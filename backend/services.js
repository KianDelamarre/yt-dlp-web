
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export function getInfoService(url) {
    return new Promise((resolve, reject) => {
        const args = [
            url,
            "--skip-download",
            "--dump-json",
            "--remote-components",
            "ejs:github"
        ];
        const proc = spawn("yt-dlp", args);

        let output = "";

        proc.stdout.on("data", (data) => {
            output += data.toString();
        });

        proc.stderr.on("data", (data) => {
            // optionally filter warnings
            const text = data.toString();
            if (!text.includes("Remote components") && !text.includes("No supported JavaScript runtime")) {
                console.error(text);
            }
        });

        proc.on("close", (code) => {
            if (code === 0) {
                try {
                    const lines = output.trim().split("\n");
                    const lastLine = lines[lines.length - 1]; // last line should be JSON
                    const info = JSON.parse(lastLine);

                    resolve({
                        title: info.title,
                        duration: info.duration,
                        thumbnail: info.thumbnail,
                        uploader: info.uploader,
                        id: info.id
                    });
                } catch (err) {
                    reject(new Error("Failed to parse yt-dlp JSON output: " + err.message));
                }
            } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
            }
        });
    });
}

// // Example usage
// getInfo("https://www.youtube.com/watch?v=Os2tfilLj8c")
//   .then((data) => console.log(data))
//   .catch((err) => console.error(err));

export function convertSwitchService(url, convertParams) {
    if (convertParams.type === "audio") {
        return convertToAudioService(url);
    }
    else if (convertParams.type === "video") {
        return convertToVideoService(url);
    }
    else {
        throw new Error("Invalid convert type");
    }
}

export function convertToAudioService(url) {
    return new Promise((resolve, reject) => {
        const jobId = Date.now();
        const outputPath = `/tmp/${jobId}.mp3`; // predictable final file path

        const args = [
            url,
            "--extract-audio",
            "--audio-format", "mp3",
            "-o", `/tmp/${jobId}.%(ext)s`
        ];

        const proc = spawn("yt-dlp", args);

        proc.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
        });

        proc.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
        });

        proc.on("close", (code) => {
            if (code === 0) {
                // confirm file exists before resolving
                if (fs.existsSync(outputPath)) {
                    resolve({ done: true, path: outputPath, jobId: jobId });
                } else {
                    reject(new Error("yt-dlp finished but file was not found"));
                }
            } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
            }
        });
    });
}


export function processMediaService(convertParams) {
    return new Promise((resolve, reject) => {
        const jobId = Date.now();
        const url = convertParams.url;
        // const isAudio = convertParams.type === "audio";
        const type = convertParams.type;

        // Define extension and output path based on type
        // const ext = isAudio ? "mp3" : "mkv";

        const extensions = {
            'audio': 'mp3',
            'video': 'mp4'
        }

        const ext = extensions[type];
        const outputPath = `/tmp/${jobId}.${ext}`;

        // Base arguments common to both
        let args = [url, "-o", `/tmp/${jobId}.%(ext)s`];


        // Inside your video conversion function
        // args = [
        //     url,
        //     "-f", "bestvideo+bestaudio/best", // Get best quality
        //     "--merge-output-format", "mkv",    // FORCE the output to be .mkv
        //     "-o", `/tmp/${jobId}.%(ext)s`      // yt-dlp will replace %(ext)s with mkv
        // ];

        if (type === "audio") {
            console.log("extracting audio")
            args.push("--extract-audio", "--audio-format", ext); //audio only
        } else if (type === "video") {
            console.log("extracting video (iOS compatible)");
            // This tells yt-dlp: "Give me the best video that is h264, and the best audio that is m4a"
            args.push("-f", "bestvideo[vcodec^=avc1]+bestaudio[ext=m4a]/best[vcodec^=avc1]/best");
            args.push("--merge-output-format", ext);
        } else {
            reject(new Error("Invalid convert type"));
        }

        const proc = spawn("yt-dlp", args);

        proc.on("close", (code) => {
            if (code === 0) {
                if (fs.existsSync(outputPath)) {
                    resolve({ done: true, path: outputPath, jobId: jobId, type: convertParams.type });
                } else {
                    reject(new Error(`yt-dlp finished but ${ext} file was not found`));
                }
            } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
            }
        });

        // Optional: Log errors for debugging
        proc.stderr.on("data", (data) => console.error(`[yt-dlp error]: ${data}`));
    });
}

import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: ALLOWED_ORIGIN }));





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

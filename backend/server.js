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

// Serve static frontend files
const frontendPath = path.resolve(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Optional: redirect "/" to "index.html"
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/download/:jobId", (req, res) => {
    const jobId = req.params.jobId;
    const filePath = path.resolve(`/tmp/${jobId}.mp3`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    // Set headers to trigger download
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${jobId}.mp3"`);

    // Stream file to client
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    // Optional: delete file after serving
    stream.on("end", () => {
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete file:", err);
        });
    });
});


app.get("/convert", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    try {
        const result = await convertToAudio(url);
        res.json(result); // { done: true, path: '/tmp/...mp3' }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/info", async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: "Missing URL" });
    }

    try {
        const info = await getInfo(url); // wait for the Promise
        res.json(info); // already has { title, duration, uploader, id }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


function getInfo(url) {
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


function convertToAudio(url) {
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

app.listen(3000, () => {
    console.log("Server started on port 3000");
    console.log(`CORS allowed origin: ${ALLOWED_ORIGIN}`);
});
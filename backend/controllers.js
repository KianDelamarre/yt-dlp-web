import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getInfoService, convertToAudioService } from "./services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.resolve(__dirname, "../frontend");

export function serveFrontendController(req, res) {
    res.sendFile(path.join(frontendPath, "index.html"));
}


export function downloadController(req, res) {
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
}


export async function convertController(req, res) {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    try {
        const result = await convertToAudioService(url);
        res.json(result); // { done: true, path: '/tmp/...mp3' }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


export async function infoController(req, res) {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: "Missing URL" });
    }

    try {
        const info = await getInfoService(url); // wait for the Promise
        res.json(info); // already has { title, duration, uploader, id }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
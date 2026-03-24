import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getInfoService, processMediaService } from "./services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.resolve(__dirname, "../frontend");

export function serveFrontendController(req, res) {
    res.sendFile(path.join(frontendPath, "index.html"));
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

//expects req body to have 
// convertParams: {url: string,
//                 type: "audio" | "video"}
export async function convertController(req, res) {
    // const url = req.query.url;
    const convertParams = req.body.convertParams;
    if (!convertParams) return res.status(400).json({ error: "Missing convertParams" });

    try {
        const result = await processMediaService(convertParams);
        res.json(result); // { done: true, path: '/tmp/...mp3' }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


//expects url/:jobId?type=audio|video
export function downloadController(req, res) {
    const { jobId } = req.params;
    const { type } = req.query;

    console.log("download controller", jobId, type);

    const extensions = {
        'audio': 'mp3',
        'video': 'mkv'
    }

    const ext = extensions[type];
    const filePath = path.resolve(`/tmp/${jobId}.${ext}`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    // 1. Map extensions to their correct MIME types
    const mimeTypes = {
        'mp3': 'audio/mpeg',
        'mkv': 'video/x-matroska',
    };


    // 2. Determine the correct type (fallback to octet-stream if unknown)
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 3. Set dynamic headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="download-${jobId}.${ext}"`);

    const stream = fs.createReadStream(filePath);

    // Error handling for the stream itself
    stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) res.status(500).send("Stream failed");
    });

    stream.pipe(res);

    stream.on("end", () => {
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete file:", err);
        });
    });
}
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { downloadController, convertController, infoController, serveFrontendController } from "./controller/controller.js";
import { updateYtDlp, scheduleNightlyYtDlpUpdate } from './utils/ytDlpUpdater.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const YT_DLP_UPDATE_TMIE = process.env.YT_DLP_UPDATE_TMIE || '0 3 * * *';
const TZ = process.env.TZ || 'Europe/London';


const app = express();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// Serve static frontend files
const frontendPath = path.resolve(__dirname, "../../frontend");
app.use(express.static(frontendPath));

// Optional: redirect "/" to "index.html"
app.get("/", serveFrontendController);
app.get("/download/:jobId", downloadController);
app.post("/convert", convertController);
app.get("/info", infoController);


// // Example usage
// getInfo("https://www.youtube.com/watch?v=Os2tfilLj8c")
//   .then((data) => console.log(data))
//   .catch((err) => console.error(err));



app.listen(3000, async () => {
    console.log("Server started on port 3000");
    console.log(`CORS allowed origin: ${ALLOWED_ORIGIN}`);


    // Optional: Run once right now on startup to ensure it's up to date immediately
    await updateYtDlp();

    // Schedule to run every night
    scheduleNightlyYtDlpUpdate(YT_DLP_UPDATE_TMIE, TZ);
});


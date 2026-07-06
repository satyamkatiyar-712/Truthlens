import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import Groq from "groq-sdk";
import { CoreEngine } from "./Coreengine.js";

// exec ko async/await ke sath use karne ke liye promisify kar liya
const execPromise = promisify(exec);

// Groq SDK initialize kar le (Apna API key .env me daal lena)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const ProcessVideoLink = async (req, res) => {
    try {
        const videoUrl = req.body.claim;
        const mode = req.body.mode;

        if (mode === "chat") {
            return res.status(400).json({ success: false, message: "Vedio verification can not be done in fast mode" });
        }


        if (!videoUrl) {
            return res.status(400).json({ success: false, message: "First attach or provide a vedio link" });
        }

        const isValidLink = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be|instagram\.com)\/.+$/.test(videoUrl.trim());

        if (!isValidLink) {
            return res.status(400).json({
                success: false,
                message: "Paste valid links for veification."
            });
        }

        try {
            // Ye command bina video download kiye sirf uski length (seconds me) return karegi
            const durationCmd = `yt-dlp --print duration "${videoUrl}"`;
            const { stdout } = await execPromise(durationCmd);

            const durationInSeconds = parseInt(stdout.trim(), 10);
            console.log(`Video length is: ${durationInSeconds} seconds`);

            if (durationInSeconds > 120) {
                return res.status(400).json({
                    success: false,
                    message: "Size of the vedio should be less than 2 minutes"
                });
            }
        } catch (metadataError) {
            throw metadataError;
        }

        console.log("Downloading audio from:", videoUrl);

        // 1. Temporary folder and file name setup
        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        const tempFilePath = path.join(tempDir, `audio_${Date.now()}.m4a`);

        // 2. yt-dlp command: Extract ONLY best audio (Super Fast)
        // --max-filesize 50M: Taaki koi 10 ghante ka podcast na daal de
        const ytDlpCmd = `yt-dlp -f "bestaudio" --max-filesize 50M -o "${tempFilePath}" "${videoUrl}"`;

        await execPromise(ytDlpCmd);
        console.log("Audio downloaded successfully to:", tempFilePath);

        // 3. Groq Whisper API (Audio to Text)
        console.log("Sending to Groq Whisper for transcription...");
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-large-v3",
            response_format: "json",
            language: "en", // Agar Hindi/Hinglish majority hai to 'hi' kar dena ya hata dena auto-detect ke liye
        });

        const transcriptText = transcription.text;
        console.log("Transcript received:", transcriptText);

        // 4. Cleanup: Temp file delete kar do taaki server storage full na ho
        fs.unlinkSync(tempFilePath);

        if (!transcriptText || transcriptText.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Video mein koi awaaz ya words nahi mile." });
        }

        // 5. Core Engine ko bhej do fact-check ke liye
        const promptForAi = `Context: This is a transcript extracted from a social media video. Please analyze and verify the claims made in it.\nTranscript: "${transcriptText}"`;

        // Tera purana function jo text ko AI pipeline me daalta hai
        let finalVerdict
        if (mode === "fact") {
            finalVerdict = await CoreEngine(promptForAi, null);
        }


        return res.status(200).json({
            success: true,
            transcript: transcriptText,
            data: finalVerdict
        });

    } catch (error) {
        console.error("Video Processing Error Details:", error.message || error);

        // Temp file clean karne ka backup agar process crash ho jaye beech mein
        const tempFilePath = path.join(process.cwd(), "temp"); // exact file path track karna mushkil hai catch me bina global variable ke, par OS apne aap temp clean kar deta hai mostly. Agar tu chahe toh req ke shuru mein file path define kar sakta hai.

        // ERROR DETECTION LOGIC
        const errorString = (error.message || error.stderr || "").toLowerCase();

        if (
            errorString.includes("private video") ||
            errorString.includes("login") ||
            errorString.includes("sign in") ||
            errorString.includes("members only")
        ) {
            return res.status(400).json({
                success: false,
                message: "The vedio is private i can not access it."
            });
        }

        if (errorString.includes("video unavailable") || errorString.includes("not found")) {
            return res.status(404).json({
                success: false,
                message: "The media does not exist anymore."
            });
        }

        // Default Error Fallback
        return res.status(500).json({
            success: false,
            message: "Server error in processing vedio link."
        });
    }
};
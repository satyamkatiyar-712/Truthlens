import sharp from "sharp";
import { VisionImagecheck } from "./Visionimage.js";
import { Factcheck } from "../models/ClaimHistory.js"; // Updated Schema
import { CoreEngine } from "./Coreengine.js";
import { genAI } from "./Coreengine.js";
import { ProcessVideoLink } from "./vedioController.js";

export const ConnectingAi = async (req, res) => {
  try {
    const userId = req.user.userId;
 
    const chatId = req.body.chatId || null;

    const saveMessageToDB = async (claimText, verdictData) => {
      const newMessage = {
        userClaim: claimText,
        verdict: verdictData.verdict,
        confidenceScore: verdictData.confidenceScore || null,
        explanation: verdictData.explanation,
        sources: verdictData.sources || [],
      };

      let savedChat;

      if (chatId) {
        savedChat = await Factcheck.findOneAndUpdate(
          { _id: chatId, user: userId },
          { $push: { messages: newMessage } },
          { new: true },
        );
      }

      if (!savedChat) {
        savedChat = await Factcheck.create({
          title:
            claimText.substring(0, 30) + (claimText.length > 30 ? "..." : ""),
          user: userId,
          messages: [newMessage],
        });
      }
      return savedChat;
    };

    // ==========================================
    // 1. VIDEO LOGIC
    // ==========================================
    if (req.body.inputType === "videoUrl") {
      const videoResult = await ProcessVideoLink(req);

      if (videoResult.error) {
        return res.status(videoResult.status).json({
          success: false,
          message: videoResult.message,
        });
      }

      const savedChat = await saveMessageToDB(
        req.body.claim,
        videoResult.finalVerdict,
      );

      return res.status(200).json({
        success: true,
        chatId: savedChat._id,
        data: videoResult.finalVerdict,
      });
    }

    // ==========================================
    // 2. IMAGE & TEXT LOGIC PREP
    // ==========================================
    let Finalclaim = req.body.claim || "";
    const Imagefile = req.file || null;
    const mode = req.body.mode || "fact";
    let ImageExtractedText = "";

    let base64Image = null;
    let mimeType = null;

    if (Imagefile) {
      const Imagebuffer = await sharp(Imagefile.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toBuffer();

      base64Image = Imagebuffer.toString("base64");
      mimeType = "image/jpeg";

      ImageExtractedText = await VisionImagecheck(
        base64Image,
        mimeType,
        Finalclaim,
      );

      if (ImageExtractedText.includes("NO_CLAIM_FOUND") && !req.body.claim) {
        return res.status(400).json({
          success: false,
          message: "Nothing is obtained from the image!",
        });
      }

      if (Finalclaim) {
        Finalclaim = `Context: ${Finalclaim}. Image Claim: ${ImageExtractedText}`;
      } else {
        Finalclaim = ImageExtractedText;
      }
    }

    if (!Finalclaim) {
      return res.status(400).json({
        success: false,
        message: "nothing obtained",
      });
    }

    let finalImagePart = null;
    if (Imagefile) {
      finalImagePart = {
        inlineData: { data: base64Image, mimeType: mimeType },
      };
    }

    const SavetoDbclaim = req.body.claim ? req.body.claim : ImageExtractedText;

    // ==========================================
    // 3. FAST CHAT MODE
    // ==========================================
    if (mode === "chat") {
      const currentDateTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

     const chatPrompt = `You are Truthlens, a highly intelligent and specialized AI assistant dedicated ONLY to fact-checking, verifying claims, analyzing news, and debunking misinformation.

[System Context]
- Current Date and Time: ${currentDateTime} (IST)
- Always keep this current date and year in mind when answering time-sensitive questions.

[Core Rules]
1. STRICT SCOPE & BOUNDARY (CRITICAL): Your ONLY job is to fact-check, verify claims, check news authenticity, and determine if something is true or false. 
   - EXCEPTION (GREETINGS): If the user simply says "Hi", "Hello", "How are you", or normal casual greetings, DO NOT refuse. Respond back politely and ask how you can help them verify a fact today.
   - OUT-OF-SCOPE TASKS: IF the user asks for anything outside this scope (e.g., "write code", "create a roadmap for ML", "write an essay", "translate this", "tell me a joke", or general tasks), YOU MUST POLITELY DECLINE. 
   - Do NOT provide the answer to out-of-scope questions. Instead, politely apologize and state your purpose. Example: "Main sirf fact-checking aur claims verify karne ke liye banaya gaya hoon. Main code likhne ya roadmaps banane mein help nahi kar sakta." (Ensure the decline matches the user's language).
2. Language Mirroring: Strictly reply in the exact language the user uses. If they use Hinglish, reply in natural conversational Hinglish. If Hindi, use Hindi. If English, use English.
3. Tone Adaptation: Match the user's vibe. Be respectful, but if the user is casual or playful, respond with the same energy.
4. Clean Formatting: Answer directly and beautifully. Use clean Markdown (bold text for emphasis, bullet points for readability, and appropriate emojis). STRICTLY AVOID using weird, extra, or unnecessary raw symbols (like excessive asterisks, LaTeX outside math, or XML tags).
5. Constraint: Do not search the web. Give a complete, self-contained response based on your training data.
6. Paragraph Structure: Write cohesive paragraphs containing at least 3 to 4 sentences together. STRICTLY DO NOT break into a new line after every single sentence.
7. Controlled Spacing: Use double newlines (\\n\\n) ONLY to separate completely different paragraphs, headings, or lists. 
8. Emoji Discipline: Use a MAXIMUM of 1 or 2 professional emojis in the entire response. DO NOT put emojis at the end of every line or sentence. Be mature and structured.

User says: "${req.body.claim || "What is in this image?"}"
 
Response:`; 

      const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let contentArray = [chatPrompt];
      if (finalImagePart) contentArray.push(finalImagePart);

      const response = await chatModel.generateContent(contentArray);
      const chatAnswer = response.response.text();

      const chatVerdictObj = {
        verdict: null,
        confidenceScore: null,
        explanation: chatAnswer,
        sources: [],
      };

      const savedChat = await saveMessageToDB(SavetoDbclaim, chatVerdictObj);

      return res.json({
        success: true,
        chatId: savedChat._id,
        data: chatVerdictObj,
      });

      // ==========================================
      // 4. CORE FACT CHECK MODE
      // ==========================================
    } else {
      const finallmResponse = await CoreEngine(Finalclaim, finalImagePart);

      const savedChat = await saveMessageToDB(SavetoDbclaim, finallmResponse);

      return res.json({
        success: true,
        chatId: savedChat._id,
        data: finallmResponse,
      });
    }
  } catch (error) {
    console.log("error obtained", error);
    return res.status(500).json({
      success: false,
      message: "Ai did not responded Try again.",
    });
  }
};

// ==========================================
// RENAME HISTORY (UPDATED)
// ==========================================
export const UpdateHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const newClaimName = req.body.userClaim; // Frontend se aane wala naam

    if (!newClaimName) {
      return res.status(400).json({
        success: false,
        message: "provide new claim to modify!",
      });
    }

    const updatedclaim = await Factcheck.findOneAndUpdate(
      { _id: id, user: userId },
      { title: newClaimName },
      { new: true },
    );

    if (!updatedclaim) {
      return res
        .status(404)
        .json({ success: false, message: "History item not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "History updated successfully" });
  } catch (error) {
    console.error("update History Error: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error in updating the claim" });
  }
};

export const DeleteHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const deletedclaim = await Factcheck.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedclaim) {
      return res
        .status(404)
        .json({ success: false, message: "History item not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "History deleted successfully" });
  } catch (error) {
    console.error("Delete History Error: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error in deleting the claim" });
  }
};

export const TogglePinHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;

    const claim = await Factcheck.findOne({ _id: id, user: userId });
    if (!claim) {
      return res
        .status(404)
        .json({ success: false, message: "History item not found" });
    }

    claim.isPinned = !claim.isPinned;
    await claim.save();

    return res.status(200).json({
      success: true,
      message: claim.isPinned
        ? "Chat pinned successfully"
        : "Chat unpinned successfully",
      isPinned: claim.isPinned,
    });
  } catch (error) {
    console.error("Pin Toggle Error: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during pinning." });
  }
};

import sharp from "sharp";
import { VisionImagecheck } from "./Visionimage.js";
import { Factcheck } from "../models/ClaimHistory.js";
import { CoreEngine } from "./Coreengine.js";
import { genAI } from "./Coreengine.js";
import { ProcessVideoLink } from "./vedioController.js";

export const ConnectingAi = async (req, res) => {
  try {

    if (req.body.inputType === "videoUrl") {
      return await ProcessVideoLink(req, res);
    }

    let Finalclaim = req.body.claim || "";
    const Imagefile = req.file || null;
    const mode = req.body.mode || "fact";
    let ImageExtractedText = "";
    console.log("analyzing claim", Finalclaim);
    console.log("analyzing claim", Imagefile);

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
      console.log("Imagetext", ImageExtractedText);

      if (ImageExtractedText.includes("NO_CLAIM_FOUND") && !req.body.claim) {
        return res.status(400).json({
          success: false,
          message:
            "Bhai, is photo mein check karne layak koi news ya text nahi hai!",
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
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      };
    }

    let chatAnswer = null;
    let finallmResponse = null;

    const SavetoDbclaim = req.body.claim ? req.body.claim : ImageExtractedText;
    let SavedFact = null;

    if (mode === "chat") {
      const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let chatPrompt = `
      You are a highly intelligent, friendly AI assistant.
      The user says: "${req.body.claim || 'What is in this image?'}"
      
      Answer directly, conversationally, and beautifully using Markdown (bold, lists, emojis).
      Mirror the user's language (Hinglish/Hindi/English). Do not search the web.

      🚨 CRITICAL MARKDOWN FORMATTING RULES (FAILURE IS NOT AN OPTION):
      You MUST format your output exactly like the "GOOD" examples below. The frontend parser will BREAK if you clump text together.

      1. PARAGRAPH BREAKS: You MUST leave a completely blank line between paragraphs.
      BAD:
      Paragraph 1.
      Paragraph 2.

      GOOD:
      Paragraph 1.

      Paragraph 2.

      2. LISTS: You MUST leave a completely blank line BEFORE and AFTER a list.
      GOOD:
      Here is the list:

      * Item 1
      * Item 2

      Moving on to next topic...

      3. TABLES (CRITICAL): You MUST place EVERY single table row on a NEW LINE. NEVER put multiple rows on the same line. Leave a blank line before and after the table.
      BAD:
      | Header 1 | Header 2 | |---|---| | Row 1 | Row 1 |

      GOOD:
      Here is the table:

      | Header 1 | Header 2 |
      | -------- | -------- |
      | Row 1    | Value 1  |
      | Row 2    | Value 2  |

      4. NO HTML: Never use <br> or any other HTML tags.
      `;

      let contentArray = [chatPrompt];
      if (finalImagePart) contentArray.push(finalImagePart);

      const response = await chatModel.generateContent(contentArray);
      chatAnswer = response.response.text();

      SavedFact = await Factcheck.create({
        userClaim: SavetoDbclaim,
        verdict: "Chat",
        confidenceScore: 100,
        explanation: chatAnswer,
        sources: [],
      });
      console.log("Saved history :", SavedFact._id);

      return res.json({
        success: true,
        data: {
          verdict: "Chat",
          confidenceScore: 100,
          explanation: chatAnswer,
          sources: [],
        },
      });
    } else {
      finallmResponse = await CoreEngine(Finalclaim, finalImagePart);
      SavedFact = await Factcheck.create({
        userClaim: SavetoDbclaim,
        verdict: finallmResponse.verdict,
        confidenceScore: finallmResponse.confidenceScore,
        explanation: finallmResponse.explanation,
        sources: finallmResponse.sources,
      });

      console.log("💾 Saved Fact History ID:", SavedFact._id);

      res.json({
        success: true,
        data: finallmResponse,
      });
    }
  } catch (error) {
    console.log("error obtained", error);
    return res.status(500).json({
      success: false,
       message:error.message || "Ai did not responded Try again.",
    });
  }
};


export const DeleteHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedclaim = await Factcheck.findByIdAndDelete(id);

    if (!deletedclaim) {
      return res.status(404).json({
        success: false,
        message: "History item not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "History deleted successfully"
    })
  }
  catch(error){
      console.error("Delete History Error: ", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server mein kuch dikkat aa gayi delete karte waqt." 
    });
  }
}


export const UpdateHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const newClaimName = req.body.userClaim;

    if (!newClaimName) {
      return res.status(400).json({
        success: false,
        message: "Naya naam (userClaim) provide karna zaroori hai!"
      });
    }

    const updatedclaim = await Factcheck.findByIdAndUpdate(id,{userClaim:newClaimName},{new:true});

    if (!updatedclaim) {
      return res.status(404).json({
        success: false,
        message: "History item not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "History updated successfully"
    })
  }
  catch(error){
      console.error("update History Error: ", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server mein kuch dikkat aa gayi delete karte waqt." 
    });
  }
}



export const TogglePinHistory = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Pehle document find karo
    const claim = await Factcheck.findById(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: "History item not found" });
    }

    // Current status ko ulta (toggle) kar do (true -> false, false -> true)
    claim.isPinned = !claim.isPinned;
    await claim.save();

    return res.status(200).json({
      success: true,
      message: claim.isPinned ? "Chat pinned successfully" : "Chat unpinned successfully",
      isPinned: claim.isPinned
    });
  } catch (error) {
    console.error("Pin Toggle Error: ", error);
    return res.status(500).json({ success: false, message: "Server error during pinning." });
  }
};
import { GoogleGenerativeAI } from "@google/generative-ai";

export const VisionImagecheck = async (base64Image, mimeType,userText="") => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const ImageclaimModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig:{
        temperature:0.0
      }
    })
      
    let specificFocus = "Extract the main factual claim or readable text from the image.";

    if (userText && userText.trim() !== "") {
        specificFocus = `
    USER'S SPECIFIC CONTEXT/QUESTION: "${userText}"
    
    YOUR OBJECTIVE:
    1. Identify the core subject (person, landmark, object) or text the user is asking about.
    2. Keep it concise. Do not over-explain. Just extract the identity or the core claim. (e.g., If the user asks "Is he retired?", just identify the person: "MS Dhoni").
    3. 🚨 STRICT LANGUAGE RULE: No matter what language the user's question is in (Hindi, Hinglish, etc.), you MUST translate and output your final visual description or extracted claim strictly in PURE ENGLISH keywords.
        `;
    }
    
    const prompt = `
    You are an elite Visual QA (Question Answering) and OCR AI. 
    Look at the provided image very carefully.
    
    ${specificFocus}

    CRITICAL INSTRUCTIONS (FAILING THESE WILL BREAK THE SEARCH PIPELINE):
    1. THE "SMART NO_CLAIM" RULE: 
       - IF the user has provided a context/question, you MUST identify the contents of the image (e.g., landmarks, people, objects) to help answer their question, even if there is NO text in the image.
       - ONLY IF the user provides NO context AND the image has NO readable text, then you MUST reply with exactly one word: "NO_CLAIM_FOUND".
    2. IDENTIFY, BUT DO NOT INVENT: You ARE explicitly allowed to identify well-known public figures, landmarks (like Burj Khalifa), or logos. However, NEVER invent news, stats, or facts about them. Just identify what is visible.
    3. OCR FOCUS: If there IS text in the image, extract it word-for-word, BUT translate the final meaning to English if it is in another language. Pay special attention to low-contrast text.
    4. EXTRACT/DESCRIBE, DON'T JUDGE: Just describe the image or extract the core claim. Do not tell me if a claim is "True" or "False" right now. Another AI will do the web search.
    5. IGNORE NOISE: Ignore phone UI elements (battery, time), "Forwarded" tags, or usernames.
    6. 🚨 THE ENGLISH-ONLY MANDATE: Your final output MUST be in English. If the image contains Hindi text or the user asked in Hinglish, TRANSLATE your findings into English keywords. Search engines require English.

    OUTPUT FORMAT:
    Return STRICTLY the extracted plain text or visual description in PURE ENGLISH. No introductory words like "Here is the text" or "The image shows". Just the raw English keywords or identity.
    `;
    
    const imageParts = [
      {
        inlineData: {
          data: base64Image, 
          mimeType: mimeType 
        },
      },
    ];

    const Generatedclaim = await ImageclaimModel.generateContent([prompt,...imageParts])

    const finalGeneratedclaim= Generatedclaim.response.text().trim()

    return finalGeneratedclaim

};

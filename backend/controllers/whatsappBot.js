// import pkg from "whatsapp-web.js";
// const { Client, LocalAuth } = pkg;

// import qrcode from "qrcode-terminal";
// import { CoreEngine } from "./Coreengine.js";
// import { VisionImagecheck } from "./Visionimage.js";

// export const client = new Client({
//   authStrategy: new LocalAuth(),
//   authTimeoutMs: 60000, 
//   puppeteer: {
//     executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//     headless: true,
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//       '--disable-accelerated-2d-canvas',
//       '--disable-gpu'
//     ]
//   },
// });

// client.on("qr", (qr) => {
//   console.log("Scan this qr from the whatsapp");
//   qrcode.generate(qr, { small: true });
// });

// client.on("ready", () => {
//   console.log("you are connected to use the bot service");
// });

// client.on("message", async (msg) => {
//   if (!msg.body && !msg.hasMedia) return;

//   if (!msg.body.toLowerCase().startsWith("!check")) return;

//   const chat = await msg.getChat();

//  msg.reply("⚙️ *ClaimBuster SCAN INITIATED* ⚙️\n\n🕵️‍♂️ AI Agents internet ki gehraiyon mein is claim ko verify kar rahe hain. Bas 10-15 seconds wait karo... ⏳🔍")
//  chat.sendStateTyping()
  
//  const typingInterval = setInterval(() => {
//     chat.sendStateTyping();
//   }, 5000);

//   let ImageBuffer = null;
//   let mimeType = null;
//   let claim = msg.body.slice(6).trim();

//   if (msg.hasMedia) {
//     const media = await msg.downloadMedia();

//     if (media.mimetype.includes("image")) {
//       ImageBuffer=media.data
//       mimeType = media.mimetype;
//     } else {
//       clearInterval(typingInterval)
//       chat.clearState()
//       msg.reply(
//         "please provide a image or a text only we are working on other type of files",
//       );
//       return;
//     }
//     const Imagetext = await VisionImagecheck(ImageBuffer, mimeType, claim)
//     if (Imagetext.includes("NO_CLAIM_FOUND") && claim=== "") {
//     clearInterval(typingInterval)
//     chat.clearState()
//       msg.reply("Kch check krne jaisa hai hi nhi isme")
//       return
//     }

//     if (claim) {
//       claim = `Context: ${claim}. Image Claim: ${Imagetext}`
//     } else {
//       claim = Imagetext;
//     }
//   }

//   if (!ImageBuffer && !claim){
//       clearInterval(typingInterval)
//       chat.clearState()
//       return
//   } 

//   try {
//     const result = await CoreEngine(claim)

//     let replyTxt = `
// Bhai, tera Fact-Check ho gaya! 🔍✨

// 🚨 (Result):* *${result.verdict}*

// 💡 *Asliyat (The Truth):*
// ${result.explanation}

// 🤖 _Powered by ClaimBuster AI_
// `;  clearInterval(typingInterval)
//     chat.clearState()
//     msg.reply(replyTxt);
//   } catch (error) {
//     clearInterval(typingInterval)
//     chat.clearState()
//     msg.reply("backend me koi error hai bhai wait");
//   }
// });

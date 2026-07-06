// 🚨 BUG 1 FIX: Dotenv ko sabse pehle load karo (CoreEngine import hone se bhi pehle!)
import 'dotenv/config'
import { CoreEngine } from "./controllers/Coreengine.js";

const testCases = [
  {
    // 1. The "Half-Truth" Trap (Misleading - Finance/Tech)
    // Sach: Paytm Bank pe restriction laga tha. Jhooth: Paytm UPI ban ho gaya.
    claim: "RBI ke order ke baad, ab India mein Paytm app se UPI payment karna puri tarah ban ho gaya hai.",
    expectedVerdict: "Misleading", 
    reasoningTarget: "AI must explain that Paytm Payments Bank was restricted, but the Paytm app still works for UPI using other partner banks."
  },
  {
    // 2. The "Pure Truth" (True - Sports)
    // Sach: Neeraj won Silver, Arshad won Gold.
    claim: "Neeraj Chopra won the silver medal in the men's javelin throw event at the 2024 Paris Olympics.",
    expectedVerdict: "True",
    reasoningTarget: "AI should easily find official Olympic records from Aug 2024 confirming this."
  },
  {
    // 3. The "Exaggeration / Aadha Sach" Trap (Misleading - FMCG/News)
    // Sach: Bournvita ko 'Health Drink' category se hataya gaya tha. Jhooth: Usko Ban kar diya gaya hai.
    claim: "Indian Government ne Bournvita aur us jaise milk additives ko high sugar ki wajah se India mein puri tarah ban (illegal) kar diya hai.",
    expectedVerdict: "Misleading",
    reasoningTarget: "AI should clarify that the Govt asked e-commerce sites to remove it from the 'health drinks' category, but it is NOT banned."
  },
  {
    // 4. The "Classic WhatsApp Hoax" (False - Government Scheme)
    // Jhooth: Aisi koi scheme exist nahi karti.
    claim: "Bhai kya Modi sarkar sach mein 'PM Free Laptop Yojana 2026' ke tahat sabhi students ko muft laptop de rahi hai?",
    expectedVerdict: "False",
    reasoningTarget: "AI must identify this as a common viral fake link/scam and confirm no such official scheme exists."
  },
  {
    // 5. The "Historical Truth" (True - Space/Science)
    // Sach: Exact date and mission.
    claim: "ISRO ne 1 January 2024 ko apna pehla polarimetry mission, XPoSat, successfully launch kiya tha.",
    expectedVerdict: "True",
    reasoningTarget: "AI should verify the exact date and mission name with ISRO's official updates."
  }
];

// 🚨 BUG 2 FIX: Function ko async banao taaki andar await kaam kare
export const Tester = async () => {
  let correct = 0;
  let total = testCases.length;

  console.log(`🚀 Starting Eval Pipeline for ${total} claims...\n`);

  // 🚨 BUG 2 FIX: .map ki jagah for...of use karo taaki ek-ek karke test chale
  for (const test of testCases) {
    console.log(`Testing: "${test.claim}"`);
    
    try {
      // AI response ka wait karo
      const result = await CoreEngine(test.claim);

      if (result.verdict === test.expectedVerdict) {
        console.log(`✅ PASS! (Expected: ${test.expectedVerdict}, Got: ${result.verdict})`);
        correct++;
      } else {
        console.log(`❌ FAIL! (Expected: ${test.expectedVerdict}, Got: ${result.verdict})`);
        console.log(`   💡 AI Reason: ${result.explanation}`);
      }
    } catch (error) {
        console.log(`⚠️ CRASH on claim: ${test.claim}`);
    }

    console.log("---------------------------------------------------\n");
  }

  const accuracy = (correct / total) * 100;
  console.log(`🎯 FINAL ACCURACY: ${accuracy}% (${correct}/${total} correct)`);
};

// Script ko run karo
Tester();
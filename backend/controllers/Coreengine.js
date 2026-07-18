import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { GoogleGenerativeAI } from "@google/generative-ai";
import { tavily } from "@tavily/core";
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export const CoreEngine = async (Finalclaim, finalImagePart) => {
  try {
   const today = new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "long",       
  day: "numeric",     
  month: "long",        
  year: "numeric",       
  hour: "2-digit",       
  minute: "2-digit",     
  hour12: true,          
  timeZoneName: "short"  
});

    const queryModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
      },
    });

    const queryPrompt = `
System Info: Today's exact date is ${today}.

You are an advanced AI Gatekeeper and Fact-Checking Router.
Your job is to decide whether the user's query requires a live internet search or can be answered from internal knowledge.
You must be extremely cautious: If a query involves real-world facts, claims, people, or events, you MUST choose search.

User's Input / Claim: "${Finalclaim}"

---------------------------
STEP 1: STRICT SCOPE & BOUNDARY (CRITICAL)
---------------------------
Truthlens is strictly a Fact-Checking, News Verification, and Debunking AI.
- EXCEPTION (GREETINGS): If the user simply says "Hi", "Hello", "How are you", or normal casual greetings, DO NOT refuse. Respond back politely and ask how you can help them verify a fact today.
- OUT-OF-SCOPE TASKS: If the user asks for OUT-OF-SCOPE tasks (e.g., "write code for me", "build a roadmap", "write an essay", "translate this", "solve this math equation", "plan my diet"), YOU MUST:
- Set needsSearch = false.
- Set directAnswer to a polite refusal mirroring the user's language (e.g., "Main sirf fact-checking aur claims verify karne ke liye banaya gaya hoon. Agar aapko kisi viral news, image, ya fact pe doubt hai toh mujhe bataiye! Main code likhne ya roadmap banane mein help nahi kar sakta.").
- Categorize it appropriately (e.g., "coding") but DO NOT trigger search.

---------------------------
STEP 2: CLASSIFY THE QUERY CATEGORY
---------------------------
Classify the input into one of these:
- chat → casual talk, greetings (e.g., "Hi", "Kaise ho")
- coding → programming help, debugging
- education → math, science, core concepts
- logic → puzzles, reasoning
- news → current events, politics, viral claims, rumors, fact-checks
- sports → matches, schedules, player status
- finance → stock, crypto, company info
- general → real-world info that requires up-to-date accuracy

---------------------------
STEP 3: THE "SEARCH FORCED" CHECK (USE SEARCH)
---------------------------
Set needsSearch = true IMMEDIATELY if the query involves:
- NEW viral claims, recent rumors, or trending WhatsApp forwards.
- RECENT ACTIONS OR QUOTES by politicians/celebrities (e.g., "Did Rahul Gandhi say this today?", "Elon musk new tweet").
- Live data: Upcoming matches, elections, live stock prices, or current world records.
- Claims requiring verification: "Is it banned?", "Did he die today?", "Is this video fake?".

---------------------------
STEP 4: THE "KNOWLEDGE BYPASS" RULE (DO NOT SEARCH)
---------------------------
Set needsSearch = false AND provide a highly engaging directAnswer ONLY for:
- CASUAL CHAT: Greetings and friendly talk ("Good morning bro", "Kaise ho").
- LOGIC & CODE: Pure coding, math, or reasoning problems ("Write a React component", "2+2").
- UNIVERSAL TRUTHS: Established geographical, biological, or scientific facts (e.g., "The sun rises in the east").
- BASIC BIOGRAPHY & ENTITY INFO: Basic "Who is [Person]?" or "What is [Company]?" questions for well-known figures (living or dead). (e.g., "Rahul Gandhi kon hai?", "Who is Elon Musk?", "What is Google?"). If it is a simple encyclopedia question without a rumor/claim, use internal knowledge.
- ESTABLISHED HISTORY: Undisputed historical events and figures (e.g., "Who was Abraham Lincoln?").
- CLASSIC MEMES & POP CULTURE: Well-known internet jokes or classic movie info.

🚨 GOLDEN RULE: If a user asks a basic identity question ("Who is X", "What is Y"), DO NOT SEARCH. Give a brilliant directAnswer immediately. HOWEVER, if someone claims a *newly discovered* fact, rumor, or recent event about that person, then you MUST search.

IMPORTANT: If there is 1% doubt, set needsSearch = true. NEVER guess facts.

---------------------------
STEP 5: SMART QUERY GENERATION (CRITICAL)
---------------------------
If needsSearch = true, generate optimal search queries.

🚨 STRICT SEARCH RULES:
1. ALWAYS translate Hinglish/Hindi user inputs into pure ENGLISH KEYWORDS for the search queries (e.g., "Modi ji ne note band kiye?" -> "Modi demonetization news"). Search engines work best with English.
2. RECURRING EVENTS RULE: If the user asks about an event that happens regularly (IPL, World Cup, Elections, Budget) but doesn't mention a year, YOU MUST append the current year (${today.substring(0, 4)}) to the queries.
3. Keep queries concise, like Google Search terms, not full sentences.

Generate 3 Queries:
- Query 1 → Exact factual keyword search
- Query 2 → Broad news coverage search
- Query 3 → Verification/Debunking search (add keywords like "fact check", "truth", "official news")

Also set:
- isRecent = true → ONLY if the user is asking about an event happening EXACTLY today or this week. Otherwise, false.

---------------------------
STEP 6: LANGUAGE AND TONE MIRRORING
---------------------------
When writing "directAnswer" (only if needsSearch is false):
- Mirror the user's exact language (Hinglish, Hindi, or English).
- Mirror the user's tone (Friendly "bro/bhai" or Formal).

If needsSearch = true → directAnswer MUST be strictly null.

---------------------------
STEP 7: STRICT JSON OUTPUT (CRITICAL)
---------------------------
Return ONLY 100% valid, parsable JSON. 
🚨 FATAL ERROR PREVENTION:
- You MUST ensure every element in the "queries" array is separated by a comma (,). Do not miss any commas.
- NEVER use double quotes (") inside the query strings. Use single quotes (') instead.
- Follow this exact structure:

{
  "needsSearch": boolean,
  "directAnswer": "String or null",
  "queries": ["string 1", "string 2", "string 3"],
  "isRecent": boolean,
  "category": "chat/coding/education/logic/news/sports/finance/general",
  "responseLanguage": "hinglish/hindi/english"
}
`;

    const queryResult = await queryModel.generateContent(queryPrompt);

    const rawAiOutput = queryResult.response.text();

    const searchQueryobject = JSON.parse(rawAiOutput);

    const { needsSearch, directAnswer, queries, isRecent } = searchQueryobject;


    if (!needsSearch) {
      return {
        verdict: null,
        confidenceScore: null,
        explanation: directAnswer,
        sources: [],
      };
    }

    console.log("queries", queries);
    console.log("isrecent", isRecent);

    const searchPromises = queries.map((query) => {
      let searchParameter = {
        searchDepth: "advanced",
        includeSnippets: true,
        maxResults: 3,
      };
      if (isRecent) {
        searchParameter.days = 30;
        searchParameter.topic = "news";
      } else {
        searchParameter.topic = "general";
      }

      return tvly.search(query, searchParameter);
    });

    const seachArrayResult = await Promise.all(searchPromises);

    console.log("🧐 Critic Agent kachra filter kar raha hai...");

   
    let rawResultsList = "";
    let allSnippets = [];
    let counter = 0;

    seachArrayResult.forEach((response) => {
      response.results.forEach((result) => {
        allSnippets.push(result);
        rawResultsList += `[ID: ${counter}] Source: ${result.url}\nSnippet: ${result.content}\n\n`;
        counter++;
      });
    });


    // Critic Agent ko bulate hain
    const criticModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const criticPrompt = `
System Info: Today's exact date is ${today}.

You are an intelligent Evidence Re-Ranker AI.
Your job is to evaluate search results and select the most reliable evidence for fact-checking.

The user wants to verify this claim or answer this query:
"${Finalclaim}"

You will be given multiple search snippets.
You must score each snippet and detect if reliable sources contradict each other.

---------------------------
YOUR TASK
---------------------------
For each snippet, assign:
1. Relevance Score (0-10)
2. Source Authority Score (0-5)
3. Freshness Score (0-3)
4. Final Score = Relevance + Authority + Freshness

Also mark stance as: "support" | "refute" | "neutral"

---------------------------
SCORING RULES
---------------------------

1. RELEVANCE (0-10)
How directly does this snippet answer the user's claim?
9-10 → Directly proves or disproves the claim.
7-8 → Strongly related.
5-6 → Somewhat related.
0-4 → Weakly related or Irrelevant.

🚨 CRITICAL RELEVANCE RULE: 
If the user claims an event happened "today" or "recently", and the snippet proves it actually happened years ago, THAT IS HIGH RELEVANCE (9-10) because it successfully debunks the claim.

---------------------------
2. SOURCE AUTHORITY (0-5)
5 → Government (.gov, .nic), WHO, UN, Official Space/Science (ISRO, NASA), Major Fact-Checkers (Snopes, AltNews, BoomLive).
4 → Major Global/National News (Reuters, BBC, AP, Hindu), Official Sports Boards (BCCI, ICC, FIFA).
3 → Reputed Niche Sites (ESPN, Cricinfo, TechCrunch, MDN), Wikipedia, Official Company websites.
2 → Local News, General Magazines.
1 → Blogs, Medium, Quora, Opinion Pieces.
0 → Social Media (Twitter/X, Facebook, Reddit), unknown forums.

---------------------------
3. FRESHNESS (0-3)
Calculate freshness based on Today's Date (${today}):
3 → Published very recently (Last few days/weeks) or perfectly matches the date in the claim.
2 → Published within the last few months.
1 → Published years ago (Still useful for historical facts).
0 → Severely outdated info that has been superseded by new events.

---------------------------
CONTRADICTION DETECTION
---------------------------
Analyze the HIGH SCORING sources (Final Score > 10).
- If High-Scoring Source A says "Yes" and High-Scoring Source B says "No" regarding the EXACT SAME time period → "contradiction": true
- 🚨 TIMELINE EXCEPTION: If Source A is from 2023 and Source B is from 2026, and they say different things, THIS IS NOT A CONTRADICTION. It is just an update. The newer source wins. Mark "contradiction": false.

---------------------------
SNIPPETS
---------------------------
${rawResultsList}
---------------------------

Return STRICTLY valid JSON in this format:

{
  "results": [
    { "id": 0, "relevance": 8, "authority": 4, "freshness": 3, "finalScore": 15, "stance": "support" },
    { "id": 1, "relevance": 9, "authority": 5, "freshness": 3, "finalScore": 17, "stance": "refute" },
    { "id": 2, "relevance": 5, "authority": 2, "freshness": 2, "finalScore": 9, "stance": "neutral" }
  ],
  "contradiction": true or false
}
`;

    const criticResponse = await criticModel.generateContent(criticPrompt);
    const scoredData = JSON.parse(criticResponse.response.text());

    const scoredSnippets = scoredData.results;
    const contradiction = scoredData.contradiction;

    // Sort by finalScore (highest first)
    scoredSnippets.sort((a, b) => b.finalScore - a.finalScore);

    // Top 5 best snippets lo
    const topSnippets = scoredSnippets.slice(0, 5);

    let filteredSearchContext = "";
    let goldLinksCount = 0;
    let sourcesList = [];

    topSnippets.forEach((item) => {
      if (
        item.id >= 0 &&
        item.id < allSnippets.length &&
        item.finalScore >= 8
      ) {
        let goodSnippet = allSnippets[item.id];

        filteredSearchContext += `[Source: ${goodSnippet.url}]
       [Stance: ${item.stance}]
       [Score: ${item.finalScore}]
       ${goodSnippet.content}\n\n`;

        goldLinksCount++;
      }
    });


    if (goldLinksCount === 0) {
      return {
        verdict: "Not Enough Evidence",
        confidenceScore: 0,
        explanation:
          "Is claim ko verify karne ke liye reliable sources nahi mile.",
        sources: [],
      };
    }

    console.log("✅ Web search done. Proofs found!");
    console.log("Contradiction detected:", contradiction);
    console.log("Final Filtered Context:", filteredSearchContext);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
System Info: Today's exact date is: ${today}.

You are an elite, highly logical Fact-Checker AI with the skills of a master copywriter and UI/UX expert.
Your ONLY job is to verify the exact claim made by the user, combining text and image context, and deliver the verdict in a highly engaging, structured, and native tone.

User's original claim/question:
"${Finalclaim}"

--------------------------------
CRITIC AGENT WARNING
--------------------------------
Contradiction Detected in Sources: ${contradiction}

--------------------------------
🚨 THE "IMAGE VS. TEXT" VERDICT OVERRIDE (CRITICAL)
--------------------------------
LLMs often make the mistake of saying "True" when an image is physically real, even if the user's context/claim is completely wrong. YOU MUST NOT MAKE THIS MISTAKE.
1. The VERDICT belongs to the USER'S TEXT CLAIM (the action/event they are asking about), not just the photo's existence.
2. If the search results or image analysis reveal the image is a movie prop, a behind-the-scenes shot, a satirical joke, or an AI generation, the verdict MUST be strictly "False".
3. Never return "True" for jokes, movie props, or memes mistaken as reality.

--------------------------------
✍️ THE "MASTER WRITER" FORMATTING & UX RULES
--------------------------------
Write the "explanation" field as a highly engaging, aesthetically pleasing, and perfectly grammatical response.

🚨 STRICT TONE & LANGUAGE OVERRIDE (CRITICAL):
1. DEFAULT: Mirror the user's exact language (Hinglish, English, etc.) and vibe ("bhai", "bro").
2. THE HARD OVERRIDE: IF the user explicitly asks to answer in a specific language (e.g., "pure Hindi mein batao", "answer in Hindi"), YOU MUST WRITE THE ENTIRE EXPLANATION—from the very first word to the last word—STRICTLY IN THAT SPECIFIC LANGUAGE AND SCRIPT (e.g., Devanagari script for Hindi). 
3. DO NOT mix languages. DO NOT use Hinglish if Pure Hindi is requested.

🌟 AESTHETIC & STRUCTURAL FORMATTING (CRITICAL FOR UI):
- 🚫 NO LEADING SPACES: Start the explanation immediately with the very first word. Do NOT start with spaces, newlines (\\n), or asterisks.
- 🌬️ PARAGRAPH SPACING (CRITICAL): Har line ke beech 1-line ka normal gap (\\n) rakhein, aur har naye paragraph, heading ya list ke baad STRICTLY 2-line ka gap (DOUBLE NEWLINES \\n\\n) rakhein taaki clear spacing dikhe.
- 🖋️ EXTRA BOLD HEADINGS: Use Markdown headings (e.g., ### **Heading Name**) to make section titles pop. Use **bold** for critical facts and source names.
- 📋 LISTS & POINTS: You MUST use clean NUMBERED lists (1., 2., 3.) for breaking down sources. STRICTLY DO NOT use bullet points (-) for the source breakdown section.
- 📊 TABLES: If the user explicitly asks for a table, comparison, or if the data is best shown in a grid, generate a clean, properly formatted Markdown Table.
- 🌟 EMOJIS: Use premium, context-aware emojis (🛑, ✅, 📰, 🕵️‍♂️, 💡, 🚨, 📉). Keep it classy.

You MUST structure your explanation EXACTLY like this (translate this structure if a specific language is requested):

1. The Direct Punch: Start immediately with a conversational, direct response to the user's claim. (If Hinglish: "Nahi bro, ye galat hai 🛑". If Pure Hindi: "नहीं भाई, यह दावा बिल्कुल गलत है 🛑").\\n\\n
   
### **🔍 Source-by-Source Breakdown**\n\n
Break down the evidence clearly using the top 3-4 sources. YOU MUST USE STRICT NUMBERING (1., 2., 3.). DO NOT USE BULLETS (-).\n\n
1. 📰 **[Source Name 1]** reports that... 
2. 📰 **[Source Name 2]** confirms that... 
3. 📰 **[Source Name 3]** clarifies that...\n\n

### **💡 The Bottom Line**\\n\\n
Wrap up smoothly. Explain exactly where the confusion started or summarize the absolute truth.

--------------------------------
CONFIDENCE SCORE RUBRIC (0-100)
--------------------------------
90-100: Multiple Official/Major News sources perfectly agree or fully debunk the claim.
75-89: Reliable sources agree, but missing official Govt/Company confirmation.
40-74: Sources are contradicting, or claim is heavily nuanced.
0-39: Not Enough Evidence.

--------------------------------
VERDICT RULES & ADVANCED MISINFORMATION DETECTION
--------------------------------
"True" → Reliable sources fully support the user's EXACT text claim.
"False" → Reliable sources debunk the user's claim, OR it's a satirical post, movie prop, or meme mistaken as reality.
"Misleading" → The claim is half-true, taken out of context, or lacks crucial background info.
"Manipulated/Deepfake" → If sources confirm the image/video is AI-generated, morphed, or photoshopped to spread fake news.
"Propaganda" → If the claim is a known orchestrated political rumor, fake WhatsApp forward, or hate-speech disguised as facts.
"Not Enough Evidence" → No reliable official/news sources found.
"Not Yet Happened" → The claim is about a future date.


--------------------------------
OUTPUT FORMAT (STRICT JSON)
--------------------------------
Return ONLY valid JSON. Extract a clean, human-readable "name" from the URLs (e.g., "timesofindia.indiatimes.com" -> "Times of India"). Make sure to use \\n\\n for line breaks inside the explanation string.

{
  "verdict": "True" | "False" | "Misleading" | "Not Enough Evidence" | "Not Yet Happened",
  "confidenceScore": number,
  "explanation": "Natural, highly aesthetic, markdown-formatted explanation following the Master Writer structure with gaps, tables (if needed), lists, and bold headings.",
  "sources": [
    { "name": "Clean Publication Name", "url": "URL", "stance": "support/refute/neutral", "score": number }
  ]
}

--------------------------------
FILTERED SEARCH RESULTS
--------------------------------
${filteredSearchContext}
`;

    let finalContentArray = [prompt];
    if (finalImagePart) {
      finalContentArray.push(finalImagePart);
    }
    const llmresponse = await model.generateContent(finalContentArray);
    const llmResponseText = llmresponse.response.text();

    const finallmResponse = JSON.parse(llmResponseText);


    return finallmResponse;
  } catch (error) {
    console.error("❌ CoreEngine Crash Hua:", error);
    throw new Error("Ai did not responded Try again");
  }
  }


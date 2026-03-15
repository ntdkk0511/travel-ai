import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDays, parseISO, format } from "date-fns";
import { genAI } from "../app.js";

const LANG_INSTRUCTIONS = {
  ja: "必ず日本語のみで回答してください。他の言語を使わないでください。",
  en: "You MUST respond in English only. Do not use any other language.",
  zh: "你必须只用中文回答。请勿使用其他语言。整个回答都必须是中文。",
  ko: "반드시 한국어로만 답변해 주세요. 다른 언어를 사용하지 마세요. 전체 답변을 한국어로 작성하세요.",
};

export const refinePlan = async (req, res) => {
  const {
    originalPlan,   // 最初に生成されたプランテキスト
    feedback,       // ユーザーの追加要望
    startDate,
    endDate,
    stayType,
    nights = 0,
    stayLocation,
    lang = "ja",
  } = req.body;

  if (!originalPlan || !feedback) {
    return res.status(400).json({ error: "originalPlan と feedback は必須です" });
  }

  try {
    console.log('aaaaaaaaaaaa')
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log('aaaaabbbbbbb')
    const langInstruction = LANG_INSTRUCTIONS[lang] ?? LANG_INSTRUCTIONS.ja;

    let prompt = `${langInstruction}\n\n`;
    prompt += `The following is an existing travel plan:\n`;
    prompt += `---\n${originalPlan}\n---\n\n`;
    prompt += `The user has an additional request:\n"${feedback}"\n\n`;
    prompt += `Please revise the travel plan to incorporate this request while keeping the overall schedule structure.\n`;
    prompt += `Trip start date: ${startDate}\n`;
    prompt += `Trip end date: ${endDate}\n`;
    prompt += `Trip type: ${stayType}\n`;
    if (stayType === "宿泊") {
      prompt += `Number of nights: ${nights}\n`;
      if (stayLocation) prompt += `Stay location: ${stayLocation}\n`;
    }
    prompt += `\n[Critical Rule - Route Data]\n`;
    prompt += `At the very end of your response, add ONE line in this exact format:\n`;
    prompt += `Locations: [place1, place2, place3]\n`;
    prompt += `IMPORTANT: The place names inside Locations:[...] MUST be written in Japanese. This is required for the map API.\n\n`;
    prompt += `[Language Rule - Highest Priority]\n`;
    prompt += `${langInstruction} Apply this to all text EXCEPT the Locations:[...] line.`;

    console.log(">>> [refinePlan] Gemini 2.5 に接続中...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log(">>> [refinePlan] 再生成完了");
    res.json({
      plan: text,
      startDate,
      endDate,
      nights,
      stayLocation: stayLocation || "",
    });
  } catch (err) {
    console.error("--- [refinePlan エラー] ---", err.message);
    res.status(500).json({ error: "プランの再生成に失敗しました" });
  }
};
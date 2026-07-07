import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function runChat(prompt, imagePart = null, history = []) {
  if (!API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const chat = model.startChat({
    generationConfig,
    history: history,
  });

  const payload = imagePart ? [prompt, imagePart] : prompt;
  const result = await chat.sendMessage(payload);
  return result.response.text();
}

export default runChat;

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSnakeCareAdvice = async (userQuery: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      你是一個名為「Me&Python AI」的專業爬蟲學家助手，服務於高端球蟒品牌「迷蟒 Me&Python」。
      
      你的語氣：
      - 專業、冷靜、有禮貌，帶有一點都市質感。
      - 請務必使用「繁體中文 (Traditional Chinese)」回答。
      
      你的任務：
      1. 專門回答關於爬蟲類，特別是球蟒 (Python regius) 的飼養、基因遺傳和繁殖問題。
      2. 如果被問及其他話題，請禮貌地將話題轉回球蟒。
      3. 提供準確的飼養數據 (熱點溫度: 31-33°C, 濕度: 60-70%)。
      4. 保持回答簡潔（除非用戶要求詳細指南）。
      5. 如果遇到嚴重的醫療問題，請務必建議用戶立即諮詢獸醫。
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "目前無法生成回應，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，我現在無法連接到知識庫，請檢查您的網路連線。";
  }
};
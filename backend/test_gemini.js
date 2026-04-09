require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const testGenAI = async () => {
  try {
    console.log("Testing GenAI Key:", process.env.GEMINI_API_KEY ? "Found" : "Missing");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let promptString = "SYSTEM INSTRUCTION: Test.\nASSISTANT: ";
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: promptString
    });
    
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Gemini API Error:", err.message);
  }
};
testGenAI();

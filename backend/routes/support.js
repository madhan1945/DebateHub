const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // System instruction definition
    const systemInstruction = "You are the DebateHub AI Support Agent. You represent DebateHub, a platform for structured arguments. Help users concisely. If they ask about reputation, it is gained via upvotes. If they ask about toxicity, Anthropic Claude moderates it. If they ask about subscriptions, we have mock Stripe/Razorpay tiers on /subscription. If a problem genuinely seems too complex, tell them you've flagged it and a human support agent will email them shortly.";

    // Convert OpenAI array format into a flat string sequence to feed to Gemini
    let promptString = `SYSTEM INSTRUCTION: ${systemInstruction}\n\n--- CONVERSATION HISTORY ---\n`;
    messages.forEach(msg => { promptString += `\n${msg.role.toUpperCase()}: ${msg.content}`; });
    promptString += `\nASSISTANT: `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptString
    });

    return res.status(200).json({ success: true, message: response.text });
  } catch (err) {
    console.error('Gemini Support Chat Error:', err);
    if (err.message && err.message.includes('503')) {
      return res.status(503).json({ success: false, message: "Sorry, Google Gemini is currently experiencing extreme global traffic demands. Please try asking again in a few minutes." });
    }
    return res.status(500).json({ success: false, message: `DIAGNOSTIC ERROR: ${err.message}` });
  }
});

module.exports = router;

require('dotenv').config();
const OpenAI = require('openai');

const testOpenAI = async () => {
  try {
    console.log("Testing key:", process.env.OPENAI_API_KEY ? "Found" : "Missing");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello!' }],
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI Error:", err.message);
  }
};
testOpenAI();

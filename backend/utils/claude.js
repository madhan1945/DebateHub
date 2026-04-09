const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

/**
 * Checks if text contains toxic content (hate speech, severe harassment, threats).
 * @param {string} text 
 * @returns {Promise<{ isToxic: boolean, reason?: string }>}
 */
const checkToxicity = async (text) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('No Anthropic API key, skipping toxicity check');
    return { isToxic: false };
  }
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      system: 'You are a strict automated toxicity moderator. Analyze the text for hate speech, severe direct harassment, racism, physical threats, or extremely inappropriate content meant to attack someone. (Standard heated debate arguments on controversial topics are allowed, only flag truly toxic/abusive behavior). Return valid JSON only, using this schema: { "isToxic": boolean, "reason": "why if toxic" }.',
      messages: [{ role: 'user', content: text }],
    });

    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isToxic: false };

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error('Toxicity Check Error:', error.message);
    // Fail open - don't block user if AI API is down
    return { isToxic: false };
  }
};

/**
 * Summarizes an array of debate arguments.
 * @param {string} debateTitle 
 * @param {Array<{side: string, content: string}>} argumentsList 
 * @returns {Promise<string>}
 */
const summarizeThread = async (debateTitle, argumentsList) => {
  if (!process.env.ANTHROPIC_API_KEY) return 'AI Summarization unavailable.';
  if (!argumentsList || argumentsList.length === 0) return 'Not enough arguments to summarize.';

  const formattedArgs = argumentsList.map(a => `[${a.side.toUpperCase()}]: ${a.content}`).join('\n\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: 'You are an objective debate summarizer. Given the debate title and arguments, summarize the key points made by both the SUPPORT and OPPOSE sides in a balanced, concise paragraph.',
      messages: [{ role: 'user', content: `Debate: ${debateTitle}\n\nArguments:\n${formattedArgs}` }],
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Summarize Error:', error.message);
    return 'Failed to generate summary.';
  }
};

/**
 * Generates debate topics for a given category.
 * @param {string} category 
 * @returns {Promise<Array<{title: string, description: string}>>}
 */
const generateTopics = async (category) => {
  if (!process.env.ANTHROPIC_API_KEY) return [];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 400,
      system: 'You generate engaging, controversial, and nuanced debate topics. Return valid JSON only, containing an array of 3 objects with `title` and `description`.',
      messages: [{ role: 'user', content: `Generate 3 debate topics for the category: ${category}` }],
    });

    const jsonMatch = response.content[0].text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Topic Gen Error:', error.message);
    return [];
  }
};

module.exports = {
  checkToxicity,
  summarizeThread,
  generateTopics
};

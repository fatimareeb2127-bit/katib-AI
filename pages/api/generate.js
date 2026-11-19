import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const rateBuckets = new Map();

function isRateLimited(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const key = String(forwarded || req.socket?.remoteAddress || 'local');
  const now = Date.now();
  const bucket = rateBuckets.get(key) || [];
  const recent = bucket.filter((time) => now - time < 60 * 1000);
  if (recent.length >= 20) {
    rateBuckets.set(key, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
  return false;
}

const prompts = {
  generate: ({ text, style = 'Professional', tone = 'Neutral', length = 'Medium', audience = 'General', language = 'English' }) =>
    `Write original content about the following instruction. Use a ${style} style, ${tone} tone, ${length} length, for a ${audience} audience, in ${language}. Return polished prose only.\n\nInstruction:\n${text}`,
  grammar: ({ text }) =>
    `Analyze the text for grammar, spelling, punctuation, clarity, and sentence structure. Return the revised text first, then a concise bulleted list of changes. Do not invent or change meaning.\n\nText:\n${text}`,
  paraphrase: ({ text, style = 'Standard' }) =>
    `Rewrite the following text in a ${style} style while preserving its exact meaning. Return only the rewritten text.\n\nText:\n${text}`,
  summarize: ({ text, format = 'Key points' }) =>
    `Create a ${format} summary of the following text. Preserve factual accuracy and clearly mark that no unsupported facts are inferred.\n\nText:\n${text}`,
  rewriter: ({ text }) =>
    `Improve clarity, readability, vocabulary, and sentence flow while preserving the author's meaning. Remove unnecessary repetition. Return only the improved text.\n\nText:\n${text}`,
  expand: ({ text }) =>
    `Expand the following sentence or passage with useful detail while preserving its meaning. Do not introduce unsupported facts.\n\nText:\n${text}`,
  shorten: ({ text }) =>
    `Shorten the following passage into clear, concise writing while preserving its meaning.\n\nText:\n${text}`,
  tone: ({ text, tone = 'Professional' }) =>
    `Rewrite the following text in a ${tone} tone while preserving its meaning.\n\nText:\n${text}`,
  translate: ({ text, language = 'Spanish' }) =>
    `Translate the following text into ${language}. Preserve technical terminology unless a standard equivalent is appropriate. Return only the translation.\n\nText:\n${text}`,
  academic: ({ text, task = 'Improve this academic text' }) =>
    `Act as an academic writing assistant. Task: ${task}. Preserve the author's meaning, avoid fabricated references or findings, and flag unsupported claims.\n\nText:\n${text}`,
  analyze: ({ text }) =>
    `Analyze this text for writing quality, readability, sentence complexity, repetition, passive voice, unsupported claims, and structure. Return actionable, concise findings and no reliability claims about AI-generated text detection.\n\nText:\n${text}`,
};

const allowedActions = new Set(Object.keys(prompts));

export default async function generateAction(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'AI is not configured. Add OPENAI_API_KEY to the server environment.',
    });
  }

  if (isRateLimited(req)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many AI requests. Please wait one minute and try again.' });
  }

  const { action = 'generate', text = '', userInput, ...options } = req.body || {};
  if (!allowedActions.has(String(action))) {
    return res.status(400).json({ error: 'Unknown AI action.' });
  }
  const content = String(text || userInput || '').trim();
  if (!content) return res.status(400).json({ error: 'Text is required.' });
  if (content.length > 30000) return res.status(413).json({ error: 'Text exceeds 30,000 characters.' });

  const promptBuilder = prompts[action] || prompts.generate;

  try {
    const completion = await Promise.race([
      openai.createChatCompletion({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional, accurate writing assistant. Never fabricate citations, data, studies, findings, or quotations.' },
          { role: 'user', content: promptBuilder({ text: content, ...options }) },
        ],
        temperature: action === 'generate' ? 0.7 : 0.35,
        max_tokens: 1600,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), 60000)),
    ]);

    const output = completion.data?.choices?.[0]?.message?.content?.trim();
    if (!output) throw new Error('The AI provider returned no content.');
    return res.status(200).json({ output });
  } catch (error) {
    const status = error?.response?.status === 429 ? 429 : 502;
    const message = error?.response?.data?.error?.message || error.message || 'AI request failed.';
    return res.status(status).json({ error: message });
  }
}
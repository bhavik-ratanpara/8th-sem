import OpenAI from 'openai';

const kilo = new OpenAI({
  baseURL: 'https://api.kilo.ai/api/gateway',
  apiKey: 'anonymous',
});

export async function generateWithKilo(
  messages: {role: 'user' | 'assistant' | 'system'; content: string}[],
  options?: {temperature?: number; maxTokens?: number}
) {
  const completion = await kilo.chat.completions.create({
    model: 'kilo-auto/free',
    messages: messages as any,
    temperature: options?.temperature,
    max_tokens: options?.maxTokens,
  });
  return completion.choices[0]?.message?.content || '';
}

export async function generateWithFallback(
  messages: {role: 'user' | 'assistant' | 'system'; content: string}[],
  options?: {temperature?: number; maxTokens?: number}
) {
  const hasGeminiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_');
  
  if (hasGeminiKey) {
    try {
      console.log('[AI] Using Gemini (gemini-3.1-flash-lite-preview)');
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
      
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.warn('[AI] Gemini failed, falling back to Kilo:', error);
    }
  }
  
  console.log('[AI] Using Kilo (kilo-auto/free)');
  return generateWithKilo(messages, options);
}
import OpenAI from 'openai';

// Groq uses the exact same SDK as OpenAI
const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function generateWithGroq(
  messages: {role: 'user' | 'assistant' | 'system'; content: string}[],
  options?: {temperature?: number; maxTokens?: number}
) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: messages as any,
    temperature: options?.temperature ?? 0.3,
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
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout')), 5000)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]) as any;

      return result.response.text();
    } catch (error) {
      console.warn('[AI] Gemini failed, falling back to Groq:', error);
    }
  }
  
  console.log('[AI] Using Groq (llama-3.3-70b-versatile)');
  return generateWithGroq(messages, options);
}

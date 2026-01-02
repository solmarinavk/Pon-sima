// ============================================
// AI UTILITIES - Prepared for future integration
// ============================================

/**
 * IMPORTANT: These are STUB functions for AI integration
 *
 * To activate:
 * 1. Choose an AI provider (OpenAI, Anthropic Claude, Google Gemini)
 * 2. Install the SDK: npm install openai / @anthropic-ai/sdk / @google/generative-ai
 * 3. Add API key to wrangler secrets: wrangler secret put AI_API_KEY
 * 4. Implement the actual API calls below
 * 5. Update wrangler.toml to add AI_API_KEY binding
 */

interface ExampleGenerationParams {
  word: string;
  translation: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  context?: string;
}

interface GeneratedExample {
  spanish_sentence: string;
  english_translation: string;
  context: string;
}

/**
 * Generate contextual example sentences using AI
 *
 * @param params - Word and context information
 * @returns Generated example sentence in Spanish and English
 *
 * TODO: Implement with OpenAI/Claude/Gemini API
 */
export async function generateExample(
  params: ExampleGenerationParams
): Promise<GeneratedExample | null> {
  // STUB IMPLEMENTATION
  // Replace this with actual AI API call

  console.log('AI Example Generation (STUB) called with:', params);

  // Simulated response - replace with actual AI call
  return {
    spanish_sentence: `Ejemplo generado para: ${params.word}`,
    english_translation: `Generated example for: ${params.translation}`,
    context: 'AI-generated example (placeholder)',
  };

  /* EXAMPLE IMPLEMENTATION WITH OPENAI:

  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: env.AI_API_KEY, // from Cloudflare secrets
  });

  const prompt = `Generate a natural Spanish sentence using the word "${params.word}" (${params.translation})
  appropriate for ${params.level} level students.
  ${params.context ? `Context: ${params.context}` : ''}

  Return JSON with:
  - spanish_sentence: the example sentence in Spanish
  - english_translation: the English translation
  - context: brief explanation of when to use it
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'You are a Spanish language teacher creating example sentences.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(completion.choices[0].message.content);
  return result;
  */
}

/**
 * Explain a common mistake in Spanish
 *
 * @param userAnswer - What the student wrote
 * @param correctAnswer - The correct answer
 * @returns Explanation of the mistake
 *
 * TODO: Implement with AI API
 */
export async function explainMistake(
  userAnswer: string,
  correctAnswer: string
): Promise<string | null> {
  // STUB IMPLEMENTATION
  console.log('AI Mistake Explanation (STUB) called');

  return `The correct answer is "${correctAnswer}". You wrote "${userAnswer}". [AI explanation would go here]`;

  /* EXAMPLE IMPLEMENTATION:

  const prompt = `A Spanish student wrote "${userAnswer}" but the correct answer is "${correctAnswer}".
  Explain the mistake briefly and kindly in English, suitable for a beginner learner.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'You are a patient Spanish tutor.' },
      { role: 'user', content: prompt }
    ]
  });

  return completion.choices[0].message.content;
  */
}

/**
 * Generate pronunciation hints using IPA or simplified phonetics
 *
 * @param word - Spanish word
 * @returns Pronunciation guide
 *
 * TODO: Implement with AI or phonetics library
 */
export async function getPronunciationHint(word: string): Promise<string | null> {
  // STUB IMPLEMENTATION
  console.log('Pronunciation hint (STUB) requested for:', word);

  return `[Pronunciation guide for "${word}" would appear here]`;

  /* NOTE: You could also use Cloudflare AI for TTS:

  const response = await env.AI.run('@cf/meta/m2m100-1.2b', {
    text: word,
    source_lang: 'spanish',
    target_lang: 'english'
  });

  Or use a dedicated TTS service like ElevenLabs, Google TTS, etc.
  */
}

/**
 * Suggest related vocabulary based on a word
 *
 * @param word - Spanish word
 * @param count - Number of suggestions
 * @returns Array of related words
 */
export async function suggestRelatedWords(
  word: string,
  count: number = 5
): Promise<string[]> {
  // STUB IMPLEMENTATION
  console.log('Related words (STUB) requested for:', word);

  return [
    `Related to ${word} #1`,
    `Related to ${word} #2`,
    `Related to ${word} #3`,
  ];
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * AI Provider configuration
 * Update this when you choose your AI provider
 */
export const AI_CONFIG = {
  provider: 'none', // 'openai' | 'anthropic' | 'gemini' | 'cloudflare-ai' | 'none'
  model: 'gpt-4-turbo', // Update based on provider
  enabled: false, // Set to true when AI is configured
};

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return AI_CONFIG.enabled;
}

import type { Business } from '../supabase/types';

export type ReviewGeneratorInput = {
  business: Pick<Business, 'name' | 'owner_name' | 'owner_title' | 'type' | 'service_list'>;
  feedback: {
    contact_name: string;
    rating: number;
    liked_items: string[];
    comment?: string;
  };
  style: 'formal' | 'casual' | 'enthusiastic' | 'simple';
  custom_instructions?: string;
};

export type ReviewGeneratorOutput =
  | { review: string; generated: true }
  | { generated: false; reason: 'low_rating' };

const TONE_INSTRUCTIONS: Record<string, string> = {
  simple: 'Plain, direct. Customer speaks plainly. Short sentences. Natural.',
  enthusiastic: 'Warm, excited. Customer is genuinely thrilled. Express genuine enthusiasm.',
  casual: 'Conversational. Like telling a friend about their experience.',
  formal: 'Professional. More structured sentences. Polite and businesslike.',
};

function buildSystemPrompt(style: string, customInstructions?: string): string {
  const tone = TONE_INSTRUCTIONS[style] || TONE_INSTRUCTIONS.simple;

  return `You are a real customer writing a Google Maps review for a local business.
You write in first person, "I" perspective.
Write 3-5 sentences. Sound like a genuine person, not AI.
Do NOT use: "great service", "highly recommended", "would definitely recommend" as standalone phrases.
Do NOT use: emojis, asterisks, or markdown in the review text.
Always include specific details from what the customer liked.
Be specific — mention the owner's name if provided.
End naturally. Include ⭐⭐⭐⭐⭐ at the end.

TONE: ${tone}${customInstructions ? `\n\nAdditional context from the business: ${customInstructions}` : ''}

---
Output format (JSON only):
{
  "review": "full review text with stars at end",
  "generate": true
}

If rating < 4, return:
{
  "generate": false,
  "reason": "low_rating"
}

Never explain. Only return the JSON object.`;
}

export async function generateReview(input: ReviewGeneratorInput): Promise<ReviewGeneratorOutput> {
  const { business, feedback, style, custom_instructions } = input;

  if (feedback.rating < 4) {
    return { generated: false, reason: 'low_rating' };
  }

  const systemPrompt = buildSystemPrompt(style, custom_instructions);

  const userPrompt = `Business: ${business.name}
Owner: ${business.owner_name} (${business.owner_title})
Customer: ${feedback.contact_name}
Rating: ${feedback.rating} stars
Liked: ${feedback.liked_items.join(', ') || 'everything'}
${feedback.comment ? `Comment: ${feedback.comment}` : ''}`;

  try {
    const response = await fetch('https://api.gameron.me/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GAMERON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gameron API error:', response.status, errorText);
      throw new Error(`Gameron API returned ${response.status}`);
    }

    const data = await response.json();

    // Gameron API returns { content: "...", role: "assistant" } or similar
    const content = data.content || data.message?.content || '';

    // Parse JSON from the response
    let parsed: { review?: string; generate?: boolean };
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, use the content as the review
        parsed = { review: content.trim(), generate: true };
      }
    } catch {
      parsed = { review: content.trim(), generate: true };
    }

    if (parsed.generate === false) {
      return { generated: false, reason: 'low_rating' };
    }

    return {
      review: parsed.review || content.trim(),
      generated: true,
    };
  } catch (error) {
    console.error('Review generation failed:', error);
    // Fallback: generate a simple review
    const likedText = feedback.liked_items.length > 0
      ? `I particularly appreciated ${feedback.liked_items.slice(0, 3).join(' and ')}.`
      : '';

    const fallbackReview = `I recently visited ${business.name} and had a wonderful experience. ${likedText} The owner ${business.owner_name} and the team made sure everything was perfect. I would definitely come back! ⭐⭐⭐⭐⭐`;

    return {
      review: fallbackReview,
      generated: true,
    };
  }
}

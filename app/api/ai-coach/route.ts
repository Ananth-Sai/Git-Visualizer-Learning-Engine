import { NextRequest, NextResponse } from 'next/server';

// In-memory sliding window rate limiter for server key fallback
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRateLimits = new Map<string, RateLimitRecord>();
const FREE_TIER_MAX_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  // Clean expired records periodically
  if (ipRateLimits.size > 10000) {
    for (const [key, val] of ipRateLimits.entries()) {
      if (now > val.resetTime) ipRateLimits.delete(key);
    }
  }

  if (!record || now > record.resetTime) {
    ipRateLimits.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: FREE_TIER_MAX_PER_MINUTE - 1, resetInSec: 60 };
  }

  if (record.count >= FREE_TIER_MAX_PER_MINUTE) {
    const resetInSec = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec };
  }

  record.count += 1;
  const resetInSec = Math.ceil((record.resetTime - now) / 1000);
  return { allowed: true, remaining: FREE_TIER_MAX_PER_MINUTE - record.count, resetInSec };
}

export async function POST(req: NextRequest) {
  try {
    const { context, systemPrompt } = await req.json();
    const provider = req.headers.get('x-provider') || 'default-free';
    const customApiKey = req.headers.get('x-custom-api-key');
    const customModel = req.headers.get('x-custom-model');

    // Extract client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0] : req.headers.get('x-real-ip')) || '127.0.0.1';

    // Apply Rate Limiting ONLY on free tier (bypassed if user provides their own API key)
    if (!customApiKey) {
      const rateLimit = checkRateLimit(clientIp);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: `Rate limit reached on free tier (${FREE_TIER_MAX_PER_MINUTE} req/min). Please wait ${rateLimit.resetInSec}s or configure your own BYOK key in Settings.`,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(rateLimit.resetInSec),
            },
          }
        );
      }
    }

    const promptText = `
User Context:
${JSON.stringify(context, null, 2)}

Provide helpful, clear, and encouraging Git advice. Return your advice in plain text with any recommended commands in backticks.
`;

    // 1. OpenAI BYOK Provider
    if (provider === 'openai' && customApiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customApiKey}`,
        },
        body: JSON.stringify({
          model: customModel || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptText },
          ],
          temperature: 0.4,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: response.status });
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      return NextResponse.json({ advice: content });
    }

    // 2. Anthropic BYOK Provider
    if (provider === 'anthropic' && customApiKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': customApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: customModel || 'claude-3-5-sonnet-20241022',
          system: systemPrompt,
          messages: [{ role: 'user', content: promptText }],
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: `Anthropic error: ${err}` }, { status: response.status });
      }

      const data = await response.json();
      const content = data.content[0]?.text || '';
      return NextResponse.json({ advice: content });
    }

    // 3. Google Gemini (BYOK or Server Free Tier with Multi-Model Fallback Chain)
    const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const candidateModels = customModel
        ? [customModel]
        : [
            'gemini-3.7-flash',
            'gemini-3.6-flash',
            'gemini-3.5-flash',
            'gemini-2.5-flash',
            'gemini-flash-latest',
          ];

      for (const model of candidateModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\n${promptText}` }],
                  },
                ],
                generationConfig: {
                  maxOutputTokens: 300,
                  temperature: 0.3,
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (content) {
              return NextResponse.json({ advice: content });
            }
          }
        } catch {
          // Attempt next model in fallback chain
          continue;
        }
      }
    }

    // 4. Fallback Default Educational Response
    let advice = '💡 Keep exploring! Try making a commit or branching to see the fluid topology in action.';
    if (context?.errorMessage) {
      advice = `⚠️ Error: "${context.errorMessage}". Check your command syntax or run \`git status\` to review current repository state.`;
    } else if (context?.levelObjective) {
      advice = `🎯 Objective: ${context.levelObjective}. Try executing the next recommended step in your learning path!`;
    }

    return NextResponse.json({ advice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal AI proxy error' }, { status: 500 });
  }
}

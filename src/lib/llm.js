// Shared LLM helper. Single place that knows how to turn a prompt into a
// parsed JSON object, trying providers in order of preference and falling back
// through whichever API keys are configured. Groq is primary.
//
//   Groq -> Gemini -> Claude -> OpenAI -> null
//
// Each caller is responsible for its own non-LLM fallback when this returns null.

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Tolerant JSON extraction: strips markdown fences and grabs the first {...} block.
 * @param {string} rawText
 * @returns {object|null}
 */
function parseJsonLoose(rawText) {
  if (!rawText) return null;
  const cleaned = rawText.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
  // Try a direct parse first (Groq/OpenAI JSON mode return clean JSON)
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to extracting the first balanced-looking object/array block
    const block = cleaned.match(/[[{][\s\S]*[\]}]/);
    if (!block) return null;
    try {
      return JSON.parse(block[0]);
    } catch {
      return null;
    }
  }
}

/**
 * Call the configured LLM providers in order and return parsed JSON, or null.
 * @param {string} prompt
 * @param {object} [opts]
 * @param {string} [opts.system] system instruction
 * @param {number} [opts.maxTokens]
 * @param {number} [opts.temperature]
 * @param {function} [opts.addLog] optional (message, type) logger
 * @returns {Promise<object|null>}
 */
export async function callLLMForJson(prompt, opts = {}) {
  const { system, maxTokens = 1024, temperature = 0.2, addLog } = opts;
  const log = typeof addLog === 'function' ? addLog : () => {};

  // 1. Groq (primary) — OpenAI-compatible chat completions with JSON mode
  if (process.env.GROQ_API_KEY) {
    try {
      log(`Calling Groq (${GROQ_MODEL}) for JSON completion...`, 'info');
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system || 'You are a precise assistant. Return ONLY valid JSON.' },
            { role: 'user', content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = parseJsonLoose(data?.choices?.[0]?.message?.content || '');
        if (parsed) {
          log('Groq returned JSON.', 'success');
          return parsed;
        }
        throw new Error('Groq returned no parseable JSON');
      }
      throw new Error(`Groq API status ${res.status}`);
    } catch (err) {
      log(`Groq failed: ${err.message}. Trying next provider...`, 'warn');
    }
  }

  // 2. Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      log('Calling Gemini 2.0 Flash for JSON completion...', 'info');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: system ? `${system}\n\n${prompt}` : prompt }] }],
            generationConfig: { temperature, maxOutputTokens: maxTokens, responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(12000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const parsed = parseJsonLoose(data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
        if (parsed) {
          log('Gemini returned JSON.', 'success');
          return parsed;
        }
        throw new Error('Gemini returned no parseable JSON');
      }
      throw new Error(`Gemini API status ${res.status}`);
    } catch (err) {
      log(`Gemini failed: ${err.message}. Trying next provider...`, 'warn');
    }
  }

  // 3. Claude
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      log('Calling Claude 3.5 Sonnet for JSON completion...', 'info');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          system: system || 'You are a precise assistant. Return ONLY valid JSON.',
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = parseJsonLoose(data?.content?.[0]?.text || '');
        if (parsed) {
          log('Claude returned JSON.', 'success');
          return parsed;
        }
        throw new Error('Claude returned no parseable JSON');
      }
      throw new Error(`Anthropic API status ${res.status}`);
    } catch (err) {
      log(`Claude failed: ${err.message}. Trying next provider...`, 'warn');
    }
  }

  // 4. OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      log('Calling OpenAI (gpt-4o-mini) for JSON completion...', 'info');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system || 'You are a precise assistant. Return ONLY valid JSON.' },
            { role: 'user', content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = parseJsonLoose(data?.choices?.[0]?.message?.content || '');
        if (parsed) {
          log('OpenAI returned JSON.', 'success');
          return parsed;
        }
        throw new Error('OpenAI returned no parseable JSON');
      }
      throw new Error(`OpenAI API status ${res.status}`);
    } catch (err) {
      log(`OpenAI failed: ${err.message}. No more providers.`, 'warn');
    }
  }

  return null;
}

export { GROQ_MODEL };

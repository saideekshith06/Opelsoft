// Shared LLM helper. Single place that turns a prompt into a parsed JSON object.
// Groq is the only provider. If GROQ_API_KEY is missing or the call fails, this
// returns null and each caller falls back to its own non-LLM path.

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Tolerant JSON extraction: strips markdown fences and grabs the first {...}/[...] block.
 * @param {string} rawText
 * @returns {object|null}
 */
function parseJsonLoose(rawText) {
  if (!rawText) return null;
  const cleaned = rawText.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
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
 * Call Groq and return parsed JSON, or null on any failure.
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

  if (!process.env.GROQ_API_KEY) {
    log('GROQ_API_KEY not set; skipping LLM call.', 'warn');
    return null;
  }

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
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`Groq API status ${res.status}`);
    }

    const data = await res.json();
    const parsed = parseJsonLoose(data?.choices?.[0]?.message?.content || '');
    if (parsed) {
      log('Groq returned JSON.', 'success');
      return parsed;
    }
    throw new Error('Groq returned no parseable JSON');
  } catch (err) {
    log(`Groq call failed: ${err.message}`, 'warn');
    return null;
  }
}

export { GROQ_MODEL };

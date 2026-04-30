const normalizeText = (value) => String(value || '').trim();

const getBody = (req) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'CLAUDE_API_KEY missing', mode: 'fallback' });

  try {
    const { prompt = '', budget = 0, location = '', uploads = [] } = getBody(req);

    const promptTrimmed = String(prompt || '').trim();
    const userPrompt = [
      'You are a fashion intent parser for outfit shopping recommendations.',
      'Return STRICT JSON only.',
      'Schema:',
      '{"intentSummary":"string","styleKeywords":["string"],"occasion":"string","timeHint":"day|night|any","promptSignal":"string"}',
      'Rules:',
      '1) intentSummary must reference at least 2 concrete details from the Prompt.',
      '2) styleKeywords must be specific fashion terms (max 8).',
      '3) promptSignal must be a short quote or phrase from the Prompt proving you used it.',
      `Prompt: ${promptTrimmed}`,
      `Budget: ${budget}`,
      `Location: ${location}`,
      `Upload count: ${Array.isArray(uploads) ? uploads.length : 0}`,
    ].join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 180,
        temperature: 0,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: 'Claude request failed', details: errorBody.slice(0, 400), mode: 'fallback' });
    }

    const json = await response.json();
    const text = (json.content || []).filter((block) => block.type === 'text').map((block) => block.text).join('\n').trim();

    let parsed = null;
    try {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }

    if (!parsed && text.includes('{') && text.includes('}')) {
      try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        parsed = JSON.parse(text.slice(start, end + 1));
      } catch {
        parsed = null;
      }
    }

    const styleKeywords = Array.isArray(parsed && parsed.styleKeywords)
      ? parsed.styleKeywords.map((v) => String(v).trim()).filter(Boolean).slice(0, 8)
      : [];

    const summary = normalizeText(parsed && parsed.intentSummary);
    const promptSignal = normalizeText(parsed && parsed.promptSignal);
    const fallbackSummary = promptTrimmed
      ? `Prompt intent for "${promptTrimmed.slice(0, 80)}" in ${location} with budget ${budget}.`
      : `Prompt intent for budget ${budget} in ${location}.`;

    return res.status(200).json({
      intentSummary: summary || text || fallbackSummary,
      styleKeywords,
      occasion: (parsed && parsed.occasion) || '',
      timeHint: (parsed && parsed.timeHint) || '',
      promptSignal: promptSignal || promptTrimmed.slice(0, 60),
      mode: 'live',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Claude intent failed', details: String(error), mode: 'fallback' });
  }
};

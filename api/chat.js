// File location in your repo: /api/chat.js  (repo root, same level as index.html)
// This runs on Vercel's servers, not in the customer's browser — so your
// GEMINI_API_KEY never gets exposed.
//
// Tries gemini-3.6-flash first (current stable GA model as of Sep 2026),
// automatically falls back to gemini-2.5-flash if that fails (overloaded,
// temporarily unavailable, etc.) — so a transient Google-side issue with
// one model doesn't take down the whole chat. If BOTH ever start failing
// with 404, check https://ai.google.dev/gemini-api/docs/models for
// current model names and update the GEMINI_MODELS list below.
//
// SETUP (all free, no card required):
// 1. Go to https://aistudio.google.com/apikey and sign in with Google
// 2. Click "Create API key" — copy it
// 3. In Vercel dashboard → bright-spot project → Settings → Environment Variables
//    add: GEMINI_API_KEY = your key (Type: Secret)
// 4. Redeploy by making a new commit — don't click "Redeploy" on an old
//    deployment entry, that rebuilds the OLD commit instead of the latest one.
//
// This returns responses in the SAME shape the widget already expects
// (the old Anthropic-style {content:[{type:'text', text:...}]} format),
// so index.html does NOT need any changes — only this file changed.

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash'];

async function callGemini(model, system, contents) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { responseMimeType: 'application/json' }
      })
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
  }));

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await callGemini(model, system, geminiContents);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini API error (${model}):`, errText);
        lastError = { status: response.status, text: errText };
        continue; // try the next model in the list
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!text) {
        console.error(`Gemini returned no text (${model}). Full response:`, JSON.stringify(data));
        lastError = { status: 502, text: 'Empty response' };
        continue;
      }

      // Success — re-shape into the format the widget's frontend already
      // parses, so index.html never needs to change.
      return res.status(200).json({
        content: [{ type: 'text', text }]
      });

    } catch (err) {
      console.error(`Chat proxy exception (${model}):`, err);
      lastError = { status: 500, text: String(err) };
    }
  }

  // Every model in the list failed.
  return res.status(lastError?.status || 500).json({ error: 'All Gemini models failed', detail: lastError?.text });
}

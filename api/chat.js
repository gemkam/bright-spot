// File location in your repo: /api/chat.js  (repo root, same level as index.html)
// This runs on Vercel's servers, not in the customer's browser — so your
// GEMINI_API_KEY never gets exposed.
//
// Uses gemini-3.6-flash (current stable GA model as of Sep 2026).
// Gemini 1.5 models are fully shut down; Gemini 2.5 models are scheduled
// to shut down Oct 16, 2026 — if this ever 404s again, check
// https://ai.google.dev/gemini-api/docs/models for the current model name
// and swap it into the URL below.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    // Convert the widget's Anthropic-style messages (role: user/assistant)
    // into Gemini's expected format (role: user/model).
    const geminiContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
      
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: geminiContents,
          generationConfig: {
            // Forces Gemini to return valid JSON directly — matches the
            // strict JSON contract the widget's system prompt requires.
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      console.error('Gemini returned no text. Full response:', JSON.stringify(data));
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }

    // Re-shape into the format the widget's frontend already parses —
    // no changes needed on the index.html side.
    return res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// File location in your repo: /api/chat.js  (repo root, same level as index.html)
// This runs on Vercel's servers, not in the customer's browser — so your
// ANTHROPIC_API_KEY never gets exposed.
//
// SETUP:
// 1. Get an API key from https://console.anthropic.com (Anthropic Console)
// 2. In Vercel dashboard → bright-spot project → Settings → Environment Variables
//    add: ANTHROPIC_API_KEY = your key
// 3. Redeploy

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: system,
        messages: messages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

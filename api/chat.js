// /api/chat.js — Groq (open-source Llama) version. Free, no card.
// Setup: https://console.groq.com/keys -> create key ->
// Vercel env var: GROQ_API_KEY (Secret) -> redeploy.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const groqMessages = [
    { role: 'system', content: system },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    }))
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: groqMessages,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      return res.status(response.status).json({ error: 'Upstream API error', detail: errText });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) return res.status(502).json({ error: 'Empty response from Groq' });

    // Same shape the widget already expects — no index.html changes needed.
    return res.status(200).json({ content: [{ type: 'text', text }] });

  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

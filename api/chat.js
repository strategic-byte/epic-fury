/**
 * EPIC FURY — Anthropic API Proxy
 * Vercel Serverless Function
 *
 * Хранит API ключ в переменных окружения Vercel (ANTHROPIC_API_KEY).
 * Браузер → /api/chat → Anthropic API
 * Ключ никогда не попадает в клиентский код.
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  // CORS headers на все ответы
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const body = req.body;

    // Проверяем базовую структуру запроса
    if (!body || !body.model || !body.messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Пробрасываем статус и тело ответа как есть
    return res.status(response.status).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
}

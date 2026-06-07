import { get } from '@vercel/blob';

const CHARACTER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function getCharacterId(req) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  return typeof id === 'string' ? id : '';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = getCharacterId(req);

  if (!CHARACTER_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: 'Invalid id parameter' });
  }

  try {
    const result = await get(`characters/${id}.json`, {
      access: 'private',
      useCache: false,
    });

    if (!result) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const data = await new Response(result.stream).json();

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Load error:', err);
    return res.status(500).json({
      error: 'Failed to load character',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

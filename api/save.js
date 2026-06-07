import { put } from '@vercel/blob';

const CHARACTER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;

    if (!body) {
      body = await new Promise((resolve) => {
        let dataStr = '';
        req.on('data', (chunk) => { dataStr += chunk; });
        req.on('end', () => {
          try {
            resolve(JSON.parse(dataStr));
          } catch {
            resolve({});
          }
        });
      });
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { id, data } = body || {};

    if (typeof id !== 'string' || !CHARACTER_ID_PATTERN.test(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const blob = await put(`characters/${id}.json`, JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({
      error: 'Failed to save character',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

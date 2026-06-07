import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, data } = req.body;

    if (!id || !data) {
      return res.status(400).json({ error: 'Missing id or data' });
    }

    const blob = await put(`characters/${id}.json`, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ error: 'Failed to save character' });
  }
}

import { list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    // List blobs with the character prefix to find the exact file
    const { blobs } = await list({ prefix: `characters/${id}.json` });

    if (blobs.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Fetch the blob content from its URL
    const blobUrl = blobs[0].url;
    const response = await fetch(blobUrl);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error('Load error:', err);
    return res.status(500).json({ error: 'Failed to load character' });
  }
}

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
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not defined in environment variables. Please set it in Vercel project settings.");
    }

    // List blobs with the character prefix to find the exact file
    const { blobs } = await list({ 
      prefix: `characters/${id}.json`,
      token: token
    });

    if (blobs.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Fetch the blob content from its URL
    const blobUrl = blobs[0].url;
    const response = await fetch(blobUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Load error:', err);
    return res.status(500).json({ 
      error: 'Failed to load character', 
      message: err.message, 
      stack: err.stack 
    });
  }
}

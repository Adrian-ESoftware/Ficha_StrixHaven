import { put } from '@vercel/blob';
import { createHash } from 'node:crypto';

const CHARACTER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;

    if (!body) {
      body = await new Promise((resolve) => {
        let dataStr = '';
        req.on('data', (chunk) => { dataStr += chunk; });
        req.on('end', () => {
          try { resolve(JSON.parse(dataStr)); } catch { resolve({}); }
        });
      });
    } else if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const { id, data, password } = body || {};

    if (typeof id !== 'string' || !CHARACTER_ID_PATTERN.test(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const passwordHash = hashPassword(password);

    const [charBlob] = await Promise.all([
      put(`characters/${id}.json`, JSON.stringify(data), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: 'application/json',
      }),
      put(`characters/${id}/password`, passwordHash, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: 'text/plain',
      }),
    ]);

    return res.status(201).json({ url: charBlob.url });
  } catch (err) {
    if (err?.statusCode === 409 || err?.message?.includes('already exists')) {
      return res.status(409).json({ error: 'Character already exists' });
    }
    console.error('Create error:', err);
    return res.status(500).json({
      error: 'Failed to create character',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

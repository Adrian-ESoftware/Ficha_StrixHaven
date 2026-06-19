import { put, get } from '@vercel/blob';
import { timingSafeEqual, createHash } from 'node:crypto';

const CHARACTER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const VALID_TYPES = ['avatar', 'concept-art'];
const DATA_URI_PATTERN = /^data:(image\/[a-zA-Z+.-]+);base64,/;

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function passwordsMatch(candidate, expected) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return candidateBuffer.length === expectedBuffer.length
    && timingSafeEqual(candidateBuffer, expectedBuffer);
}

function parseDataUri(dataUri) {
  const match = dataUri.match(DATA_URI_PATTERN);
  if (!match) return null;
  const mimeType = match[1];
  const base64 = dataUri.substring(match[0].length);
  return { mimeType, buffer: Buffer.from(base64, 'base64') };
}

function extensionFromMime(mimeType) {
  const map = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
  };
  return map[mimeType] || 'png';
}

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
          try { resolve(JSON.parse(dataStr)); } catch { resolve({}); }
        });
      });
    } else if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const { id, image, type } = body || {};

    if (typeof id !== 'string' || !CHARACTER_ID_PATTERN.test(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Allowed: avatar, concept-art' });
    }

    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image. Must be a data URI' });
    }

    const password = typeof req.headers['x-edit-password'] === 'string'
      ? req.headers['x-edit-password']
      : '';

    const passwordBlob = await get(`characters/${id}/password`, {
      access: 'private',
      useCache: false,
    });

    if (!passwordBlob) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const storedHash = await new Response(passwordBlob.stream).text();

    if (!passwordsMatch(hashPassword(password), storedHash.trim())) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const parsed = parseDataUri(image);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid data URI format' });
    }

    const ext = extensionFromMime(parsed.mimeType);
    const blobPath = `characters/${id}/${type}`;

    const blob = await put(blobPath, parsed.buffer, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: parsed.mimeType,
      cacheControlMaxAge: 31536000,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload image error:', err);
    return res.status(500).json({
      error: 'Failed to upload image',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

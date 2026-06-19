import { get } from '@vercel/blob';
import { timingSafeEqual, createHash } from 'node:crypto';

const CHARACTER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function passwordsMatch(candidate, expected) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return candidateBuffer.length === expectedBuffer.length
    && timingSafeEqual(candidateBuffer, expectedBuffer);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const id = typeof body?.id === 'string' ? body.id : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!CHARACTER_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
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

    return res.status(200).json({ authenticated: true });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({
      error: 'Failed to authenticate',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

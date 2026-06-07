import { timingSafeEqual } from 'node:crypto';

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

  const editPassword = process.env.EDIT_PASSWORD;
  if (!editPassword) {
    return res.status(503).json({ error: 'EDIT_PASSWORD is not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const password = typeof body?.password === 'string' ? body.password : '';
  if (!passwordsMatch(password, editPassword)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  return res.status(200).json({ authenticated: true });
}

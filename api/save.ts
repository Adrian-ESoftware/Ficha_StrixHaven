import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    
    // Parser de segurança caso a Vercel não tenha parseado o JSON automaticamente
    if (!body) {
      body = await new Promise((resolve) => {
        let dataStr = "";
        req.on("data", chunk => dataStr += chunk);
        req.on("end", () => {
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
        // ignore
      }
    }

    const { id, data } = body || {};

    if (!id || !data) {
      return res.status(400).json({ error: 'Missing id or data', received: body });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not defined in environment variables. Please set it in Vercel project settings.");
    }

    const blob = await put(`characters/${id}.json`, JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      token: token,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err: any) {
    console.error('Save error:', err);
    return res.status(500).json({ 
      error: 'Failed to save character', 
      message: err.message, 
      stack: err.stack 
    });
  }
}

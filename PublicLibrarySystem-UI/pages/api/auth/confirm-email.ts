import type { NextApiRequest, NextApiResponse } from 'next';
import { protectedProxyRequest } from '../../../lib/protectedProxy';

type Data = { message?: string; token?: string } | any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const API_BASE_URL = process.env.API_BASE_URL;
  if (!API_BASE_URL) {
    return res.status(500).json({ message: 'API_BASE_URL not configured' });
  }

  // Extract token from query parameters
  const tokenParam = req.query.token;
  const token = typeof tokenParam === "string" ? tokenParam : "";
  if (!token) {
    return res.status(400).json({ message: "Token is missing from query" });
  }

  // Build URL with proper query string parameter
  const url = `${API_BASE_URL}/api/auth/confirm-email?token=${encodeURIComponent(token)}`;

  try {
    const apiRes = await protectedProxyRequest(url, {
      method: 'GET'
    });

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

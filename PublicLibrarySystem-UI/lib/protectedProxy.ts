// /lib/protectedProxy.ts

/**
 * Retrieves a Bearer token from the external GetToken endpoint.
 */
export async function getBearerToken(): Promise<string> {
    const API_BASE_URL = process.env.API_BASE_URL;
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL not configured');
    }
  
    // The API key used for token generation is stored in an env var.
    const apiKey = process.env.SECRET_API_KEY;
    if (!apiKey) {
      throw new Error('SECRET_API_KEY not configured');
    }
  
    const tokenUrl = `${API_BASE_URL}/Token/GetToken?userId=${encodeURIComponent(apiKey)}`;
    const tokenRes = await fetch(tokenUrl, { method: 'GET' });
    if (!tokenRes.ok) {
      throw new Error(`Failed to retrieve token: ${tokenRes.statusText}`);
    }
  
    const tokenText = await tokenRes.text();
    if (!tokenText) {
      throw new Error('Token not returned from GetToken API');
    }
    return tokenText;
}
  
  /**
   * Forwards a request to the given URL using the Bearer token obtained from getBearerToken().
   */
export async function protectedProxyRequest(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await getBearerToken();
  
    // Merge provided headers with the Authorization header
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    // Ensure content-type is set if not already provided
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  
    return fetch(url, { ...options, headers });
}
  
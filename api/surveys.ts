// Vercel Serverless Function: Google Apps Script Proxy
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    // Validate request
    if (!data || !Array.isArray(data.surveys) || data.surveys.length === 0) {
      console.warn('[Vercel API] Invalid payload received');
      return res.status(400).json({ error: 'Invalid payload. Expected a non-empty array of surveys.' });
    }

    const surveyCount = data.surveys.length;
    console.log(`[Vercel API] Forwarding ${surveyCount} survey(s) to Google Apps Script`);

    // Retrieve the Google Apps Script Web App URL from environment variables
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!gasUrl) {
      console.error('[Vercel API] Missing GOOGLE_APPS_SCRIPT_URL environment variable');
      return res.status(500).json({ error: 'Server Configuration Error: Missing Google Apps Script URL' });
    }

    // Server-side fetch to bypass browser CORS and handle HTTP 302 Redirects natively
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        // Send as text/plain to avoid any complex CORS preflight expectations on Google's end
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });

    console.log(`[Vercel API] Apps Script HTTP status: ${gasResponse.status}`);

    if (!gasResponse.ok) {
      console.error(`[Vercel API] Apps Script returned non-200 status: ${gasResponse.status}`);
      return res.status(gasResponse.status).json({ error: `Google Apps Script returned ${gasResponse.status}` });
    }

    // Read the response from the Apps Script
    const responseText = await gasResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Vercel API] Failed to parse JSON from Apps Script:', responseText.substring(0, 100));
      return res.status(502).json({ error: 'Invalid JSON response from Google Apps Script' });
    }

    console.log(`[Vercel API] Apps Script success value: ${responseData.success}`);
    if (responseData.syncedIds) {
      console.log(`[Vercel API] Synced IDs count: ${responseData.syncedIds.length}`);
    }

    // Relay the response back to the React PWA exactly as is
    if (responseData.success === true) {
      return res.status(200).json(responseData);
    } else {
      console.error(`[Vercel API] Apps Script reported an error:`, responseData.error);
      return res.status(400).json(responseData);
    }
    
  } catch (error: any) {
    console.error(`[Vercel API] Server-side fetch failed: ${error.message}`);
    return res.status(500).json({ error: 'Failed to communicate with Google Apps Script' });
  }
}

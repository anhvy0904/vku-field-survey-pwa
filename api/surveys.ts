// Mock API endpoint for Vercel Serverless Functions
// Handles incoming synchronized surveys from the PWA.

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
    if (!data || !Array.isArray(data.surveys)) {
      return res.status(400).json({ error: 'Invalid payload. Expected an array of surveys.' });
    }

    // Simulate backend processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate random failure (for testing retry logic)
    // In production, this would actually insert into a real DB (e.g., PostgreSQL / Supabase)
    const shouldFail = Math.random() < 0.1; // 10% chance to fail
    if (shouldFail) {
      throw new Error('Simulated backend failure');
    }

    console.log(`[API] Successfully received ${data.surveys.length} surveys.`);

    return res.status(200).json({ 
      success: true, 
      message: `Successfully synchronized ${data.surveys.length} surveys.`,
      syncedIds: data.surveys.map((s: any) => s.id)
    });
  } catch (error: any) {
    console.error('[API] Synchronization Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

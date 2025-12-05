// Vercel Serverless Function - POST /api/submit
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answers, completionTime, fingerprint } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    // Check for duplicate submission (if using Vercel KV)
    try {
      if (process.env.KV_REST_API_URL) {
        const existingSubmission = await kv.get(`submission:${fingerprint}`);
        if (existingSubmission) {
          return res.status(429).json({ 
            error: 'You have already submitted this survey. Only one submission per person is allowed.' 
          });
        }
      }
    } catch (kvError) {
      console.log('KV not available, skipping duplicate check');
    }

    // Create submission object
    const submission = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      answers,
      completionTime,
      fingerprint,
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    // Store in Vercel KV if available
    try {
      if (process.env.KV_REST_API_URL) {
        await kv.set(`submission:${fingerprint}`, submission);
        await kv.lpush('submissions', JSON.stringify(submission));
      }
    } catch (kvError) {
      console.log('KV storage failed, continuing without persistence');
    }

    res.status(200).json({ 
      message: 'Thank you! Your response has been recorded.',
      submissionId: submission.id
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
}

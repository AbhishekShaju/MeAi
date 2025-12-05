// Vercel Serverless Function - Admin Submissions Export
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let submissions = [];

    // Try to get from Vercel KV
    try {
      if (process.env.KV_REST_API_URL) {
        const submissionStrings = await kv.lrange('submissions', 0, -1);
        submissions = submissionStrings.map(s => JSON.parse(s));
      }
    } catch (kvError) {
      console.log('KV not available');
    }

    const format = req.query.format || 'json';

    if (format === 'csv') {
      // Generate CSV
      if (submissions.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=meai_responses.csv');
        return res.status(200).send('No submissions yet');
      }

      // Get all unique question IDs
      const questionIds = new Set();
      submissions.forEach(s => {
        Object.keys(s.answers || {}).forEach(qId => questionIds.add(qId));
      });

      // Create CSV header
      const headers = ['id', 'timestamp', 'completionTime', ...Array.from(questionIds)];
      let csv = headers.join(',') + '\n';

      // Add rows
      submissions.forEach(submission => {
        const row = [
          submission.id,
          submission.timestamp,
          submission.completionTime,
          ...Array.from(questionIds).map(qId => {
            const answer = submission.answers[qId];
            if (Array.isArray(answer)) return `"${answer.join('; ')}"`;
            if (typeof answer === 'string' && answer.includes(',')) return `"${answer}"`;
            return answer || '';
          })
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=meai_responses.csv');
      return res.status(200).send(csv);
    }

    // Return JSON
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
}

// Vercel Serverless Function - Admin Analytics
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

    // Return empty analytics if no submissions
    if (submissions.length === 0) {
      return res.status(200).json({
        summary: {
          totalSubmissions: 0,
          averageCompletionTime: 0,
          ageGroupCounts: {},
          placeOfLivingCounts: {}
        },
        questionResponses: {}
      });
    }

    // Calculate analytics
    const summary = {
      totalSubmissions: submissions.length,
      averageCompletionTime: Math.round(
        submissions.reduce((sum, s) => sum + (s.completionTime || 0), 0) / submissions.length
      ),
      ageGroupCounts: {},
      placeOfLivingCounts: {}
    };

    const questionResponses = {};

    submissions.forEach(submission => {
      const answers = submission.answers || {};
      
      // Count demographics
      if (answers.age_group) {
        summary.ageGroupCounts[answers.age_group] = 
          (summary.ageGroupCounts[answers.age_group] || 0) + 1;
      }
      if (answers.place_of_living) {
        summary.placeOfLivingCounts[answers.place_of_living] = 
          (summary.placeOfLivingCounts[answers.place_of_living] || 0) + 1;
      }

      // Aggregate question responses
      Object.entries(answers).forEach(([questionId, answer]) => {
        if (!questionResponses[questionId]) {
          questionResponses[questionId] = {};
        }

        if (Array.isArray(answer)) {
          answer.forEach(a => {
            questionResponses[questionId][a] = 
              (questionResponses[questionId][a] || 0) + 1;
          });
        } else if (typeof answer === 'string' || typeof answer === 'number') {
          questionResponses[questionId][answer] = 
            (questionResponses[questionId][answer] || 0) + 1;
        }
      });
    });

    res.status(200).json({ summary, questionResponses });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
}

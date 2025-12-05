// Vercel Serverless Function - Researcher API
import { questions } from '../_data';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - List all questions
  if (req.method === 'GET') {
    return res.status(200).json(questions);
  }

  // For other methods, return readonly message in serverless mode
  return res.status(503).json({ 
    error: 'Question management requires backend deployment. Questions are currently read-only.',
    message: 'Deploy the backend server to enable question management features.'
  });
}

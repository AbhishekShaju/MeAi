# Vercel Serverless API

This directory contains Vercel serverless functions that handle the backend API.

## Structure

- `form.js` - GET /api/form - Returns survey questions
- `submit.js` - POST /api/submit - Handles survey submissions
- `researcher/questions.js` - Researcher API endpoints
- `admin/analytics.js` - GET /api/admin/analytics - Returns analytics data
- `admin/submissions.js` - GET /api/admin/submissions - Export submissions
- `_data.js` - Shared question data

## How it works

Vercel automatically deploys these as serverless functions. No separate backend deployment needed!

## Storage

By default, submissions are stored in-memory (won't persist).

### Add Persistent Storage (Optional - Free)

1. Go to Vercel Dashboard → Your Project → Storage
2. Create a KV Database (free tier available)
3. Vercel automatically sets environment variables
4. Functions will automatically use KV for storage

## Local Testing

```bash
npm install -g vercel
vercel dev
```

This will run both the React app and serverless functions locally.

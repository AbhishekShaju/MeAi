// API Configuration
// In production on Vercel, use relative paths to hit serverless functions
// In development, use the backend server
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export default API_URL;

// Mock API endpoints for local development
// react-scripts automatically loads this file
module.exports = function(app) {
  const express = require('express');
  app.use(express.json());
  
  // Shared questions data
  const questions = [
    {
      id: 'age_group',
      type: 'single-choice',
      text: 'Age Group',
      required: true,
      locked: true,
      order: 0,
      options: ['13-17', '18-24', '25-34', '35-44', '45-50']
    },
    {
      id: 'place_of_living',
      type: 'single-choice',
      text: 'Place of Living',
      required: true,
      locked: true,
      order: 1,
      options: ['Urban', 'Suburban', 'Rural']
    },
    {
      id: 'happiness_level',
      type: 'rating',
      text: 'On a scale of 1-10, how happy are you with your current life?',
      required: true,
      order: 2,
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      validation: { min: 1, max: 10 }
    },
    {
      id: 'stress_level',
      type: 'rating',
      text: 'How would you rate your stress level in the past week?',
      required: true,
      order: 3,
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      validation: { min: 1, max: 10 }
    },
    {
      id: 'social_connections',
      type: 'single-choice',
      text: 'How satisfied are you with your social connections?',
      required: true,
      order: 4,
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
    },
    {
      id: 'work_life_balance',
      type: 'single-choice',
      text: 'How would you describe your work-life balance?',
      required: true,
      order: 5,
      options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
    },
    {
      id: 'hobbies',
      type: 'multiple-choice',
      text: 'What activities do you enjoy? (Select all that apply)',
      required: false,
      order: 6,
      options: ['Reading', 'Sports', 'Music', 'Art', 'Cooking', 'Gaming', 'Traveling', 'Other']
    },
    {
      id: 'sleep_quality',
      type: 'single-choice',
      text: 'How would you rate your sleep quality?',
      required: true,
      order: 7,
      options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
    },
    {
      id: 'health_rating',
      type: 'rating',
      text: 'How would you rate your overall health?',
      required: true,
      order: 8,
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      validation: { min: 1, max: 10 }
    },
    {
      id: 'future_outlook',
      type: 'single-choice',
      text: 'How do you feel about your future?',
      required: true,
      order: 9,
      options: ['Very Optimistic', 'Optimistic', 'Neutral', 'Pessimistic', 'Very Pessimistic']
    },
    {
      id: 'additional_thoughts',
      type: 'long-text',
      text: 'Is there anything else you would like to share?',
      required: false,
      order: 10
    }
  ];

  // GET /api/form - Return survey questions
  app.get('/api/form', (req, res) => {
    res.json({
      title: 'MeAi Survey',
      description: 'Help us understand you better',
      questions: questions
    });
  });

  // POST /api/submit - Handle survey submissions
  app.post('/api/submit', (req, res) => {
    const { answers, completionTime, fingerprint } = req.body;
    
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    console.log('✅ Survey submitted:', {
      answersCount: Object.keys(answers).length,
      completionTime: completionTime + 's',
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      message: 'Thank you! Your response has been recorded.',
      submissionId: Date.now().toString()
    });
  });

  // GET /api/researcher/questions - Return questions for researcher
  app.get('/api/researcher/questions', (req, res) => {
    res.json(questions);
  });

  // GET /api/admin/analytics - Return empty analytics
  app.get('/api/admin/analytics', (req, res) => {
    res.json({
      summary: {
        totalSubmissions: 0,
        averageCompletionTime: 0,
        ageGroupCounts: {},
        placeOfLivingCounts: {}
      },
      questionResponses: {}
    });
  });

  // GET /api/admin/submissions - Return empty submissions
  app.get('/api/admin/submissions', (req, res) => {
    res.json([]);
  });

  console.log('🚀 Local API endpoints registered:');
  console.log('   GET  /api/form');
  console.log('   POST /api/submit');
  console.log('   GET  /api/researcher/questions');
  console.log('   GET  /api/admin/analytics');
  console.log('   GET  /api/admin/submissions');
};

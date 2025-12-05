import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Generate a simple browser fingerprint
const getBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('fingerprint', 2, 2);
  const canvasData = canvas.toDataURL();
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasHash: canvasData.slice(0, 50)
  };
  
  return btoa(JSON.stringify(fingerprint));
};

function UserModule() {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const response = await axios.get('/api/form');
      setForm(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching form:', error);
      setMessage({ type: 'error', text: 'Failed to load survey. Please refresh the page.' });
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleChoiceChange = (questionId, option, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, option] };
      } else {
        return { ...prev, [questionId]: currentAnswers.filter(a => a !== option) };
      }
    });
  };

  const calculateProgress = () => {
    if (!form) return 0;
    
    const visibleQuestions = form.questions.filter(q => checkConditionalLogic(q));
    const totalQuestions = visibleQuestions.length;
    
    if (totalQuestions === 0) return 0;
    
    const answeredQuestions = visibleQuestions.filter(q => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== null && answer !== '' && 
             (!Array.isArray(answer) || answer.length > 0);
    }).length;
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const checkConditionalLogic = (question) => {
    if (!question.conditional) return true;
    
    const { dependsOn, showWhen } = question.conditional;
    const dependentAnswer = answers[dependsOn];
    
    if (!dependentAnswer) return false;
    
    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependentAnswer);
    }
    
    return dependentAnswer === showWhen;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form) return errors;
    
    // Check required questions
    const visibleQuestions = form.questions.filter(q => checkConditionalLogic(q));
    
    visibleQuestions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id];
        
        if (answer === undefined || answer === null || answer === '' || 
            (Array.isArray(answer) && answer.length === 0)) {
          errors.push(`${question.text} is required`);
        }
      }
      
      // Validate numeric constraints
      if (question.type === 'numeric' && answers[question.id] !== undefined && answers[question.id] !== '') {
        const value = parseFloat(answers[question.id]);
        
        if (question.validation) {
          if (question.validation.min !== undefined && value < question.validation.min) {
            errors.push(`${question.text} must be at least ${question.validation.min}`);
          }
          if (question.validation.max !== undefined && value > question.validation.max) {
            errors.push(`${question.text} must be at most ${question.validation.max}`);
          }
        }
      }
      
      // Validate text patterns
      if (question.type === 'short-text' && question.validation && question.validation.pattern) {
        const answer = answers[question.id];
        if (answer) {
          const regex = new RegExp(question.validation.pattern);
          if (!regex.test(answer)) {
            errors.push(`${question.text} format is invalid`);
          }
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors[0] });
      return;
    }
    
    setSubmitting(true);
    setMessage(null);
    
    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000); // seconds
      const fingerprint = getBrowserFingerprint();
      
      const response = await axios.post('/api/submit', {
        answers,
        completionTime,
        fingerprint
      });
      
      setMessage({ 
        type: 'success', 
        text: response.data.message 
      });
      
      // Clear form
      setAnswers({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to submit response. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    // Check conditional logic
    if (!checkConditionalLogic(question)) {
      return null;
    }
    
    const isLocked = question.locked;
    
    return (
      <div key={question.id} className={`question-card ${isLocked ? 'locked' : ''}`}>
        <div className="question-label">
          {question.text}
          {question.required && <span className="required-indicator"> *</span>}
          {isLocked && <span className="locked-badge">Required</span>}
        </div>
        
        {question.type === 'single-choice' && (
          <div className="radio-group">
            {question.options.map(option => (
              <label 
                key={option} 
                className={`radio-option ${answers[question.id] === option ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'multiple-choice' && (
          <div className="checkbox-group">
            {question.options.map(option => (
              <label 
                key={option} 
                className={`checkbox-option ${(answers[question.id] || []).includes(option) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={(e) => handleMultipleChoiceChange(question.id, option, e.target.checked)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'short-text' && (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Your answer"
          />
        )}
        
        {question.type === 'long-text' && (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Your answer"
          />
        )}
        
        {question.type === 'numeric' && (
          <input
            type="number"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            min={question.validation?.min}
            max={question.validation?.max}
            placeholder="Enter a number"
          />
        )}
        
        {question.type === 'rating' && (
          <div className="rating-scale">
            {question.options.map(rating => (
              <button
                key={rating}
                type="button"
                className={`rating-button ${answers[question.id] === rating ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(question.id, rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        )}
        
        {question.type === 'date' && (
          <input
            type="date"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="survey-page">
        <div className="background-animations">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="survey-page">
        <div className="background-animations">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="message message-error">
            Unable to load survey. Please refresh the page.
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="survey-page">
      {/* Animated background elements - matching landing page */}
      <div className="background-animations">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        <div className="floating-circle circle-4"></div>
        <div className="floating-circle circle-5"></div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-label">Survey Progress</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="progress-shine"></div>
            </div>
          </div>
          <div className="progress-info">
            {progress === 0 && "Let's get started! 🌸"}
            {progress > 0 && progress < 25 && "Great start! Keep going 💫"}
            {progress >= 25 && progress < 50 && "You're doing amazing! ✨"}
            {progress >= 50 && progress < 75 && "Halfway there! Keep it up 🌟"}
            {progress >= 75 && progress < 100 && "Almost done! You're doing great 🎉"}
            {progress === 100 && "All done! Ready to submit 🎊"}
          </div>
        </div>

        {message && (
          <div className={`message message-${message.type} message-animated`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="survey-form">
          {form.questions.map(question => renderQuestion(question))}

          <div className="submit-section">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting}
            >
              <span className="button-text">
                {submitting ? 'Submitting...' : 'Submit Your Responses'}
              </span>
              {!submitting && <span className="button-icon">✓</span>}
            </button>
          </div>
        </form>

        <div className="survey-footer">
          <p>Your responses are anonymous. Thank you for participating! 🌸</p>
        </div>
      </div>
    </div>
  );
}

export default UserModule;

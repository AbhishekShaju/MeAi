import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const motivationalThoughts = [
  "Your voice deserves to be heard. Share your story today.",
  "Express yourself freely in a safe, peaceful space.",
  "Every thought you share makes a difference.",
  "Be part of something meaningful. Your opinion matters.",
  "Take a moment to share what's on your mind.",
  "Join thousands who've already shared their thoughts.",
  "Speak up, share out. Your perspective is valuable.",
  "Feel heard, feel valued. Share your honest thoughts."
];

const testimonials = [
  {
    text: "Finally, a place where I can share my thoughts without worrying about privacy. The experience was so calm and peaceful.",
    author: "Sarah M.",
    role: "Community Member"
  },
  {
    text: "I loved how easy it was to express myself. The questions made me think about things I never considered before.",
    author: "James K.",
    role: "Student"
  },
  {
    text: "Beautiful design and completely anonymous. I felt comfortable sharing my honest opinions for the first time.",
    author: "Emily R.",
    role: "Working Professional"
  }
];

const images = [
  { emoji: "🌸", color: "#FFE5F0", label: "Peaceful" },
  { emoji: "🌿", color: "#E8F5E9", label: "Natural" },
  { emoji: "💙", color: "#E3F2FD", label: "Calm" },
  { emoji: "✨", color: "#FFF9E6", label: "Serene" },
  { emoji: "🦋", color: "#F3E5F5", label: "Gentle" }
];

function LandingPage() {
  const navigate = useNavigate();
  const [currentThought, setCurrentThought] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentThought((prev) => (prev + 1) % motivationalThoughts.length);
        setFadeIn(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container">
      {/* Animated background gradient */}
      <div className="gradient-background"></div>
      
      {/* Grid pattern overlay */}
      <div className="grid-pattern"></div>

      {/* Content */}
      <div className="landing-content">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-left">
            <div className="badge">✨ Join 10,000+ Happy Voices</div>
            
            <h1 className="landing-title">
              Share Your Voice
              <span className="title-gradient"> Make It Count</span>
            </h1>
            
            <p className="landing-subtitle">
              A peaceful, safe space where your thoughts matter. Express yourself freely, 
              stay completely anonymous, and be part of something meaningful.
            </p>

            <div className={`thought-container ${fadeIn ? 'fade-in' : 'fade-out'}`}>
              <div className="thought-icon">💭</div>
              <p className="motivational-thought">
                {motivationalThoughts[currentThought]}
              </p>
            </div>

            <div className="cta-group">
              <button 
                className="cta-button primary"
                onClick={() => navigate('/survey')}
              >
                <span className="button-text">Share Your Thoughts</span>
                <span className="button-icon">→</span>
              </button>
              
              <button 
                className="cta-button secondary"
                onClick={() => navigate('/survey')}
              >
                <span className="button-text">Start Now - It's Free</span>
              </button>
            </div>

            <div className="features-quick">
              <div className="feature-quick">
                <span className="feature-icon">🔒</span>
                <span>100% Anonymous</span>
              </div>
              <div className="feature-quick">
                <span className="feature-icon">⚡</span>
                <span>Only 2 Minutes</span>
              </div>
              <div className="feature-quick">
                <span className="feature-icon">💬</span>
                <span>Your Voice Matters</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="dashboard-preview">
              <div className="preview-window">
                <div className="window-header">
                  <div className="window-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="window-title">Survey Dashboard</div>
                </div>
                <div className="window-content">
                  <div 
                    className="preview-visual"
                    style={{ background: images[currentImage].color }}
                  >
                    <div className="visual-emoji">{images[currentImage].emoji}</div>
                    <div className="visual-label">{images[currentImage].label} Design</div>
                    <div className="visual-stats">
                      <div className="stat-mini">
                        <div className="stat-mini-value">87%</div>
                        <div className="stat-mini-label">Completion</div>
                      </div>
                      <div className="stat-mini">
                        <div className="stat-mini-value">4.9</div>
                        <div className="stat-mini-label">Rating</div>
                      </div>
                    </div>
                  </div>
                  <div className="preview-indicators">
                    {images.map((_, index) => (
                      <div 
                        key={index}
                        className={`preview-dot ${index === currentImage ? 'active' : ''}`}
                        onClick={() => setCurrentImage(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Voices Shared</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Thoughts Expressed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Feel Heard</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Private & Safe</div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick & Simple</h3>
            <p>Share your thoughts in just 2 minutes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Totally Private</h3>
            <p>No sign-up, no tracking, no worries</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💭</div>
            <h3>Express Yourself</h3>
            <p>Share what truly matters to you</p>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="testimonials-section">
          <h2 className="section-title">Real Stories from <span>Real People</span></h2>
          <div className="testimonial-carousel">
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">{testimonials[currentTestimonial].text}</p>
              <div className="testimonial-author">
                <div className="author-name">{testimonials[currentTestimonial].author}</div>
                <div className="author-role">{testimonials[currentTestimonial].role}</div>
              </div>
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <div 
                  key={index}
                  className={`testimonial-dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="trust-section">
          <div className="trust-badge">
            <span className="trust-icon">🔐</span>
            <span className="trust-text">Fully Anonymous</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">💝</span>
            <span className="trust-text">Always Free</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">🌸</span>
            <span className="trust-text">Peaceful Design</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">⚡</span>
            <span className="trust-text">Quick & Easy</span>
          </div>
        </div>

        <div className="bottom-links">
          <button 
            className="text-link"
            onClick={() => navigate('/server')}
          >
            Server Dashboard
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="decorative-leaves">
        <div className="leaf leaf-1">🍃</div>
        <div className="leaf leaf-2">🍃</div>
        <div className="leaf leaf-3">🍃</div>
      </div>
    </div>
  );
}

export default LandingPage;

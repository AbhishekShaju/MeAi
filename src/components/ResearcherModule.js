import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function ResearcherModule() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New question template
  const emptyQuestion = {
    text: '',
    type: 'single-choice',
    required: false,
    options: [''],
    validation: {}
  };

  const [newQuestion, setNewQuestion] = useState(emptyQuestion);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/researcher/questions');
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setMessage({ type: 'error', text: 'Failed to load questions' });
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      // Validate
      if (!newQuestion.text.trim()) {
        setMessage({ type: 'error', text: 'Question text is required' });
        return;
      }

      if (['single-choice', 'multiple-choice', 'rating'].includes(newQuestion.type)) {
        if (!newQuestion.options || newQuestion.options.filter(o => o.trim()).length === 0) {
          setMessage({ type: 'error', text: 'At least one option is required' });
          return;
        }
      }

      const questionData = {
        ...newQuestion,
        options: newQuestion.options?.filter(o => o.trim()) || []
      };

      const response = await axios.post('/api/researcher/questions', questionData);
      
      setQuestions([...questions, response.data]);
      setNewQuestion(emptyQuestion);
      setShowAddForm(false);
      setMessage({ type: 'success', text: 'Question added successfully!' });
    } catch (error) {
      console.error('Error adding question:', error);
      const errorMsg = error.response?.data?.error || 'Failed to add question';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleUpdateQuestion = async (questionId, updates) => {
    try {
      const response = await axios.put(`/api/researcher/questions/${questionId}`, updates);
      
      setQuestions(questions.map(q => q.id === questionId ? response.data : q));
      setEditingQuestion(null);
      setMessage({ type: 'success', text: 'Question updated successfully!' });
    } catch (error) {
      console.error('Error updating question:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update question';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await axios.delete(`/api/researcher/questions/${questionId}`);
      
      setQuestions(questions.filter(q => q.id !== questionId));
      setMessage({ type: 'success', text: 'Question deleted successfully!' });
    } catch (error) {
      console.error('Error deleting question:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete question';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    // Separate locked and unlocked questions
    const locked = questions.filter(q => q.locked);
    const unlocked = questions.filter(q => !q.locked);

    // Reorder unlocked questions
    const [removed] = unlocked.splice(result.source.index, 1);
    unlocked.splice(result.destination.index, 0, removed);

    // Combine and update
    const reordered = [...locked, ...unlocked];
    setQuestions(reordered);

    try {
      await axios.put('/api/researcher/questions/reorder', {
        orderedIds: unlocked.map(q => q.id)
      });
      setMessage({ type: 'success', text: 'Questions reordered successfully!' });
    } catch (error) {
      console.error('Error reordering questions:', error);
      setMessage({ type: 'error', text: 'Failed to reorder questions' });
      fetchQuestions(); // Reload on error
    }
  };

  const updateNewQuestionOption = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const addNewQuestionOption = () => {
    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
  };

  const removeNewQuestionOption = (index) => {
    const newOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h1>Survey Preview</h1>
          <button className="btn-secondary" onClick={() => setShowPreview(false)}>
            ← Back to Editor
          </button>
        </div>

        <div className="header">
          <h1>MeAi Survey</h1>
          <p>Just answer the questions — no login required</p>
        </div>

        {questions.sort((a, b) => a.order - b.order).map(question => (
          <div key={question.id} className={`question-card ${question.locked ? 'locked' : ''}`}>
            <div className="question-label">
              {question.text}
              {question.required && <span className="required-indicator"> *</span>}
              {question.locked && <span className="locked-badge">Required</span>}
            </div>

            {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
              <div className="radio-group">
                {question.options?.map(option => (
                  <div key={option} className="radio-option">
                    <input 
                      type={question.type === 'single-choice' ? 'radio' : 'checkbox'} 
                      disabled 
                    />
                    {option}
                  </div>
                ))}
              </div>
            )}

            {question.type === 'short-text' && (
              <input type="text" placeholder="Your answer" disabled />
            )}

            {question.type === 'long-text' && (
              <textarea placeholder="Your answer" disabled />
            )}

            {question.type === 'numeric' && (
              <input type="number" placeholder="Enter a number" disabled />
            )}

            {question.type === 'rating' && (
              <div className="rating-scale">
                {question.options?.map(rating => (
                  <button key={rating} type="button" className="rating-button" disabled>
                    {rating}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'date' && (
              <input type="date" disabled />
            )}
          </div>
        ))}
      </div>
    );
  }

  const lockedQuestions = questions.filter(q => q.locked);
  const editableQuestions = questions.filter(q => !q.locked);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h1>Question Designer</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button className="btn-secondary" onClick={() => setShowPreview(true)}>
            👁️ Preview Form
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            ➕ Add Question
          </button>
        </div>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Locked Demographics */}
      <div className="mb-xl">
        <h2>📌 Locked Demographics</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
          These questions are permanent and cannot be modified or deleted.
        </p>
        
        {lockedQuestions.map(question => (
          <div key={question.id} className="question-card locked">
            <div className="question-label">
              {question.text}
              <span className="required-indicator"> *</span>
              <span className="locked-badge">Locked</span>
            </div>
            <div className="radio-group">
              {question.options?.map(option => (
                <div key={option} className="radio-option">
                  <input type="radio" disabled />
                  {option}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Editable Questions */}
      <div>
        <h2>✏️ Your Questions</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
          Drag to reorder. Click to edit or delete.
        </p>

        {editableQuestions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p style={{ color: 'var(--text-light)' }}>
              No custom questions yet. Click "Add Question" to get started!
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {editableQuestions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="question-card"
                          style={{
                            ...provided.draggableProps.style,
                            marginBottom: 'var(--spacing-md)',
                            cursor: 'move'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div className="question-label">
                                {question.text}
                                {question.required && <span className="required-indicator"> *</span>}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: 'var(--spacing-xs)' }}>
                                Type: {question.type}
                                {question.options && ` • ${question.options.length} options`}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                              <button 
                                className="btn-small btn-secondary"
                                onClick={() => setEditingQuestion(question)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn-small btn-danger"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Add Question Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Add New Question</h2>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                Question Text *
              </label>
              <input
                type="text"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="Enter your question"
              />
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                Question Type *
              </label>
              <select
                value={newQuestion.type}
                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value, options: [''] })}
              >
                <option value="single-choice">Single Choice</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="short-text">Short Text</option>
                <option value="long-text">Long Text</option>
                <option value="numeric">Numeric</option>
                <option value="rating">Rating</option>
                <option value="date">Date</option>
              </select>
            </div>

            {['single-choice', 'multiple-choice', 'rating'].includes(newQuestion.type) && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                  Options *
                </label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateNewQuestionOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      style={{ flex: 1 }}
                    />
                    {newQuestion.options.length > 1 && (
                      <button
                        type="button"
                        className="btn-small btn-danger"
                        onClick={() => removeNewQuestionOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-small btn-secondary"
                  onClick={addNewQuestionOption}
                >
                  + Add Option
                </button>
              </div>
            )}

            {newQuestion.type === 'numeric' && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                  Validation
                </label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="number"
                    placeholder="Min value"
                    value={newQuestion.validation?.min || ''}
                    onChange={(e) => setNewQuestion({
                      ...newQuestion,
                      validation: { ...newQuestion.validation, min: parseFloat(e.target.value) }
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Max value"
                    value={newQuestion.validation?.max || ''}
                    onChange={(e) => setNewQuestion({
                      ...newQuestion,
                      validation: { ...newQuestion.validation, max: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newQuestion.required}
                  onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                />
                <span style={{ fontWeight: 500 }}>Required question</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewQuestion(emptyQuestion);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddQuestion}
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Edit Question</h2>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                Question Text *
              </label>
              <input
                type="text"
                value={editingQuestion.text}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editingQuestion.required}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, required: e.target.checked })}
                />
                <span style={{ fontWeight: 500 }}>Required question</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setEditingQuestion(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => handleUpdateQuestion(editingQuestion.id, editingQuestion)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResearcherModule;

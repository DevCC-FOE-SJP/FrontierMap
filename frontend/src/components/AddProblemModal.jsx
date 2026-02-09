import React, { useState } from 'react';
import { discoveryService } from '../services/api';
import './AddProblemModal.css';

const AddProblemModal = ({ isOpen, onClose, onSave, searchQuery = '' }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [subTopic, setSubTopic] = useState('');
  const [formData, setFormData] = useState({
    gap: '',
    context: '',
    source_citation: '',
    proposed_solution: '',
    novelty_score: 5,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!subTopic.trim()) return;
    setIsGenerating(true);
    try {
      const card = await discoveryService.generateCard(searchQuery || 'general research', subTopic);
      setFormData({
        gap: card.gap || '',
        context: card.context || '',
        source_citation: card.source_citation || '',
        proposed_solution: card.proposed_solution || '',
        novelty_score: card.novelty_score || 5,
      });
      setActiveTab('manual'); // Switch to manual tab so user can review/edit
    } catch (error) {
      alert('Failed to generate card. Make sure the backend is running with a valid GROQ_API_KEY.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.gap.trim()) {
      alert('Please enter a gap title.');
      return;
    }
    setIsSaving(true);
    try {
      const cardToSave = {
        ...formData,
        novelty_score: parseFloat(formData.novelty_score) || 5,
        domain: searchQuery,
        is_manual: activeTab === 'manual',
      };
      // Save to backend
      try {
        await discoveryService.saveCard(cardToSave);
      } catch {
        // Continue even if backend save fails - card will still be added to local state
      }
      // Add to parent state
      onSave(cardToSave);
      // Reset form
      setFormData({ gap: '', context: '', source_citation: '', proposed_solution: '', novelty_score: 5 });
      setSubTopic('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Problem Card</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            ✏️ Manual Entry
          </button>
          <button
            className={`modal-tab ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI Generate
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'ai' && (
            <div className="ai-generate-section">
              <label className="form-label">FOCUS AREA / SUB-TOPIC</label>
              <div className="ai-input-row">
                <input
                  type="text"
                  placeholder="e.g., Attention mechanisms in transformers..."
                  value={subTopic}
                  onChange={e => setSubTopic(e.target.value)}
                  className="form-input"
                />
                <button
                  className="generate-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating || !subTopic.trim()}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {searchQuery && (
                <p className="ai-context">Domain: <strong>{searchQuery}</strong></p>
              )}
              {isGenerating && (
                <div className="generating-indicator">
                  <div className="spinner"></div>
                  <span>AI is analyzing the frontier...</span>
                </div>
              )}
            </div>
          )}

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">GAP TITLE *</label>
              <input
                type="text"
                placeholder="The specific research or implementation gap..."
                value={formData.gap}
                onChange={e => handleChange('gap', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">CONTEXT / LIMITATION</label>
              <textarea
                placeholder="Background information and why this gap is important..."
                value={formData.context}
                onChange={e => handleChange('context', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PROPOSED SOLUTION DIRECTION</label>
              <textarea
                placeholder="A high-level direction for solving this gap..."
                value={formData.proposed_solution}
                onChange={e => handleChange('proposed_solution', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">SOURCE CITATION</label>
                <input
                  type="text"
                  placeholder="e.g., arXiv:2104.XXXX or Manual entry"
                  value={formData.source_citation}
                  onChange={e => handleChange('source_citation', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group novelty-group">
                <label className="form-label">NOVELTY SCORE (1-10)</label>
                <div className="novelty-input-row">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={formData.novelty_score}
                    onChange={e => handleChange('novelty_score', e.target.value)}
                    className="novelty-slider"
                  />
                  <span className="novelty-value">{formData.novelty_score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={isSaving || !formData.gap.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Problem Card'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProblemModal;

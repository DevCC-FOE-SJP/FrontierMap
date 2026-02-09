import React, { useState, useEffect } from 'react';
import { discoveryService } from '../services/api';
import './ProblemCard.css';

const ProblemCard = ({ card, searchQuery = 'Uncategorized', onDelete = null, showDeleteInHeader = false, onUpdate = null }) => {
  const { gap, context, source_citation, source_url, proposed_solution, novelty_score, _id, status = 'TODO', priority = 'MEDIUM' } = card;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);
  const [localPriority, setLocalPriority] = useState(priority);

  // Check if card is already bookmarked on mount
  useEffect(() => {
    const savedClusters = JSON.parse(localStorage.getItem('SavedClusters') || '{}');
    const clusterCards = savedClusters[searchQuery] || [];
    const isAlreadyBookmarked = clusterCards.some(bookmarkedCard => bookmarkedCard.gap === gap);
    setIsBookmarked(isAlreadyBookmarked);
  }, [gap, searchQuery]);

  const handleBookmark = () => {
    const savedClusters = JSON.parse(localStorage.getItem('SavedClusters') || '{}');
    
    if (isBookmarked) {
      // Remove from bookmarked cards in this cluster
      if (savedClusters[searchQuery]) {
        savedClusters[searchQuery] = savedClusters[searchQuery].filter(
          bookmarkedCard => bookmarkedCard.gap !== gap
        );
        // Remove cluster if empty
        if (savedClusters[searchQuery].length === 0) {
          delete savedClusters[searchQuery];
        }
      }
      localStorage.setItem('SavedClusters', JSON.stringify(savedClusters));
      setIsBookmarked(false);
      // Post feedback: dismissed (un-bookmarked)
      discoveryService.postFeedback(gap, searchQuery, 'dismissed');
    } else {
      // Add to bookmarked cards under this search query
      const cardToBookmark = {
        gap,
        context,
        source_citation,
        source_url: source_url || '',
        proposed_solution,
        novelty_score,
        bookmarkedAt: new Date().toISOString()
      };
      
      if (!savedClusters[searchQuery]) {
        savedClusters[searchQuery] = [];
      }
      savedClusters[searchQuery].push(cardToBookmark);
      localStorage.setItem('SavedClusters', JSON.stringify(savedClusters));
      setIsBookmarked(true);
      // Post feedback: bookmarked
      discoveryService.postFeedback(gap, searchQuery, 'bookmarked');
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('bookmarkChanged'));
  };

  const handleDelete = (e) => {
    // Post dismiss feedback
    discoveryService.postFeedback(gap, searchQuery, 'dismissed');
    if (onDelete) onDelete(e);
  };

  const handleStatusChange = async (newStatus) => {
    if (!_id) return;
    try {
      await discoveryService.updateCard(_id, { status: newStatus });
      setLocalStatus(newStatus);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!_id) return;
    try {
      await discoveryService.updateCard(_id, { priority: newPriority });
      setLocalPriority(newPriority);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return '#6c757d';
      case 'IN_PROGRESS': return '#0d6efd';
      case 'DONE': return '#198754';
      case 'BLOCKED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return '#6c757d';
      case 'MEDIUM': return '#ffc107';
      case 'HIGH': return '#fd7e14';
      case 'CRITICAL': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="problem-card">
      <div className="card-header">
        <div className="header-left-section">
          <span className="knowledge-gap-badge">KNOWLEDGE GAP</span>
          {_id && (
            <div className="card-metadata">
              <select 
                className="status-select" 
                value={localStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ backgroundColor: getStatusColor(localStatus) }}
                title="Change status"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
              <select 
                className="priority-select" 
                value={localPriority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                style={{ backgroundColor: getPriorityColor(localPriority) }}
                title="Change priority"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          )}
        </div>
        <div className="header-actions">
          {!showDeleteInHeader && (
            <button 
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`} 
              onClick={handleBookmark}
              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {isBookmarked ? '🔖' : '🔖'}
            </button>
          )}
          {showDeleteInHeader && onDelete && (
            <button 
              className="delete-btn-header"
              onClick={handleDelete}
              title="Delete card"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      <h3 className="card-title">{gap}</h3>
      
      <div className="card-section">
        <span className="section-label">THE LIMITATION</span>
        <p className="section-content text-truncate">{context}</p>
      </div>

      <div className="card-section">
        <span className="section-label">PROPOSED DIRECTION</span>
        <p className="section-content">{proposed_solution}</p>
      </div>

      <div className="card-footer">
        <div className="source-info">
          <span className="source-icon">📄</span>
          {source_url ? (
            <a href={source_url} target="_blank" rel="noopener noreferrer" className="source-text source-link">{source_citation}</a>
          ) : (
            <span className="source-text">{source_citation}</span>
          )}
        </div>
        <div className="novelty-gauge">
          <svg className="gauge-svg" viewBox="0 0 36 36">
            <path className="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="gauge-progress" strokeDasharray={`${novelty_score * 10}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="gauge-text">
            <span className="gauge-value">{novelty_score * 10}%</span>
            <span className="gauge-label">NOV</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;

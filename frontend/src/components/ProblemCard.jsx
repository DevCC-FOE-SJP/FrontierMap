import React, { useState, useEffect } from 'react';
import { discoveryService } from '../services/api';
import './ProblemCard.css';

const ProblemCard = ({ card, searchQuery = 'Uncategorized', onDelete = null, showDeleteInHeader = false }) => {
  const { gap, context, source_citation, source_url, proposed_solution, novelty_score } = card;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="problem-card">
      <div className="card-header">
        <span className="knowledge-gap-badge">KNOWLEDGE GAP</span>
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
        <p className={`section-content ${!isExpanded ? 'text-clamp' : ''}`}>{context}</p>
      </div>

      <div className="card-section">
        <span className="section-label">PROPOSED DIRECTION</span>
        <p className={`section-content ${!isExpanded ? 'text-clamp' : ''}`}>{proposed_solution}</p>
      </div>

      {(context?.length > 180 || proposed_solution?.length > 180) && (
        <button className="expand-toggle" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Show less ▲' : 'Show more ▼'}
        </button>
      )}

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

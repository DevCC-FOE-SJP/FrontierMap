import React from 'react';
import './ProblemCard.css';

const ProblemCard = ({ card }) => {
  const { gap, context, source_citation, proposed_solution, novelty_score } = card;

  return (
    <div className="problem-card">
      <div className="card-header">
        <span className="knowledge-gap-badge">KNOWLEDGE GAP</span>
        <button className="bookmark-btn">🔖</button>
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
          <span className="source-text">{source_citation}</span>
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

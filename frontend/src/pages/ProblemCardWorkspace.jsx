import React from 'react';
import ProblemCard from '../components/ProblemCard';
import './ProblemCardWorkspace.css';

const ProblemCardWorkspace = ({ gaps = [] }) => {
  // Use real data if provided
  const displayCards = gaps.length > 0 ? gaps : [];

  return (
    <div className="problem-card-workspace">
      <div className="workspace-header">
        <div className="header-left">
          <div className="accent-line"></div>
          <h1 className="workspace-title">Problem Card Workspace</h1>
        </div>
        <div className="header-right">
          <div className="search-filter">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Filter active problems..." className="filter-input" />
          </div>
          <div className="active-stats">
            <span className="stats-label">ACTIVE PROBLEMS</span>
            <span className="stats-value">12,402</span>
          </div>
        </div>
      </div>

      <p className="workspace-desc">
        Curated high-density knowledge gaps requiring urgent cross-disciplinary synthesis.
      </p>

      <div className="cards-grid">
        {displayCards.map((card, index) => (
          <ProblemCard key={index} card={card} />
        ))}
        
        <div className="define-new-gap">
          <div className="plus-icon">+</div>
          <span className="add-text">DEFINE NEW GAP</span>
        </div>
      </div>
      
      <button className="add-card-btn">
        <span className="plus">+</span> Add Problem Card
      </button>
    </div>
  );
};

export default ProblemCardWorkspace;

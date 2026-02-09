import React, { useState, useEffect } from 'react';
import ProblemCard from '../components/ProblemCard';
import './SavedClusters.css';

const SavedClusters = () => {
  const [savedClusters, setSavedClusters] = useState({});
  const [expandedClusters, setExpandedClusters] = useState(new Set());

  useEffect(() => {
    loadSavedClusters();
    
    // Listen for storage changes to update the view
    const handleStorageChange = () => {
      loadSavedClusters();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event from bookmark clicks
    window.addEventListener('bookmarkChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkChanged', handleStorageChange);
    };
  }, []);

  const loadSavedClusters = () => {
    const clusters = JSON.parse(localStorage.getItem('SavedClusters') || '{}');
    setSavedClusters(clusters);
    // Expand all clusters by default
    setExpandedClusters(new Set(Object.keys(clusters)));
  };

  const toggleCluster = (clusterName) => {
    setExpandedClusters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clusterName)) {
        newSet.delete(clusterName);
      } else {
        newSet.add(clusterName);
      }
      return newSet;
    });
  };

  const deleteCluster = (clusterName, e) => {
    e.stopPropagation(); // Prevent toggle
    if (window.confirm(`Delete the "${clusterName}" cluster and all its cards?`)) {
      const clusters = JSON.parse(localStorage.getItem('SavedClusters') || '{}');
      delete clusters[clusterName];
      localStorage.setItem('SavedClusters', JSON.stringify(clusters));
      loadSavedClusters();
      window.dispatchEvent(new Event('bookmarkChanged'));
    }
  };

  const deleteCard = (clusterName, cardGap, e) => {
    e.stopPropagation(); // Prevent any parent handlers
    const clusters = JSON.parse(localStorage.getItem('SavedClusters') || '{}');
    if (clusters[clusterName]) {
      clusters[clusterName] = clusters[clusterName].filter(card => card.gap !== cardGap);
      if (clusters[clusterName].length === 0) {
        delete clusters[clusterName];
      }
      localStorage.setItem('SavedClusters', JSON.stringify(clusters));
      loadSavedClusters();
      window.dispatchEvent(new Event('bookmarkChanged'));
    }
  };

  const clusterNames = Object.keys(savedClusters);
  const totalCards = clusterNames.reduce((sum, name) => sum + savedClusters[name].length, 0);

  return (
    <div className="saved-clusters-page">
      <div className="clusters-header">
        <div className="header-left">
          <div className="accent-line"></div>
          <h1 className="clusters-title">Saved Clusters</h1>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{clusterNames.length}</span>
            <span className="stat-label">CLUSTERS</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{totalCards}</span>
            <span className="stat-label">CARDS</span>
          </div>
        </div>
      </div>

      <p className="clusters-desc">
        Your bookmarked knowledge gaps organized by research domain.
      </p>

      {clusterNames.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h2>No Saved Clusters Yet</h2>
          <p>Bookmark cards from the Problem Card Workspace to organize them here by topic.</p>
        </div>
      ) : (
        <div className="clusters-container">
          {clusterNames.map((clusterName) => {
            const cards = savedClusters[clusterName];
            const isExpanded = expandedClusters.has(clusterName);
            
            return (
              <div key={clusterName} className="cluster-section">
                <div 
                  className="cluster-header"
                >
                  <div className="cluster-title-row" onClick={() => toggleCluster(clusterName)}>
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
                    <h2 className="cluster-name">{clusterName}</h2>
                    <span className="cluster-count">{cards.length} cards</span>
                  </div>
                  <button 
                    className="delete-cluster-btn"
                    onClick={(e) => deleteCluster(clusterName, e)}
                    title="Delete cluster"
                  >
                    🗑️
                  </button>
                </div>
                
                {isExpanded && (
                  <div className="cluster-cards-grid">
                    {cards.map((card, index) => (
                      <ProblemCard 
                        key={index}
                        card={card} 
                        searchQuery={clusterName}
                        showDeleteInHeader={true}
                        onDelete={(e) => deleteCard(clusterName, card.gap, e)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedClusters;

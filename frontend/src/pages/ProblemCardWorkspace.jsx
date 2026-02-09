import { motion } from 'framer-motion';
import React, { useState, useMemo } from 'react';
import ProblemCard from '../components/ProblemCard';
import AddProblemModal from '../components/AddProblemModal';
import './ProblemCardWorkspace.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ProblemCardWorkspace = ({ gaps = [], searchQuery = '', onAddCard }) => {
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayCards = useMemo(() => {
    if (!gaps.length) return [];
    if (!filterText.trim()) return gaps;
    const lower = filterText.toLowerCase();
    return gaps.filter(card =>
      (card.gap && card.gap.toLowerCase().includes(lower)) ||
      (card.context && card.context.toLowerCase().includes(lower)) ||
      (card.proposed_solution && card.proposed_solution.toLowerCase().includes(lower))
    );
  }, [gaps, filterText]);

  const handleSaveCard = (newCard) => {
    if (onAddCard) onAddCard(newCard);
  };

  return (
    <motion.div
      className="problem-card-workspace"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="workspace-header">
        <div className="header-left">
          <div className="accent-line"></div>
          <div className="title-container">
            <h1 className="workspace-title">Problem Card Workspace</h1>
          </div>
        </div>
        <div className="header-right">
          <div className="search-filter">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Filter active problems..."
              className="filter-input"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
          </div>
          <div className="active-stats">
            <span className="stats-label">ACTIVE PROBLEMS</span>
            <span className="stats-value">{gaps.length}</span>
          </div>
        </div>
      </div>

      {searchQuery && <p className="search-context">{searchQuery}</p>}
      <p className="workspace-desc">
        Curated high-density knowledge gaps requiring urgent cross-disciplinary synthesis.
      </p>

      {displayCards.length === 0 && gaps.length === 0 ? (
        <div className="workspace-empty-state">
          <div className="empty-icon-large">🗂️</div>
          <h2>No Problem Cards Yet</h2>
          <p>Run a scan in the Search Explorer to discover research gaps, or create one manually.</p>
          <button className="empty-action-btn" onClick={() => setIsModalOpen(true)}>
            + Create Manually
          </button>
        </div>
      ) : (
        <motion.div
          className="cards-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {displayCards.map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <ProblemCard card={card} searchQuery={searchQuery} />
            </motion.div>
          ))}

          <motion.div variants={itemVariants} className="define-new-gap" onClick={() => setIsModalOpen(true)}>
            <div className="plus-icon">+</div>
            <span className="add-text">DEFINE NEW GAP</span>
          </motion.div>
        </motion.div>
      )}

      {filterText && displayCards.length === 0 && gaps.length > 0 && (
        <div className="no-filter-results">
          <p>No cards match "{filterText}". Try a different filter.</p>
        </div>
      )}

      <button className="add-card-btn" onClick={() => setIsModalOpen(true)}>
        <span className="plus">+</span> Add Problem Card
      </button>

      <AddProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        searchQuery={searchQuery}
      />
    </motion.div>
  );
};

export default ProblemCardWorkspace;

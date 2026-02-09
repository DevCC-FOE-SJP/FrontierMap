import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProblemCard from '../components/ProblemCard';
import { discoveryService } from '../services/api';
import './BacklogBoard.css';

const BacklogBoard = () => {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDomain, setFilterDomain] = useState('');

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      if (filterDomain) filters.domain = filterDomain;

      const response = await discoveryService.getFilteredBacklog(filters);
      setCards(response.cards || []);
    } catch (error) {
      console.error('Failed to load backlog:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterDomain]);

  const loadStats = async () => {
    try {
      const statsData = await discoveryService.getBacklogStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadCards();
    loadStats();
  }, [loadCards]);

  const handleCardUpdate = () => {
    // Reload cards after update
    loadCards();
    loadStats();
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await discoveryService.deleteCard(cardId);
      loadCards();
      loadStats();
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  // Group cards by status for kanban view
  const cardsByStatus = {
    TODO: cards.filter(c => c.status === 'TODO'),
    IN_PROGRESS: cards.filter(c => c.status === 'IN_PROGRESS'),
    DONE: cards.filter(c => c.status === 'DONE'),
    BLOCKED: cards.filter(c => c.status === 'BLOCKED'),
  };

  return (
    <motion.div
      className="backlog-board"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="backlog-header">
        <div className="header-left">
          <div className="accent-line"></div>
          <div className="title-container">
            <h1 className="backlog-title">Issue Backlog</h1>
            <p className="backlog-subtitle">Manage research gaps as trackable issues</p>
          </div>
        </div>
        
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.total_cards}</div>
              <div className="stat-label">Total Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.by_status?.TODO || 0}</div>
              <div className="stat-label">To Do</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.by_status?.IN_PROGRESS || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.by_status?.DONE || 0}</div>
              <div className="stat-label">Done</div>
            </div>
          </div>
        )}
      </div>

      <div className="backlog-filters">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
          <option value="BLOCKED">Blocked</option>
        </select>

        <select 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        <input
          type="text"
          placeholder="Filter by domain..."
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="filter-input"
        />

        <button onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterDomain(''); }} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading backlog...</div>
      ) : (
        <div className="kanban-board">
          {Object.entries(cardsByStatus).map(([status, statusCards]) => (
            <div key={status} className="kanban-column">
              <div className="column-header">
                <h3 className="column-title">{status.replace('_', ' ')}</h3>
                <span className="column-count">{statusCards.length}</span>
              </div>
              <div className="column-cards">
                {statusCards.map((card) => (
                  <div key={card._id} className="kanban-card">
                    <ProblemCard 
                      card={card} 
                      searchQuery={card.domain || 'General'} 
                      onUpdate={handleCardUpdate}
                      onDelete={() => handleDeleteCard(card._id)}
                      showDeleteInHeader={true}
                    />
                  </div>
                ))}
                {statusCards.length === 0 && (
                  <div className="empty-column">No issues in this status</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BacklogBoard;

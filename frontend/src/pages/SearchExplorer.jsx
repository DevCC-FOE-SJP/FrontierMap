import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { discoveryService } from '../services/api';
import './SearchExplorer.css';

const SearchExplorer = ({ onScanResults, isLoading, setIsLoading }) => {
  const [query, setQuery] = useState('');

  const handleScan = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const results = await discoveryService.getGaps(query);
      onScanResults(results, query);
    } catch (error) {

      alert('Error scanning the frontier. Make sure the backend is running and configured with API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="search-explorer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hero-section">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          FRONTIER DISCOVERY ACTIVE
        </div>

        <h1 className="hero-title">
          FrontierMap: The <br />
          <span className="accent-text">Bleeding-Edge</span> Innovation Engine
        </h1>

        <p className="hero-subtitle">
          Discover what <span className="bold">needs</span> to be built,
          not just what <span className="bold">can</span> be built.
        </p>

        <div className="search-container">
          <input
            type="text"
            placeholder="Enter your field of interest (e.g., Computer Vision for Traffic)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            className="scan-button"
            onClick={handleScan}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                SCANNING THE FRONTIER...
                <div className="loading-spinner"></div>
              </>
            ) : (
              <>
                SCAN THE FRONTIER
                <span className="scan-icon">📡</span>
              </>
            )}
          </button>
        </div>

        <div className="tags-container">
          <span className="tag-label">• PAPER CLUSTERS</span>
          <span className="tag-label">• PATENT SILOS</span>
          <span className="tag-label">• PROBLEM CARDS</span>
        </div>
      </div>

      <div className="system-metrics">
        <div className="metric-item">
          <span className="metric-label">ENGINE STATUS</span>
          <span className="metric-value nominal">ENGINE NOMINAL • 4MS LATENCY</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">© {new Date().getFullYear()} FRONTIERMAP CORE • ADVANCED SCIENTIFIC ENGINE</span>
        </div>
        <div className="metric-item right">
          <span className="metric-label">RECENT DISCOVERY</span>
          <span className="metric-value">Carbon-Negative Concrete Catalyst</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchExplorer;

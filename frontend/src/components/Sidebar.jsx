import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen, activePage, setActivePage }) => {
  const menuItems = [
    { id: 'search', label: 'Search Explorer', icon: '🔍' },
    { id: 'graph', label: 'Frontier Graph', icon: '🕸️' },
    { id: 'cards', label: 'Problem Cards', icon: '🗂️' },
    { id: 'saved', label: 'Saved Clusters', icon: '📁' },
    { id: 'backlog', label: 'Issue Backlog', icon: '📋' },
    { id: 'metrics', label: 'Research Metrics', icon: '📊' },
  ];

  return (
    <>
      <button 
        className={`hamburger-menu ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation"
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </button>

      <aside className={`sidebar ${isOpen ? 'visible' : 'hidden'}`}>
        <div className="logo-container">
          <div className="logo-icon">F</div>
          <h1 className="logo-text">FrontierMap</h1>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item.id);
                setIsOpen(false); // Auto-close sidebar on mobile/small screens
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="avatar"></div>
            <div className="user-info">
              <span className="user-name">Principal Investigator</span>
              <span className="user-role">Standard Access</span>
            </div>
          </div>
        </div>
      </aside>
      
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;

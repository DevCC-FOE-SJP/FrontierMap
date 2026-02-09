import { AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import SearchExplorer from './pages/SearchExplorer'
import ProblemCardWorkspace from './pages/ProblemCardWorkspace'
import FrontierGraph from './pages/FrontierGraph'
import ResearchMetrics from './pages/ResearchMetrics'
import SavedClusters from './pages/SavedClusters'
import BacklogBoard from './pages/BacklogBoard'
import './App.css'
import './index.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('search')
  const [discoveredGaps, setDiscoveredGaps] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('discoveredGaps') || '[]'); } catch { return []; }
  })
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('searchQuery') || '')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('discoveredGaps', JSON.stringify(discoveredGaps));
  }, [discoveredGaps]);

  useEffect(() => {
    sessionStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  const handleScanResults = (results, query) => {
    setDiscoveredGaps(results);
    setSearchQuery(query);
    setActivePage('cards');
  };

  const handleAddCard = useCallback((newCard) => {
    setDiscoveredGaps(prev => [...prev, newCard]);
  }, []);


  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <main className="content-area">
        <AnimatePresence mode="wait">
          {activePage === 'search' ? (
            <SearchExplorer
              key="search"
              isSidebarOpen={isSidebarOpen}
              onScanResults={handleScanResults}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : activePage === 'cards' ? (
            <ProblemCardWorkspace key="cards" gaps={discoveredGaps} searchQuery={searchQuery} onAddCard={handleAddCard} />
          ) : activePage === 'saved' ? (
            <SavedClusters key="saved" />
          ) : activePage === 'graph' ? (
            <FrontierGraph key="graph" gaps={discoveredGaps} query={searchQuery} />
          ) : activePage === 'metrics' ? (
            <ResearchMetrics key="metrics" gaps={discoveredGaps} searchQuery={searchQuery} />
          ) : activePage === 'backlog' ? (
            <BacklogBoard key="backlog" />
          ) : (

            <div key="placeholder" className="placeholder">
              <h1>{activePage.toUpperCase()} - Coming Soon</h1>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App

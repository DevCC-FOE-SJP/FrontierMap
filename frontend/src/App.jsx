import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import SearchExplorer from './pages/SearchExplorer'
import ProblemCardWorkspace from './pages/ProblemCardWorkspace'
import FrontierGraph from './pages/FrontierGraph'
import ResearchMetrics from './pages/ResearchMetrics'
import SavedClusters from './pages/SavedClusters'
import './App.css'
import './index.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('search')
  const [discoveredGaps, setDiscoveredGaps] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleScanResults = (results, query) => {
    setDiscoveredGaps(results);
    setSearchQuery(query);
    setActivePage('cards'); // Automatically switch to the workspace
  };


  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <main className="content-area">
        {activePage === 'search' ? (
          <SearchExplorer 
            isSidebarOpen={isSidebarOpen} 
            onScanResults={handleScanResults}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : activePage === 'cards' ? (
          <ProblemCardWorkspace gaps={discoveredGaps} searchQuery={searchQuery} />
        ) : activePage === 'saved' ? (
          <SavedClusters />
        ) : activePage === 'graph' ? (
          <FrontierGraph gaps={discoveredGaps} query={searchQuery} />
        ) : activePage === 'metrics' ? (
          <ResearchMetrics gaps={discoveredGaps} />
        ) : (

          <div className="placeholder">
            <h1>{activePage.toUpperCase()} - Coming Soon</h1>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

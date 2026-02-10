import { AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react'
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
  const [discoveredGaps, setDiscoveredGaps] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('discoveredGaps') || '[]'); } catch { return []; }
  })
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('searchQuery') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

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

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const domain = searchQuery || 'machine learning';

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('FrontierMap Research Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Domain: ${domain}`, pageWidth / 2, 30, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 37, { align: 'center' });

      let yPos = 50;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;

      const summaryData = [
        ['Problem Cards Found', String(discoveredGaps.length)],
        ['Domain', domain],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [255, 140, 0] },
      });

      yPos = doc.lastAutoTable.finalY + 15;

      if (discoveredGaps.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Problem Cards', 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [['Gap', 'Novelty', 'Source']],
          body: discoveredGaps.slice(0, 30).map(g => [
            g.gap?.substring(0, 100) || '',
            `${(g.novelty_score || 0) * 10}%`,
            g.source_citation || '',
          ]),
          theme: 'grid',
          headStyles: { fillColor: [255, 140, 0] },
          columnStyles: { 0: { cellWidth: 90 } },
        });
      }

      doc.save(`FrontierMap_Report_${domain.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [discoveredGaps, searchQuery]);


  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        onExportPDF={handleExportPDF}
        exporting={exporting}
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

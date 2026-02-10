import React, { useCallback, useMemo, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './FrontierGraph.css';

const FrontierGraph = ({ gaps = [], query = '' }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [graphSearch, setGraphSearch] = useState('');
  const fgRef = useRef();

  // Get unique categories from gap data for dynamic filter chips
  const categories = useMemo(() => {
    const cats = new Set();
    gaps.forEach(item => {
      const src = (item.source_citation || '').toLowerCase();
      if (src.includes('arxiv')) cats.add('ARXIV');
      else if (src.includes('reddit')) cats.add('REDDIT');
      else if (src.includes('stack')) cats.add('STACKEXCHANGE');
      else cats.add('OTHER');
    });
    return ['ALL', ...Array.from(cats)];
  }, [gaps]);

  // Filter gaps by active filter and search
  const filteredGaps = useMemo(() => {
    let result = gaps;
    
    // Apply category filter
    if (activeFilter !== 'ALL') {
      result = result.filter(item => {
        const src = (item.source_citation || '').toLowerCase();
        if (activeFilter === 'ARXIV') return src.includes('arxiv');
        if (activeFilter === 'REDDIT') return src.includes('reddit');
        if (activeFilter === 'STACKEXCHANGE') return src.includes('stack');
        return !src.includes('arxiv') && !src.includes('reddit') && !src.includes('stack');
      });
    }
    
    // Apply search filter
    if (graphSearch.trim()) {
      const lower = graphSearch.toLowerCase();
      result = result.filter(item =>
        (item.gap && item.gap.toLowerCase().includes(lower)) ||
        (item.context && item.context.toLowerCase().includes(lower))
      );
    }
    
    return result;
  }, [gaps, activeFilter, graphSearch]);

  // Dynamic Graph Data from filtered gaps
  const graphData = useMemo(() => {
    if (!filteredGaps || filteredGaps.length === 0) {
      return {
        nodes: [{ id: 'central', name: query || 'Discover a Frontier...', type: 'core', val: 25 }],
        links: []
      };
    }

    const centralId = 'central';
    const nodes = [
      { id: centralId, name: query || 'Frontier Center', type: 'core', val: 25 }
    ];

    const links = [];
    const searchLower = graphSearch.toLowerCase();

    filteredGaps.forEach((item, index) => {
      const nodeId = `gap-${index}`;
      const isHighlighted = searchLower && item.gap && item.gap.toLowerCase().includes(searchLower);
      nodes.push({
        id: nodeId,
        name: item.gap,
        type: 'gap',
        val: 12 + (item.novelty_score || 0),
        data: item,
        highlight: isHighlighted,
      });
      links.push({ source: centralId, target: nodeId });

      // Create inter-gap links for items with similar novelty scores (clustering)
      filteredGaps.forEach((other, j) => {
        if (j > index && j < index + 3) {
          const scoreDiff = Math.abs((item.novelty_score || 5) - (other.novelty_score || 5));
          if (scoreDiff < 2) {
            links.push({ source: nodeId, target: `gap-${j}`, weak: true });
          }
        }
      });
    });

    return { nodes, links };
  }, [filteredGaps, query, graphSearch]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    // Center the view on the clicked node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 500);
      fgRef.current.zoom(4, 500);
    }
  }, []);

  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.5, 300);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom / 1.5, 300);
    }
  };

  const handleZoomFit = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 60);
    }
  };

  return (
    <div className="frontier-graph-page">
      <div className="graph-header">
        <div className="filter-chips">
          {categories.map(cat => (
            <button
              key={cat}
              className={`chip ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat === 'ALL' ? 'ALL DOMAINS' : cat}
            </button>
          ))}
        </div>
        
        <div className="search-bar-inline">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search knowledge frontier..."
            value={graphSearch}
            onChange={e => setGraphSearch(e.target.value)}
          />
          {graphSearch && (
            <button className="clear-search" onClick={() => setGraphSearch('')}>×</button>
          )}
        </div>

        <div className="top-metrics">
          <div className="metric">
            <span className="label">NODES VISIBLE</span>
            <span className="value">{filteredGaps.length}</span>
          </div>
          <div className="metric">
            <span className="label">TOTAL GAPS</span>
            <span className="value orange">{gaps.length}</span>
          </div>
        </div>
      </div>

      <div className="graph-container">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={n => n.type === 'core' ? '#ff8c00' : n.highlight ? '#ff8c00' : '#444'}
          nodeRelSize={6}
          linkColor={l => l.weak ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.1)'}
          linkWidth={l => l.weak ? 0.5 : 1}
          backgroundColor="transparent"
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedNode(null)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Inter`;

            ctx.fillStyle = node.type === 'core' ? '#ff8c00' : node.highlight ? '#ff8c00' : '#333';
            ctx.beginPath();
            const radius = node.type === 'core' ? 6 : node.highlight ? 5 : 4;
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fill();

            // Glow effect for highlighted or core nodes
            if (node.highlight || node.type === 'core') {
              ctx.shadowColor = '#ff8c00';
              ctx.shadowBlur = 15;
              ctx.fill();
              ctx.shadowBlur = 0;
            }

            if (globalScale > 2.5) {
              const label = node.name?.length > 40 ? node.name.substring(0, 40) + '...' : node.name;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.highlight ? '#ff8c00' : '#fff';
              ctx.fillText(label, node.x, node.y + 10);
            }
          }}
        />

        {selectedNode && (
          <div className="node-info-card">
            <button className="close-info-btn" onClick={() => setSelectedNode(null)}>×</button>
            <span className="card-label">{selectedNode.type === 'core' ? 'CENTRAL DOMAIN' : 'ACTIVE FRONTIER'}</span>
            <h2 className="card-node-title">{selectedNode.name}</h2>
            <div className="card-stats">
              {selectedNode.type === 'gap' ? (
                <>
                  <div className="stat">📊 {(selectedNode.data?.novelty_score || 0) * 10}% Novelty</div>
                  <div className="stat">📄 {selectedNode.data?.source_citation}</div>
                  {selectedNode.data?.proposed_solution && (
                    <div className="stat proposed-solution">
                      💡 {selectedNode.data.proposed_solution.length > 150 
                        ? selectedNode.data.proposed_solution.substring(0, 150) + '...' 
                        : selectedNode.data.proposed_solution}
                    </div>
                  )}
                </>
              ) : (
                <div className="stat">🌐 Research Epicenter</div>
              )}
            </div>
          </div>
        )}

        <div className="graph-controls">
          <button className="control-btn" onClick={handleZoomIn} title="Zoom In">+</button>
          <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">-</button>
          <button className="control-btn" onClick={handleZoomFit} title="Fit to View">⛶</button>
        </div>

        <div className="engine-status">
          <span className="pulse-dot"></span>
          MAPPING ENGINE LIVE
        </div>
      </div>

      <div className="active-problems-shelf">
        <h3 className="shelf-title">Active Research Problems</h3>
        <p className="shelf-subtitle">Unsolved challenges at the edge of human knowledge.</p>
        
        <div className="shelf-grid">
          {filteredGaps.length > 0 ? filteredGaps.slice(0, 6).map((item, index) => (
            <div key={index} className="mini-card" onClick={() => {
              const node = graphData.nodes.find(n => n.id === `gap-${index}`);
              if (node) handleNodeClick(node);
            }}>
              <span className="category">RESEARCH GAP</span>
              <h4>{item.gap}</h4>
              <p>{item.context?.substring(0, 120)}</p>
              <div className="mini-card-footer">
                <span className="novelty-badge">{(item.novelty_score || 0) * 10}% Novel</span>
              </div>
            </div>
          )) : (
            <div className="mini-card empty">
              <h4>No gaps discovered yet</h4>
              <p>Run a scan in the Search Explorer to populate this graph.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrontierGraph;

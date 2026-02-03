import React, { useCallback, useMemo, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './FrontierGraph.css';

const FrontierGraph = ({ gaps = [], query = '' }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  // Dynamic Graph Data from discovery
  const graphData = useMemo(() => {
    // If no gaps, return a small empty-state graph or the central node
    if (!gaps || gaps.length === 0) {
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

    gaps.forEach((item, index) => {
      const nodeId = `gap-${index}`;
      nodes.push({
        id: nodeId,
        name: item.gap,
        type: 'gap',
        val: 12 + (item.novelty_score || 0),
        data: item // Store full item for the info card
      });
      links.push({ source: centralId, target: nodeId });
    });


    return { nodes, links };
  }, [gaps, query]);


  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="frontier-graph-page">
      <div className="graph-header">
        <div className="filter-chips">
          <button className="chip active">ALL DOMAINS</button>
          <button className="chip">PHYSICS ▾</button>
          <button className="chip">BIO-ENGINEERING ▾</button>
          <button className="chip">INTELLIGENCE ▾</button>
        </div>
        
        <div className="search-bar-inline">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search knowledge frontier (e.g. Topological Insulators)..." />
        </div>

        <div className="top-metrics">
          <div className="metric">
            <span className="label">PAPERS INDEXED</span>
            <span className="value">1,248,392</span>
          </div>
          <div className="metric">
            <span className="label">ACTIVE CLUSTERS</span>
            <span className="value orange">45,802</span>
          </div>
        </div>
      </div>

      <div className="graph-container">
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeColor={n => n.type === 'core' ? '#ff8c00' : n.highlight ? '#ff8c00' : '#444'}
          nodeRelSize={6}
          linkColor={() => 'rgba(255, 255, 255, 0.1)'}
          backgroundColor="transparent"
          onNodeClick={handleNodeClick}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Inter`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = node.type === 'core' ? '#ff8c00' : node.highlight ? '#ff8c00' : '#333';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
            ctx.fill();

            if (globalScale > 3) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(label, node.x, node.y + 8);
            }
          }}
        />

        {selectedNode && (
          <div className="node-info-card">
            <span className="card-label">{selectedNode.type === 'core' ? 'CENTRAL DOMAIN' : 'ACTIVE FRONTIER'}</span>
            <h2 className="card-node-title">{selectedNode.name}</h2>
            <div className="card-stats">
                {selectedNode.type === 'gap' ? (
                  <>
                    <div className="stat">📊 {selectedNode.data?.novelty_score * 10}% Novelty</div>
                    <div className="stat">📄 {selectedNode.data?.source_citation}</div>
                  </>
                ) : (
                  <div className="stat">🌐 Research Epicenter</div>
                )}
            </div>
          </div>
        )}


        <div className="graph-controls">
            <button className="control-btn">+</button>
            <button className="control-btn">-</button>
            <button className="control-btn">⛶</button>
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
            {gaps.length > 0 ? gaps.map((item, index) => (
                <div key={index} className="mini-card">
                    <span className="category">RESEARCH GAP</span>
                    <h4>{item.gap}</h4>
                    <p>{item.context}</p>
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

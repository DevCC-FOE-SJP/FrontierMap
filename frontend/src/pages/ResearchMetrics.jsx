import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import './ResearchMetrics.css';

const ResearchMetrics = () => {
  const velocityData = [
    { name: 'JAN 2024', value: 30 },
    { name: 'FEB 2024', value: 45 },
    { name: 'MAR 2024', value: 38 },
    { name: 'APR 2024', value: 82 },
    { name: 'MAY 2024', value: 55 },
    { name: 'JUN 2024', value: 72 },
  ];

  const authors = [
    { id: '01', name: 'Dr. Elena Vosovic', field: 'QUANTUM INFO', cites: '12.4k' },
    { id: '02', name: 'Marcus Thorne', field: 'TOPOLOGICAL INS.', cites: '9.8k' },
    { id: '03', name: 'Dr. Aris Nakamura', field: 'NEURAL MANIFOLDS', cites: '8.1k' },
  ];

  return (
    <div className="research-metrics-page">
      <div className="metrics-header">
        <div className="header-left">
          <div className="accent-line"></div>
          <h1 className="workspace-title">Research Metrics</h1>
          <p className="workspace-desc">Global innovation signals and sentiment analysis.</p>
        </div>
        <div className="header-right">
          <div className="time-toggle">
            <button className="toggle-btn">Last 6 Months</button>
            <button className="toggle-btn active">Real-time Feed</button>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card velocity-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Research Velocity</h3>
              <p>Monthly publications across indexed archives</p>
            </div>
            <div className="growth-badge">+24.2% MOM GROWTH</div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={velocityData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{background: '#1c1c1c', border: '1px solid #333', borderRadius: '8px'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {velocityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#ff8c00' : '#4a3016'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-labels">
                <span>JAN 2024</span>
                <span>MAR 2024</span>
                <span>MAY 2024</span>
                <span>JUN 2024</span>
            </div>
          </div>
        </div>

        <div className="metric-card sentiment-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Community Sentiment</h3>
              <p>Reddit & HackerNews Discourse</p>
            </div>
          </div>
          <div className="sentiment-visualization">
            <div className="sentiment-gauge">
                <svg viewBox="0 0 100 50">
                    <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />
                    <path d="M10 50 A 40 40 0 0 1 80 15" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3e82f7" />
                            <stop offset="100%" stopColor="#ff8c00" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="sentiment-value">
                    <span className="number">82.4</span>
                    <span className="label">HOT TOPIC</span>
                </div>
            </div>
            <div className="sentiment-labels">
                <span>DEAD END</span>
                <span>BREAKTHROUGH</span>
            </div>
          </div>
        </div>

        <div className="metric-card map-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Geographic Innovation Map</h3>
              <p>High-density research hubs</p>
            </div>
          </div>
          <div className="placeholder-map">
            <div className="map-shape"></div>
            <div className="map-node node-1"></div>
            <div className="map-node node-2"></div>
            <div className="map-node node-3"></div>
            <div className="map-legend">
                <span>• ACTIVE HUB</span>
                <span>• EMERGING</span>
            </div>
          </div>
        </div>

        <div className="metric-card authors-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Top Cited Authors</h3>
              <p>Specific field leadership</p>
            </div>
          </div>
          <div className="authors-list">
            {authors.map(author => (
              <div key={author.id} className="author-item">
                <div className="author-rank">{author.id}</div>
                <div className="author-main">
                  <span className="author-name">{author.name}</span>
                  <span className="author-field">{author.field}</span>
                </div>
                <div className="author-cites">
                  <span className="cite-count">{author.cites}</span>
                  <span className="cite-label">CITES</span>
                </div>
              </div>
            ))}
          </div>
          <button className="view-full-btn">VIEW FULL DIRECTORY</button>
        </div>
      </div>
      
      <div className="metrics-footer">
        <button className="export-btn">📊 Export Report</button>
      </div>
    </div>
  );
};

export default ResearchMetrics;

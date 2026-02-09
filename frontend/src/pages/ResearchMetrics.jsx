import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { discoveryService } from '../services/api';
import './ResearchMetrics.css';

const ResearchMetrics = ({ gaps = [], searchQuery = '' }) => {
  const [metrics, setMetrics] = useState(null);
  const [pulse, setPulse] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [exporting, setExporting] = useState(false);

  const domain = searchQuery || 'machine learning';

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await discoveryService.getMetrics(domain);
      setMetrics(data);
      if (data.sentiment) {
        setPulse(data.sentiment);
      }
    } catch (err) {
      setError('Failed to load metrics. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  const fetchPulse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await discoveryService.getPulse(domain);
      setPulse(data);
    } catch (err) {
      setError('Failed to load pulse data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleTimeToggle = (range) => {
    setTimeRange(range);
    if (range === 'realtime') {
      fetchPulse();
    } else {
      fetchMetrics();
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('FrontierMap Research Report', pageWidth / 2, 20, { align: 'center' });

      // Domain
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Domain: ${domain}`, pageWidth / 2, 30, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 37, { align: 'center' });

      let yPos = 50;

      // Summary stats
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;

      const summaryData = [
        ['Papers Indexed', String(metrics?.total_papers_indexed || 0)],
        ['Growth Rate', `${metrics?.growth_rate || 0}%`],
        ['Sentiment Score', `${pulse?.score || 0} (${pulse?.label || 'N/A'})`],
        ['HackerNews Mentions', String(metrics?.hackernews_mentions || 0)],
        ['StackExchange Questions', String(metrics?.stackexchange_questions || 0)],
        ['Problem Cards Found', String(gaps.length)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [255, 140, 0] },
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Research Velocity
      if (metrics?.velocity_data?.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Research Velocity', 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [['Month', 'Publications']],
          body: metrics.velocity_data.map(d => [d.name, String(d.value)]),
          theme: 'grid',
          headStyles: { fillColor: [255, 140, 0] },
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Top Authors
      if (metrics?.top_authors?.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Authors', 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Name', 'Field', 'Papers']],
          body: metrics.top_authors.map((a, i) => [
            String(i + 1).padStart(2, '0'),
            a.name,
            a.field || 'GENERAL',
            String(a.paper_count),
          ]),
          theme: 'grid',
          headStyles: { fillColor: [255, 140, 0] },
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Problem Cards
      if (gaps.length > 0) {
        // Check if we need a new page
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Problem Cards', 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [['Gap', 'Novelty', 'Source']],
          body: gaps.slice(0, 20).map(g => [
            g.gap?.substring(0, 80) || '',
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
  };

  // Derived data
  const velocityData = metrics?.velocity_data || [];
  const authors = (metrics?.top_authors || []).map((a, i) => ({
    id: String(i + 1).padStart(2, '0'),
    name: a.name,
    field: (a.field || 'GENERAL').toUpperCase().substring(0, 20),
    papers: a.paper_count,
  }));
  const displayedAuthors = showAllAuthors ? authors : authors.slice(0, 5);
  const sentimentScore = pulse?.score ?? 50;
  const sentimentLabel = pulse?.label ?? 'GROWING';
  const growthRate = metrics?.growth_rate ?? 0;

  // SVG arc for sentiment gauge
  const sentimentAngle = (sentimentScore / 100) * 180;
  const rad = (angle) => (angle * Math.PI) / 180;
  const gaugeEndX = 50 - 40 * Math.cos(rad(sentimentAngle));
  const gaugeEndY = 50 - 40 * Math.sin(rad(sentimentAngle));
  const largeArc = sentimentAngle > 180 ? 1 : 0;

  if (loading && !metrics) {
    return (
      <div className="research-metrics-page">
        <div className="loading-state">
          <div className="metrics-spinner"></div>
          Loading research metrics for "{domain}"...
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="research-metrics-page">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="research-metrics-page">
      <div className="metrics-header">
        <div className="header-left">
          <div className="accent-line"></div>
          <h1 className="workspace-title">Research Metrics</h1>
          <p className="workspace-desc">
            {domain !== 'machine learning'
              ? `Innovation signals for "${domain}"`
              : 'Global innovation signals and sentiment analysis.'}
          </p>
        </div>
        <div className="header-right">
          <div className="time-toggle">
            <button
              className={`toggle-btn ${timeRange === '6months' ? 'active' : ''}`}
              onClick={() => handleTimeToggle('6months')}
            >
              Last 6 Months
            </button>
            <button
              className={`toggle-btn ${timeRange === 'realtime' ? 'active' : ''}`}
              onClick={() => handleTimeToggle('realtime')}
            >
              Real-time Feed
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-number">{metrics?.total_papers_indexed || 0}</span>
          <span className="stat-label">PAPERS INDEXED</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{metrics?.hackernews_mentions || 0}</span>
          <span className="stat-label">HN MENTIONS</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{metrics?.stackexchange_questions || 0}</span>
          <span className="stat-label">SE QUESTIONS</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{gaps.length}</span>
          <span className="stat-label">PROBLEM CARDS</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card velocity-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Research Velocity</h3>
              <p>Monthly publications across indexed archives</p>
            </div>
            <div className={`growth-badge ${growthRate >= 0 ? '' : 'negative'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate}% MOM GROWTH
            </div>
          </div>
          <div className="chart-container">
            {velocityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={velocityData}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{background: '#1c1c1c', border: '1px solid #333', borderRadius: '8px', color: '#fff'}}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {velocityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === velocityData.length - 1 ? '#ff8c00' : '#4a3016'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-labels">
                  {velocityData.map((d, i) => (
                    <span key={i}>{d.name}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">No velocity data available yet</div>
            )}
          </div>
        </div>

        <div className="metric-card sentiment-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Community Sentiment</h3>
              <p>Reddit, HackerNews & StackExchange Discourse</p>
            </div>
          </div>
          <div className="sentiment-visualization">
            <div className="sentiment-gauge">
              <svg viewBox="0 0 100 50">
                <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />
                <path
                  d={`M10 50 A 40 40 0 ${largeArc} 1 ${gaugeEndX} ${gaugeEndY}`}
                  fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3e82f7" />
                    <stop offset="100%" stopColor="#ff8c00" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="sentiment-value">
                <span className="number">{sentimentScore}</span>
                <span className="label">{sentimentLabel}</span>
              </div>
            </div>
            <div className="sentiment-labels">
              <span>DEAD END</span>
              <span>BREAKTHROUGH</span>
            </div>
            {pulse?.sources && (
              <div className="sentiment-breakdown">
                {pulse.sources.hackernews && (
                  <div className="source-stat">
                    <span className="source-name">HackerNews</span>
                    <span className="source-val">{pulse.sources.hackernews.total_stories} stories · avg {pulse.sources.hackernews.avg_points} pts</span>
                  </div>
                )}
                {pulse.sources.reddit && (
                  <div className="source-stat">
                    <span className="source-name">Reddit</span>
                    <span className="source-val">{pulse.sources.reddit.total_discussions} threads · avg {pulse.sources.reddit.avg_score} score</span>
                  </div>
                )}
                {pulse.sources.stackexchange && (
                  <div className="source-stat">
                    <span className="source-name">StackExchange</span>
                    <span className="source-val">{pulse.sources.stackexchange.total_questions} Qs · {Math.round(pulse.sources.stackexchange.answered_ratio * 100)}% answered</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="metric-card map-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Research Categories</h3>
              <p>Top arXiv categories for this domain</p>
            </div>
          </div>
          <div className="categories-list">
            {metrics?.top_categories?.length > 0 ? (
              metrics.top_categories.map((cat, i) => (
                <span key={i} className="category-tag">{cat}</span>
              ))
            ) : (
              <div className="empty-state">No category data available</div>
            )}
          </div>
        </div>

        <div className="metric-card authors-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Top Cited Authors</h3>
              <p>Most active researchers in this field</p>
            </div>
          </div>
          <div className="authors-list">
            {displayedAuthors.length > 0 ? displayedAuthors.map(author => (
              <div key={author.id} className="author-item">
                <div className="author-rank">{author.id}</div>
                <div className="author-main">
                  <span className="author-name">{author.name}</span>
                  <span className="author-field">{author.field}</span>
                </div>
                <div className="author-cites">
                  <span className="cite-count">{author.papers}</span>
                  <span className="cite-label">PAPERS</span>
                </div>
              </div>
            )) : (
              <div className="empty-state">No author data available</div>
            )}
          </div>
          {authors.length > 5 && (
            <button className="view-full-btn" onClick={() => setShowAllAuthors(!showAllAuthors)}>
              {showAllAuthors ? 'SHOW LESS' : `VIEW ALL ${authors.length} AUTHORS`}
            </button>
          )}
        </div>
      </div>
      
      <div className="metrics-footer">
        <button className="export-btn" onClick={handleExportPDF} disabled={exporting}>
          {exporting ? '⏳ Generating PDF...' : '📊 Export Report'}
        </button>
      </div>
    </div>
  );
};

export default ResearchMetrics;

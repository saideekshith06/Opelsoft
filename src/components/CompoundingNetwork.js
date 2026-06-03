'use client';

import { useState } from 'react';

const INTEGRATION_TABS = {
  inputs: {
    label: '1. Ingest & Scrapers',
    title: 'Automated Input Scraping & Ingestion',
    description: 'Deploy crawler telemetry to index target corporate career pages (Greenhouse, Lever, Workday) and ingest resume coordinates in real-time.',
    kpis: [
      { value: '< 2.4s', label: 'CRAWL LATENCY' },
      { value: '99.8%', label: 'CRAWLER UPTIME' },
      { value: '24 active', label: 'ATS TARGETS' }
    ],
    summary: 'Status: 18 crawler targets active. Greenhouse and Lever endpoints synced.'
  },
  ai_core: {
    label: '2. Cognitive Match Core',
    title: 'Advanced LLM Relevance Reasoning',
    description: 'Compare candidate resume vector coordinates against scraped job parameters using Groq-accelerated Llama 3.3. Automatically isolate skill gaps.',
    kpis: [
      { value: '0.85s', label: 'EVALUATION SPEED' },
      { value: '96.4%', label: 'MATCH RELEVANCE' },
      { value: '12-axis', label: 'VECTOR ANALYSIS' }
    ],
    summary: 'Status: 32 scoring match operations executed. 6 risk factors identified.'
  },
  actions: {
    label: '3. Action Triggers',
    title: 'Autonomous Integration Triggers',
    description: 'Dispatch real-time alerts to Slack and email digests, while automatically drafting cover letters and preparing direct application vectors.',
    kpis: [
      { value: '< 50ms', label: 'ALERT DISPATCH' },
      { value: '110 drafts', label: 'AUTO COVERS' },
      { value: 'Active', label: 'INTEGRATIONS' }
    ],
    summary: 'Status: Slack notification dispatched. Cover draft compiled for Staff React Role.'
  }
};

const NODES_DATA = [
  // Column 1: Inputs
  { id: 'greenhouse', type: 'blue', tab: 'inputs', title: 'Greenhouse Scraper', status: 'Crawling active', icon: '📡' },
  { id: 'lever', type: 'blue', tab: 'inputs', title: 'Lever Scraper', status: 'Crawl completed', icon: '⚡' },
  { id: 'workday', type: 'blue', tab: 'inputs', title: 'Workday Parser', status: 'Synced', icon: '📦' },
  
  // Column 2: AI Core
  { id: 'groq', type: 'emerald', tab: 'ai_core', title: 'Groq LPU Engine', status: 'Scoring match', icon: '🧠' },
  { id: 'llama', type: 'emerald', tab: 'ai_core', title: 'Llama 3.3 70B', status: 'Scanning gaps', icon: '✨' },
  { id: 'vector', type: 'emerald', tab: 'ai_core', title: 'Vector Embeddings', status: 'Scored 94% fit', icon: '📊' },
  
  // Column 3: Outputs
  { id: 'slack', type: 'amber', tab: 'actions', title: 'Slack Dispatcher', status: 'Notification sent', icon: '💬' },
  { id: 'email', type: 'amber', tab: 'actions', title: 'Email Drafter', status: 'Covers drafted', icon: '✉️' },
  { id: 'webhook', type: 'purple', tab: 'actions', title: 'API Webhooks', status: 'Response 200 OK', icon: '🔌' }
];

export default function CompoundingNetwork() {
  const [activeTab, setActiveTab] = useState('inputs');
  const [hoveredNode, setHoveredNode] = useState(null);

  const activeData = INTEGRATION_TABS[activeTab];

  // Helper to check if a node is currently active based on selected tab or hover state
  const isNodeActive = (node) => {
    if (hoveredNode) {
      return node.id === hoveredNode;
    }
    return node.tab === activeTab;
  };

  const handleNodeHover = (nodeId) => {
    setHoveredNode(nodeId);
    // Auto switch tab to match hovered node for visual alignment
    const node = NODES_DATA.find(n => n.id === nodeId);
    if (node) {
      setActiveTab(node.tab);
    }
  };

  return (
    <section id="compounding-memory" className="section-dark section-padding bg-grid-dark" style={{ position: 'relative', overflow: 'hidden', padding: '120px 0', background: '#0b0f19' }}>
      
      {/* Glow decorations */}
      <div className="ambient-glow ambient-blue animate-drift-1" style={{ top: '10%', left: '5%', width: '500px', height: '500px', opacity: 0.35 }} />
      <div className="ambient-glow ambient-purple animate-drift-2" style={{ bottom: '10%', right: '5%', width: '500px', height: '500px', opacity: 0.35 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '60px', alignItems: 'center' }}>
          
          {/* Left Column: Switcher, metrics, and details */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-mono-stack)' }}>
              INTEGRATION HUB
            </div>
            
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: '800', letterSpacing: '-0.04em', color: '#ffffff', lineHeight: '1.1', marginBottom: '32px' }}>
              Enterprise AI<br />
              <span style={{ fontWeight: '400', fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }} className="font-serif-italic">Workflow Integrations.</span>
            </h2>

            {/* Timeline Segmented Control */}
            <div style={{ display: 'flex', flexDirection: 'column', smDirection: 'row', gap: '8px', marginBottom: '36px', background: 'rgba(255, 255, 255, 0.02)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {Object.keys(INTEGRATION_TABS).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: activeTab === key ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    color: activeTab === key ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {INTEGRATION_TABS[key].label}
                </button>
              ))}
            </div>

            {/* Current Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                  {activeData.title}
                </span>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.02rem', lineHeight: '1.6' }}>
                  {activeData.description}
                </p>
              </div>

              {/* KPI Metrics Dashboard Panel */}
              <div className="kpi-row">
                {activeData.kpis.map((kpi, idx) => (
                  <div key={idx} className="kpi-card">
                    <div className="kpi-value">{kpi.value}</div>
                    <div className="kpi-label">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Real World Synthesis Log Panel */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: activeTab === 'inputs' ? '#1E50FF' : activeTab === 'ai_core' ? '#10b981' : '#f59e0b', fontWeight: '700', fontFamily: 'var(--font-mono-stack)' }}>
                  ACTIVE SYSTEM DIGEST:
                </span>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5', margin: 0, fontFamily: 'var(--font-mono-stack)' }}>
                  {activeData.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Integration Dashboard Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', position: 'relative' }}>
            
            {/* SVG Data Stream Lines overlay */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 500 400" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
                {/* Inputs -> AI Core */}
                <path d="M 160 80 Q 250 80 250 200" fill="none" stroke="#1e50ff" strokeWidth="2" />
                <path d="M 160 200 Q 250 200 250 200" fill="none" stroke="#1e50ff" strokeWidth="2" />
                <path d="M 160 320 Q 250 320 250 200" fill="none" stroke="#1e50ff" strokeWidth="2" />
                
                {/* AI Core -> Action Triggers */}
                <path d="M 340 200 Q 340 80 410 80" fill="none" stroke="#10b981" strokeWidth="2" />
                <path d="M 340 200 Q 340 200 410 200" fill="none" stroke="#10b981" strokeWidth="2" />
                <path d="M 340 200 Q 340 320 410 320" fill="none" stroke="#10b981" strokeWidth="2" />
              </svg>
            </div>

            <div className="integration-grid" style={{ zIndex: 1 }}>
              
              {/* Inputs Column */}
              <div className="integration-column">
                <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono-stack)', marginBottom: '4px' }}>
                  INPUT SOURCES
                </div>
                {NODES_DATA.slice(0, 3).map((node) => {
                  const active = isNodeActive(node);
                  return (
                    <div
                      key={node.id}
                      className={`integration-node-card${active ? ' node-active-blue' : ''}`}
                      onMouseEnter={() => handleNodeHover(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <div className="integration-node-icon">{node.icon}</div>
                      <div className="integration-node-details">
                        <span className="integration-node-title">{node.title}</span>
                        <span className="integration-node-status" style={{ color: active ? '#5b7fff' : 'rgba(255,255,255,0.4)' }}>{node.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Processing Column */}
              <div className="integration-column" style={{ justifyContent: 'center' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono-stack)', marginBottom: '4px', textAlign: 'center' }}>
                  COGNITIVE CORE
                </div>
                {NODES_DATA.slice(3, 6).map((node) => {
                  const active = isNodeActive(node);
                  return (
                    <div
                      key={node.id}
                      className={`integration-node-card${active ? ' node-active-emerald' : ''}`}
                      onMouseEnter={() => handleNodeHover(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <div className="integration-node-icon">{node.icon}</div>
                      <div className="integration-node-details">
                        <span className="integration-node-title">{node.title}</span>
                        <span className="integration-node-status" style={{ color: active ? '#34d399' : 'rgba(255,255,255,0.4)' }}>{node.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Column */}
              <div className="integration-column" style={{ justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono-stack)', marginBottom: '4px', textAlign: 'right' }}>
                  ACTION TRIGGERS
                </div>
                {NODES_DATA.slice(6, 9).map((node) => {
                  const active = isNodeActive(node);
                  // Slack, Email, Webhooks
                  const activeClass = node.id === 'webhook' ? 'node-active-purple' : 'node-active-amber';
                  return (
                    <div
                      key={node.id}
                      className={`integration-node-card${active ? ` ${activeClass}` : ''}`}
                      onMouseEnter={() => handleNodeHover(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <div className="integration-node-icon">{node.icon}</div>
                      <div className="integration-node-details">
                        <span className="integration-node-title">{node.title}</span>
                        <span className="integration-node-status" style={{ color: active ? (node.id === 'webhook' ? '#a78bfa' : '#fbbf24') : 'rgba(255,255,255,0.4)' }}>{node.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Dashboard active indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 18px', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono-stack)' }}>
              <span>ACTIVE SYSTEM: {activeTab === 'inputs' ? 'INGESTING TELEMETRY' : activeTab === 'ai_core' ? 'COGNITIVE EVALUATION' : 'DISPATCHING TRIGGERS'}</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>● ONLINE</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

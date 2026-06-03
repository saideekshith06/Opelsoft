'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SLIDES_DATA = [
  {
    tag: "AUTONOMOUS RECRUITING",
    title: "Automate the Hunt.",
    highlight: "Align the Matches.",
    description: "Opelsoft deploys custom crawler telemetry to index company career pages and runs cognitive LLM reasoning to score opportunities against your resume.",
    ctaText: "Start Free Trial",
    ctaLink: "/register",
    theme: "blue"
  },
  {
    tag: "TELEMETRY SCRAPING",
    title: "Direct ATS Ingestion.",
    highlight: "Real-time Telemetry.",
    description: "Ingest live job postings directly from Greenhouse, Lever, and private corporate portals in real-time. No delayed aggregators, no stale listings.",
    ctaText: "Explore Crawl Targets",
    ctaLink: "/jobs",
    theme: "emerald"
  },
  {
    tag: "COGNITIVE SCORING",
    title: "LLM Relevance.",
    highlight: "Expose Skill Gaps.",
    description: "Compare candidate blueprints against job specifications automatically using Claude 3.5 & Gemini. Instantly identify qualification risks and missing skills.",
    ctaText: "Configure Your Agent",
    ctaLink: "/dashboard/candidate?tab=ai-agent",
    theme: "amber"
  }
];

const MOCK_LOGS = [
  { type: 'crawl', label: 'CRAWLER', text: 'GREENHOUSE: Indexing Google AI career page...' },
  { type: 'crawl', label: 'ATS', text: 'LEVER: Scraped 4 new positions from Vercel' },
  { type: 'score', label: 'COGNITIVE', text: 'CLAUDE-3.5: Scoring "Senior Full-Stack Engineer" against resume blueprint' },
  { type: 'score', label: 'MATCH', text: 'MATCH ENGINE: Score 94% match. Matches: Next.js, React, Node.js' },
  { type: 'alert', label: 'ALERT', text: 'NOTIFICATION: Slack digest dispatched to 12 candidates' },
  { type: 'crawl', label: 'CRAWLER', text: 'WORKDAY: Indexing Netflix career portal...' },
  { type: 'crawl', label: 'ATS', text: 'GREENHOUSE: Ingested 2 new roles from Stripe' },
  { type: 'score', label: 'COGNITIVE', text: 'GEMINI-1.5: Analyzing skill gap for "ML Scientist"' },
  { type: 'alert', label: 'GAP', text: 'MATCH ENGINE: Found gap: PyTorch (severity: medium)' },
  { type: 'crawl', label: 'ATS', text: 'LEVER: Crawling Figma target endpoints...' },
  { type: 'score', label: 'TELEMETRY', text: 'TELEMETRY: Re-indexed Greenhouse targets for 18 active companies' }
];

const MOCK_PIPELINES = [
  {
    candidate: 'Hemanth K. (AI Engineer)',
    company: 'DeepMind',
    role: 'Senior ML Engineer',
    score: 96,
    status: 'Verified Match',
    gaps: ['PyTorch', 'Distributed Training']
  },
  {
    candidate: 'Sarah L. (Frontend Architect)',
    company: 'Vercel',
    role: 'Lead UI Engineer',
    score: 92,
    status: 'Direct ATS Ingest',
    gaps: ['WebGL']
  },
  {
    candidate: 'Alex M. (Data Platform Lead)',
    company: 'Stripe',
    role: 'Staff Analytics Engineer',
    score: 88,
    status: 'Scored & Ranked',
    gaps: ['Rust', 'Snowflake']
  }
];

export default function HomeSlider({ stats }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [logs, setLogs] = useState([MOCK_LOGS[0], MOCK_LOGS[1], MOCK_LOGS[2], MOCK_LOGS[3]]);
  const [pipelineIndex, setPipelineIndex] = useState(0);

  const jobsCount = stats?.jobsCount || 37;
  const usersCount = stats?.usersCount || 6;
  const companiesCount = stats?.companiesCount || 25;

  // Cycle text slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES_DATA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Cycle logs terminal
  useEffect(() => {
    let logIndex = 4;
    const logInterval = setInterval(() => {
      setLogs((prev) => {
        const next = [...prev.slice(1), MOCK_LOGS[logIndex]];
        logIndex = (logIndex + 1) % MOCK_LOGS.length;
        return next;
      });
    }, 3000);

    return () => clearInterval(logInterval);
  }, []);

  // Cycle pipeline simulations
  useEffect(() => {
    const pipelineInterval = setInterval(() => {
      setPipelineIndex((prev) => (prev + 1) % MOCK_PIPELINES.length);
    }, 6000);

    return () => clearInterval(pipelineInterval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (searchTitle.trim()) params.append('title', searchTitle.trim());
      if (searchLocation.trim()) params.append('city', searchLocation.trim());
      window.location.href = `/jobs?${params.toString()}`;
    }
  };

  const activePipeline = MOCK_PIPELINES[pipelineIndex];

  return (
    <section style={{ position: 'relative', width: '100%', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#09090b', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      
      {/* Symmetrical Tech Grid Background (Replacing Unsplash image slider background) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.12, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 60% 40%, rgba(30, 80, 255, 0.08) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 20% 70%, rgba(16, 185, 129, 0.04) 0%, transparent 60%)' }} />

      {/* Ambient Gradient Glow Drops */}
      <div className="ambient-glow ambient-blue animate-drift-1" style={{ top: '-10%', right: '10%', width: '600px', height: '600px', opacity: 0.35 }} />
      <div className="ambient-glow ambient-purple animate-drift-2" style={{ bottom: '-10%', left: '10%', width: '500px', height: '500px', opacity: 0.3 }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '100px 24px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center', width: '100%' }}>
          
          {/* Left Column: Slidable Hero Content (Clean & Symmetrical) */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
            
            {/* Slide indicators */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {SLIDES_DATA.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  style={{
                    width: index === activeSlide ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: index === activeSlide ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Tag / Category Badge */}
            <div
              style={{
                fontFamily: 'var(--font-mono-stack)',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: activeSlide === 0 ? '#1e50ff' : activeSlide === 1 ? '#10b981' : '#f59e0b',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                transition: 'color 0.4s ease',
              }}
            >
              {SLIDES_DATA[activeSlide].tag}
            </div>

            {/* Main Header Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                  fontWeight: '900',
                  lineHeight: '1.05',
                  letterSpacing: '-0.04em',
                  color: '#ffffff',
                }}
              >
                {SLIDES_DATA[activeSlide].title}
              </h1>
              <h1
                className="font-serif-italic"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                  fontWeight: '400',
                  lineHeight: '1.05',
                  letterSpacing: '-0.02em',
                  color: 'rgba(255, 255, 255, 0.65)',
                }}
              >
                {SLIDES_DATA[activeSlide].highlight}
              </h1>
            </div>

            {/* Description Text */}
            <p
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.2rem)',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6',
                fontWeight: '400',
              }}
            >
              {SLIDES_DATA[activeSlide].description}
            </p>

            {/* CTA + Actions */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
              <Link
                href={SLIDES_DATA[activeSlide].ctaLink}
                className="fs-btn-pill"
                style={{
                  padding: '14px 28px',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: '#ffffff',
                  color: '#09090b',
                  borderColor: '#ffffff',
                  boxShadow: '0 10px 25px rgba(255, 255, 255, 0.08)',
                }}
              >
                {SLIDES_DATA[activeSlide].ctaText}
              </Link>
              <Link
                href="/about-us"
                className="fs-btn-ghost"
                style={{
                  padding: '14px 28px',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'transparent',
                  color: '#ffffff',
                  boxShadow: 'none',
                }}
              >
                How It Works
              </Link>
            </div>

          </div>

          {/* Right Column: Search + Live KAI Telemetry Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 3 }}>
            
            {/* Search Box Component */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '4px', color: '#ffffff' }}>
                Search Opportunities
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Opelsoft database holds live crawled positions
              </p>

              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-mono-stack)' }}>
                    Keyword / Role
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. Next.js, Python, Manager"
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 36px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        transition: 'border-color 0.2s',
                      }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                      🔍
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-mono-stack)' }}>
                    Location
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. London, Remote"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 36px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        transition: 'border-color 0.2s',
                      }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                      📍
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="fs-btn-pill"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(30, 80, 255, 0.25)',
                    marginTop: '4px',
                  }}
                >
                  Query Positions
                </button>
              </form>
            </div>

            {/* Interactive KAI Agent & Crawler Telemetry Console */}
            <div className="telemetry-console">
              <div className="telemetry-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="telemetry-dots">
                    <span className="telemetry-dot dot-red" />
                    <span className="telemetry-dot dot-yellow" />
                    <span className="telemetry-dot dot-green" />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', color: '#e4e4e7', fontFamily: 'var(--font-mono-stack)' }}>
                    KAI-1 TELEMETRY FEED
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} className="animate-live-pulse" />
                  <span style={{ fontSize: '9px', fontWeight: '600', color: '#10b981', textTransform: 'uppercase' }}>
                    LIVE SYSTEM
                  </span>
                </div>
              </div>

              {/* Scrolling Log Stream */}
              <div className="telemetry-log-feed">
                {logs.map((log, index) => {
                  const isLast = index === logs.length - 1;
                  return (
                    <div key={index} className="telemetry-log-line" style={{ opacity: isLast ? 1 : 0.4 + index * 0.15 }}>
                      <span className={`telemetry-status-tag status-tag-${log.type}`}>
                        {log.label}
                      </span>
                      <span style={{ color: isLast ? '#ffffff' : '#a1a1aa', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {log.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Match Engine Simulated Preview */}
              <div className="match-pipeline-preview">
                <div className="match-gauge-ring">
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle
                      className="match-gauge-circle"
                      cx="26"
                      cy="26"
                      r="22"
                      fill="none"
                      stroke="url(#blue-emerald-grad)"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - activePipeline.score / 100)}
                    />
                    <defs>
                      <linearGradient id="blue-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e50ff" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="match-gauge-percent">{activePipeline.score}%</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', textTransform: 'uppercase' }}>
                      {activePipeline.status}
                    </span>
                    <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>MATCHED</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {activePipeline.candidate}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {activePipeline.company} &bull; {activePipeline.role}
                  </div>
                  {activePipeline.gaps && activePipeline.gaps.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {activePipeline.gaps.map((gap, gIdx) => (
                        <span key={gIdx} style={{ fontSize: '8px', padding: '1px 4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '3px', textTransform: 'uppercase', fontFamily: 'var(--font-mono-stack)' }}>
                          GAP: {gap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stat Counters Layer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em', fontFamily: 'var(--font-mono-stack)' }}>
                  {jobsCount}
                </div>
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Live Jobs
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em', fontFamily: 'var(--font-mono-stack)' }}>
                  {usersCount}
                </div>
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Candidates
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em', fontFamily: 'var(--font-mono-stack)' }}>
                  {companiesCount}
                </div>
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Companies
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TALENT_NAV = { name: 'Talent & Staffing', path: '/talent-staffing' };

const CANDIDATE_NAV = { name: 'For Candidates', path: '/dashboard/candidate' };

// Shown only when an employer is signed in.
const EMPLOYER_NAV = {
  name: 'For Employers', dropdown: [
    { name: 'Employer Dashboard', path: '/dashboard/employer' }, { name: 'Post a Job', path: '/dashboard/employer?tab=post-job' }, ],
};

function buildNav(user) {
  return [
    { name: 'Home', path: '/' }, { name: 'About Us', path: '/about-us' }, TALENT_NAV, CANDIDATE_NAV, { name: 'Find Jobs', path: '/jobs' }, ...(user && user.role === 'employer' ? [EMPLOYER_NAV] : []), { name: 'Contact', path: '/contact-us' }, ];
}

function DropdownMenu({ items, onMouseEnter, onMouseLeave }) {
  return (
    <div className="fs-dropdown" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {items.map((item) => (
        <Link key={item.path} href={item.path} className="fs-dropdown-item">
          {item.name}
        </Link>
      ))}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef(null);
  const closeTimer = useRef(null);

  const openMenu = useCallback((name) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(name);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 120);
  }, []);

  // Check login session on load and route changes
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Frosted-glass + shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const navItems = buildNav(user);

  return (
    <>
      <header className={`fs-header${scrolled ? ' scrolled' : ''}`} ref={headerRef}>
        <div className="fs-header-inner">
          {/* Logo */}
          <Link href="/" className="fs-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.svg" alt="OpelSoft Logo" style={{ height: '32px', width: 'auto', display: 'block' }} />
          </Link>

          {/* Desktop Nav, centered */}
          <nav className="fs-nav-desktop">
            {navItems.map((item) => {
              const hasDropdown = !!item.dropdown;
              const isActive = item.path ? pathname === item.path : item.dropdown?.some(d => pathname === d.path);
              const isOpen = openDropdown === item.name;

              return (
                <div
                  key={item.name}
                  className={`fs-nav-item${hasDropdown ? ' has-dropdown' : ''}`}
                  onMouseEnter={() => hasDropdown && openMenu(item.name)}
                  onMouseLeave={() => hasDropdown && scheduleClose()}
                >
                  {hasDropdown ? (
                    <button
                      className={`fs-nav-link op-underline${isActive ? ' active' : ''}`}
                      onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                      aria-expanded={isOpen}
                    >
                      {item.name}
                      <svg
                        className={`fs-chevron${isOpen ? ' rotated' : ''}`}
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ) : (
                    <Link href={item.path} className={`fs-nav-link op-underline${isActive ? ' active' : ''}`}>
                      {item.name}
                    </Link>
                  )}

                  {hasDropdown && isOpen && (
                    <DropdownMenu
                      items={item.dropdown}
                      onMouseEnter={() => openMenu(item.name)}
                      onMouseLeave={scheduleClose}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="fs-header-cta">
            {user ? (
              <>
                <Link 
                  href={user.role === 'candidate' ? '/dashboard/candidate' : '/dashboard/employer'} 
                  className="fs-btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', textTransform: 'none' }}
                >
                  👤 {user.username}
                </Link>
                <button 
                  onClick={handleSignOut} 
                  className="fs-btn-pill" 
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="fs-btn-ghost">Login</Link>
                <Link href="/register" className="fs-btn-pill">Join Us</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="fs-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span className={`fs-ham-line${mobileOpen ? ' open' : ''}`} />
            <span className={`fs-ham-line${mobileOpen ? ' open' : ''}`} />
            <span className={`fs-ham-line${mobileOpen ? ' open' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`fs-mobile-drawer${mobileOpen ? ' open' : ''}`}>
        <div className="fs-mobile-nav">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.dropdown ? (
                <>
                  <span className="fs-mobile-section">{item.name}</span>
                  {item.dropdown.map((sub) => (
                    <Link key={sub.path} href={sub.path} className="fs-mobile-link sub">
                      {sub.name}
                    </Link>
                  ))}
                </>
              ) : (
                <Link href={item.path} className={`fs-mobile-link${pathname === item.path ? ' active' : ''}`}>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
          
          {user ? (
            <div className="fs-mobile-cta" style={{ gap: '10px' }}>
              <Link 
                href={user.role === 'candidate' ? '/dashboard/candidate' : '/dashboard/employer'} 
                className="fs-mobile-link"
                style={{ textAlign: 'center', fontWeight: '700', padding: '10px 0' }}
              >
                Dashboard ({user.username})
              </Link>
              <button 
                onClick={handleSignOut} 
                className="fs-btn-pill full" 
                style={{ width: '100%', cursor: 'pointer', border: 'none' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="fs-mobile-cta">
              <Link href="/login" className="fs-btn-ghost full">Login</Link>
              <Link href="/register" className="fs-btn-pill full">Join Us</Link>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && <div className="fs-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}

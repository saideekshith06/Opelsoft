'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about-us' },
  { name: 'Talent & Staffing', path: '/talent-staffing' },
  { name: 'Enterprise Solutions', path: '/enterprise-solutions' },
  { name: 'Find Jobs', path: '/jobs' },
  { name: 'Contact', path: '/contact-us' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  const ref = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobile(false); }, [pathname]);

  return (
    <>
      <header className={`nv${scrolled ? ' scrolled' : ''}`} ref={ref}>
        <div className="nv-inner">
          <Link href="/" className="nv-logo" aria-label="OpelSoft home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="OpelSoft" />
          </Link>

          <nav className="nv-links">
            {NAV.map((item) => (
              <Link key={item.name} href={item.path} className={`nv-link${pathname === item.path ? ' active' : ''}`}>{item.name}</Link>
            ))}
          </nav>

          <button className={`nv-burger${mobile ? ' open' : ''}`} aria-label="Toggle menu" aria-expanded={mobile} onClick={() => setMobile(!mobile)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`nv-scrim${mobile ? ' open' : ''}`} onClick={() => setMobile(false)} />
      <div className={`nv-drawer${mobile ? ' open' : ''}`}>
        {NAV.map((item) => (
          <Link key={item.name} href={item.path} className={pathname === item.path ? 'active' : ''}>{item.name}</Link>
        ))}
      </div>
    </>
  );
}

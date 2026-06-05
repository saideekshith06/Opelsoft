import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark-footer">
      <div className="container dark-footer-inner">

        {/* Top grid */}
        <div className="dark-footer-grid">

          {/* Brand col */}
          <div className="df-brand">
            <Link href="/" className="fs-logo" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center' }}>
              <img src="/logo.svg" alt="OpelSoft Logo" style={{ height: '40px', width: 'auto', display: 'block' }} />
            </Link>
            <p className="df-tagline">
              Discover roles from the companies building what&apos;s next.
            </p>
            <div className="df-socials">
              {/* LinkedIn */}
              <a href="#" className="df-social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="df-social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" className="df-social-link" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="df-col">
            <h4 className="df-col-title">Platform</h4>
            <ul className="df-links">
              <li><Link href="/jobs">Find Jobs</Link></li>
              <li><Link href="/talent-staffing">Talent &amp; Staffing</Link></li>
              <li><Link href="/enterprise-solutions">Enterprise Solutions</Link></li>
              <li><Link href="/about-us">About Us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="df-col">
            <h4 className="df-col-title">Company</h4>
            <ul className="df-links">
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/contact-us">Contact</Link></li>
              <li><Link href="/enterprise-solutions">Enterprise Solutions</Link></li>
              <li><Link href="/contact-us">Get in touch</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="df-col">
            <h4 className="df-col-title">Contact</h4>
            <ul className="df-contact-list">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                255 Old New Brunswick Rd, Ste: N210, Piscataway, NJ 08854
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                hr@opelsoft.com
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 5.86 5.86l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +1 (845) 546-3999
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="dark-footer-bar">
          <p>© {year} Opelsoft. All rights reserved.</p>
          <div className="df-bar-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

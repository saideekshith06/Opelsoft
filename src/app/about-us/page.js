import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AboutUsPage() {
  return (
    <div className="about-page container" style={{ padding: '60px 24px 100px 24px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '80px', position: 'relative' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1.5px' }}>
          Connecting <span className="text-gradient">Talent</span> with <span className="text-gradient">Opportunity</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
          Opelsoft is a premier IT staffing and recruiting firm. We specialize in sourcing top technical talent for leading global companies and matching candidates with their dream career paths.
        </p>
      </section>

      {/* Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '80px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.5px' }}>
            Our Staffing Mission
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.8', marginBottom: '20px' }}>
            For over a decade, we have partnered with high-growth startups and established enterprise teams across Europe and the UK. Our process combines deep tech vetting with personal career consulting to ensure alignments that last.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.8' }}>
            Whether you are looking to scale your engineering team with contractors, hire full-time executive staff, or take the next step in your developer career, Opelsoft provides the framework to make recruitment seamless.
          </p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '40px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>10+ Years</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Recruitment Expertise</div>
          </div>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>70+ Active</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Staffing Placements</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>100% Verified</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Employer Network</div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '60px' }}>
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <h2>Our Core <span className="text-gradient">Values</span></h2>
          <p>The foundational principles guiding our staffing and technical services</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="card">
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🛡️</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Absolute Integrity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              We build transparent partnerships. No hidden clauses, just clear communication and honest pricing policies.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚡</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Vetted Efficiency</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              Our automated matching scripts and engineering interview parameters reduce hiring cycles from weeks to 48 hours.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🌍</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Global Reach</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              With candidate databases covering regions worldwide, we bridge the gap between remote talent pools and UK businesses.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="card" style={{ marginTop: '80px', padding: '50px', textAlign: 'center', background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Ready to Hire or Get Hired?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
          Join the Opelsoft network today and gain access to premium jobs or vetted candidate pools immediately.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/jobs" className="btn btn-primary">
            Browse Opportunities
          </Link>
          <Link href="/contact-us" className="btn btn-secondary">
            Talk to an Advisor
          </Link>
        </div>
      </div>
    </div>
  );
}

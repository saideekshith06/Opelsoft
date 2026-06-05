import JobIntakeForm from '@/components/JobIntakeForm';
import Decor from '@/components/ui/Decor';

export const metadata = {
  title: 'Find Jobs — OpelSoft',
  description: 'Tell us about yourself and our team will match you with the right opportunities.',
};

export default function JobsPage() {
  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* HERO */}
      <section className="op-mesh" style={{ position: 'relative', borderBottom: '1px solid var(--border-color)', padding: '76px 0 56px', overflow: 'hidden' }}>
        <Decor variant="b" />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '760px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '16px' }}>For Candidates</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.06', marginBottom: '16px' }}>
            Find your next role with <span className="op-grad-text">OpelSoft</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.12rem', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto' }}>
            Tell us a little about yourself and our team will match you with the right opportunities. We&apos;ll review your details and get in touch within 1 working day.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="section-padding sec-grid" style={{ position: 'relative' }}>
        <Decor variant="c" />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <JobIntakeForm />
        </div>
      </section>
    </div>
  );
}

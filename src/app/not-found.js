import Link from 'next/link';
import Decor from '@/components/ui/Decor';

export const metadata = {
  title: 'Page not found - OpelSoft',
};

export default function NotFound() {
  return (
    <section
      className="op-mesh"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-color)',
        color: 'var(--text-primary)',
        padding: '60px 24px',
      }}
    >
      <Decor variant="a" />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px' }}>
        <div
          className="op-grad-text"
          style={{ fontSize: 'clamp(6rem, 18vw, 11rem)', fontWeight: '800', letterSpacing: '-0.05em', lineHeight: '1', marginBottom: '8px' }}
        >
          404
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '14px' }}>
          This page took a different role
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 32px' }}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="op-btn op-grad-bg" style={{ padding: '14px 30px', borderRadius: '12px', fontWeight: '700', color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>
            Back to home
          </Link>
          <Link href="/jobs" className="op-btn" style={{ padding: '14px 30px', borderRadius: '12px', fontWeight: '700', border: '1px solid var(--border-color)', background: '#fff', color: '#09090b', textDecoration: 'none' }}>
            Find jobs
          </Link>
        </div>
      </div>
    </section>
  );
}

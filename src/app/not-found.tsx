import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '6rem', marginBottom: 'var(--space-4)' }} aria-hidden="true">🌸</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-5xl)', color: 'var(--color-burgundy)', marginBottom: 'var(--space-4)' }}>
            Page Not Found
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-500)', lineHeight: 1.7, marginBottom: 'var(--space-8)' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track!
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary btn-lg" id="404-go-home">
              Go Home
            </Link>
            <Link href="/collection" className="btn btn-outline btn-lg" id="404-browse">
              Browse Sarees
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

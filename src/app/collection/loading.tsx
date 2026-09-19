export default function CollectionLoading() {
  return (
    <div style={{ minHeight: '80vh', padding: 'var(--space-16) 0' }}>
      <div className="container">
        {/* Header skeleton */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div className="shimmer" style={{ height: 20, width: 120, margin: '0 auto var(--space-3)', borderRadius: 'var(--radius-md)' }} />
          <div className="shimmer" style={{ height: 36, width: 280, margin: '0 auto var(--space-4)', borderRadius: 'var(--radius-md)' }} />
        </div>

        {/* Filter skeleton */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-8)', justifyContent: 'center' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 36, width: 80, borderRadius: 'var(--radius-full)' }} />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
              <div className="shimmer" style={{ aspectRatio: '3/4' }} />
              <div style={{ padding: 'var(--space-4)' }}>
                <div className="shimmer" style={{ height: 18, width: '80%', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }} />
                <div className="shimmer" style={{ height: 14, width: '50%', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)' }} />
                <div className="shimmer" style={{ height: 36, width: '100%', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

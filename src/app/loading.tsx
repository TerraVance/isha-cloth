export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner dark" style={{ width: 36, height: 36, margin: '0 auto var(--space-4)' }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>Loading…</p>
      </div>
    </div>
  );
}

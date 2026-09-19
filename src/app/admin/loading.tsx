export default function AdminLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
    }}>
      <div style={{ textAlign: 'center' }}>
        <span className="spinner dark" style={{ width: 32, height: 32 }} />
        <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>Loading admin…</p>
      </div>
    </div>
  );
}

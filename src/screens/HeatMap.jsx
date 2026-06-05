import React from 'react'

export default function HeatMap({ locationCounts }) {
  const maxCount = Math.max(...Object.values(locationCounts), 1)

  const heatColor = (count) => {
    if (!count) return '#2a3848'
    const ratio = count / maxCount
    if (ratio > 0.7) return '#d11a1a'
    if (ratio > 0.4) return '#e8632e'
    if (ratio > 0.2) return '#e8923a'
    if (ratio > 0.05) return '#c9a227'
    return '#3d6699'
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Location Heat Map</div>
          <div style={styles.subtitle}>Case density by location</div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.legend}>
          <div style={styles.legTitle}>DENSITY</div>
          {[['Critical', '#d11a1a'], ['High', '#e8632e'], ['Moderate', '#e8923a'], ['Low', '#c9a227'], ['Minimal', '#3d6699']].map(([l, c]) => (
            <div key={l} style={styles.legItem}>
              <div style={{...styles.legBox, background: c}} />
              <span style={styles.legLabel}>{l}</span>
            </div>
          ))}
        </div>

        <div style={styles.locations}>
          {Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([loc, count]) => (
              <div key={loc} style={{...styles.locItem, background: heatColor(count)}}>
                <div style={styles.locName}>{loc}</div>
                <div style={styles.locCount}>{count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '24px 36px' },
  header: { marginBottom: 24 },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#eef0f4', marginBottom: 4 },
  subtitle: { fontSize: '0.76rem', color: '#445', fontFamily: 'monospace' },
  content: { display: 'flex', gap: 24 },
  legend: { background: '#0b1018', border: '1px solid #18222e', borderRadius: 4, padding: '14px 16px', width: 180, flexShrink: 0 },
  legTitle: { fontSize: '0.6rem', color: '#445', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 },
  legItem: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  legBox: { width: 16, height: 16, borderRadius: 2, flexShrink: 0 },
  legLabel: { fontSize: '0.72rem', color: '#7a8898', fontFamily: 'monospace' },
  locations: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, flex: 1 },
  locItem: { borderRadius: 4, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  locName: { fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.7)', marginBottom: 4 },
  locCount: { fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.7)' },
}

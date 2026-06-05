import React from 'react'

export default function CaseCard({ case: c, onClick }) {
  return (
    <div style={styles.card} onClick={onClick} className="card">
      <div style={styles.cTop}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={styles.cName}>{c.full_name}</div>
          <div style={styles.cMeta}>{c.title}{c.agency_or_office ? ` · ${c.agency_or_office}` : ''}</div>
          <div style={styles.cLoc}>📍 {c.location || 'Unknown Location'}</div>
        </div>
      </div>
      <div style={styles.cMid}>
        {c.category && <span style={styles.mTag}>{c.category}</span>}
        {c.date && <span style={styles.dt}>{new Date(c.date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span>}
      </div>
      <div style={styles.cDesc}>{c.specific_charges ? c.specific_charges.slice(0, 180) : c.details?.slice(0, 180) || 'No description'}{c.specific_charges?.length > 180 ? '…' : ''}</div>
    </div>
  )
}

const styles = {
  card: { background: '#0b1018', border: '1px solid #18222e', borderRadius: 4, padding: '15px 17px', cursor: 'pointer', transition: 'all 0.15s' },
  cTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  cName: { fontSize: '0.96rem', fontWeight: 700, color: '#e8f0ff', marginBottom: 2 },
  cMeta: { fontSize: '0.74rem', color: '#90a0bc', fontFamily: 'monospace', marginBottom: 2 },
  cLoc: { fontSize: '0.68rem', color: '#6a8aa0', fontFamily: 'monospace' },
  cMid: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7, flexWrap: 'wrap' },
  mTag: { fontSize: '0.66rem', color: '#8898a8', fontFamily: 'monospace', background: '#131c28', padding: '2px 7px', borderRadius: 2 },
  dt: { marginLeft: 'auto', fontSize: '0.67rem', color: '#556', fontFamily: 'monospace' },
  cDesc: { fontSize: '0.78rem', color: '#a8b8cc', lineHeight: 1.55 },
}

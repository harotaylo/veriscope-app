import React from 'react'

export default function CaseModal({ case: c, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        
        <h2 style={styles.modalName}>{c.full_name}</h2>
        <div style={styles.modalTitle}>{c.title}</div>
        <div style={styles.modalDept}>{c.agency_or_office}</div>
        
        <div style={{borderTop: '1px solid #1a2030', margin: '16px 0'}} />

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 16}}>
          {[['Location', c.location || '—'], ['Date', c.date ? new Date(c.date).toLocaleDateString() : '—'], ['Category', c.category || '—']].map(([l, v]) => (
            <div key={l}>
              <div style={styles.fLabel}>{l}</div>
              <div style={styles.fValue}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{borderTop: '1px solid #1a2030', margin: '16px 0'}} />

        {[['Charges', c.specific_charges], ['Details', c.details], ['Sources', c.source_url]].filter(([,v]) => v).map(([l, v]) => (
          <div key={l} style={{marginBottom: 16}}>
            <div style={{fontSize: '0.65rem', color: '#c84b4b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6}}>{l}</div>
            {l === 'Sources' ? <a href={v} target="_blank" rel="noopener noreferrer" style={{color: '#8ab4f8', fontSize: '0.8rem'}}>{v}</a> : <div style={{fontSize: '0.84rem', color: '#8892a0', lineHeight: 1.65}}>{v}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: '#0b1018', border: '1px solid #1a2535', borderRadius: 6, padding: '30px 26px', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: '#334', fontSize: '1.1rem', cursor: 'pointer', padding: 4 },
  modalName: { fontSize: '1.7rem', fontWeight: 700, color: '#eef0f4', margin: '0 0 4px', letterSpacing: '-0.02em' },
  modalTitle: { fontSize: '0.9rem', color: '#8892a0', fontFamily: 'monospace', marginBottom: 2 },
  modalDept: { fontSize: '0.8rem', color: '#445', fontFamily: 'monospace', marginBottom: 16 },
  fLabel: { fontSize: '0.6rem', color: '#445', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 },
  fValue: { fontSize: '0.82rem', color: '#b0bac8', fontFamily: 'monospace' },
}

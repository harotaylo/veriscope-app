import React from 'react'
import CaseCard from '../components/CaseCard'
import CaseModal from '../components/CaseModal'

export default function Database({
  cases,
  loading,
  search,
  setSearch,
  filterCategory,
  setFilterCategory,
  filterLevel,
  setFilterLevel,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  page,
  setPage,
  totalCount,
  categories,
  levels,
}) {
  const [selected, setSelected] = React.useState(null)
  const pageSize = 50
  const maxPage = Math.ceil(totalCount / pageSize)

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.sbS}>
          <label style={styles.sbL}>🔍 Search</label>
          <input
            style={styles.sbI}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name, charges, location…"
          />
        </div>

        <div style={styles.sbS}>
          <label style={styles.sbL}>Category</label>
          <select
            style={styles.sbSel}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option>All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={styles.sbS}>
          <label style={styles.sbL}>Level</label>
          <select
            style={styles.sbSel}
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
          >
            <option>All Levels</option>
            {levels.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        <button
          style={styles.clearBtn}
          onClick={() => {
            setSearch('')
            setFilterCategory('All Categories')
            setFilterLevel('All Levels')
            setPage(0)
          }}
        >
          ↺ Clear Filters
        </button>

        <div style={styles.rcnt}>{totalCount} record{totalCount !== 1 ? 's' : ''}</div>
      </aside>

      <main style={styles.main}>
        <div style={styles.sortBar}>
          <span style={styles.sortL}>Sort:</span>
          {['date', 'full_name', 'location'].map(col => (
            <button
              key={col}
              style={{...styles.sortBtn, ...(sortBy === col ? styles.sortOn : {})}}
              onClick={() => {
                if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
                else { setSortBy(col); setSortDir('desc') }
              }}
            >
              {col === 'full_name' ? 'Name' : col === 'date' ? 'Date' : 'Location'}
              {sortBy === col && <span style={{marginLeft: 3}}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
            </button>
          ))}
        </div>

        <div style={styles.list}>
          {loading && <div style={styles.loading}>Loading…</div>}
          {!loading && cases.length === 0 && <div style={styles.empty}>No cases match your filters.</div>}
          {!loading && cases.map(c => (
            <CaseCard key={c.id} case={c} onClick={() => setSelected(c)} />
          ))}
        </div>

        {!loading && maxPage > 1 && (
          <div style={styles.pagination}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              style={styles.pagBtn}
            >
              ← Previous
            </button>
            <span style={styles.pagInfo}>Page {page + 1} of {maxPage}</span>
            <button
              disabled={page >= maxPage - 1}
              onClick={() => setPage(p => p + 1)}
              style={styles.pagBtn}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {selected && <CaseModal case={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: 'calc(100vh - 145px)' },
  sidebar: { width: 222, background: '#0b1018', borderRight: '1px solid #18222e', padding: 16, flexShrink: 0, overflowY: 'auto' },
  sbS: { marginBottom: 13 },
  sbL: { display: 'block', fontSize: '0.58rem', color: '#445', letterSpacing: '0.1em', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4 },
  sbI: { width: '100%', background: '#131c28', border: '1px solid #1a2535', borderRadius: 3, color: '#c8d8f0', padding: '7px 8px', fontSize: '0.76rem', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' },
  sbSel: { width: '100%', background: '#131c28', border: '1px solid #1a2535', borderRadius: 3, color: '#c8d8f0', padding: '7px 8px', fontSize: '0.73rem', fontFamily: 'monospace', outline: 'none', cursor: 'pointer' },
  clearBtn: { width: '100%', background: 'none', border: '1px solid #1a2535', color: '#445', padding: '6px', borderRadius: 3, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'monospace', marginBottom: 8 },
  rcnt: { fontSize: '0.66rem', color: '#334', fontFamily: 'monospace', textAlign: 'center' },
  main: { flex: 1, padding: '20px 22px', overflowY: 'auto' },
  sortBar: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 },
  sortL: { fontSize: '0.66rem', color: '#334', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' },
  sortBtn: { background: 'none', border: '1px solid #1a2535', color: '#445', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'monospace' },
  sortOn: { border: '1px solid #c84b4b44', color: '#c8d8f0', background: '#c84b4b11' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: { textAlign: 'center', color: '#556', padding: '40px', fontFamily: 'monospace' },
  empty: { textAlign: 'center', color: '#334', padding: 60, fontFamily: 'monospace', fontSize: '0.85rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #18222e' },
  pagBtn: { background: '#131c28', border: '1px solid #1a2535', color: '#c8d8f0', padding: '8px 16px', borderRadius: 3, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'monospace' },
  pagInfo: { fontSize: '0.78rem', color: '#556', fontFamily: 'monospace' },
}

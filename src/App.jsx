import React, { useState, useEffect } from 'react'
import { getCases, getCasesByLocation, getCategories, getLevels } from '../lib/db'
import Database from './screens/Database'
import HeatMap from './screens/HeatMap'

export default function App() {
  const [view, setView] = useState('database')
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [filterLevel, setFilterLevel] = useState('All Levels')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [levels, setLevels] = useState([])
  const [locationCounts, setLocationCounts] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [casesRes, catsRes, levelsRes, locRes] = await Promise.all([
        getCases({ page: 0, pageSize: 50 }),
        getCategories(),
        getLevels(),
        getCasesByLocation(),
      ])
      setCases(casesRes.data)
      setTotalCount(casesRes.count)
      setCategories(catsRes)
      setLevels(levelsRes)
      setLocationCounts(locRes)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [search, filterCategory, filterLevel, sortBy, sortDir, page])

  async function fetchCases() {
    try {
      setLoading(true)
      const res = await getCases({
        search,
        category: filterCategory === 'All Categories' ? null : filterCategory,
        level: filterLevel === 'All Levels' ? null : filterLevel,
        sortBy,
        sortDir,
        page,
        pageSize: 50,
      })
      setCases(res.data)
      setTotalCount(res.count)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div>
          <div style={styles.badge}>⚖ VERISCOPE</div>
          <h1 style={styles.title}>Public Official <span style={{ color: '#c84b4b' }}>Misconduct</span> Database</h1>
          <p style={styles.subtitle}>Documented cases sourced from public court records, official filings, and verified government sources</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.stat}><span style={styles.statNum}>{totalCount}</span><span style={styles.statLabel}>Total Cases</span></div>
          <div style={styles.stat}><span style={styles.statNum}>{Object.keys(locationCounts).length}</span><span style={styles.statLabel}>Locations</span></div>
          <div style={styles.stat}><span style={styles.statNum}>{categories.length}</span><span style={styles.statLabel}>Categories</span></div>
        </div>
      </header>

      <nav style={styles.nav}>
        <div style={styles.tabs}>
          <button style={{...styles.tab, ...(view === 'database' ? styles.tabActive : {})}} onClick={() => setView('database')}>
            ⊞ Database
          </button>
          <button style={{...styles.tab, ...(view === 'heatmap' ? styles.tabActive : {})}} onClick={() => setView('heatmap')}>
            ◈ Heat Map
          </button>
        </div>
      </nav>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {view === 'database' && (
        <Database
          cases={cases}
          loading={loading}
          search={search}
          setSearch={setSearch}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          categories={categories}
          levels={levels}
        />
      )}

      {view === 'heatmap' && (
        <HeatMap locationCounts={locationCounts} />
      )}
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', background: '#080c12' },
  header: { background: 'linear-gradient(135deg, #0b1018, #101825 60%, #0c1520)', borderBottom: '2px solid #1a2535', padding: '26px 36px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' },
  badge: { display: 'inline-block', background: '#c41e1e18', border: '1px solid #c41e1e55', color: '#ff6b6b', fontSize: '0.58rem', letterSpacing: '0.18em', padding: '3px 10px', borderRadius: 2, marginBottom: 10, fontFamily: 'monospace', fontWeight: 700 },
  title: { margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.15, color: '#eef0f4', letterSpacing: '-0.02em' },
  subtitle: { margin: 0, fontSize: '0.76rem', color: '#4a5a6a', lineHeight: 1.5, maxWidth: 540, fontFamily: 'monospace' },
  headerStats: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  stat: { background: '#131c28', border: '1px solid #1a2535', borderRadius: 4, padding: '10px 14px', textAlign: 'center', minWidth: 80 },
  statNum: { display: 'block', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'monospace', color: '#c8d8f0' },
  statLabel: { display: 'block', fontSize: '0.58rem', color: '#445', letterSpacing: '0.1em', fontFamily: 'monospace', textTransform: 'uppercase', marginTop: 2 },
  nav: { background: '#0b1018', borderBottom: '1px solid #18222e', padding: '0 36px', display: 'flex' },
  tabs: { display: 'flex' },
  tab: { background: 'none', border: 'none', color: '#445', padding: '13px 16px', cursor: 'pointer', fontSize: '0.76rem', fontFamily: 'monospace', letterSpacing: '0.05em', borderBottom: '2px solid transparent' },
  tabActive: { color: '#c8d8f0', borderBottomColor: '#c84b4b' },
  errorBanner: { background: '#8b0000', color: '#fff', padding: '12px 36px', fontSize: '0.85rem', fontFamily: 'monospace' },
}

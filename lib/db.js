import { supabase } from './supabase'

const CASE_COLUMNS = `
  id, title, full_name, first_name, last_name,
  agency_or_office, level, specific_charges,
  summary, ai_summary, details, risk_score, tags,
  date, date_charged, date_resolved, last_verified,
  source_url, source_type, source_date, source_notes, location, category,
  publication_status, verified_by, verified_at,
  arrest_date, booking_number, booking_agency, arrest_source_url
`

export async function getCases(filters = {}) {
  const {
    search,
    category,
    level,
    sortBy = 'date',
    sortDir = 'desc',
    page = 0,
    pageSize = 50,
  } = filters

  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('cases')
    .select(CASE_COLUMNS, { count: 'exact' })
    .eq('publication_status', 'published')

  if (search && search.trim()) {
    const t = search.trim()
    query = query.or(
      `full_name.ilike.%${t}%,title.ilike.%${t}%,agency_or_office.ilike.%${t}%,specific_charges.ilike.%${t}%,location.ilike.%${t}%,details.ilike.%${t}%`
    )
  }

  if (category) query = query.eq('category', category)
  if (level) query = query.eq('level', level)

  query = query
    .order(sortBy, { ascending: sortDir === 'asc', nullsFirst: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('[db.getCases]', error.message)
    throw new Error(error.message)
  }

  return { data: data || [], count: count || 0, page, pageSize }
}

export async function getCaseById(id) {
  const { data, error } = await supabase
    .from('cases')
    .select(CASE_COLUMNS)
    .eq('id', id)
    .eq('publication_status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('[db.getCaseById]', error.message)
    throw new Error(error.message)
  }

  return data
}

export async function getCasesByLocation() {
  const { data, error } = await supabase
    .from('cases')
    .select('location')
    .eq('publication_status', 'published')

  if (error) {
    console.error('[db.getCasesByLocation]', error.message)
    throw new Error(error.message)
  }

  const counts = {}
  for (const row of data || []) {
    const key = (row.location || 'Unknown').trim()
    counts[key] = (counts[key] || 0) + 1
  }

  return counts
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('cases')
    .select('category')
    .eq('publication_status', 'published')

  if (error) {
    console.error('[db.getCategories]', error.message)
    throw new Error(error.message)
  }

  return [...new Set((data || []).map(r => r.category).filter(Boolean))].sort()
}

export async function getLevels() {
  const { data, error } = await supabase
    .from('cases')
    .select('level')
    .eq('publication_status', 'published')

  if (error) {
    console.error('[db.getLevels]', error.message)
    throw new Error(error.message)
  }

  return [...new Set((data || []).map(r => r.level).filter(Boolean))].sort()
}

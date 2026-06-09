import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import '../styles/Database.css';

export default function Database() {
  const [allCases, setAllCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [displayedCases, setDisplayedCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 100;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCaseStatus, setSelectedCaseStatus] = useState('');
  const [selectedOfficialType, setSelectedOfficialType] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  
  // Dynamic filter options
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [caseStatuses, setCaseStatuses] = useState([]);
  const [officialTypes, setOfficialTypes] = useState([]);
  const [positions, setPositions] = useState([]);

  // Extract city and county from case details
  const extractLocationInfo = (details) => {
    if (!details) return { city: null, county: null };
    
    let city = null;
    let county = null;
    
    const countyMatch = details.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+County/);
    if (countyMatch) {
      county = countyMatch[1];
    }
    
    const cityMatch = details.match(/\b(?:in|from)\s+([A-Z][a-z]+)(?:\s+(?:County|Parish))?[,\.]/);
    if (cityMatch) {
      city = cityMatch[1];
    }
    
    return { city, county };
  };

  // Fetch ALL cases on mount (no 1000 limit)
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .in('publication_status', ['draft', 'published'])
          .order('verified_at', { ascending: false })
          .range(0, 9999); // Fetch up to 10,000 cases
        
        if (error) throw error;
        
        // Enrich cases with extracted location info
        const enrichedCases = (data || []).map(c => {
          const locationInfo = extractLocationInfo(c.details);
          return {
            ...c,
            extracted_city: locationInfo.city,
            extracted_county: locationInfo.county,
          };
        });
        
        setAllCases(enrichedCases);
        buildFilterOptions(enrichedCases);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setLoading(false);
      }
    };
    
    fetchCases();
  }, []);

  // Build dynamic filter options from data
  const buildFilterOptions = (cases) => {
    const locationSet = new Set();
    const categorySet = new Set();
    const levelSet = new Set();
    const statusSet = new Set();
    const typeSet = new Set();
    const posSet = new Set();
    
    cases.forEach(c => {
      if (c.location && c.location !== 'Unknown') locationSet.add(c.location);
      if (c.category) categorySet.add(c.category);
      if (c.level) levelSet.add(c.level);
      if (c.case_status) statusSet.add(c.case_status);
      if (c.official_type) typeSet.add(c.official_type);
      if (c.position_title) posSet.add(c.position_title);
    });
    
    setLocations(Array.from(locationSet).sort());
    setCategories(Array.from(categorySet).sort());
    setLevels(Array.from(levelSet).sort());
    setCaseStatuses(Array.from(statusSet).sort());
    setOfficialTypes(Array.from(typeSet).sort());
    setPositions(Array.from(posSet).sort());
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...allCases];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        const fullName = (c.full_name || `${c.first_name || ''} ${c.last_name || ''}`.trim()).toLowerCase();
        const title = (c.title || '').toLowerCase();
        const location = (c.location || '').toLowerCase();
        const city = (c.extracted_city || '').toLowerCase();
        const county = (c.extracted_county || '').toLowerCase();
        
        return fullName.includes(term) || 
               title.includes(term) || 
               location.includes(term) ||
               city.includes(term) ||
               county.includes(term);
      });
    }
    
    if (selectedLocation) {
      filtered = filtered.filter(c => c.location === selectedLocation);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    
    if (selectedLevel) {
      filtered = filtered.filter(c => c.level === selectedLevel);
    }
    
    if (selectedCaseStatus) {
      filtered = filtered.filter(c => c.case_status === selectedCaseStatus);
    }
    
    if (selectedOfficialType) {
      filtered = filtered.filter(c => c.official_type === selectedOfficialType);
    }
    
    if (selectedPosition) {
      filtered = filtered.filter(c => c.position_title === selectedPosition);
    }
    
    setFilteredCases(filtered);
    setCurrentPage(1);
  }, [
    searchTerm, selectedLocation, selectedCategory, selectedLevel, 
    selectedCaseStatus, selectedOfficialType, selectedPosition, allCases
  ]);

  // Paginate filtered cases
  useEffect(() => {
    const startIdx = (currentPage - 1) * casesPerPage;
    const endIdx = startIdx + casesPerPage;
    setDisplayedCases(filteredCases.slice(startIdx, endIdx));
  }, [filteredCases, currentPage]);

  const getFullName = (caseData) => {
    if (caseData.full_name) return caseData.full_name;
    const first = caseData.first_name || '';
    const last = caseData.last_name || '';
    return `${first} ${last}`.trim() || 'Unknown';
  };

  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  if (loading) {
    return <div className="database-screen">Loading cases...</div>;
  }

  return (
    <div className="database-screen">
      <div className="filters-section">
        <h2>Search & Filter Cases</h2>
        
        <div className="filter-group">
          <label>Search by Name, Location, City, or County</label>
          <input
            type="text"
            placeholder="Search official name, state, city, county..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
        
        {locations.length > 0 && (
          <div className="filter-group">
            <label>State/Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="filter-select"
            >
              <option value="">— Locations —</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}
        
        <div className="other-filters">
          {categories.length > 0 && (
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">— Categories —</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          
          {levels.length > 0 && (
            <div className="filter-group">
              <label>Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="filter-select"
              >
                <option value="">— Levels —</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}
          
          {caseStatuses.length > 0 && (
            <div className="filter-group">
              <label>Case Status</label>
              <select
                value={selectedCaseStatus}
                onChange={(e) => setSelectedCaseStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">— Statuses —</option>
                {caseStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          
          {officialTypes.length > 0 && (
            <div className="filter-group">
              <label>Official Type</label>
              <select
                value={selectedOfficialType}
                onChange={(e) => setSelectedOfficialType(e.target.value)}
                className="filter-select"
              >
                <option value="">— Types —</option>
                {officialTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
          
          {positions.length > 0 && (
            <div className="filter-group">
              <label>Position Title</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="filter-select"
              >
                <option value="">— Positions —</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
        </div>
        
        <div className="filter-stats">
          Showing {displayedCases.length} of {filteredCases.length} cases (Total: {allCases.length})
        </div>
      </div>

      <div className="cases-grid">
        {displayedCases.map((c) => (
          <div
            key={c.id}
            className="case-card"
            onClick={() => setSelectedCase(c)}
          >
            <h3>{getFullName(c)}</h3>
            <p className="case-title">{c.title}</p>
            <div className="case-badges">
              {c.category && <span className="badge category">{c.category}</span>}
              {c.case_status && <span className="badge status">{c.case_status}</span>}
              {c.official_type && <span className="badge type">{c.official_type}</span>}
            </div>
            <p className="case-location">📍 {c.location || 'Unknown'}</p>
            {c.extracted_city && <p className="case-city">🏙️ {c.extracted_city}</p>}
            {c.extracted_county && <p className="case-county">📌 {c.extracted_county} County</p>}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            ← Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next →
          </button>
        </div>
      )}

      {selectedCase && (
        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCase(null)}>✕</button>
            <h2>{getFullName(selectedCase)}</h2>
            <p className="modal-title">{selectedCase.title}</p>
            
            <div className="case-details">
              <div className="detail-row">
                <strong>Position:</strong> {selectedCase.position_title || 'Unknown'}
              </div>
              <div className="detail-row">
                <strong>Official Type:</strong> {selectedCase.official_type || 'Unknown'}
              </div>
              <div className="detail-row">
                <strong>Location/State:</strong> {selectedCase.location || 'Unknown'}
              </div>
              {selectedCase.extracted_county && (
                <div className="detail-row">
                  <strong>County:</strong> {selectedCase.extracted_county}
                </div>
              )}
              {selectedCase.extracted_city && (
                <div className="detail-row">
                  <strong>City:</strong> {selectedCase.extracted_city}
                </div>
              )}
              <div className="detail-row">
                <strong>Case Status:</strong> {selectedCase.case_status || 'Unknown'}
              </div>
              <div className="detail-row">
                <strong>Category:</strong> {selectedCase.category || 'Unknown'}
              </div>
              <div className="detail-row">
                <strong>Abuse Type:</strong> {selectedCase.abuse_of_power_type || 'Unknown'}
              </div>
              <div className="detail-row">
                <strong>Date Charged:</strong> {selectedCase.date_charged || 'Unknown'}
              </div>
              {selectedCase.date_resolved && (
                <div className="detail-row">
                  <strong>Date Resolved:</strong> {selectedCase.date_resolved}
                </div>
              )}
              <div className="detail-row">
                <strong>Details:</strong>
              </div>
              <p className="case-details-text">
                {selectedCase.details || 'No details available'}
              </p>
              {selectedCase.source_url && (
                <div className="detail-row">
                  <strong>Source:</strong> 
                  <a href={selectedCase.source_url} target="_blank" rel="noopener noreferrer">
                    View Official Record →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import '../styles/Database.css';

export default function Database() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedOfficialType, setSelectedOfficialType] = useState('');
  const [selectedPositionTitle, setSelectedPositionTitle] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, selectedCategory, selectedLevel, selectedStatus, selectedTitle, selectedOfficialType, selectedPositionTitle]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('publication_status', 'published')
        .order('date_charged', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (selectedLevel) {
      filtered = filtered.filter(c => c.level === selectedLevel);
    }

    if (selectedStatus) {
      filtered = filtered.filter(c => c.case_status === selectedStatus);
    }

    if (selectedTitle) {
      filtered = filtered.filter(c => c.title === selectedTitle);
    }

    if (selectedOfficialType) {
      filtered = filtered.filter(c => c.official_type === selectedOfficialType);
    }

    if (selectedPositionTitle) {
      filtered = filtered.filter(c => c.position_title === selectedPositionTitle);
    }

    setFilteredCases(filtered);
  };

  const categories = [...new Set(cases.map(c => c.category).filter(Boolean))].sort();
  const levels = [...new Set(cases.map(c => c.level).filter(Boolean))].sort();
  const titles = [...new Set(cases.map(c => c.title).filter(Boolean))].sort();
  const officialTypes = [...new Set(cases.map(c => c.official_type).filter(Boolean))].sort();
  const positionTitles = [...new Set(cases.map(c => c.position_title).filter(Boolean))].sort();

  return (
    <div className="database">
      <div className="database-header">
        <h2>Case Database</h2>
        <p>{filteredCases.length} cases found</p>
      </div>

      <div className="database-filters">
        <input
          type="text"
          placeholder="Search by name, title, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="filter-select"
        >
          <option value="">All Levels</option>
          {levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Arrested / Detained">Arrested / Detained</option>
          <option value="Booked">Booked</option>
          <option value="Charges Filed">Charges Filed</option>
          <option value="Indicted">Indicted</option>
          <option value="Arraigned">Arraigned</option>
          <option value="Bail/Bond Set">Bail/Bond Set</option>
          <option value="Discovery">Discovery</option>
          <option value="Pre-Trial Motions">Pre-Trial Motions</option>
          <option value="Diversion / Deferred Adjudication">Diversion / Deferred Adjudication</option>
          <option value="Awaiting Trial">Awaiting Trial</option>
          <option value="Plea Bargain Reached">Plea Bargain Reached</option>
          <option value="Dismissed">Dismissed</option>
          <option value="Acquitted">Acquitted</option>
          <option value="Convicted">Convicted</option>
          <option value="Sentenced">Sentenced</option>
          <option value="Appealing">Appealing</option>
          <option value="Parole / Probation">Parole / Probation</option>
          <option value="Closed / Disposed">Closed / Disposed</option>
        </select>

        <select
          value={selectedOfficialType}
          onChange={(e) => setSelectedOfficialType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Official Types</option>
          {officialTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={selectedPositionTitle}
          onChange={(e) => setSelectedPositionTitle(e.target.value)}
          className="filter-select"
        >
          <option value="">All Position Titles</option>
          {positionTitles.map(title => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>

        <select
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className="filter-select"
        >
          <option value="">All Case Titles</option>
          {titles.map(title => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="loading">Loading cases...</p>
      ) : (
        <div className="cases-container">
          {filteredCases.length === 0 ? (
            <p className="no-data">No cases found</p>
          ) : (
            filteredCases.map(caseItem => (
              <div
                key={caseItem.id}
                className="case-card"
                onClick={() => setSelectedCase(caseItem)}
              >
                <h3>{caseItem.full_name}</h3>
                <p className="title">{caseItem.title}</p>
                {caseItem.position_title && (
                  <p className="position">Position: {caseItem.position_title}</p>
                )}
                <p className="location">📍 {caseItem.location}</p>
                <p className="date">Charged: {new Date(caseItem.date_charged).toLocaleDateString()}</p>
                <div className="card-badges">
                  <span className="category-badge">{caseItem.category}</span>
                  {caseItem.case_status && (
                    <span className="status-badge">{caseItem.case_status}</span>
                  )}
                  {caseItem.official_type && (
                    <span className="official-type-badge">{caseItem.official_type}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedCase && (
        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCase(null)}>✕</button>
            <h2>{selectedCase.full_name}</h2>
            {selectedCase.position_title && (
              <p><strong>Position:</strong> {selectedCase.position_title}</p>
            )}
            {selectedCase.official_type && (
              <p><strong>Official Type:</strong> {selectedCase.official_type}</p>
            )}
            <p><strong>Case Title:</strong> {selectedCase.title}</p>
            <p><strong>Agency:</strong> {selectedCase.agency_or_office}</p>
            <p><strong>Location:</strong> {selectedCase.location}</p>
            <p><strong>Charges:</strong> {selectedCase.specific_charges}</p>
            <p><strong>Category:</strong> {selectedCase.category}</p>
            <p><strong>Case Status:</strong> {selectedCase.case_status || 'N/A'}</p>
            <p><strong>Date Charged:</strong> {new Date(selectedCase.date_charged).toLocaleDateString()}</p>
            <p><strong>Details:</strong> {selectedCase.details}</p>
            <p><strong>Source:</strong> <a href={selectedCase.source_url} target="_blank" rel="noopener noreferrer">{selectedCase.source_url}</a></p>
          </div>
        </div>
      )}
    </div>
  );
}

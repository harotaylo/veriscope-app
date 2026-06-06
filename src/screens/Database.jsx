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
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, selectedCategory, selectedLevel]);

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

    setFilteredCases(filtered);
  };

  const categories = [...new Set(cases.map(c => c.category).filter(Boolean))];
  const levels = [...new Set(cases.map(c => c.level).filter(Boolean))];

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
                <p className="location">📍 {caseItem.location}</p>
                <p className="date">Charged: {new Date(caseItem.date_charged).toLocaleDateString()}</p>
                <span className="category-badge">{caseItem.category}</span>
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
            <p><strong>Position:</strong> {selectedCase.position}</p>
            <p><strong>Agency:</strong> {selectedCase.agency_or_office}</p>
            <p><strong>Location:</strong> {selectedCase.location}</p>
            <p><strong>Charges:</strong> {selectedCase.specific_charges}</p>
            <p><strong>Category:</strong> {selectedCase.category}</p>
            <p><strong>Details:</strong> {selectedCase.details}</p>
            <p><strong>Source:</strong> <a href={selectedCase.source_url} target="_blank" rel="noopener noreferrer">{selectedCase.source_url}</a></p>
          </div>
        </div>
      )}
    </div>
  );
}


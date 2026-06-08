import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';
import './Database.css';

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
          .range(0, 9999);
        
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
      filtered =

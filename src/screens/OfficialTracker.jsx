import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/OfficialTracker.css';

export default function OfficialTracker() {
  const [officials, setOfficials] = useState([]);
  const [csamCases, setCsamCases] = useState([]);
  const [stateProfile, setStateProfile] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trackers');
  const [selectedOfficialType, setSelectedOfficialType] = useState('Judge');
  const [selectedState, setSelectedState] = useState('SC');

  useEffect(() => {
    fetchData();
  }, [selectedOfficialType, selectedState]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: officialsData } = await supabase
        .from('official_summary')
        .select('*')
        .eq('official_type', selectedOfficialType);
      setOfficials(officialsData || []);

      const { data: csamData } = await supabase
        .rpc('get_csam_by_state', { state_code: selectedState });
      setCsamCases(csamData || []);

      const { data: profileData } = await supabase
        .from('state_profiles')
        .select('*')
        .eq('state', selectedState)
        .single();
      setStateProfile(profileData);

      const { data: rankingsData } = await supabase
        .from('official_rankings')
        .select('*')
        .eq('official_type', selectedOfficialType)
        .order('case_count', { ascending: false })
        .limit(10);
      setRankings(rankingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="official-tracker">
      <div className="tracker-header">
        <h1>🚨 Official Misconduct Tracker</h1>
        <p>Document when public officials abuse their power</p>
      </div>

      <div className="tracker-tabs">
        <button
          className={`tab ${activeTab === 'trackers' ? 'active' : ''}`}
          onClick={() => setActiveTab('trackers')}
        >
          Trackers
        </button>
        <button
          className={`tab ${activeTab === 'csam' ? 'active' : ''}`}
          onClick={() => setActiveTab('csam')}
        >
          🚨 CSAM Cases
        </button>
        <button
          className={`tab ${activeTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setActiveTab('rankings')}
        >
          Rankings
        </button>
        <button
          className={`tab ${activeTab === 'states' ? 'active' : ''}`}
          onClick={() => setActiveTab('states')}
        >
          State Profiles
        </button>
      </div>

      {activeTab === 'trackers' && (
        <div className="tracker-section">
          <div className="tracker-controls">
            <select
              value={selectedOfficialType}
              onChange={(e) => setSelectedOfficialType(e.target.value)}
              className="filter-select"
            >
              <option value="Judge">Judges</option>
              <option value="Politician">Politicians</option>
              <option value="Police">Police</option>
            </select>
          </div>

          {loading ? (
            <p className="loading">Loading officials...</p>
          ) : (
            <div className="officials-grid">
              {officials.length === 0 ? (
                <p className="no-data">No officials found</p>
              ) : (
                officials.map((official) => (
                  <div key={official.id} className="official-card">
                    <div className="official-header">
                      <h3>{official.full_name}</h3>
                      <span className={`status ${official.status?.toLowerCase()}`}>
                        {official.status}
                      </span>
                    </div>
                    <p className="position">{official.position}</p>
                    <p className="agency">{official.agency_or_office}</p>
                    <p className="state">📍 {official.state}</p>
                    
                    <div className="abuse-type">
                      <span className="badge">
                        {official.abuse_of_power_type}
                      </span>
                    </div>

                    <div className="case-breakdown">
                      <p className="total-cases">
                        <strong>{official.total_cases}</strong> Cases
                      </p>
                      {official.csam_cases > 0 && (
                        <p className="csam-badge">🚨 {official.csam_cases} CSAM</p>
                      )}
                    </div>

                    <p className="recent-date">
                      Latest: {official.most_recent_case ? new Date(official.most_recent_case).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'csam' && (
        <div className="tracker-section">
          <div className="tracker-controls">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="filter-select"
            >
              <option value="SC">South Carolina</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="NY">New York</option>
            </select>
            <span className="csam-warning">🚨 Child Sexual Abuse Material Cases</span>
          </div>

          {loading ? (
            <p className="loading">Loading CSAM cases...</p>
          ) : (
            <div className="csam-list">
              {csamCases.length === 0 ? (
                <p className="no-data">No CSAM cases in {selectedState}</p>
              ) : (
                csamCases.map((case_) => (
                  <div key={case_.id} className="csam-case-card">
                    <div className="csam-header">
                      <h4>{case_.full_name}</h4>
                      <span className="csam-badge">CSAM</span>
                    </div>
                    <p className="position">{case_.position}</p>
                    <p className="title">{case_.title}</p>
                    <p className="location">📍 {case_.location}</p>
                    <p className="date">Charged: {new Date(case_.date_charged).toLocaleDateString()}</p>
                    <a href={case_.source_url} target="_blank" rel="noopener noreferrer" className="source-link">
                      View Court Record →
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="tracker-section">
          <div className="tracker-controls">
            <select
              value={selectedOfficialType}
              onChange={(e) => setSelectedOfficialType(e.target.value)}
              className="filter-select"
            >
              <option value="Judge">Judges</option>
              <option value="Politician">Politicians</option>
              <option value="Police">Police</option>
            </select>
            <p className="ranking-subtitle">Top 10 {selectedOfficialType}s by Case Count</p>
          </div>

          {loading ? (
            <p className="loading">Loading rankings...</p>
          ) : (
            <div className="rankings-list">
              {rankings.length === 0 ? (
                <p className="no-data">No rankings available</p>
              ) : (
                rankings.map((official, idx) => (
                  <div key={official.id} className="ranking-row">
                    <span className="rank">#{idx + 1}</span>
                    <div className="ranking-info">
                      <h4>{official.full_name}</h4>
                      <p>{official.position}</p>
                    </div>
                    <span className="badge">
                      {official.abuse_of_power_type}
                    </span>
                    <span className="case-count">{official.case_count} cases</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'states' && (
        <div className="tracker-section">
          <div className="tracker-controls">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="filter-select"
            >
              <option value="SC">South Carolina</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="NY">New York</option>
            </select>
          </div>

          {loading ? (
            <p className="loading">Loading state profile...</p>
          ) : stateProfile ? (
            <div className="state-profile-card">
              <h2>{selectedState} State Profile</h2>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-value">{stateProfile.total_cases}</span>
                  <span className="stat-label">Total Cases</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{stateProfile.unique_officials}</span>
                  <span className="stat-label">Unique Officials</span>
                </div>
                <div className="stat csam">
                  <span className="stat-value">{stateProfile.csam_cases}</span>
                  <span className="stat-label">🚨 CSAM Cases</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{stateProfile.corruption_cases}</span>
                  <span className="stat-label">Corruption Cases</span>
                </div>
              </div>
              
              <div className="official-breakdown">
                <h3>By Official Type</h3>
                <div className="breakdown-stats">
                  <p>👨‍⚖️ Judges: {stateProfile.judge_cases}</p>
                  <p>🏛️ Politicians: {stateProfile.politician_cases}</p>
                  <p>👮 Police: {stateProfile.police_cases}</p>
                </div>
              </div>

              {stateProfile.most_recent && (
                <p className="most-recent">
                  Most Recent Case: {new Date(stateProfile.most_recent).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="no-data">No data for {selectedState}</p>
          )}
        </div>
      )}
    </div>
  );
}

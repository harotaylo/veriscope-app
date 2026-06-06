import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import '../styles/HeatMap.css';

export default function HeatMap() {
  const [locationStats, setLocationStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('location, state')
        .eq('publication_status', 'published');

      if (error) throw error;

      // Group by location
      const locationMap = {};
      data.forEach(c => {
        const key = c.location || 'Unknown';
        locationMap[key] = (locationMap[key] || 0) + 1;
      });

      const stats = Object.entries(locationMap)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count);

      setLocationStats(stats);
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="heatmap">
      <div className="heatmap-header">
        <h2>Case Density by Location</h2>
        <p>Total locations: {locationStats.length}</p>
      </div>

      {loading ? (
        <p className="loading">Loading heat map...</p>
      ) : (
        <div className="heatmap-container">
          {locationStats.length === 0 ? (
            <p className="no-data">No location data available</p>
          ) : (
            <div className="location-list">
              {locationStats.map((item, idx) => (
                <div key={idx} className="location-item">
                  <div className="location-name">{item.location}</div>
                  <div className="location-bar">
                    <div
                      className="location-fill"
                      style={{
                        width: `${(item.count / locationStats[0].count) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="location-count">{item.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

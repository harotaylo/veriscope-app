import { useState } from 'react';
import './App.css';
import Database from './screens/Database';
import HeatMap from './screens/HeatMap';
import OfficialTracker from './screens/OfficialTracker';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('database');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚨 VeriScope</h1>
        <p>Officials Abusing Their Power</p>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeScreen === 'database' ? 'active' : ''}`}
          onClick={() => setActiveScreen('database')}
        >
          Database
        </button>
        <button 
          className={`nav-btn ${activeScreen === 'heatmap' ? 'active' : ''}`}
          onClick={() => setActiveScreen('heatmap')}
        >
          Heat Map
        </button>
        <button 
          className={`nav-btn ${activeScreen === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveScreen('tracker')}
        >
          Official Tracker
        </button>
      </nav>

      <main className="app-content">
        {activeScreen === 'database' && <Database />}
        {activeScreen === 'heatmap' && <HeatMap />}
        {activeScreen === 'tracker' && <OfficialTracker />}
      </main>
    </div>
  );
}

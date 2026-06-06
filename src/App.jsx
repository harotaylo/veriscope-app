import { useState } from 'react';
import './App.css';
import OfficialTracker from './screens/OfficialTracker';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🚨 VeriScope</h1>
        <p>Officials Abusing Their Power</p>
      </header>

      <main className="app-content">
        <OfficialTracker />
      </main>
    </div>
  );
}

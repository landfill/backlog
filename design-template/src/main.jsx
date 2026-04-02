import './index.css';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import NeomorphismSynthApp from '../templates/NeomorphismSynthApp.jsx';
import TokyoReceiptApp from '../templates/TokyoReceiptApp.jsx';

const TEMPLATES = [
  { id: 'neo', name: 'Neomorphism Synth', Component: NeomorphismSynthApp },
  { id: 'tokyo', name: 'Tokyo Receipt', Component: TokyoReceiptApp },
];

function DesignTemplateViewer() {
  const [current, setCurrent] = useState('neo');
  const { Component } = TEMPLATES.find((t) => t.id === current);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          padding: '10px 16px',
          background: 'rgba(0,0,0,0.85)',
          color: '#eee',
          fontSize: '14px',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {TEMPLATES.map(({ id, name }) => (
          <button
            key={id}
            onClick={() => setCurrent(id)}
            style={{
              padding: '8px 14px',
              border: 'none',
              borderRadius: '6px',
              background: current === id ? '#3A82FF' : 'rgba(255,255,255,0.1)',
              color: current === id ? '#fff' : '#ccc',
              cursor: 'pointer',
              fontWeight: current === id ? 600 : 400,
            }}
          >
            {name}
          </button>
        ))}
      </header>
      <main style={{ paddingTop: '52px', minHeight: '100vh' }}>
        <Component />
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DesignTemplateViewer />
  </React.StrictMode>
);

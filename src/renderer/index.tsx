import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.href = 'https://gemini.google.com/app';
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '50px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#1a73e8', marginBottom: '20px' }}>Gemini AI Desktop</h1>

      <div style={{
        background: isOnline ? '#e8f5e8' : '#ffebee',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0', color: isOnline ? '#2e7d32' : '#c62828' }}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </p>
      </div>

      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Unable to load Gemini AI. This could be due to:
      </p>

      <ul style={{
        textAlign: 'left',
        display: 'inline-block',
        marginBottom: '30px',
        listStyle: 'none',
        padding: '0'
      }}>
        <li style={{ marginBottom: '10px' }}>• Network connectivity issues</li>
        <li style={{ marginBottom: '10px' }}>• Gemini AI service temporarily unavailable</li>
        <li style={{ marginBottom: '10px' }}>• Firewall or proxy restrictions</li>
      </ul>

      <div>
        <button
          onClick={handleRetry}
          style={{
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1557b0'}
          onMouseOut={(e) => e.currentTarget.style.background = '#1a73e8'}
        >
          Retry Connection
        </button>

        <button
          onClick={() => window.open('https://gemini.google.com/app', '_blank')}
          style={{
            background: 'transparent',
            color: '#1a73e8',
            border: '1px solid #1a73e8',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Open in Browser
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

import React, { useState, useEffect } from 'react';

interface HeaderStatsProps {
  darkMode?: boolean;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({ darkMode = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}年${mm}月${dd}日`;
  };

  const formatTime = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div 
      className="stats-container" 
      style={{ 
        padding: '8px 20px', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        minHeight: '44px', 
        background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
        borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.1)',
        position: 'relative',
        transition: 'all 0.3s ease',
        boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: darkMode ? 'rgba(42, 107, 124, 0.1)' : '#FFFFFF',
        borderRadius: '10px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.1)',
        fontFamily: "'Orbitron', sans-serif",
        boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(29, 78, 95, 0.06)'
      }}>
        <div style={{ 
          textAlign: 'center',
          fontSize: '13px', 
          fontWeight: 600, 
          color: darkMode ? '#5DA3B3' : '#1D4E5F',
          whiteSpace: 'nowrap'
        }}>
          {formatDate(time)}
        </div>
        <div style={{ 
          width: '1px', 
          height: '18px', 
          background: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.15)' 
        }} />
        <div style={{ 
          textAlign: 'center',
          fontSize: '17px', 
          fontWeight: 700, 
          color: darkMode ? '#E2E8F0' : '#1F2937',
          letterSpacing: '2px'
        }}>
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};

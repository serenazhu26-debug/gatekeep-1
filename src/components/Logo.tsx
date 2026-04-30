import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate('/')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
      }}
    >
      <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {/* T-Shirt Outline */}
          <path
            d="M20 35L35 20C35 20 42 28 50 28C58 28 65 20 65 20L80 35V50H70V85H30V50H20V35Z"
            stroke="black"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          
          {/* Gate Detail (Vertical bars inside the shirt body) */}
          <line x1="40" y1="50" x2="40" y2="85" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="50" y2="85" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="60" y1="50" x2="60" y2="85" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Gate Arch / Neck Detail */}
          <path
            d="M30 50C30 50 40 40 50 40C60 40 70 50 70 50"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '-0.02em',
          color: 'black',
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Gatekeep
      </span>
    </motion.div>
  );
};

export default Logo;

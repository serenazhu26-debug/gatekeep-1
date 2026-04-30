import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate('/')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        marginLeft: '-4px', // Shift slightly more to the left
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: 32,
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

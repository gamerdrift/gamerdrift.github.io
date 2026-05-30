import React from 'react';
import './NeonButton.css';

export default function NeonButton({ children, onClick, className = '' }) {
  return (
    <button className={`neon-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

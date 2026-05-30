// GlassCard.jsx
import React from 'react';
import './GlassCard.css';

export default function GlassCard({ children, style }) {
  return (
    <div className="glass-card" style={style}>
      {children}
    </div>
  );
}

import React from 'react';
import NavBar from '../../components/NavBar';

export default function ContactPage() {
  return (
    <div className="container flex flex-col items-center py-6">
      <NavBar />
      <div className="w-full max-w-xl cyber-card p-8 mt-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-6 neon">Contact GamerDrift</h1>
        <p className="text-text-secondary mb-4 text-lg">Have feedback, game suggestions, or business inquiries?</p>
        <p className="text-neon-blue font-semibold text-xl mb-6">support@gamerdrift.com</p>
        <p className="text-text-secondary text-sm">Our team will get back to you within 24 standard cyber-hours.</p>
      </div>
    </div>
  );
}

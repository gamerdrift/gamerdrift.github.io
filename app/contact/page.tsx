"use client";

import React, { useState, useEffect } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [logs, setLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const runTelemetrySimulation = async () => {
    setIsSubmitting(true);
    setLogs([]);
    
    const steps = [
      'Establishing secure VPN proxy node...',
      'Opening SSL certificate tunnel handshake...',
      'Analyzing local host telemetry packet payload...',
      'Packing message envelope under RSA-4096 stream...',
      'Uploading telemetry packets to GamerDrift server...',
      'Encrypted message delivered. Acknowledged: 0x900A_OK',
      'Closing neural uplink portal...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLogs((prev) => [...prev, `[SYS_LOG] ${steps[i]}`]);
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    runTelemetrySimulation();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setLogs([]);
    setSubmitted(false);
  };

  return (
    <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-cyber-grid flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Page Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-widest text-center neon-text">
          UPLINK TRANSCEIVER
        </h1>
        <p className="text-text-secondary text-sm md:text-base mb-8 text-center font-medium">
          Send encrypted feedback, bug logs, or inquiries directly to GamerDrift HQ.
        </p>

        {/* Contact Form Terminal Card */}
        <div className="w-full cyber-card p-6 md:p-8">
          {!submitted && !isSubmitting ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Drifter ID (Name) Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider font-mono text-neon-blue">
                  DRIFTER_ID (NAME)
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="HEX_DECK_USER"
                  className="w-full bg-[#150a21]/60 border border-neon-blue/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-300"
                />
              </div>

              {/* Uplink Node (Email) Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider font-mono text-neon-blue">
                  UPLINK_NODE (EMAIL)
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="netrunner@domain.com"
                  className="w-full bg-[#150a21]/60 border border-neon-blue/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-300"
                />
              </div>

              {/* Telemetry Message textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider font-mono text-neon-pink">
                  CORE_TELEMETRY (MESSAGE)
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your transmission contents here..."
                  className="w-full bg-[#150a21]/60 border border-neon-pink/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-neon-pink focus:shadow-[0_0_10px_rgba(255,0,255,0.3)] transition-all duration-300 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="neon-button w-full mt-4 py-3 text-sm font-bold tracking-wider"
              >
                BROADCAST UPLINK SIGNAL
              </button>
            </form>
          ) : (
            /* Submitting and Telemetry Console Display */
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-bold text-white tracking-widest font-mono border-b border-white/10 pb-2 flex justify-between items-center">
                <span>SIGNAL UPLINK TRANSMISSION</span>
                <span className="text-xs text-neon-blue animate-pulse">
                  {isSubmitting ? 'ONLINE' : 'COMPLETED'}
                </span>
              </h3>

              {/* Terminal Logs container */}
              <div className="w-full bg-black/80 rounded-lg p-5 border border-neon-pink/20 min-h-60 font-mono text-xs text-neon-blue flex flex-col gap-2.5 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="animate-fade-in">
                    {log}
                  </div>
                ))}
                {isSubmitting && (
                  <div className="flex items-center gap-1.5 text-neon-pink">
                    <span className="animate-ping w-2 h-2 rounded-full bg-neon-pink" />
                    <span>Transmitting package metadata...</span>
                  </div>
                )}
              </div>

              {/* Submit completed view */}
              {submitted && (
                <div className="flex flex-col items-center gap-4 text-center mt-2">
                  <div className="text-neon-blue text-4xl animate-bounce">⚡</div>
                  <h4 className="text-base font-bold text-white uppercase tracking-wider">UPLINK SYNCHRONIZED SECURELY</h4>
                  <p className="text-text-secondary text-xs font-mono max-w-md">
                    Transmission received at Support Sector HQ. We will trace this signal and respond within 24 standard cyber-hours.
                  </p>
                  <button
                    onClick={resetForm}
                    className="neon-button text-xs py-2 px-6 bg-neon-blue/20 border border-neon-blue/40 rounded mt-2"
                  >
                    SEND NEW TRANSMISSION
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

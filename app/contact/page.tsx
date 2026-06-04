"use client";

import React, { useState, useEffect } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [logs, setLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [signalStrength, setSignalStrength] = useState(94);

  useEffect(() => {
    const timer = setInterval(() => {
      setSignalStrength(prev => Math.max(80, Math.min(99, prev + Math.floor(Math.random() * 5) - 2)));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Append telemetry logs when user interacts
    if (logs.length < 3 && Math.random() < 0.3) {
      setLogs(prev => [...prev, `[SYS] Intercepted character stream packet in ${e.target.name.toUpperCase()}`]);
    }
  };

  const runTelemetrySimulation = async () => {
    setIsSubmitting(true);
    setLogs([
      '[SYS_INIT] Initializing comms dispatch requisition...',
      '[SECURE_SHIELD] Binding local drifter key signature...'
    ]);
    
    const steps = [
      'Establishing secure VPN proxy node: SUCCESS',
      'Opening SSL certificate tunnel handshake: 0x908A_TUNNEL',
      'RSA-4096 stream compression: COMPLETE',
      'Discharging payload to supply HQ coordinates...',
      'Secure packet acknowledgment received: 0x900A_OK',
      'Closing transmission deck uplink...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
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
    <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-black flex flex-col items-center justify-center font-mono text-xs text-slate-300">
      <div className="absolute inset-0 bg-tactical-grid opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-2xl flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8 w-full border-b border-[#00f0ff]/20 pb-4">
          <span className="text-[9px] text-[#ff9f00] tracking-[0.3em] block mb-1">HQ COMMUNICATION CHANNELS</span>
          <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">COMMS_DECK</h1>
          <p className="text-[10px] text-slate-500 uppercase mt-1 leading-relaxed max-w-md mx-auto">
            Dispatch encrypted telemetry, reports, or business requisitions directly to GamerDrift operations.
          </p>
        </div>

        {/* Transmission card */}
        <div className="w-full bg-[#0c0f16] hud-panel p-6 md:p-8">
          {!submitted && !isSubmitting ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Telemetry Status Bar */}
              <div className="bg-black/40 border border-slate-900 p-2.5 flex justify-between items-center text-[9px]">
                <span className="text-slate-500 uppercase">SIGNAL_STRENGTH</span>
                <span className="text-[#39ff14] font-bold">{signalStrength}% // SECURE</span>
              </div>

              {/* Drifter Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[#00f0ff] font-bold uppercase tracking-wider text-[9px]">DRIFTER_ID (NAME) *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Hex_Netrunner"
                  className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[#00f0ff] font-bold uppercase tracking-wider text-[9px]">UPLINK_NODE (EMAIL) *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="netrunner@domain.net"
                  className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-[#ff9f00] font-bold uppercase tracking-wider text-[9px]">CORE_TRANSMISSION (MESSAGE) *</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="INPUT ENCRYPTED MESSAGE TEXT DATA..."
                  className="bg-black/60 border border-slate-800 px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-[#ff9f00] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00f0ff] text-black font-extrabold py-3.5 uppercase tracking-widest text-xs hover:bg-[#00f0ff]/80 shadow-[0_0_10px_rgba(0,240,255,0.2)] mt-2"
              >
                BROADCAST_UPLINK_SIGNAL &gt;&gt;
              </button>

            </form>
          ) : (
            /* Submitting and Telemetry Console Display */
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-bold text-white tracking-widest font-mono border-b border-slate-900 pb-2 flex justify-between items-center">
                <span>SIGNAL UPLINK TRANSMISSION</span>
                <span className="text-[10px] text-[#00f0ff] animate-pulse">
                  {isSubmitting ? 'TRANSMITTING' : 'COMPLETED'}
                </span>
              </h3>

              {/* Terminal Logs container */}
              <div className="w-full bg-black/80 p-4 border border-slate-900 min-h-60 font-mono text-[10px] text-[#00f0ff] flex flex-col gap-2 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="animate-fade-in">
                    {log}
                  </div>
                ))}
                {isSubmitting && (
                  <div className="flex items-center gap-1.5 text-[#ff9f00]">
                    <span className="animate-pulse w-2 h-2 bg-[#ff9f00]" />
                    <span>TRANSMITTING DATA PACKETS IN SECTOR 4...</span>
                  </div>
                )}
              </div>

              {/* Submit completed view */}
              {submitted && (
                <div className="flex flex-col items-center gap-4 text-center mt-2 border-t border-slate-900 pt-4">
                  <div className="text-3xl animate-bounce">📡</div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">UPLINK SYNCHRONIZED SECURELY</h4>
                  <p className="text-slate-500 text-[10px] max-w-sm uppercase leading-relaxed">
                    MESSAGE PACKETS DELIVERED AT COMMAND DECK LOGISTICS. TRANSMISSION RECEIVED. SHIELD TUNNEL IS DISCONNECTED.
                  </p>
                  <button
                    onClick={resetForm}
                    className="border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 text-xs py-2 px-6 uppercase mt-2 font-bold tracking-wider"
                  >
                    DISPATCH NEW SIGNAL
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

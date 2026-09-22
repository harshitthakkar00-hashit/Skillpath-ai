import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function AIRobotGreeting() {
  const { user, isSpeaking, playGreeting, justLoggedIn, clearJustLoggedIn } = useApp()
  const [visible, setVisible] = useState(false)
  const [minimized, setMinimized] = useState(false)

  // Automatically display the robot when user logs in
  useEffect(() => {
    if (user && justLoggedIn) {
      setVisible(true)
      setMinimized(false)
    }
  }, [user, justLoggedIn])

  if (!user) return null

  const handleReplay = () => {
    playGreeting(user.name)
  }

  const handleClose = () => {
    setVisible(false)
    setMinimized(true)
    if (clearJustLoggedIn) clearJustLoggedIn()
  }

  return (
    <>
      {/* Floating Robot Mini-Companion (When minimized or always accessible in corner) */}
      {minimized && (
        <button
          className="robot-corner-badge"
          onClick={() => {
            setVisible(true)
            setMinimized(false)
            playGreeting(user.name)
          }}
          title="Click to talk to AI Robot Guide"
        >
          <div className="mini-robot-icon">
            <svg viewBox="0 0 64 64" width="28" height="28" fill="none">
              {/* Head */}
              <rect x="14" y="16" width="36" height="30" rx="10" fill="url(#miniGrad)" stroke="#38bdf8" strokeWidth="2" />
              {/* Antenna */}
              <line x1="32" y1="16" x2="32" y2="8" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="32" cy="7" r="3.5" fill={isSpeaking ? '#22d3ee' : '#38bdf8'} className={isSpeaking ? 'pulse-antenna' : ''} />
              {/* Eyes */}
              <circle cx="25" cy="28" r="3.5" fill="#38bdf8" />
              <circle cx="39" cy="28" r="3.5" fill="#38bdf8" />
              {/* Mouth */}
              <line x1="26" y1="38" x2="38" y2="38" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="miniGrad" x1="14" y1="16" x2="50" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="mini-robot-label">AI Guide</span>
          {isSpeaking && <span className="sound-wave-dot"></span>}
        </button>
      )}

      {/* Full Interactive Robot Welcome Dialog / Banner */}
      {visible && (
        <div className="robot-greeting-overlay">
          <div className="robot-modal-card">
            {/* Close / Minimize button */}
            <button className="robot-close-btn" onClick={handleClose} title="Dismiss">
              ✕
            </button>

            <div className="robot-presentation-row">
              {/* Animated Robot Character */}
              <div className="robot-figure-container">
                <div className={`robot-figure ${isSpeaking ? 'is-speaking' : ''}`}>
                  {/* Aura Glow behind robot */}
                  <div className="robot-halo-glow"></div>

                  <svg
                    viewBox="0 0 160 180"
                    width="140"
                    height="160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="robot-svg"
                  >
                    <defs>
                      <linearGradient id="robotBody" x1="30" y1="20" x2="130" y2="160" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="50%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#1e1b4b" />
                      </linearGradient>
                      <linearGradient id="visorGlass" x1="40" y1="40" x2="120" y2="90" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
                      </linearGradient>
                      <linearGradient id="glowBorder" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>

                    {/* Antenna */}
                    <line x1="80" y1="36" x2="80" y2="14" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="80" cy="12" r="7" fill="#38bdf8" className={isSpeaking ? 'antenna-bulb active' : 'antenna-bulb'} />
                    {isSpeaking && (
                      <>
                        <circle cx="80" cy="12" r="13" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" className="antenna-wave" />
                        <circle cx="80" cy="12" r="19" stroke="#38bdf8" strokeWidth="1" opacity="0.3" className="antenna-wave" />
                      </>
                    )}

                    {/* Ears / Side Audio Nodes */}
                    <rect x="22" y="52" width="10" height="24" rx="5" fill="#38bdf8" opacity="0.9" />
                    <rect x="128" y="52" width="10" height="24" rx="5" fill="#38bdf8" opacity="0.9" />

                    {/* Head Casement */}
                    <rect
                      x="28"
                      y="32"
                      width="104"
                      height="74"
                      rx="24"
                      fill="url(#robotBody)"
                      stroke="url(#glowBorder)"
                      strokeWidth="3"
                    />

                    {/* Visor Area */}
                    <rect
                      x="40"
                      y="46"
                      width="80"
                      height="46"
                      rx="14"
                      fill="url(#visorGlass)"
                      stroke="rgba(56, 189, 248, 0.4)"
                      strokeWidth="1.5"
                    />

                    {/* Expressive LED Eyes */}
                    <g className="robot-eyes">
                      {/* Left Eye */}
                      <ellipse cx="60" cy="64" rx="7" ry="8" fill="#38bdf8" className="robot-eye-left" />
                      <circle cx="58" cy="62" r="2.5" fill="#ffffff" />
                      {/* Right Eye */}
                      <ellipse cx="100" cy="64" rx="7" ry="8" fill="#38bdf8" className="robot-eye-right" />
                      <circle cx="98" cy="62" r="2.5" fill="#ffffff" />
                    </g>

                    {/* Speaking Animated Mouth / Audio Wave */}
                    {isSpeaking ? (
                      <g className="robot-voice-bars">
                        <line x1="66" y1="80" x2="66" y2="86" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" className="vbar v1" />
                        <line x1="73" y1="78" x2="73" y2="88" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="vbar v2" />
                        <line x1="80" y1="76" x2="80" y2="90" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="vbar v3" />
                        <line x1="87" y1="78" x2="87" y2="88" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="vbar v2" />
                        <line x1="94" y1="80" x2="94" y2="86" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" className="vbar v1" />
                      </g>
                    ) : (
                      /* Smiling mouth */
                      <path
                        d="M 68 82 Q 80 89 92 82"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}

                    {/* Neck Joint */}
                    <rect x="68" y="106" width="24" height="8" rx="3" fill="#334155" />

                    {/* Chest / Body */}
                    <path
                      d="M 46 114 L 114 114 L 126 158 C 126 164 120 170 112 170 L 48 170 C 40 170 34 164 34 158 Z"
                      fill="url(#robotBody)"
                      stroke="url(#glowBorder)"
                      strokeWidth="2.5"
                    />

                    {/* Chest Core AI Reactor */}
                    <circle cx="80" cy="142" r="13" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="80" cy="142" r="8" fill="#38bdf8" className={isSpeaking ? 'core-pulse' : ''} />
                    <circle cx="80" cy="142" r="3" fill="#ffffff" />
                  </svg>
                </div>
              </div>

              {/* Robot Speech Bubble & Content */}
              <div className="robot-speech-bubble">
                <div className="bubble-header">
                  <span className="bubble-tag">
                    <span className="live-dot"></span>
                    SkillPath AI Voice Companion
                  </span>
                  <span className="status-label">
                    {isSpeaking ? 'Speaking audio greeting...' : 'Greeting Ready'}
                  </span>
                </div>

                <h3 className="bubble-welcome-text">
                  “Welcome to SkillPath AI,{' '}
                  <span className="highlight-user-name">{user.name}</span>!”
                </h3>

                <p className="bubble-subtext">
                  I am your AI Computer Science & Career Tutor. I'll help you assess your current skills, build your personalized learning path, and prepare you for your dream tech career!
                </p>

                {/* Animated Equalizer Waveform */}
                <div className="audio-wave-row">
                  <div className={`wave-bar ${isSpeaking ? 'active' : ''}`}></div>
                  <div className={`wave-bar ${isSpeaking ? 'active' : ''}`}></div>
                  <div className={`wave-bar ${isSpeaking ? 'active' : ''}`}></div>
                  <div className={`wave-bar ${isSpeaking ? 'active' : ''}`}></div>
                  <div className={`wave-bar ${isSpeaking ? 'active' : ''}`}></div>
                  <span className="wave-text">
                    {isSpeaking ? 'AI Voice Speaking...' : 'Audio Voice Greeting'}
                  </span>
                </div>

                {/* Actions */}
                <div className="bubble-actions">
                  <button
                    className="bubble-btn bubble-btn-primary"
                    onClick={handleReplay}
                  >
                    🔊 {isSpeaking ? 'Replay Speech' : 'Play Voice Audio Again'}
                  </button>
                  <button
                    className="bubble-btn bubble-btn-ghost"
                    onClick={handleClose}
                  >
                    Start Learning 🚀
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Robot Styles */}
      <style>{`
        /* Floating Mini Robot Corner Button */
        .robot-corner-badge {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          border: 1.5px solid #38bdf8;
          border-radius: 999px;
          padding: 8px 16px 8px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #f8fafc;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.4);
          z-index: 1000;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .robot-corner-badge:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.7), 0 0 28px rgba(56, 189, 248, 0.6);
          border-color: #67e8f9;
        }

        .mini-robot-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .sound-wave-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 10px #22d3ee;
          animation: blinkDot 1s infinite alternate;
        }

        @keyframes blinkDot {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.3); }
        }

        /* Overlay & Modal Card */
        .robot-greeting-overlay {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          max-width: 680px;
          z-index: 1500;
          animation: slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDownFade {
          0% { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }

        .robot-modal-card {
          position: relative;
          background: linear-gradient(145deg, #090e24 0%, #0d163a 50%, #0a0e27 100%);
          border: 1.5px solid rgba(56, 189, 248, 0.45);
          border-radius: 24px;
          padding: 24px 28px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.25);
          backdrop-filter: blur(16px);
        }

        .robot-close-btn {
          position: absolute;
          top: 14px;
          right: 16px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #94a3b8;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .robot-close-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #ffffff;
        }

        .robot-presentation-row {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        /* Robot Character Body & Hover Physics */
        .robot-figure-container {
          position: relative;
          width: 140px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin: 0 auto;
        }

        .robot-figure {
          position: relative;
          animation: robotHover 3.2s infinite ease-in-out;
        }

        @keyframes robotHover {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(-1.5deg); }
        }

        .robot-figure.is-speaking {
          animation: robotSpeakingBob 0.6s infinite alternate ease-in-out;
        }

        @keyframes robotSpeakingBob {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-4px) scale(1.02); }
        }

        .robot-halo-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          top: 20px;
          left: 10px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(139, 92, 246, 0.25) 50%, transparent 75%);
          filter: blur(20px);
          border-radius: 50%;
          pointer-events: none;
        }

        .antenna-bulb.active {
          animation: bulbPulse 0.4s infinite alternate;
        }

        @keyframes bulbPulse {
          0% { fill: #38bdf8; filter: drop-shadow(0 0 4px #38bdf8); }
          100% { fill: #ffffff; filter: drop-shadow(0 0 14px #22d3ee); }
        }

        .antenna-wave {
          animation: expandWave 1.2s infinite ease-out;
        }

        @keyframes expandWave {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .core-pulse {
          animation: coreGlow 1s infinite alternate ease-in-out;
        }

        @keyframes coreGlow {
          0% { filter: drop-shadow(0 0 2px #38bdf8); }
          100% { filter: drop-shadow(0 0 12px #22d3ee); }
        }

        .vbar {
          animation: voiceBarBounce 0.4s infinite alternate ease-in-out;
          transform-origin: center;
        }
        .v1 { animation-delay: 0.1s; }
        .v2 { animation-delay: 0.2s; }
        .v3 { animation-delay: 0.3s; }

        @keyframes voiceBarBounce {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.3); }
        }

        /* Speech Bubble Side */
        .robot-speech-bubble {
          flex: 1;
          min-width: 280px;
        }

        .bubble-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .bubble-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 6px #22d3ee;
        }

        .status-label {
          font-size: 12px;
          color: #94a3b8;
        }

        .bubble-welcome-text {
          font-size: 21px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .highlight-user-name {
          background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }

        .bubble-subtext {
          font-size: 13.5px;
          color: #cbd5e1;
          line-height: 1.5;
          margin: 0 0 14px 0;
        }

        /* Audio Wave Equalizer */
        .audio-wave-row {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 8px 14px;
          margin-bottom: 16px;
        }

        .wave-bar {
          width: 4px;
          height: 14px;
          background: #334155;
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .wave-bar.active {
          background: linear-gradient(180deg, #38bdf8, #a855f7);
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
          animation: equalizerBounce 0.5s infinite alternate ease-in-out;
        }

        .wave-bar:nth-child(1) { animation-delay: 0.1s; }
        .wave-bar:nth-child(2) { animation-delay: 0.25s; }
        .wave-bar:nth-child(3) { animation-delay: 0.15s; }
        .wave-bar:nth-child(4) { animation-delay: 0.3s; }
        .wave-bar:nth-child(5) { animation-delay: 0.05s; }

        @keyframes equalizerBounce {
          0% { height: 6px; }
          100% { height: 22px; }
        }

        .wave-text {
          font-size: 12px;
          color: #94a3b8;
          margin-left: 6px;
        }

        /* Action Buttons */
        .bubble-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bubble-btn {
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bubble-btn-primary {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
        }

        .bubble-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(2, 132, 199, 0.5);
        }

        .bubble-btn-ghost {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
        }

        .bubble-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 600px) {
          .robot-greeting-overlay {
            width: 95%;
            top: 70px;
          }
          .robot-presentation-row {
            flex-direction: column;
            text-align: center;
          }
          .bubble-header, .bubble-actions, .audio-wave-row {
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}

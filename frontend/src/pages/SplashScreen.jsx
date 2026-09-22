import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import splashImage from '../assets/splash-screen.png'

export default function SplashScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(10)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    // Smooth progress animation over 2.6 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 4
      })
    }, 80)

    // Trigger transition to login
    const timeout = setTimeout(() => {
      setFadingOut(true)
      setTimeout(() => {
        navigate('/login')
      }, 350)
    }, 2700)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [navigate])

  const handleSkip = () => {
    setFadingOut(true)
    setTimeout(() => {
      navigate('/login')
    }, 200)
  }

  return (
    <div
      className={`splash-fullscreen-wrapper ${fadingOut ? 'fade-out' : ''}`}
      onClick={handleSkip}
      title="Click anywhere to enter"
    >
      {/* Ambient background glow elements */}
      <div className="ambient-glow cyan-glow" />
      <div className="ambient-glow blue-glow" />

      {/* Top action: Quick Skip */}
      <div className="splash-top-bar">
        <button
          className="splash-skip-btn"
          onClick={(e) => {
            e.stopPropagation()
            handleSkip()
          }}
        >
          Skip ➔
        </button>
      </div>

      {/* Seamless Hero Artwork Display (No phone frame / No mobile mockup) */}
      <div className="splash-content-center">
        <img
          src={splashImage}
          alt="SkillPath AI - Your Skills. Our AI. A Brighter Future."
          className="splash-graphic-image"
        />

        {/* High-Fidelity Glowing Progress Bar Overlay */}
        <div className="splash-progress-wrapper">
          <div className="splash-progress-track">
            <div
              className="splash-progress-bar"
              style={{ width: `${progress}%` }}
            >
              <div className="splash-progress-flare" />
            </div>
          </div>
          <div className="splash-status-text">
            <span>Loading SkillPath AI... {progress}%</span>
          </div>
        </div>
      </div>

      <style>{`
        .splash-fullscreen-wrapper {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at 50% 40%, #061539 0%, #030a21 55%, #01040d 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          z-index: 9999;
          transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .splash-fullscreen-wrapper.fade-out {
          opacity: 0;
          transform: scale(1.02);
        }

        /* Ambient glowing orbs in background matching graphic colors */
        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.45;
          animation: floatGlow 6s ease-in-out infinite alternate;
        }

        .cyan-glow {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(0, 229, 255, 0.25) 0%, rgba(0, 245, 160, 0.1) 50%, transparent 70%);
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .blue-glow {
          width: 650px;
          height: 650px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(99, 102, 241, 0.08) 60%, transparent 75%);
          top: 15%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes floatGlow {
          0% {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0.35;
          }
          100% {
            transform: translate(-50%, -48%) scale(1.08);
            opacity: 0.55;
          }
        }

        /* Top Bar */
        .splash-top-bar {
          position: absolute;
          top: 24px;
          right: 28px;
          z-index: 30;
        }

        .splash-skip-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: rgba(255, 255, 255, 0.85);
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .splash-skip-btn:hover {
          background: rgba(0, 229, 255, 0.2);
          border-color: rgba(0, 229, 255, 0.5);
          color: #ffffff;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.4);
          transform: translateY(-1px);
        }

        /* Center Content: Full web presentation without phone frame */
        .splash-content-center {
          position: relative;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .splash-graphic-image {
          height: 92vh;
          max-height: 960px;
          width: auto;
          max-width: 95vw;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 10px 40px rgba(0, 0, 0, 0.75));
          animation: subtleReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          user-select: none;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 98% 98% at 50% 50%, black 85%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 98% 98% at 50% 50%, black 85%, transparent 100%);
        }

        @keyframes subtleReveal {
          0% {
            opacity: 0;
            transform: scale(0.97) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Progress Bar & Status at bottom of screen */
        .splash-progress-wrapper {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 25;
          pointer-events: none;
        }

        .splash-progress-track {
          width: 220px;
          height: 6px;
          background: rgba(3, 15, 38, 0.7);
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: 999px;
          overflow: hidden;
          padding: 1px;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 229, 255, 0.15);
        }

        .splash-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00e5ff 0%, #3b82f6 50%, #00f5a0 100%);
          border-radius: 999px;
          position: relative;
          transition: width 0.08s linear;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
        }

        .splash-progress-flare {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 14px;
          background: #ffffff;
          border-radius: 50%;
          filter: blur(2px);
          opacity: 0.95;
        }

        .splash-status-text {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.65);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
          animation: pulseText 2s ease-in-out infinite;
        }

        @keyframes pulseText {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }

        /* Responsive on all screens */
        @media (max-width: 768px) {
          .splash-graphic-image {
            height: 88vh;
            max-width: 98vw;
          }
          .splash-progress-wrapper {
            bottom: 24px;
          }
          .splash-progress-track {
            width: 180px;
          }
          .splash-top-bar {
            top: 16px;
            right: 16px;
          }
        }
      `}</style>
    </div>
  )
}

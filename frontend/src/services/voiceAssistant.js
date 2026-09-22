// Voice Assistant Service using Web Audio API + SpeechSynthesis API

/**
 * Plays a futuristic soft chime using Web Audio API
 */
export function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now) // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15) // G5

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(659.25, now + 0.05) // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25) // C6

    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.05)
    osc1.stop(now + 0.6)
    osc2.stop(now + 0.6)
  } catch (err) {
    console.warn('Web Audio chime not supported:', err)
  }
}

/**
 * Speaks a welcome message using SpeechSynthesis
 * Example: "Welcome to SkillPath AI, Ronak Lakhtariya!"
 */
export function speakWelcome(userName, onStart, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.')
    return false
  }

  // Play a soft futuristic chime first
  playChime()

  // Clean previous speeches
  window.speechSynthesis.cancel()

  const safeName = (userName && userName.trim()) || 'Learner'
  const text = `Welcome to SkillPath AI, ${safeName}! Build skills. Shape your future.`

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.96
  utterance.pitch = 1.05
  utterance.volume = 1.0

  // Choose a smooth English voice if available
  const voices = window.speechSynthesis.getVoices()
  const preferredVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Zira') ||
        v.name.includes('David'))
  ) || voices.find((v) => v.lang.startsWith('en'))

  if (preferredVoice) {
    utterance.voice = preferredVoice
  }

  if (onStart) utterance.onstart = onStart
  if (onEnd) utterance.onend = onEnd
  utterance.onerror = (e) => {
    console.warn('Speech error:', e)
    if (onEnd) onEnd()
  }

  // Speak with slight delay after chime
  setTimeout(() => {
    window.speechSynthesis.speak(utterance)
  }, 250)

  return true
}

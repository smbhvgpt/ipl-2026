// Tiny WebAudio click using oscillator + envelope. No assets, no autoplay issues.
let ctx;
function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function playClick(enabled) {
  if (!enabled) return;
  const ac = ensureCtx(); if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(820, t);
  o.frequency.exponentialRampToValueAtTime(420, t + 0.08);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + 0.13);
}

export function playWhoosh(enabled) {
  if (!enabled) return;
  const ac = ensureCtx(); if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  const f = ac.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.6;
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(900, t + 0.25);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(f).connect(g).connect(ac.destination);
  o.start(t); o.stop(t + 0.34);
}

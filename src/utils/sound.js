let ctx = null;
let muted = false;

export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; return muted; }

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playTone(freq, duration, type = 'square', volume = 0.15) {
  if (muted) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

export function playFlap() {
  if (muted) return;
  const c = getCtx();
  const t = c.currentTime;
  const dur = 0.08;

  // Short noise burst — wing whoosh
  const bufferSize = c.sampleRate * dur;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const env = 1 - (i / bufferSize);
    data[i] = (Math.random() * 2 - 1) * env * env;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  // Bandpass filter — gives it a soft "fwip" character
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, t);
  filter.frequency.exponentialRampToValueAtTime(2000, t + dur * 0.3);
  filter.frequency.exponentialRampToValueAtTime(600, t + dur);
  filter.Q.value = 1.5;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start(t);
  source.stop(t + dur);
}

export function playScore() {
  playTone(660, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.1), 60);
}

export function playHit() {
  if (muted) return;
  playTone(120, 0.2, 'sawtooth', 0.15);
  playTone(80, 0.3, 'square', 0.1);
}

export function playSwoosh() {
  if (muted) return;
  const c = getCtx();
  const bufferSize = c.sampleRate * 0.1;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.08, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
  source.connect(gain);
  gain.connect(c.destination);
  source.start();
}

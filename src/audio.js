// ---------- audio (all synthesized) ----------
const AU = { ctx: null, muted: false, mode: 'title', layer: 0, step: 0, next: 0, combo: 0, song: 0, want: 0 };
let aMaster, aSfx, aMus, aDelay, aNoise;
function initAudio() {
  if (AU.ctx) { if (AU.ctx.state !== 'running') AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  try {
    const c = new AC(); AU.ctx = c;
    aMaster = c.createGain(); aMaster.gain.value = AU.muted ? 0 : 0.9;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 6;
    aMaster.connect(comp); comp.connect(c.destination);
    aSfx = c.createGain(); aSfx.gain.value = 0.6; aSfx.connect(aMaster);
    aMus = c.createGain(); aMus.gain.value = 0.55; aMus.connect(aMaster);
    aDelay = c.createDelay(1); aDelay.delayTime.value = 0.31;
    const fb = c.createGain(); fb.gain.value = 0.36; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    aDelay.connect(lp); lp.connect(fb); fb.connect(aDelay); lp.connect(aMus);
    const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; aNoise = b;
    c.resume(); AU.next = c.currentTime + 0.1; setInterval(musicTick, 50);
  } catch (e) { AU.ctx = null; }
}
function setMuted(m) { AU.muted = m; if (aMaster) aMaster.gain.value = m ? 0 : 0.9; }
function tone(f, d, o = {}) {
  const c = AU.ctx; if (!c) return;
  const t0 = c.currentTime + (o.t || 0), os = c.createOscillator(), gn = c.createGain();
  os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t0); if (o.f2) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + d);
  gn.gain.setValueAtTime(0.0001, t0); gn.gain.linearRampToValueAtTime(o.g || 0.2, t0 + (o.a || 0.006)); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  os.connect(gn); gn.connect(o.bus || aSfx); if (o.send) gn.connect(aDelay);
  os.start(t0); os.stop(t0 + d + 0.04);
}
function noiz(d, o = {}) {
  const c = AU.ctx; if (!c) return;
  const t0 = c.currentTime + (o.t || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), gn = c.createGain();
  s.buffer = aNoise; s.loop = true; f.type = o.type || 'lowpass'; f.frequency.setValueAtTime(o.fc || 1200, t0); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + d); f.Q.value = o.q || 0.8;
  gn.gain.setValueAtTime(0.0001, t0); gn.gain.linearRampToValueAtTime(o.g || 0.2, t0 + (o.a || 0.004)); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  s.connect(f); f.connect(gn); gn.connect(o.bus || aSfx); s.start(t0, Math.random() * 0.5); s.stop(t0 + d + 0.04);
}
const SFX_GAP = { coin: 0.05, chime: 0.3, ui: 0.05, shoot: 0.09, hit: 0.05, pop: 0.045, gem: 0.035, wake: 0.3, zap: 0.1, squish: 0.07, meow: 0.2, boom: 0.08 };
const sfxLast = {};
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
function sfx(n) {
  const c = AU.ctx; if (!c || c.state !== 'running') return;
  const now = c.currentTime; if (SFX_GAP[n] && now - (sfxLast[n] || 0) < SFX_GAP[n]) return; sfxLast[n] = now;
  switch (n) {
    case 'shoot': tone(900, 0.07, { type: 'triangle', f2: 480, g: 0.06 }); break;
    case 'hit': noiz(0.04, { g: 0.07, fc: 2600, type: 'bandpass' }); break;
    case 'pop': tone(rand(420, 620), 0.11, { type: 'square', f2: 130, g: 0.05 }); noiz(0.07, { g: 0.06, fc: 1400 }); break;
    case 'gem': { const k = PENTA[Math.min(PENTA.length - 1, AU.combo)]; const f = 880 * Math.pow(2, k / 12); tone(f, 0.13, { g: 0.07 }); tone(f * 2, 0.09, { g: 0.03, t: 0.03 }); break; }
    case 'level': [0, 4, 7, 12, 16].forEach((s, i) => tone(523 * Math.pow(2, s / 12), 0.3, { type: 'triangle', g: 0.13, t: i * 0.07, send: true })); break;
    case 'pick': tone(660, 0.16, { type: 'triangle', f2: 1320, g: 0.14 }); tone(1320, 0.2, { g: 0.07, t: 0.08, send: true }); break;
    case 'hurt': tone(190, 0.26, { type: 'sawtooth', f2: 55, g: 0.22 }); noiz(0.16, { fc: 600, g: 0.22 }); break;
    case 'wake': tone(1150, 0.06, { f2: 1500, g: 0.035 }); tone(1400, 0.06, { f2: 1100, g: 0.035, t: 0.07 }); tone(1250, 0.08, { f2: 1700, g: 0.03, t: 0.14 }); break;
    case 'thunder': noiz(0.12, { g: 0.26, fc: 3200, t: 0.22 }); noiz(1.8, { g: 0.4, fc: 380, f2: 50, t: 0.25 }); break;
    case 'boom': tone(150, 0.34, { f2: 38, g: 0.28 }); noiz(0.3, { fc: 1100, f2: 200, g: 0.2 }); for (let i = 0; i < 3; i++) tone(rand(1800, 3200), 0.1, { g: 0.025, t: 0.03 + i * 0.05 }); break;
    case 'zap': tone(2000, 0.14, { type: 'square', f2: 320, g: 0.045 }); noiz(0.1, { fc: 1500, g: 0.08 }); break;
    case 'squish': tone(280, 0.09, { f2: 620, g: 0.09 }); break;
    case 'meow': tone(720, 0.16, { type: 'triangle', f2: 1180, g: 0.05 }); break;
    case 'box': [0, 4, 7, 11, 14, 19].forEach((s, i) => tone(784 * Math.pow(2, s / 12), 0.22, { g: 0.09, t: i * 0.045, send: true })); break;
    case 'heal': tone(523, 0.2, { type: 'triangle', g: 0.12 }); tone(784, 0.3, { type: 'triangle', g: 0.12, t: 0.1, send: true }); break;
    case 'boss': tone(110, 1.6, { type: 'sawtooth', f2: 42, g: 0.3 }); tone(117, 1.6, { type: 'sawtooth', f2: 45, g: 0.25 }); noiz(1.2, { fc: 900, f2: 100, g: 0.25 }); break;
    case 'stomp': tone(95, 0.45, { f2: 28, g: 0.45 }); noiz(0.35, { fc: 500, f2: 80, g: 0.3 }); break;
    case 'scare': tone(880, 0.65, { type: 'sawtooth', f2: 1700, g: 0.22 }); tone(931, 0.65, { type: 'sawtooth', f2: 1790, g: 0.2 }); noiz(0.6, { fc: 3500, type: 'highpass', g: 0.2 }); break;
    case 'win': [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => { tone(523 * Math.pow(2, s / 12), 1.2, { type: 'triangle', g: 0.14, t: i * 0.11, send: true }); }); break;
    case 'dark': tone(70, 1.8, { type: 'sawtooth', f2: 40, g: 0.18 }); break;
    case 'coin': tone(1568, 0.07, { type: 'square', g: 0.03 }); tone(2093, 0.12, { type: 'square', g: 0.03, t: 0.05 }); break;
    case 'chime': [0, 7, 12, 19].forEach((s, i) => tone(659 * Math.pow(2, s / 12), 0.5, { g: 0.07, t: i * 0.05, send: true })); break;
    case 'ui': tone(880, 0.06, { type: 'triangle', g: 0.08 }); break;
    case 'buy': [0, 5, 12].forEach((s, i) => tone(784 * Math.pow(2, s / 12), 0.2, { type: 'triangle', g: 0.11, t: i * 0.06, send: true })); break;
    case 'nope': tone(180, 0.14, { type: 'square', f2: 120, g: 0.07 }); break;
    case 'bossdie': noiz(0.9, { fc: 5000, f2: 300, g: 0.35 }); tone(300, 0.9, { type: 'square', f2: 30, g: 0.2 }); for (let i = 0; i < 8; i++) tone(rand(1500, 4000), 0.12, { g: 0.04, t: i * 0.06 }); break;
  }
}
// music: three creepy toy songs. layers build with the night, songs rotate during a run
const SONGS = [
  { // 0: music box in A minor
    spb: 8, bpm: [84, 92, 100, 108, 124], voice: 'box',
    mel: [76, 0, 72, 76, 81, 0, 76, 0, 84, 0, 83, 81, 76, 0, 0, 0, 77, 0, 72, 77, 81, 0, 77, 0, 84, 0, 81, 77, 72, 0, 0, 0,
      74, 0, 69, 74, 77, 0, 74, 0, 81, 0, 77, 74, 77, 0, 76, 0, 76, 0, 71, 76, 80, 0, 76, 0, 83, 0, 80, 76, 80, 0, 0, 0],
    ch: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [53, 57, 60], [50, 53, 57], [50, 53, 57], [52, 56, 59], [52, 56, 59]] },
  { // 1: broken carousel waltz in D minor (3/4)
    spb: 6, bpm: [132, 140, 150, 160, 180], voice: 'organ',
    mel: [81, 0, 77, 0, 74, 0, 77, 0, 81, 0, 86, 0, 82, 0, 79, 0, 74, 0, 79, 0, 82, 0, 79, 77, 85, 0, 81, 0, 76, 0, 81, 0, 85, 0, 88, 0, 86, 0, 81, 0, 77, 0, 76, 0, 73, 0, 69, 0,
      81, 82, 81, 0, 77, 0, 74, 0, 77, 0, 81, 0, 79, 81, 79, 0, 74, 0, 70, 0, 74, 0, 79, 0, 76, 0, 73, 0, 76, 0, 81, 0, 79, 0, 76, 0, 74, 0, 0, 0, 77, 0, 74, 0, 0, 0, 0, 0],
    ch: [[50, 53, 57], [50, 53, 57], [55, 58, 62], [55, 58, 62], [45, 49, 52], [45, 49, 52], [50, 53, 57], [45, 49, 52], [50, 53, 57], [50, 53, 57], [55, 58, 62], [55, 58, 62], [45, 49, 52], [45, 49, 52], [50, 53, 57], [50, 53, 57]] },
  { // 2: detuned lullaby in E minor
    spb: 8, bpm: [72, 80, 88, 98, 112], voice: 'lull',
    mel: [83, 0, 0, 79, 76, 0, 79, 0, 84, 0, 0, 79, 76, 0, 72, 0, 81, 0, 0, 76, 72, 0, 76, 0, 78, 0, 75, 0, 71, 0, 0, 0,
      83, 0, 0, 79, 88, 0, 86, 0, 84, 0, 0, 79, 76, 0, 79, 0, 81, 0, 84, 0, 83, 0, 81, 0, 78, 0, 75, 0, 76, 0, 0, 0],
    ch: [[52, 55, 59], [48, 52, 55], [45, 48, 52], [47, 51, 54], [52, 55, 59], [48, 52, 55], [45, 48, 52], [47, 51, 54]] },
];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function lead(v, f, t, L) {
  if (v === 'organ') { tone(f, 0.34, { type: 'triangle', g: 0.085, bus: aMus, send: true, t, a: 0.02 }); tone(f * 2.004, 0.3, { type: 'square', g: 0.012, bus: aMus, t, a: 0.02 }); tone(f * 0.5, 0.3, { g: 0.03, bus: aMus, t }); }
  else if (v === 'lull') { tone(f, 1.5, { g: 0.085, bus: aMus, send: true, t }); tone(f * 1.011, 1.5, { g: 0.05, bus: aMus, t }); tone(f * 3, 0.2, { g: 0.012, bus: aMus, t }); }
  else { tone(f, 0.9, { g: 0.1, bus: aMus, send: true, t }); tone(f * 4, 0.18, { g: 0.013, bus: aMus, t }); }
}
function musicTick() {
  const c = AU.ctx; if (!c || c.state !== 'running') return;
  if (AU.next < c.currentTime - 0.5) AU.next = c.currentTime + 0.05;
  const mode = AU.mode; if (mode === 'off') { AU.next = c.currentTime + 0.1; return; }
  while (AU.next < c.currentTime + 0.2) {
    let S = SONGS[AU.song]; if (AU.step % (S.spb * S.ch.length) === 0 && AU.want !== AU.song) { AU.song = AU.want; AU.step = 0; S = SONGS[AU.song]; }
    const L = mode === 'title' ? 0 : AU.layer, sd = 30 / S.bpm[mode === 'title' ? 0 : L + 1], w = S.spb === 6;
    const s = AU.step % (S.spb * S.ch.length), bar = (s / S.spb) | 0, b = s % S.spb, t = AU.next - c.currentTime, ch = S.ch[bar];
    const m = S.mel[s]; if (m) lead(S.voice, mtof(m + (L === 3 && AU.song === 0 ? -1 * (bar % 2) : 0)), t, L);
    if (w) { if (b === 2 || b === 4) { tone(mtof(ch[1] + 12), 0.22, { g: 0.03, bus: aMus, t, type: 'triangle' }); tone(mtof(ch[2] + 12), 0.22, { g: 0.03, bus: aMus, t, type: 'triangle' }); } if (b === 0) tone(mtof(ch[0]), 0.4, { type: 'triangle', g: L >= 1 ? 0.2 : 0.1, bus: aMus, t }); }
    else { if (b % 2 === 1) tone(mtof(ch[(b >> 1) % 3] + 12), 0.5, { g: 0.035, bus: aMus, send: true, t }); if (L >= 1 && (b === 0 || b === 4 || (L >= 2 && b === 3))) tone(mtof(ch[0] - 12), 0.42, { type: 'triangle', g: 0.2, bus: aMus, t }); }
    if (L >= 2) {
      const kick = w ? b === 0 || (L === 3 && b === 3) : b === 0 || b === 4 || (L === 3 && b === 6), sn = w ? b === 2 || b === 4 : b === 2 || b === 6;
      if (kick) tone(125, 0.17, { f2: 40, g: 0.34, bus: aMus, t }); if (sn) noiz(0.09, { g: w ? 0.045 : 0.07, fc: 1900, type: 'bandpass', bus: aMus, t }); noiz(0.03, { g: b % 2 ? 0.035 : 0.018, fc: 7500, type: 'highpass', bus: aMus, t });
    }
    if (L === 3 && b === 0) { tone(mtof(ch[0] - 24), sd * S.spb, { type: 'sawtooth', g: 0.07, bus: aMus, t, a: 0.2 }); tone(mtof(ch[0] - 24) * 1.5, sd * S.spb, { type: 'sawtooth', g: 0.03, bus: aMus, t, a: 0.2 }); }
    AU.next += sd; AU.step++;
  }
}

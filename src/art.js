'use strict';
// ---------- utils ----------
const TAU = Math.PI * 2;
const rand = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;

const INK = '#1a0f33', INK2 = '#2b1b4d';
const C = { pink: '#ff8fd0', hot: '#ff4fa3', mint: '#8ff5d8', lilac: '#c9a7ff', butter: '#ffe58a', blue: '#9fd4ff', white: '#fff6fb', red: '#ff5577' };
const FONT_UI = '"Fredoka", ui-rounded, "Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif';
const SS = 2;

function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function sprite(w, h, ax, ay, draw, ss = SS) {
  const c = mk(w * ss, h * ss), g = c.getContext('2d');
  g.scale(ss, ss); g.translate(ax, ay); g.lineJoin = 'round'; g.lineCap = 'round'; draw(g);
  return { c, w, h, ax, ay };
}
function flipS(s) { const c = mk(s.c.width, s.c.height), g = c.getContext('2d'); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(s.c, 0, 0); return { c, w: s.w, h: s.h, ax: s.w - s.ax, ay: s.ay }; }
function whiteS(s, col = '#fff') { const c = mk(s.c.width, s.c.height), g = c.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return { c, w: s.w, h: s.h, ax: s.ax, ay: s.ay }; }
function ds(g, s, x, y, sx = 1, sy = sx) { g.drawImage(s.c, x - s.ax * sx, y - s.ay * sy, s.w * sx, s.h * sy); }

// ---------- shape helpers ----------
function fs(g, fill, lw = 2.2, stroke = INK) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); } }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); }
function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function limb(g, x1, y1, x2, y2, w, col) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineWidth = w + 4; g.strokeStyle = INK; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
function star(g, x, y, r, r2, n = 5, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rad = i % 2 ? r2 : r; g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } g.closePath(); }
function heart(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * 0.9); g.bezierCurveTo(x - s * 1.5, y - s * 0.2, x - s * 0.7, y - s * 1.2, x, y - s * 0.35); g.bezierCurveTo(x + s * 0.7, y - s * 1.2, x + s * 1.5, y - s * 0.2, x, y + s * 0.9); g.closePath(); }
function moon(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0.35 * Math.PI, 1.65 * Math.PI); g.arc(x + r * 0.55, y, r * 0.78, 1.42 * Math.PI, 0.58 * Math.PI, true); g.closePath(); }

// ---------- dolls ----------
function drawEyes(g, o, hy, closed) {
  for (const s of [-1, 1]) {
    const ex = s * 6.6, ey = hy + 2.5;
    let kind = o.eyes;
    if (kind === 'mismatch') kind = s < 0 ? 'button' : 'x';
    if (kind === 'boss') kind = s < 0 ? 'glossy' : 'hollow';
    if (closed) {
      g.beginPath(); g.arc(ex, ey - 1.5, 3.8, 0.12 * Math.PI, 0.88 * Math.PI); g.lineWidth = 1.9; g.strokeStyle = INK; g.stroke();
      continue;
    }
    if (kind === 'button') {
      circ(g, ex, ey, 4.7); fs(g, o.iris || '#4b3a86', 1.8);
      g.fillStyle = INK; for (const [dx, dy] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) { circ(g, ex + dx, ey + dy, 0.85); g.fill(); }
    } else if (kind === 'x') {
      g.beginPath(); g.moveTo(ex - 3.4, ey - 3.4); g.lineTo(ex + 3.4, ey + 3.4); g.moveTo(ex + 3.4, ey - 3.4); g.lineTo(ex - 3.4, ey + 3.4); g.lineWidth = 2.3; g.strokeStyle = INK; g.stroke();
    } else if (kind === 'hollow') {
      ell(g, ex, ey, 4.3, 5.3); fs(g, '#0b0618', 1.4); circ(g, ex, ey + 0.5, 1.6); g.fillStyle = o.iris || C.hot; g.fill();
    } else {
      ell(g, ex, ey, 4.9, 5.9); fs(g, '#150a2a', 1.6);
      ell(g, ex, ey + 1, 3.5, 4.3); g.fillStyle = o.iris || C.blue; g.fill();
      circ(g, ex, ey + 1.2, 1.9); g.fillStyle = '#150a2a'; g.fill();
      g.fillStyle = '#fff'; circ(g, ex - 1.7, ey - 2, 1.6); g.fill(); circ(g, ex + 1.6, ey + 2.6, 0.8); g.fill();
    }
  }
}
function drawMouth(g, o, hy) {
  const my = hy + 9.6;
  g.lineWidth = 1.5; g.strokeStyle = INK;
  if (o.mouth === 'stitch') {
    g.beginPath(); g.moveTo(-5.5, my - 0.8); g.quadraticCurveTo(0, my + 2.8, 5.5, my - 0.8); g.stroke();
    for (let i = -1; i <= 1; i++) { const yy = my + (i ? 0 : 1.2); g.beginPath(); g.moveTo(i * 3.3, yy - 1.6); g.lineTo(i * 3.3, yy + 1.8); g.stroke(); }
  } else if (o.mouth === 'o') { ell(g, 0, my, 1.8, 2.2); fs(g, '#7a2a5c', 1.2); }
  else { g.beginPath(); g.moveTo(-3, my - 0.3); g.quadraticCurveTo(0, my + 2.6, 3, my - 0.3); g.lineWidth = 1.7; g.stroke(); }
}
function drawDoll(g, o, p = {}) {
  const sit = p.sit, hy = -44;
  g.save();
  if (sit) { for (const s of [-1, 1]) { rr(g, s * 7 - 4.5, -8, 9, 9, 4); fs(g, o.shoe); } g.translate(0, 9); }
  else {
    for (const s of [-1, 1]) {
      const up = p.step === s ? -3.5 : 0;
      rr(g, s * 5.5 - 3.2, -13 + up, 6.4, 11, 3); fs(g, o.leg || o.skin);
      if (o.stripes) { g.fillStyle = o.stripes; g.fillRect(s * 5.5 - 2.4, -10 + up, 4.8, 1.8); g.fillRect(s * 5.5 - 2.4, -6.4 + up, 4.8, 1.8); }
      if (o.platform) { rr(g, s * 5.5 - 5.4, -7 + up, 10.8, 9, 3); fs(g, o.shoe); g.fillStyle = C.hot; g.fillRect(s * 5.5 - 4.4, -1.2 + up, 8.8, 2); }
      else { rr(g, s * 5.5 - 5, -4.5 + up, 10, 6.5, 3); fs(g, o.shoe); }
    }
  }
  // back hair
  if (o.hairStyle === 'ringlets') { ell(g, 0, hy + 5, 20.5, 19); fs(g, o.hair); for (const s of [-1, 1]) { circ(g, s * 17, hy + 16, 5.4); fs(g, o.hair); } }
  if (o.hairStyle === 'pigtails') for (const s of [-1, 1]) { circ(g, s * 19.5, hy + 3, 8.5); fs(g, o.hair); circ(g, s * 22, hy + 13, 5); fs(g, o.hair); }
  if (o.hairStyle === 'bun') { circ(g, 0, hy - 17, 7.6); fs(g, o.hair); }
  if (o.hairStyle === 'buns') { rr(g, -18, hy - 8, 36, 33, 13); fs(g, o.hair); for (const s of [-1, 1]) { circ(g, s * 13.5, hy - 15, 7.8); fs(g, o.hair); } }
  if (o.key) {
    g.beginPath(); g.moveTo(-7, -23); g.lineTo(-16, -23); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = C.butter; g.stroke();
    ell(g, -21, -23, 4.2, 7); fs(g, C.butter, 2); ell(g, -21, -23, 1.4, 3.2); g.fillStyle = INK; g.fill();
  }
  // arms
  const sh = -29;
  for (const s of [-1, 1]) {
    const hx = p.arms === 'out' ? s * 20 : s * 12.5, hY = p.arms === 'out' ? sh - 4 : sh + 13;
    limb(g, s * 7.5, sh, hx, hY, 5, o.sleeve || o.skin);
    circ(g, hx, hY, 3.1); fs(g, o.skin, 1.6);
  }
  // body
  if (o.body === 'leotard') {
    rr(g, -6.5, -33, 13, 19, 5); fs(g, o.dress);
    ell(g, 0, -15, 18.5, 6.5); fs(g, o.dress2, 2);
    ell(g, 0, -16.5, 12, 3.6); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill();
  } else {
    g.beginPath(); g.moveTo(-8, -33); g.lineTo(8, -33); g.lineTo(16, -11);
    for (let i = 0; i < 4; i++) { const x0 = 16 - i * 8; g.quadraticCurveTo(x0 - 4, -4, x0 - 8, -11); }
    g.closePath(); fs(g, o.dress);
    g.save(); g.clip();
    if (o.dress2) { g.fillStyle = o.dress2; g.fillRect(-20, -17.5, 40, 3.6); if (o.apron) { rr(g, -5, -31, 10, 13, 3); g.fill(); } }
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(-20, -34, 13, 30);
    g.restore();
    if (o.patch) { g.save(); g.translate(7, -22); g.rotate(0.2); g.fillStyle = o.patch; g.fillRect(-3.5, -3.5, 7, 7); g.lineWidth = 1; g.strokeStyle = INK; g.setLineDash([1.6, 1.6]); g.strokeRect(-3.5, -3.5, 7, 7); g.restore(); }
    if (o.heart) { heart(g, 0, -24, 3.6); fs(g, o.heart, 1.2); }
    if (o.collar) { ell(g, 0, -32, 8.5, 3.3); fs(g, o.collar, 1.6); }
    if (o.choker) { g.beginPath(); g.moveTo(-6, -31.5); g.lineTo(6, -31.5); g.lineWidth = 3; g.strokeStyle = '#0b0618'; g.stroke(); circ(g, 0, -30, 1.7); g.fillStyle = C.hot; g.fill(); }
  }
  // head
  ell(g, 0, hy, 16.5, 15.5); fs(g, o.skin);
  if (o.blush) { g.globalAlpha = 0.5; g.fillStyle = o.blush; for (const s of [-1, 1]) { ell(g, s * 11, hy + 7.6, 3.4, 2.2); g.fill(); } g.globalAlpha = 1; }
  g.beginPath(); g.arc(0, hy, 17, Math.PI, TAU);
  if (o.bangs === 'blunt') { g.lineTo(15.5, hy - 4.5); g.lineTo(-15.5, hy - 4.5); }
  else { g.quadraticCurveTo(12, hy - 2, 7, hy - 7.5); g.quadraticCurveTo(1, hy - 2, -5, hy - 7.5); g.quadraticCurveTo(-10, hy - 2, -17, hy); }
  g.closePath(); fs(g, o.hair);
  if (o.streak) { g.save(); g.beginPath(); g.arc(0, hy, 16, Math.PI * 1.56, Math.PI * 1.72); g.lineTo(8.5, hy - 5); g.lineTo(3.5, hy - 5); g.closePath(); g.fillStyle = o.streak; g.fill(); g.restore(); }
  g.beginPath(); g.arc(0, hy, 12.5, Math.PI * 1.18, Math.PI * 1.46); g.lineWidth = 2.2; g.strokeStyle = 'rgba(255,255,255,.5)'; g.stroke();
  drawEyes(g, o, hy, p.closed); drawMouth(g, o, hy);
  if (o.crack) { g.beginPath(); g.moveTo(10, hy - 14); g.lineTo(6.5, hy - 9); g.lineTo(10.5, hy - 5.5); g.lineTo(8, hy - 1); g.moveTo(10.5, hy - 5.5); g.lineTo(14, hy - 3.5); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke(); }
  if (o.bow) {
    g.save(); g.translate(o.bowX === undefined ? 10 : o.bowX, hy - 14.5); g.rotate(o.bowX === 0 ? 0 : 0.35);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(-9, -6); g.lineTo(-9, 6); g.closePath(); g.moveTo(0, 0); g.lineTo(9, -6); g.lineTo(9, 6); g.closePath(); fs(g, o.bow, 1.8);
    circ(g, 0, 0, 2.8); fs(g, o.bow, 1.6); g.restore();
  }
  if (o.ears) for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(s * 4.5, hy - 15); g.lineTo(s * 10.5, hy - 27); g.lineTo(s * 15, hy - 11.5); g.closePath(); fs(g, '#17102b', 2);
    g.beginPath(); g.moveTo(s * 8, hy - 15.5); g.lineTo(s * 10.6, hy - 22); g.lineTo(s * 12.6, hy - 14); g.closePath(); g.fillStyle = C.hot; g.fill();
  }
  if (o.crown) {
    g.beginPath(); g.moveTo(-10, hy - 13); g.lineTo(-12, hy - 25); g.lineTo(-5.5, hy - 19); g.lineTo(0, hy - 28); g.lineTo(5.5, hy - 19); g.lineTo(12, hy - 25); g.lineTo(10, hy - 13); g.closePath(); fs(g, C.butter, 1.8);
    circ(g, 0, hy - 17.5, 1.8); g.fillStyle = C.hot; g.fill();
  }
  g.restore();
}
function drawMat(g, col, col2) {
  g.beginPath(); g.moveTo(-20, -6); g.bezierCurveTo(-27, -28, -17, -35, -13, -42); g.bezierCurveTo(-19, -63, 19, -63, 13, -42); g.bezierCurveTo(17, -35, 27, -28, 20, -6); g.quadraticCurveTo(0, 2.5, -20, -6); g.closePath(); fs(g, col, 2.4);
  g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-30, -70, 18, 80); g.fillStyle = col2; g.fillRect(-30, -9, 60, 4); g.restore();
  ell(g, 0, -19, 11, 12.5); fs(g, '#fff3e6', 1.8);
  for (let i = 0; i < 5; i++) { const a = i * TAU / 5 - Math.PI / 2; circ(g, Math.cos(a) * 4.6, -19 + Math.sin(a) * 4.6, 3); g.fillStyle = col2; g.fill(); }
  circ(g, 0, -19, 2.4); g.fillStyle = C.butter; g.fill();
  circ(g, 0, -46, 10); fs(g, '#ffe9dc', 1.8);
  g.beginPath(); g.arc(0, -46, 10, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(0, -50, -9.9, -46.6); g.closePath(); fs(g, '#2a1a4a', 1.4);
  for (const s of [-1, 1]) { ell(g, s * 4, -44.5, 2.2, 2.8); g.fillStyle = '#150a2a'; g.fill(); circ(g, s * 4 - 0.7, -45.4, 0.8); g.fillStyle = '#fff'; g.fill(); }
  g.globalAlpha = 0.6; g.fillStyle = '#ff7fb0'; for (const s of [-1, 1]) { circ(g, s * 6.6, -41.5, 1.9); g.fill(); } g.globalAlpha = 1;
  g.beginPath(); g.moveTo(-3.4, -40.6); g.quadraticCurveTo(0, -37.6, 3.4, -40.6); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
}
const DOLLS = {
  rag: [0, 1, 2].map(i => ({ skin: ['#f8dcc6', '#eccdf5', '#fbe6b8'][i], hair: [C.hot, '#49d6bb', '#a67cff'][i], hairStyle: 'pigtails', eyes: 'mismatch', iris: ['#59d9c0', '#ff7ab8', '#ff9a5c'][i], mouth: 'stitch', dress: ['#ff9ec4', '#93e6cf', '#ffd98a'][i], dress2: '#fff6fb', patch: ['#8ff5d8', '#ffe58a', '#ff8fd0'][i], blush: '#ff6fa0', shoe: INK2 })),
  por: [0, 1, 2].map(i => ({ skin: '#fffaf6', hair: ['#3a2466', '#f6dc8f', '#8a3f66'][i], hairStyle: 'ringlets', eyes: 'glossy', iris: ['#7fc4ff', '#ff7a9c', '#6fe8c8'][i], mouth: 'o', dress: ['#a9c9ff', '#ffb8dc', '#d6c2ff'][i], dress2: '#ffffff', apron: true, collar: '#ffffff', crack: true, bow: [C.hot, '#7fc4ff', C.butter][i], blush: '#ff9ab8', shoe: '#17102b', leg: '#fff' })),
  bal: [0, 1, 2].map(i => ({ skin: '#ffeae2', hair: ['#2b1d4f', '#ff9bd6', '#ffe58a'][i], hairStyle: 'bun', eyes: 'hollow', iris: C.mint, mouth: 'smile', body: 'leotard', dress: ['#ff8fd0', '#b9a2ff', '#7fe9d0'][i], dress2: ['#ffd0ea', '#e2d6ff', '#d0fff3'][i], key: true, blush: '#ff7fb0', shoe: ['#ff8fd0', '#b9a2ff', '#7fe9d0'][i] })),
};
const MATC = [['#ff6f9f', '#ffd0e0'], ['#7c6cf0', '#d6ceff'], ['#3fc7a8', '#c8fff0']];
const BOSS_O = { skin: '#f6eef8', hair: '#1c1236', hairStyle: 'ringlets', eyes: 'boss', iris: '#ff3355', mouth: 'stitch', dress: '#2a1a4a', dress2: C.hot, apron: false, collar: C.pink, crack: true, crown: true, shoe: '#0b0618', leg: '#f6eef8' };
const PLAYER_O = { skin: '#ffe3d3', hair: '#ff9bd6', streak: '#7ff0d8', hairStyle: 'buns', bangs: 'blunt', eyes: 'glossy', iris: '#49d6bb', mouth: 'smile', blush: '#ff7fb0', dress: '#2f2157', dress2: C.lilac, sleeve: '#2f2157', heart: C.hot, shoe: '#17102b', leg: '#f6f0ff', stripes: '#2f2157' };

const A = {}; // all art
function eyeSprite(col, gap = 6.6, r = 8) {
  return sprite(44, 24, 22, 12, g => {
    for (const s of [-1, 1]) {
      const gr = g.createRadialGradient(s * gap, 0, 0, s * gap, 0, r);
      gr.addColorStop(0, '#fff'); gr.addColorStop(0.22, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(s * gap - r, -r, r * 2, r * 2);
    }
  });
}
function glowSprite(rgb, core = 0.25) {
  const c = mk(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(core, `rgba(${rgb},.85)`); gr.addColorStop(0.6, `rgba(${rgb},.22)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return { c, w: 64, h: 64, ax: 32, ay: 32 };
}
function lightSprite(rgb) {
  const c = mk(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.35, `rgba(${rgb},.62)`); gr.addColorStop(0.7, `rgba(${rgb},.18)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
function sparkSprite(col) {
  return sprite(24, 24, 12, 12, g => {
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 11); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 0.5; g.fillStyle = gr; g.fillRect(-12, -12, 24, 24); g.globalAlpha = 1;
    star(g, 0, 0, 11, 2.2, 4); g.fillStyle = '#fff'; g.fill();
  });
}
const RGB = { pink: '255,120,200', mint: '120,255,220', lilac: '190,150,255', butter: '255,225,130', white: '255,246,251', red: '255,70,100', blue: '150,190,255' };

function buildArt() {
  // dolls
  A.doll = {};
  for (const t in DOLLS) A.doll[t] = DOLLS[t].map(o => {
    const R = sprite(60, 84, 30, 76, g => drawDoll(g, o, { arms: 'out' }));
    return { R, L: flipS(R), wR: whiteS(R), wL: whiteS(flipS(R)), sit: sprite(60, 84, 30, 76, g => drawDoll(g, o, { sit: true, closed: true })), col: o.dress };
  });
  A.doll.mat = MATC.map(([a, b]) => { const R = sprite(60, 76, 30, 68, g => drawMat(g, a, b), 2.5); const w = whiteS(R); return { R, L: R, wR: w, wL: w, sit: R, col: a }; });
  { const R = sprite(240, 336, 120, 304, g => { g.scale(4, 4); drawDoll(g, BOSS_O, { arms: 'out' }); }, 3); A.boss = { R, L: flipS(R), wR: whiteS(R), wL: whiteS(flipS(R)), col: '#f6eef8' }; }
  A.eye = { rag: eyeSprite('#ff3d7f'), por: eyeSprite('#ff3d7f'), bal: eyeSprite('#5fffd8'), mat: eyeSprite('#ffd24a', 4, 6), boss: eyeSprite('#ff2244') };
  A.shadow = sprite(40, 16, 20, 8, g => { const gr = g.createRadialGradient(0, 0, 2, 0, 0, 18); gr.addColorStop(0, 'rgba(8,3,22,.55)'); gr.addColorStop(1, 'rgba(8,3,22,0)'); g.scale(1, 0.4); g.fillStyle = gr; g.fillRect(-20, -20, 40, 40); });
  // glows, lights
  A.glow = {}; A.spark = {}; A.light = {};
  for (const k in RGB) { A.glow[k] = glowSprite(RGB[k]); A.spark[k] = sparkSprite(`rgb(${RGB[k]})`); }
  A.light.white = lightSprite('255,246,236'); A.light.pink = lightSprite('255,110,200'); A.light.mint = lightSprite('110,255,220'); A.light.blue = lightSprite('140,170,255'); A.light.red = lightSprite('255,60,90'); A.light.warm = lightSprite('255,214,150');
  { const c = mk(256, 256), g = c.getContext('2d');
    for (let i = 0; i < 7; i++) { const a = 0.52 - i * 0.05, gr = g.createRadialGradient(0, 128, 6, 0, 128, 256); gr.addColorStop(0, 'rgba(255,244,225,.36)'); gr.addColorStop(0.55, 'rgba(255,240,220,.17)'); gr.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 128); g.arc(0, 128, 256, -a, a); g.closePath(); g.fill(); }
    A.cone = c; }
  A.puff = sprite(32, 32, 16, 16, g => { const gr = g.createRadialGradient(0, 0, 2, 0, 0, 15); gr.addColorStop(0, 'rgba(255,246,251,.95)'); gr.addColorStop(0.6, 'rgba(240,225,255,.6)'); gr.addColorStop(1, 'rgba(240,225,255,0)'); g.fillStyle = gr; g.fillRect(-16, -16, 32, 32); });
  { const c = mk(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 70, 128, 128, 182); gr.addColorStop(0, 'rgba(8,4,20,0)'); gr.addColorStop(1, 'rgba(8,4,20,.82)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); A.vig = c; }
  { const c = mk(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 60, 128, 128, 180); gr.addColorStop(0, 'rgba(255,40,90,0)'); gr.addColorStop(1, 'rgba(255,30,80,.85)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); A.vigRed = c; }
  // gems
  const gem = (col, hi, s) => sprite(24, 28, 12, 14, g => { g.scale(s, s); g.beginPath(); g.moveTo(0, -10); g.lineTo(7.5, -2.5); g.lineTo(0, 10); g.lineTo(-7.5, -2.5); g.closePath(); fs(g, col, 2); g.beginPath(); g.moveTo(-7.5, -2.5); g.lineTo(0, -4.5); g.lineTo(7.5, -2.5); g.moveTo(0, -4.5); g.lineTo(0, 10); g.lineWidth = 1; g.strokeStyle = 'rgba(26,15,51,.45)'; g.stroke(); g.beginPath(); g.moveTo(-4.4, -3.6); g.lineTo(0, -8.2); g.lineTo(0, -5.2); g.closePath(); g.fillStyle = hi; g.fill(); });
  A.gem = [gem('#ff6fc0', '#ffd6ee', 0.82), gem('#4fe6c6', '#d6fff5', 1), gem('#ffd24a', '#fff6cf', 1.18), sprite(24, 28, 12, 14, g => { heart(g, 0, 0, 8); fs(g, '#ff4f7f', 2); ell(g, -3.4, -3, 1.8, 2.6, -0.5); g.fillStyle = '#ffd0dc'; g.fill(); })];
  A.gemGlow = ['pink', 'mint', 'butter', 'red'];
  // weapons
  A.bolt = sprite(26, 14, 13, 7, g => { g.beginPath(); g.moveTo(11, 0); g.bezierCurveTo(6, -6.5, -4, -6, -11, 0); g.bezierCurveTo(-4, 6, 6, 6.5, 11, 0); g.closePath(); fs(g, '#ff5fb5', 1.8); ell(g, 2, -1.8, 4, 1.4); g.fillStyle = '#fff'; g.fill(); });
  A.charm = [sprite(28, 28, 14, 14, g => { heart(g, 0, 0, 9); fs(g, C.hot, 2.2); ell(g, -3.8, -3.2, 2, 3, -0.5); g.fillStyle = '#ffd0ea'; g.fill(); }),
             sprite(28, 28, 14, 14, g => { star(g, 0, 0.5, 11.5, 5.2); fs(g, C.butter, 2.2); }),
             sprite(28, 28, 14, 14, g => { moon(g, -1.5, 0, 10.5); fs(g, C.lilac, 2.2); })];
  A.ball = sprite(36, 36, 18, 18, g => { circ(g, 0, 0, 13); fs(g, '#7fefd6', 2.2); ell(g, -5, -6, 4, 2.4, -0.6); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill(); g.fillStyle = INK; circ(g, -4.2, 0, 1.6); g.fill(); circ(g, 4.2, 0, 1.6); g.fill(); g.beginPath(); g.moveTo(-2.6, 3.4); g.quadraticCurveTo(-1.3, 5.6, 0, 3.4); g.quadraticCurveTo(1.3, 5.6, 2.6, 3.4); g.lineWidth = 1.3; g.strokeStyle = INK; g.stroke(); });
  A.bomb = sprite(36, 40, 18, 22, g => { circ(g, 0, 2, 12); fs(g, C.lilac, 2.2); star(g, 0, 2, 6.5, 3); g.fillStyle = C.hot; g.fill(); g.beginPath(); g.moveTo(4, -9); g.quadraticCurveTo(8, -15, 11, -13); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); star(g, 12, -14, 5, 1.6, 4); g.fillStyle = C.butter; g.fill(); ell(g, -5, -3, 3.4, 2, -0.6); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill(); });
  A.fstar = sprite(36, 36, 18, 18, g => { star(g, 0, 0, 15, 6.5); fs(g, C.butter, 2.2); star(g, 0, 0, 7, 3); g.fillStyle = '#fff'; g.fill(); });
  const drawKitty = g => {
    g.globalAlpha = 0.93;
    g.beginPath(); g.moveTo(-13, 4); g.bezierCurveTo(-15, -10, -12, -13, -11.5, -19); g.lineTo(-5.5, -13.5); g.quadraticCurveTo(0, -15.5, 5.5, -13.5); g.lineTo(11.5, -19); g.bezierCurveTo(12, -13, 15, -10, 13, 4);
    g.quadraticCurveTo(10, 12, 6.5, 6); g.quadraticCurveTo(3, 12, 0, 6); g.quadraticCurveTo(-3, 12, -6.5, 6); g.quadraticCurveTo(-10, 12, -13, 4); g.closePath(); fs(g, '#f1fffb', 2.2);
    g.globalAlpha = 1; g.lineWidth = 1.6; g.strokeStyle = INK;
    for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 5.4, -5, 2.6, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    g.beginPath(); g.moveTo(-2.6, -0.8); g.quadraticCurveTo(-1.3, 1.6, 0, -0.8); g.quadraticCurveTo(1.3, 1.6, 2.6, -0.8); g.stroke();
    g.fillStyle = '#ff9bd6'; g.globalAlpha = 0.7; for (const s of [-1, 1]) { ell(g, s * 9, -1.5, 2.4, 1.5); g.fill(); } g.globalAlpha = 1;
  };
  const drawBunny = g => {
    g.globalAlpha = 0.93;
    for (const s of [-1, 1]) { ell(g, s * 5.5, -19, 4, 11, s * 0.16); fs(g, '#e6d8ff', 2.2); ell(g, s * 5.5, -19, 1.7, 7, s * 0.16); g.fillStyle = '#ffb3e0'; g.fill(); }
    g.beginPath(); g.moveTo(-12, 3); g.bezierCurveTo(-15, -14, 15, -14, 12, 3); g.quadraticCurveTo(9, 11, 6, 5.5); g.quadraticCurveTo(3, 11, 0, 5.5); g.quadraticCurveTo(-3, 11, -6, 5.5); g.quadraticCurveTo(-9, 11, -12, 3); g.closePath(); fs(g, '#e6d8ff', 2.2);
    g.globalAlpha = 1; g.fillStyle = INK; circ(g, -4.6, -3.5, 1.7); g.fill(); circ(g, 4.6, -3.5, 1.7); g.fill();
    g.beginPath(); g.moveTo(-1.6, 0.4); g.lineTo(0, 2); g.lineTo(1.6, 0.4); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
  };
  { const R = sprite(36, 40, 18, 24, drawKitty); A.kitty = { R, L: flipS(R) }; const B = sprite(36, 50, 18, 34, drawBunny); A.bunny = { R: B, L: flipS(B) }; }
  A.ebolt = sprite(22, 22, 11, 11, g => { circ(g, 0, 0, 8); fs(g, '#ff4f7f', 2); g.fillStyle = '#3a0a25'; for (const [x, y] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) { circ(g, x, y, 1.3); g.fill(); } });
  A.box = sprite(52, 56, 26, 46, g => {
    rr(g, -19, -30, 38, 30, 5); fs(g, '#ffb3e0', 2.4); g.save(); g.clip(); g.fillStyle = '#fff6fb'; for (let i = -3; i < 4; i += 2) g.fillRect(i * 7 - 3, -32, 6.5, 34); g.restore(); rr(g, -19, -30, 38, 30, 5); fs(g, null, 2.4);
    rr(g, -22, -38, 44, 11, 4); fs(g, C.mint, 2.4);
    circ(g, 0, -15, 9); fs(g, '#2f2157', 2); g.fillStyle = C.butter; g.font = `700 14px ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 0, -14.4);
    for (const s of [-1, 1]) { ell(g, s * 6.5, -42, 6.5, 4.2, s * -0.4); fs(g, C.hot, 2); } circ(g, 0, -40, 3); fs(g, C.hot, 1.8);
  });
  // flashlight
  A.torch = sprite(22, 12, 6, 6, g => { rr(g, -4, -3, 13, 6, 2.5); fs(g, C.lilac, 1.8); g.beginPath(); g.moveTo(8, -3); g.lineTo(14, -5); g.lineTo(14, 5); g.lineTo(8, 3); g.closePath(); fs(g, C.butter, 1.8); });
  buildWorldArt();
  buildIcons();
}

function buildPlayerArt(lv) {
  const o = Object.assign({}, PLAYER_O);
  if (lv.ears) o.ears = true;
  if (lv.bow) { o.bow = C.mint; o.bowX = lv.ears ? 15.5 : 0; }
  if (lv.boots) o.platform = true;
  if (lv.choker) o.choker = true;
  const fr = [0, 1, -1].map(st => sprite(64, 90, 32, 80, g => drawDoll(g, o, { step: st })));
  A.pl = { R: fr, L: fr.map(flipS), w: whiteS(fr[0], '#ff7fa8') };
}

function buildWorldArt() {
  // floor tile 200x200 (2x2 checker)
  A.tile = sprite(200, 200, 0, 0, g => {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x = i * 100, y = j * 100, dark = (i + j) % 2;
      g.fillStyle = dark ? '#5a499b' : '#6b59b1'; g.fillRect(x, y, 100, 100);
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x, y, 100, 2.5); g.fillRect(x, y, 2.5, 100);
      g.fillStyle = 'rgba(15,6,40,.16)'; g.fillRect(x, y + 97.5, 100, 2.5); g.fillRect(x + 97.5, y, 2.5, 100);
      for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(${k % 2 ? '255,255,255' : '20,8,50'},${rand(0.03, 0.08)})`; circ(g, x + rand(6, 94), y + rand(6, 94), rand(1, 3.4)); g.fill(); }
    }
    g.fillStyle = 'rgba(255,143,208,.28)'; g.save(); g.translate(100, 100); g.rotate(Math.PI / 4); g.fillRect(-7, -7, 14, 14); g.restore();
    g.strokeStyle = 'rgba(20,8,50,.25)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(30, 150); g.lineTo(42, 162); g.lineTo(38, 176); g.lineTo(52, 186); g.stroke();
  }, 1.5);
  A.wall = sprite(100, 170, 0, 0, g => {
    g.fillStyle = '#3e2c72'; g.fillRect(0, 0, 100, 170); g.fillStyle = '#48347f'; g.fillRect(0, 0, 50, 170);
    g.fillStyle = 'rgba(255,143,208,.16)'; heart(g, 25, 52, 6); g.fill(); heart(g, 75, 92, 6); g.fill();
    g.fillStyle = 'rgba(143,245,216,.12)'; star(g, 75, 46, 6, 2.6); g.fill(); star(g, 25, 98, 6, 2.6); g.fill();
    g.fillStyle = '#241746'; g.fillRect(0, 0, 100, 12); g.fillStyle = '#5a4494'; g.fillRect(0, 12, 100, 3);
    g.fillStyle = '#2c1d58'; g.fillRect(0, 124, 100, 46); g.fillStyle = '#5a4494'; g.fillRect(0, 121, 100, 4);
    g.strokeStyle = '#3b2970'; g.lineWidth = 2; g.strokeRect(8, 133, 84, 24); g.fillStyle = '#1b1038'; g.fillRect(0, 161, 100, 9);
  }, 1.5);
  const win = hasMoon => sprite(250, 140, 125, 70, g => {
    rr(g, -116, -62, 232, 122, 16); fs(g, '#1b1038', 3);
    rr(g, -106, -52, 212, 100, 9);
    const gr = g.createLinearGradient(0, -52, 0, 48); gr.addColorStop(0, '#16205c'); gr.addColorStop(1, '#4b5fc0'); g.fillStyle = gr; g.fill();
    g.save(); g.clip();
    g.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { g.globalAlpha = rand(0.3, 0.95); circ(g, rand(-104, 104), rand(-50, 30), rand(0.6, 1.5)); g.fill(); } g.globalAlpha = 1;
    if (hasMoon) { const mg = g.createRadialGradient(40, -14, 6, 40, -14, 50); mg.addColorStop(0, 'rgba(210,225,255,.55)'); mg.addColorStop(1, 'rgba(210,225,255,0)'); g.fillStyle = mg; g.fillRect(-20, -70, 130, 120); circ(g, 40, -14, 19); g.fillStyle = '#f4f1ff'; g.fill(); g.fillStyle = 'rgba(150,160,220,.5)'; circ(g, 34, -19, 4.5); g.fill(); circ(g, 47, -8, 3); g.fill(); circ(g, 44, -24, 2); g.fill(); }
    g.fillStyle = '#1b1038'; g.beginPath(); g.moveTo(-106, 48); for (let x = -106; x <= 106; x += 22) g.lineTo(x + 11, 34 + ((x / 22) & 1 ? 8 : 0) + rand(-3, 3)), g.lineTo(x + 22, 48); g.closePath(); g.fill();
    g.restore();
    g.fillStyle = '#1b1038'; g.fillRect(-3.5, -52, 7, 100); g.fillRect(-106, -8, 212, 6);
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 108, -54); g.quadraticCurveTo(s * 62, -44, s * 78, 10); g.quadraticCurveTo(s * 88, 30, s * 108, 50); g.closePath(); fs(g, '#d77fb8', 2.4); g.beginPath(); g.moveTo(s * 100, -46); g.quadraticCurveTo(s * 80, -30, s * 92, 30); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.3)'; g.stroke(); }
    rr(g, -124, 54, 248, 12, 4); fs(g, '#5a4494', 2.4);
  });
  A.winMoon = win(true); A.win = win(false);
  const neon = (draw, col) => sprite(96, 96, 48, 48, g => { draw(g); g.lineWidth = 9; g.strokeStyle = col; g.globalAlpha = 0.35; g.stroke(); g.globalAlpha = 1; g.lineWidth = 5; g.stroke(); g.lineWidth = 1.8; g.strokeStyle = '#fff'; g.stroke(); });
  A.neonHeart = neon(g => heart(g, 0, 0, 26), '#ff6fc0');
  A.neonMoon = neon(g => moon(g, -4, 0, 30), '#6ff5d6');
  A.neonStar = neon(g => star(g, 0, 2, 34, 15), '#ffe07a');
  A.poster = sprite(70, 90, 35, 45, g => {
    g.rotate(-0.04); rr(g, -28, -38, 56, 76, 3); fs(g, '#f4d9ff', 2.4); rr(g, -22, -32, 44, 44, 2); g.fillStyle = '#2f2157'; g.fill();
    g.save(); g.translate(0, 8); g.scale(0.62, 0.62); drawDoll(g, DOLLS.por[1], { closed: true }); g.restore();
    g.fillStyle = C.hot; rr(g, -20, 18, 40, 6, 2); g.fill(); g.fillStyle = '#2f2157'; rr(g, -14, 28, 28, 4, 2); g.fill();
  });
  A.rug = sprite(440, 300, 220, 150, g => {
    g.scale(1, 0.66);
    for (let i = 0; i < 28; i++) { const a = i * TAU / 28; circ(g, Math.cos(a) * 204, Math.sin(a) * 204, 14); g.fillStyle = '#b879d8'; g.fill(); }
    circ(g, 0, 0, 200); fs(g, '#d98ad0', 3); circ(g, 0, 0, 172); fs(g, '#8f6fe0', 3); circ(g, 0, 0, 140); fs(g, '#f3a9d8', 3); circ(g, 0, 0, 104); fs(g, '#4b3690', 3);
    star(g, 0, 0, 82, 36); fs(g, C.butter, 3);
    for (let i = 0; i < 5; i++) { const a = i * TAU / 5 - Math.PI / 2 + Math.PI / 5; moon(g, Math.cos(a) * 156, Math.sin(a) * 156, 11); g.fillStyle = '#fff6fb'; g.fill(); }
  }, 1.5);
  // shelves
  const shelf = v => sprite(436, 124, 8, 44, g => {
    const w = 420, wood = v ? '#5d4699' : '#524091', plank = v ? '#9a84e6' : '#8c76da';
    rr(g, 0, -38, w, 52, 7); fs(g, wood, 2.6); rr(g, 8, -31, w - 16, 36, 4); g.fillStyle = '#3a2a70'; g.fill();
    g.fillStyle = 'rgba(255,255,255,.05)'; for (let x = 20; x < w - 20; x += 44) g.fillRect(x, -31, 22, 36);
    rr(g, 0, 14, w, 60, 5); fs(g, wood, 2.6); rr(g, 8, 20, w - 16, 34, 4); g.fillStyle = '#231644'; g.fill();
    rr(g, -5, 6, w + 10, 10, 3.5); fs(g, plank, 2.4); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(0, 8, w, 2);
    rr(g, -5, 50, w + 10, 10, 3.5); fs(g, plank, 2.4); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(0, 52, w, 2);
    const tags = [C.butter, C.pink, C.mint, '#fff6fb'];
    for (let i = 0; i < 11; i++) { const x = 30 + i * 36; g.save(); g.translate(x, 67); g.rotate(rand(-0.12, 0.12)); rr(g, -8, -4.5, 16, 9, 2); fs(g, tags[(i + v) % 4], 1.6); g.fillStyle = INK; g.fillRect(-4.5, -1.5, 9, 1.4); g.fillRect(-4.5, 1.2, 5, 1.2); g.restore(); }
    // fairy light wire
    g.beginPath(); g.moveTo(4, -36); for (let i = 0; i < 12; i++) g.quadraticCurveTo(22 + i * 34.5, -25, 39 + i * 34.5, -36); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
    const bc = [C.pink, C.butter, C.mint, C.lilac];
    for (let i = 0; i < 12; i++) { circ(g, 22 + i * 34.5, -30, 3.3); fs(g, bc[i % 4], 1.4); }
  });
  A.shelf = [shelf(0), shelf(1)];
  A.shelfGlow = sprite(436, 40, 8, 44, g => { const bc = ['pink', 'butter', 'mint', 'lilac']; for (let i = 0; i < 12; i++) g.drawImage(A.glow[bc[i % 4]].c, 22 + i * 34.5 - 13, -30 - 13, 26, 26); });
  A.counter = sprite(436, 150, 8, 70, g => {
    const w = 420;
    rr(g, 0, 8, w, 66, 6); fs(g, '#6a3f8f', 2.6); g.fillStyle = 'rgba(255,255,255,.07)'; for (let x = 14; x < w - 20; x += 50) { rr(g, x, 22, 40, 44, 4); g.fill(); }
    rr(g, -6, -4, w + 12, 18, 6); fs(g, '#f3a9d8', 2.6); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, -1, w, 3);
    // register
    rr(g, 60, -44, 76, 44, 6); fs(g, '#8c76da', 2.6); rr(g, 68, -38, 44, 18, 3); fs(g, '#12332f', 2); g.fillStyle = C.mint; g.font = `700 13px ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('6.66', 90, -28.5);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { rr(g, 68 + i * 11, -16 + j * 7, 8, 5, 1.5); g.fillStyle = [C.pink, C.butter, C.mint, '#fff'][(i + j) % 4]; g.fill(); }
    rr(g, 118, -36, 12, 30, 3); fs(g, C.butter, 2);
    // candy jar
    rr(g, 200, -40, 40, 40, 12); g.fillStyle = 'rgba(180,240,255,.35)'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke();
    for (let i = 0; i < 10; i++) { circ(g, 206 + (i % 4) * 9 + rand(-1, 1), -8 - Math.floor(i / 4) * 9, 4.6); fs(g, [C.pink, C.butter, C.mint, C.lilac][i % 4], 1.4); }
    rr(g, 204, -48, 32, 10, 4); fs(g, C.hot, 2.2);
    // bell
    g.beginPath(); g.arc(300, -6, 13, Math.PI, TAU); g.closePath(); fs(g, C.butter, 2.2); circ(g, 300, -21, 3); fs(g, C.butter, 1.8);
    // sign
    rr(g, 340, -30, 60, 26, 4); fs(g, '#fff6fb', 2.2); g.fillStyle = C.hot; g.font = `700 11px ${FONT_UI}`; g.fillText('NO', 370, -22); g.fillStyle = INK; g.fillText('REFUNDS', 370, -11);
  });
  A.case = sprite(116, 150, 8, 76, g => {
    rr(g, 0, 22, 100, 50, 6); fs(g, '#524091', 2.6); rr(g, -4, 14, 108, 12, 4); fs(g, '#8c76da', 2.4);
    g.save(); g.translate(50, 14); g.scale(1.05, 1.05); drawDoll(g, DOLLS.por[2], { sit: true, closed: true }); g.restore();
    rr(g, 6, -66, 88, 82, 9); g.fillStyle = 'rgba(140,255,230,.2)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.moveTo(18, -56); g.lineTo(18, -20); g.moveTo(26, -58); g.lineTo(26, -44); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke();
    rr(g, 30, 38, 40, 14, 3); fs(g, C.butter, 2); g.fillStyle = INK; g.fillRect(36, 42, 28, 2); g.fillRect(36, 46.5, 18, 2);
  });
  // decals
  const block = (col, sym) => sprite(40, 44, 20, 34, g => { g.rotate(rand(-0.3, 0.3)); rr(g, -14, -24, 28, 28, 4); fs(g, col, 2.4); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-11, -21, 22, 3); g.fillStyle = INK; if (sym === 0) { heart(g, 0, -10, 6); g.fill(); } else if (sym === 1) { star(g, 0, -10, 8, 3.5); g.fill(); } else { moon(g, -1, -10, 7); g.fill(); } });
  A.decal = [block(C.pink, 0), block(C.mint, 1), block(C.butter, 2), block(C.lilac, 1),
    sprite(36, 36, 18, 26, g => { circ(g, 0, -12, 12); fs(g, '#ff7fb0', 2.4); g.save(); g.clip(); g.fillStyle = '#fff6fb'; g.fillRect(-14, -15, 28, 6); g.restore(); circ(g, 0, -12, 12); fs(g, null, 2.4); }),
    sprite(220, 60, 110, 30, g => { g.rotate(-0.07); g.font = `600 30px "Rubik Wet Paint", ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,90,170,.5)'; g.fillText('play with us', 0, 0); }),
    sprite(200, 60, 100, 30, g => { g.rotate(0.05); g.font = `600 28px "Rubik Wet Paint", ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(143,245,216,.42)'; g.fillText("don't leave", 0, 0); }),
    sprite(90, 60, 45, 30, g => { g.strokeStyle = 'rgba(255,246,251,.4)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-28 + i * 14, -16); g.lineTo(-30 + i * 14 + rand(-2, 2), 16); g.stroke(); } g.beginPath(); g.moveTo(-36, 8); g.lineTo(26, -10); g.stroke(); }),
  ];
}

// ---------- upgrade icons ----------
const ICON = {
  gloss(g) { g.rotate(0.6); rr(g, -10, -6, 20, 38, 8); fs(g, C.hot, 3); g.fillStyle = 'rgba(255,255,255,.5)'; rr(g, -6, -1, 5, 26, 2.5); g.fill(); rr(g, -8, -36, 16, 30, 4); fs(g, '#2f2157', 3); g.fillStyle = C.butter; g.fillRect(-8, -12, 16, 5); g.rotate(-0.6); star(g, 24, -22, 10, 3, 4); g.fillStyle = '#fff'; g.fill(); star(g, -26, 20, 7, 2, 4); g.fill(); },
  bomb(g) { circ(g, -2, 8, 25); fs(g, C.lilac, 3); star(g, -2, 8, 14, 6); fs(g, C.hot, 2); g.beginPath(); g.moveTo(10, -14); g.quadraticCurveTo(18, -30, 26, -24); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); star(g, 28, -26, 11, 3.5, 4); fs(g, C.butter, 1.5); ell(g, -13, -4, 7, 4, -0.6); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill(); },
  charm(g) { ell(g, 0, -4, 30, 24); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3; g.strokeStyle = C.butter; g.stroke(); heart(g, -24, 20, 10); fs(g, C.hot, 2.6); star(g, 2, 28, 12, 5.4); fs(g, C.butter, 2.6); moon(g, 25, 18, 10); fs(g, C.lilac, 2.6); },
  aura(g) { for (const [x, y, r] of [[22, -22, 12], [32, -8, 9], [10, -32, 8]]) { circ(g, x, y, r); fs(g, C.mint, 2.4); } rr(g, -26, -4, 40, 38, 9); fs(g, C.pink, 3); heart(g, -6, 16, 9); fs(g, '#fff6fb', 2); rr(g, -13, -16, 14, 13, 3); fs(g, C.butter, 3); rr(g, -17, -27, 22, 12, 5); fs(g, '#2f2157', 3); },
  ball(g) { ell(g, 0, 6, 31, 24); fs(g, '#7fefd6', 3); ell(g, -12, -6, 9, 5, -0.5); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill(); g.fillStyle = INK; circ(g, -9, 6, 3.4); g.fill(); circ(g, 9, 6, 3.4); g.fill(); g.beginPath(); g.moveTo(-5.5, 13); g.quadraticCurveTo(-2.7, 18, 0, 13); g.quadraticCurveTo(2.7, 18, 5.5, 13); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); g.globalAlpha = 0.6; g.fillStyle = '#ff7fb0'; ell(g, -18, 13, 5, 3); g.fill(); ell(g, 18, 13, 5, 3); g.fill(); g.globalAlpha = 1; g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.moveTo(-36, -18); g.lineTo(-30, -12); g.moveTo(36, -18); g.lineTo(30, -12); g.stroke(); },
  kitty(g) { g.translate(0, 8); g.scale(2.3, 2.3); g.drawImage(A.kitty.R.c, -18, -24, 36, 40); },
  bunny(g) { g.translate(0, 16); g.scale(1.9, 1.9); g.drawImage(A.bunny.R.c, -18, -34, 36, 50); },
  storm(g) { g.lineCap = 'round'; for (const [x, y, l] of [[-10, -30, 26], [-26, -14, 20], [4, -36, 16]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * 0.7, y + l * 0.7); g.lineWidth = 5; g.strokeStyle = C.pink; g.stroke(); } star(g, 8, 10, 26, 11.5); fs(g, C.butter, 3); star(g, 8, 10, 11, 5); g.fillStyle = '#fff'; g.fill(); },
  boots(g) { g.beginPath(); g.moveTo(-14, -34); g.lineTo(6, -34); g.lineTo(6, 2); g.quadraticCurveTo(30, 4, 30, 18); g.lineTo(-14, 18); g.closePath(); fs(g, '#2f2157', 3); g.fillStyle = C.lilac; for (let i = 0; i < 4; i++) g.fillRect(-4, -26 + i * 8, 10, 3); rr(g, -18, 18, 50, 14, 4); fs(g, C.hot, 3); rr(g, -17, -38, 26, 8, 3); fs(g, C.pink, 3); },
  choker(g) { g.beginPath(); g.moveTo(-34, -8); g.quadraticCurveTo(0, 14, 34, -8); g.lineWidth = 16; g.strokeStyle = INK; g.stroke(); g.lineWidth = 10; g.strokeStyle = '#3a2a6e'; g.stroke(); for (let i = -2; i <= 2; i++) { const x = i * 13, y = 1 - Math.abs(i) * 3.2; g.beginPath(); g.moveTo(x - 5, y - 3); g.lineTo(x, y - 17); g.lineTo(x + 5, y - 3); g.closePath(); fs(g, '#e9e4ff', 2); } circ(g, 0, 16, 6); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); heart(g, 0, 30, 9); fs(g, C.hot, 2.6); },
  locket(g) { g.beginPath(); g.arc(0, -30, 18, Math.PI * 0.15, Math.PI * 0.85, true); g.lineWidth = 3; g.strokeStyle = C.butter; g.stroke(); heart(g, 0, 6, 25); fs(g, C.hot, 3); ell(g, -11, -4, 5, 8, -0.5); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill(); circ(g, 0, 6, 4.5); g.fillStyle = INK; g.fill(); g.fillRect(-2, 6, 4, 11); },
  bow(g) { for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(s * 14, -30, s * 40, -26, s * 34, 0); g.bezierCurveTo(s * 40, 26, s * 14, 30, 0, 0); g.closePath(); fs(g, C.mint, 3); g.beginPath(); g.moveTo(s * 4, 6); g.lineTo(s * 14, 34); g.lineTo(s * 2, 26); g.closePath(); fs(g, '#5fd9bd', 3); } rr(g, -8, -9, 16, 18, 5); fs(g, '#5fd9bd', 3); },
  nails(g) { const cs = [C.pink, C.mint, C.lilac]; for (let i = 0; i < 3; i++) { g.save(); g.translate((i - 1) * 22, 14); g.rotate((i - 1) * 0.28); g.beginPath(); g.moveTo(-9, 16); g.lineTo(-9, -12); g.quadraticCurveTo(-8, -32, 0, -42); g.quadraticCurveTo(8, -32, 9, -12); g.lineTo(9, 16); g.closePath(); fs(g, cs[i], 3); g.fillStyle = 'rgba(255,255,255,.6)'; rr(g, -5, -18, 3.5, 20, 1.7); g.fill(); g.restore(); } },
  ears(g) { g.beginPath(); g.arc(0, 26, 34, Math.PI * 1.12, Math.PI * 1.88); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4; g.strokeStyle = '#3a2a6e'; g.stroke(); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 7, -6); g.lineTo(s * 22, -38); g.lineTo(s * 33, 2); g.closePath(); fs(g, '#17102b', 3); g.beginPath(); g.moveTo(s * 15, -5); g.lineTo(s * 22, -24); g.lineTo(s * 27, -1); g.closePath(); g.fillStyle = C.hot; g.fill(); } },
  liner(g) { g.beginPath(); g.moveTo(-32, 4); g.quadraticCurveTo(-6, -24, 22, -2); g.quadraticCurveTo(-4, 22, -32, 4); g.closePath(); fs(g, '#fff6fb', 3); circ(g, -5, 0, 11); fs(g, C.mint, 2); circ(g, -5, 0, 5); g.fillStyle = INK; g.fill(); circ(g, -8.5, -3.5, 2.6); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.moveTo(-32, 4); g.quadraticCurveTo(-6, -27, 22, -4); g.lineTo(38, -22); g.lineTo(26, 0); g.quadraticCurveTo(-4, -20, -32, 4); g.closePath(); g.fillStyle = INK; g.fill(); },
  cake(g) { g.beginPath(); g.moveTo(-22, 4); g.lineTo(22, 4); g.lineTo(16, 32); g.lineTo(-16, 32); g.closePath(); fs(g, C.mint, 3); g.beginPath(); g.moveTo(-26, 4); g.bezierCurveTo(-30, -18, -12, -18, -10, -24); g.bezierCurveTo(-6, -36, 6, -36, 10, -24); g.bezierCurveTo(12, -18, 30, -18, 26, 4); g.closePath(); fs(g, C.pink, 3); circ(g, 0, -32, 6); fs(g, C.red, 2.4); },
};
function buildIcons() {
  A.icon = {};
  for (const k in ICON) { const c = mk(192, 192), g = c.getContext('2d'); g.translate(96, 96); g.scale(2.1, 2.1); g.lineJoin = 'round'; g.lineCap = 'round'; ICON[k](g); A.icon[k] = c; }
}

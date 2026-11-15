// ---------- heroes ----------
const HEROES = [
  { id: 'luna', name: 'Luna', tag: 'The Night Owl', start: 'gloss', perk: '+1 reroll and +10% XP', mod: { reroll: 1, xp: 0.1 },
    o: { skin: '#ffe3d3', hair: '#ff9bd6', hair2: '#ff5fb5', streak: '#7ff0d8', style: 'buns', iris: '#35d0b0', top: '#2f2157', top2: '#c9a7ff', skirt: '#c9a7ff', sock: '#f6f0ff', sock2: '#2f2157', boot: '#17102b', sole: '#ff4fa3', emblem: 'heart', emb: '#ff4fa3' } },
  { id: 'jinx', name: 'Jinx', tag: 'The Hex Girl', start: 'kitty', perk: '+15% crit chance, but 20 less health', cost: 300, mod: { crit: 0.15, hp: -20 },
    o: { skin: '#f3e6f5', hair: '#2a1d4a', hair2: '#17102b', streak: '#b06cff', style: 'bob', iris: '#b06cff', top: '#17102b', top2: '#b06cff', skirt: '#6a2f9c', sock: '#17102b', sock2: '#b06cff', boot: '#0b0618', sole: '#b06cff', emblem: 'moon', emb: '#e2d6ff', choker: true } },
  { id: 'peach', name: 'Peach', tag: 'The Sweetheart', start: 'aura', perk: '+30 health and slow healing, a bit slower', unlock: 'win_short', mod: { hp: 30, regen: 0.5, spd: -0.08 },
    o: { skin: '#ffe6d6', hair: '#ffd98a', hair2: '#ffb347', streak: '#fff6fb', style: 'twintails', iris: '#ff7fa8', top: '#ffb8dc', top2: '#fff6fb', skirt: '#fff6fb', sock: '#fff6fb', sock2: '#ffb8dc', boot: '#ff8fd0', sole: '#fff6fb', emblem: 'star', emb: '#fff6fb', clips: true } },
  { id: 'pixel', name: 'Pixel', tag: 'The Gamer', start: 'mirror', perk: 'Attacks 10% faster, bigger gem magnet', cost: 800, mod: { cd: 0.1, pick: 0.3 },
    o: { skin: '#f6dcc8', hair: '#4fe6c6', hair2: '#1fb89a', streak: '#ff8fd0', style: 'long', iris: '#ff6fc0', top: '#16324a', top2: '#4fe6c6', skirt: '#0e2233', sock: '#16324a', sock2: '#ff8fd0', boot: '#f6f0ff', sole: '#4fe6c6', emblem: 'bolt', emb: '#ffe58a', phones: true } },
  { id: 'roxy', name: 'Roxy', tag: 'The Skater', start: 'scissors', perk: '+15% speed and 8% dodge', unlock: 'mini_3', mod: { spd: 0.15, dodge: 0.08 },
    o: { skin: '#f2cdb0', hair: '#ff5a5a', hair2: '#c9303f', streak: '#ffe58a', style: 'short', iris: '#7a5cff', top: '#ffe58a', top2: '#17102b', skirt: '#17102b', sock: '#f6f0ff', sock2: '#ff5a5a', boot: '#ff5a5a', sole: '#f6f0ff', emblem: 'skull', emb: '#17102b', beanie: '#3a2a6e' } },
  { id: 'mori', name: 'Mori', tag: 'The Ghost Girl', start: 'musicbox', perk: 'Starts every night with an extra life', unlock: 'win_long', mod: { revive: 1 },
    o: { skin: '#eef0ff', hair: '#f6f6ff', hair2: '#c9cdf2', streak: '#9fd4ff', style: 'long', iris: '#9fd4ff', top: '#e9ecff', top2: '#9fd4ff', skirt: '#9fb4e6', sock: '#e9ecff', sock2: '#9fd4ff', boot: '#5a6aa8', sole: '#e9ecff', emblem: 'ghost', emb: '#5a6aa8', bowTop: '#9fd4ff' } },
];
function heroHairBack(g, o, hy, back) {
  const st = o.style;
  if (st === 'buns') { rr(g, -19.5, hy - 10, 39, 37, 14); fs(g, o.hair); }
  else if (st === 'bob') { rr(g, -20.5, hy - 10, 41, 34, 12); fs(g, o.hair); }
  else if (st === 'short') { rr(g, -19.5, hy - 10, 39, 29, 12); fs(g, o.hair); }
  else if (st === 'twintails') {
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 13, hy - 9); g.bezierCurveTo(s * 34, hy - 8, s * 33, hy + 24, s * 24, hy + 38); g.bezierCurveTo(s * 20, hy + 24, s * 18, hy + 8, s * 12, hy + 2); g.closePath(); fs(g, o.hair); g.beginPath(); g.moveTo(s * 24, hy + 2); g.quadraticCurveTo(s * 27, hy + 16, s * 24, hy + 28); g.lineWidth = 1.6; g.strokeStyle = o.hair2; g.stroke(); }
    if (back) { rr(g, -18, hy - 8, 36, 28, 12); fs(g, o.hair); }
  } else if (st === 'long') {
    g.beginPath(); g.moveTo(-19, hy - 6); g.bezierCurveTo(-25, hy + 20, -21, hy + 38, -16, hy + 44); g.quadraticCurveTo(-8, hy + 40, 0, hy + 45); g.quadraticCurveTo(8, hy + 40, 16, hy + 44); g.bezierCurveTo(21, hy + 38, 25, hy + 20, 19, hy - 6); g.closePath(); fs(g, o.hair);
    g.lineWidth = 1.6; g.strokeStyle = o.hair2; for (const x of [-9, 0, 9]) { g.beginPath(); g.moveTo(x, hy + 16); g.quadraticCurveTo(x * 1.1, hy + 30, x * 0.9, hy + 40); g.stroke(); }
  }
}
function heroEmblem(g, o, x, y) {
  g.fillStyle = o.emb; const e = o.emblem;
  if (e === 'heart') { heart(g, x, y, 4.2); g.fill(); }
  else if (e === 'moon') { moon(g, x - 0.8, y, 4.6); g.fill(); }
  else if (e === 'star') { star(g, x, y, 5.2, 2.3); g.fill(); }
  else if (e === 'bolt') { g.beginPath(); g.moveTo(x + 1.5, y - 5.5); g.lineTo(x - 3.5, y + 0.8); g.lineTo(x - 0.3, y + 0.8); g.lineTo(x - 1.8, y + 5.5); g.lineTo(x + 3.6, y - 1.2); g.lineTo(x + 0.4, y - 1.2); g.closePath(); g.fill(); }
  else if (e === 'skull') { circ(g, x, y - 0.8, 4.2); g.fill(); g.fillRect(x - 2.4, y + 1.5, 4.8, 3); g.fillStyle = o.top; circ(g, x - 1.6, y - 1, 1.1); g.fill(); circ(g, x + 1.6, y - 1, 1.1); g.fill(); }
  else if (e === 'ghost') { g.beginPath(); g.arc(x, y - 1, 4, Math.PI, TAU); g.lineTo(x + 4, y + 4.5); g.lineTo(x + 2, y + 2.8); g.lineTo(x, y + 4.5); g.lineTo(x - 2, y + 2.8); g.lineTo(x - 4, y + 4.5); g.closePath(); g.fill(); }
}
function drawHero(g, o, p = {}) {
  const back = p.back, st = p.step || 0, hy = -51;
  g.save();
  if (!back) heroHairBack(g, o, hy, false);
  // legs + boots
  for (const s of [-1, 1]) {
    const up = st === s ? -4.5 : 0, lx = s * 6.2;
    rr(g, lx - 3.7, -18 + up, 7.4, 14, 3); fs(g, o.sock);
    g.fillStyle = o.sock2; g.fillRect(lx - 2.6, -15.4 + up, 5.2, 2); g.fillRect(lx - 2.6, -11.2 + up, 5.2, 2);
    const tall = o.platform ? 3 : 0;
    rr(g, lx - 6, -8.5 + up - tall, 12, 10.5 + tall, 3.6); fs(g, o.boot);
    g.fillStyle = o.sole; g.fillRect(lx - 4.9, -1.2 + up - tall * 0.9, 9.8, 2.2 + tall * 0.9);
    if (!back) { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 2.2, -6.2 + up - tall); g.lineTo(lx + 2.2, -6.2 + up - tall); g.moveTo(lx - 2.2, -3.9 + up - tall); g.lineTo(lx + 2.2, -3.9 + up - tall); g.stroke(); }
  }
  // skirt
  g.beginPath(); g.moveTo(-11, -23); g.lineTo(11, -23); g.lineTo(15.5, -13.5); g.lineTo(-15.5, -13.5); g.closePath(); fs(g, o.skirt);
  g.strokeStyle = 'rgba(26,15,51,.32)'; g.lineWidth = 1; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 4.4, -22); g.lineTo(i * 5.8, -14); g.stroke(); }
  // arms
  for (const s of [-1, 1]) {
    const sw = st ? (st === s ? 3.5 : -3.5) : 0, hx = s * 15 + (st ? s * 0.6 : 0), hyy = -21.5 + sw * 0.5;
    limb(g, s * 10.5, -37, hx, hyy - 2, 6.4, o.top);
    g.fillStyle = o.top2; rr(g, hx - 3.8, hyy - 4.2, 7.6, 3.2, 1.4); g.fill();
    circ(g, hx, hyy + 1.2, 3.3); fs(g, o.skin, 1.6);
  }
  // hoodie
  g.beginPath(); g.moveTo(-9, -42); g.lineTo(9, -42); g.quadraticCurveTo(14.5, -39, 15, -20.5); g.quadraticCurveTo(0, -16.5, -15, -20.5); g.quadraticCurveTo(-14.5, -39, -9, -42); g.closePath(); fs(g, o.top);
  g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.13)'; g.fillRect(-16, -43, 9, 27); g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(8, -43, 9, 27); g.fillStyle = o.top2; g.fillRect(-16, -23.4, 32, 2.3); g.restore();
  if (back) { g.beginPath(); g.moveTo(-11, -42); g.quadraticCurveTo(0, -25, 11, -42); g.closePath(); fs(g, o.top, 2); g.beginPath(); g.moveTo(-6, -41); g.quadraticCurveTo(0, -32, 6, -41); g.lineWidth = 1.2; g.strokeStyle = 'rgba(255,255,255,.22)'; g.stroke(); }
  else {
    g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-7.5, -25.5); g.quadraticCurveTo(0, -29.5, 7.5, -25.5); g.stroke();
    g.strokeStyle = o.top2; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-3.2, -41); g.lineTo(-3.8, -35.5); g.moveTo(3.2, -41); g.lineTo(3.8, -35.5); g.stroke();
    heroEmblem(g, o, 0, -32.5);
    if (o.choker) { g.beginPath(); g.moveTo(-6, -41.5); g.lineTo(6, -41.5); g.lineWidth = 2.8; g.strokeStyle = '#0b0618'; g.stroke(); circ(g, 0, -40.2, 1.7); g.fillStyle = C.hot; g.fill(); }
  }
  // head
  if (back) {
    heroHairBack(g, o, hy, true);
    ell(g, 0, hy, 18, 17); fs(g, o.hair);
    g.lineWidth = 1.6; g.strokeStyle = o.hair2; for (const x of [-8, 0, 8]) { g.beginPath(); g.moveTo(x * 0.6, hy - 14); g.quadraticCurveTo(x * 1.4, hy, x * 1.1, hy + 13); g.stroke(); }
    g.beginPath(); g.arc(0, hy, 13.5, Math.PI * 1.15, Math.PI * 1.45); g.lineWidth = 2.4; g.strokeStyle = 'rgba(255,255,255,.5)'; g.stroke();
  } else {
    ell(g, 0, hy, 17, 16); fs(g, o.skin);
    g.globalAlpha = 0.55; g.fillStyle = '#ff7fb0'; for (const s of [-1, 1]) { ell(g, s * 11.2, hy + 8, 3.6, 2.2); g.fill(); } g.globalAlpha = 1;
    for (const s of [-1, 1]) {
      const ex = s * 7, ey = hy + 3.2;
      if (p.blink) { g.beginPath(); g.arc(ex, ey - 1, 4.4, 0.1 * Math.PI, 0.9 * Math.PI); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); continue; }
      ell(g, ex, ey, 5, 6); g.fillStyle = '#150a2a'; g.fill();
      g.save(); g.clip(); ell(g, ex, ey + 2.2, 4.4, 4.6); g.fillStyle = o.iris; g.fill(); g.restore();
      circ(g, ex, ey + 1.3, 1.9); g.fillStyle = '#150a2a'; g.fill();
      g.fillStyle = '#fff'; circ(g, ex - 1.8, ey - 2.2, 1.8); g.fill(); circ(g, ex + 1.8, ey + 2.8, 0.9); g.fill();
      g.beginPath(); g.moveTo(ex - s * 5.2, ey - 2.2); g.quadraticCurveTo(ex, ey - 7.6, ex + s * 5.4, ey - 3.4); g.lineTo(ex + s * 7.6, ey - 5.6); g.lineWidth = 1.9; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.moveTo(ex - s * 3.2, hy - 6.2); g.lineTo(ex + s * 3, hy - 7.2); g.lineWidth = 1.4; g.strokeStyle = o.hair2; g.stroke();
    }
    g.beginPath(); g.moveTo(-2.8, hy + 9.6); g.quadraticCurveTo(-1.4, hy + 11.8, 0, hy + 9.8); g.quadraticCurveTo(1.4, hy + 11.8, 2.8, hy + 9.6); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke();
    // bangs with strands + side locks
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 17, hy - 4); g.quadraticCurveTo(s * 19.5, hy + 8, s * 15.5, hy + 15); g.quadraticCurveTo(s * 13.2, hy + 6, s * 12.2, hy - 2); g.closePath(); fs(g, o.hair, 2); }
    g.beginPath(); g.arc(0, hy, 17.6, Math.PI, TAU);
    g.lineTo(15, hy - 2); g.quadraticCurveTo(12, hy - 3, 10.5, hy - 8); g.quadraticCurveTo(8, hy - 2.5, 5, hy - 3.5); g.quadraticCurveTo(3, hy - 4, 1.5, hy - 8.5); g.quadraticCurveTo(-1, hy - 2.5, -5, hy - 3.2); g.quadraticCurveTo(-8, hy - 3.6, -9.5, hy - 8); g.quadraticCurveTo(-12, hy - 2.5, -15, hy - 2); g.closePath(); fs(g, o.hair);
    if (o.streak) { g.beginPath(); g.moveTo(4, hy - 16.8); g.quadraticCurveTo(9, hy - 12, 10.5, hy - 8); g.quadraticCurveTo(8, hy - 3, 5, hy - 3.6); g.quadraticCurveTo(7, hy - 9, 1, hy - 17.2); g.closePath(); g.fillStyle = o.streak; g.fill(); }
    g.beginPath(); g.arc(0, hy, 13.2, Math.PI * 1.16, Math.PI * 1.44); g.lineWidth = 2.6; g.strokeStyle = 'rgba(255,255,255,.6)'; g.stroke();
    g.beginPath(); g.arc(0, hy, 13.2, Math.PI * 1.5, Math.PI * 1.56); g.stroke();
  }
  // accessories
  if (o.style === 'buns') for (const s of [-1, 1]) { circ(g, s * 14, hy - 16.5, 8); fs(g, o.hair); g.beginPath(); g.arc(s * 14, hy - 16.5, 5, Math.PI * 1.1, Math.PI * 1.5); g.lineWidth = 1.8; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke(); if (!back) { g.save(); g.translate(s * 11, hy - 10.5); g.scale(0.55, 0.55); g.beginPath(); g.moveTo(0, 0); g.lineTo(-8, -5); g.lineTo(-8, 5); g.closePath(); g.moveTo(0, 0); g.lineTo(8, -5); g.lineTo(8, 5); g.closePath(); fs(g, o.streak || C.mint, 2.4); g.restore(); } }
  if (o.style === 'twintails') for (const s of [-1, 1]) { circ(g, s * 15.5, hy - 8, 3.4); fs(g, o.emb === '#fff6fb' ? C.hot : o.top2, 1.6); }
  if (o.beanie) { g.beginPath(); g.arc(0, hy - 3, 18.4, Math.PI * 1.04, Math.PI * 1.96); g.quadraticCurveTo(0, hy - 14, -17.6, hy - 5.4); g.closePath(); fs(g, o.beanie); rr(g, -18.5, hy - 10.5, 37, 6.5, 3); fs(g, o.streak, 2); circ(g, 0, hy - 22.5, 4); fs(g, o.streak, 2); }
  if (o.phones) { g.beginPath(); g.arc(0, hy - 1, 19.5, Math.PI * 1.08, Math.PI * 1.92); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = '#f6f0ff'; g.stroke(); for (const s of [-1, 1]) { rr(g, s * 18.5 - 4, hy - 5, 8, 12, 3.5); fs(g, o.streak, 2); } }
  if (o.clips && !back) { for (const [x, y, c] of [[-11, hy - 10, C.hot], [-7.5, hy - 12.5, C.mint]]) { star(g, x, y, 3, 1.3); fs(g, c, 1); } }
  if (o.bowTop) { g.save(); g.translate(0, hy - 16.5); g.beginPath(); g.moveTo(0, 0); g.lineTo(-10, -6); g.lineTo(-10, 6); g.closePath(); g.moveTo(0, 0); g.lineTo(10, -6); g.lineTo(10, 6); g.closePath(); fs(g, o.bowTop, 1.8); circ(g, 0, 0, 3); fs(g, o.bowTop, 1.6); g.restore(); }
  if (o.bow) { g.save(); g.translate(o.ears ? 16 : (o.style === 'buns' ? 0 : 11), hy - (o.style === 'buns' && !o.ears ? 18.5 : 14)); g.rotate(o.ears || o.style !== 'buns' ? 0.35 : 0); g.beginPath(); g.moveTo(0, 0); g.lineTo(-9, -6); g.lineTo(-9, 6); g.closePath(); g.moveTo(0, 0); g.lineTo(9, -6); g.lineTo(9, 6); g.closePath(); fs(g, C.mint, 1.8); circ(g, 0, 0, 2.8); fs(g, C.mint, 1.6); g.restore(); }
  if (o.ears) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 4, hy - 15.5); g.lineTo(s * 9.5, hy - 28); g.lineTo(s * 14.5, hy - 12.5); g.closePath(); fs(g, '#17102b', 2); g.beginPath(); g.moveTo(s * 7.2, hy - 16); g.lineTo(s * 9.6, hy - 23); g.lineTo(s * 12, hy - 15); g.closePath(); g.fillStyle = C.hot; g.fill(); }
  g.restore();
}
function heroSprite(o, p, ss = 3) { return sprite(72, 100, 36, 90, g => drawHero(g, o, p), ss); }
function buildPlayerArt(lv, hero) {
  const o = Object.assign({}, (hero || HEROES[0]).o);
  if (lv.ears) o.ears = true; if (lv.bow) o.bow = true; if (lv.boots) o.platform = true; if (lv.choker) o.choker = true;
  const f = [0, 1, -1].map(st => heroSprite(o, { step: st })), b = [0, 1, -1].map(st => heroSprite(o, { step: st, back: true }));
  A.pl = { R: f, L: f.map(flipS), bR: b, bL: b.map(flipS), blink: heroSprite(o, { blink: true }), w: whiteS(f[0], '#ff7fa8') };
  A.pl.blinkL = flipS(A.pl.blink);
}

// ---------- new dolls ----------
function drawTeddy(g, col, col2) {
  for (const s of [-1, 1]) { ell(g, s * 9, -5, 7, 6); fs(g, col); ell(g, s * 9, -3.5, 4, 3); g.fillStyle = col2; g.fill(); }
  for (const s of [-1, 1]) { limb(g, s * 11, -27, s * 21, -32, 7, col); }
  ell(g, 0, -20, 15, 16); fs(g, col); ell(g, 0, -17, 8.5, 9.5); g.fillStyle = col2; g.fill();
  g.strokeStyle = INK; g.lineWidth = 1.2; g.setLineDash([2, 2]); g.beginPath(); g.moveTo(0, -27); g.lineTo(0, -8); g.stroke(); g.setLineDash([]);
  for (const s of [-1, 1]) { circ(g, s * 12.5, -56, 6.5); fs(g, col); circ(g, s * 12.5, -56, 3); g.fillStyle = col2; g.fill(); }
  ell(g, 0, -44, 17, 15); fs(g, col);
  ell(g, 0, -39, 7.5, 5.5); fs(g, col2, 1.4); ell(g, 0, -41.5, 2.6, 1.8); g.fillStyle = INK; g.fill();
  g.beginPath(); g.moveTo(-3, -37.5); g.quadraticCurveTo(0, -35.5, 3, -37.5); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
  circ(g, -7, -47, 3.6); fs(g, '#2b1b4d', 1.4); g.beginPath(); g.moveTo(4.5, -49.5); g.lineTo(9.5, -44.5); g.moveTo(9.5, -49.5); g.lineTo(4.5, -44.5); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
  g.save(); g.translate(9, -24); g.rotate(0.3); g.fillStyle = C.pink; g.fillRect(-4, -4, 8, 8); g.lineWidth = 1; g.setLineDash([1.5, 1.5]); g.strokeRect(-4, -4, 8, 8); g.restore();
}
function drawRobot(g, col, col2) {
  for (const s of [-1, 1]) { rr(g, s * 7 - 4, -12, 8, 12, 2); fs(g, col2); rr(g, s * 7 - 6, -4, 12, 5, 2); fs(g, '#2b1b4d'); }
  g.beginPath(); g.moveTo(-12, -24); g.lineTo(-21, -24); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = C.butter; g.stroke(); ell(g, -25, -24, 4, 6.5); fs(g, C.butter, 2);
  for (const s of [-1, 1]) { limb(g, s * 12, -30, s * 21, -25, 5, col2); g.beginPath(); g.arc(s * 23, -24, 4, s > 0 ? -1.2 : Math.PI - 1.2, s > 0 ? 1.2 : Math.PI + 1.2); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  rr(g, -13, -37, 26, 26, 4); fs(g, col); circ(g, 0, -24, 6.5); fs(g, '#fff6fb', 1.6); g.beginPath(); g.moveTo(0, -24); g.lineTo(3.5, -27.5); g.lineWidth = 1.6; g.strokeStyle = C.red; g.stroke();
  g.fillStyle = C.pink; g.fillRect(-10, -34, 4, 3); g.fillStyle = C.mint; g.fillRect(-4, -34, 4, 3);
  rr(g, -16, -62, 32, 24, 5); fs(g, col); rr(g, -12, -58, 24, 12, 3); fs(g, '#12332f', 1.4);
  g.beginPath(); g.moveTo(0, -62); g.lineTo(0, -69); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); circ(g, 0, -71, 3); fs(g, C.red, 1.6);
  g.fillStyle = '#12332f'; for (let i = -2; i <= 2; i++) g.fillRect(i * 3.6 - 1, -44, 2, 4);
  for (const s of [-1, 1]) { rr(g, s * 17 - 2.5, -54, 5, 8, 2); fs(g, col2, 1.6); }
}
function drawJack(g, col, col2) {
  rr(g, -17, -26, 34, 26, 4); fs(g, col); g.save(); g.clip(); g.fillStyle = col2; for (let i = -2; i < 3; i += 2) g.fillRect(i * 7 - 3.5, -28, 7, 30); g.restore(); rr(g, -17, -26, 34, 26, 4); fs(g, null, 2.2);
  star(g, 0, -13, 7, 3); fs(g, C.butter, 1.4);
  g.beginPath(); g.moveTo(17, -14); g.lineTo(23, -14); g.lineTo(23, -20); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(); circ(g, 23, -22, 2.6); fs(g, C.red, 1.4);
  rr(g, -20, -30, 40, 6, 2.5); fs(g, C.butter, 2);
  g.beginPath(); g.moveTo(0, -30); for (let i = 0; i < 4; i++) { g.lineTo(i % 2 ? -6 : 6, -33.5 - i * 3.6); } g.lineTo(0, -46); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#e9e4ff'; g.stroke();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 4, -68); g.quadraticCurveTo(s * 20, -82, s * 24, -66); g.quadraticCurveTo(s * 14, -66, s * 12, -60); g.closePath(); fs(g, s > 0 ? col : col2); circ(g, s * 24, -65, 3); fs(g, C.butter, 1.4); }
  ell(g, 0, -57, 15, 13.5); fs(g, '#fff6fb');
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 6.5, -66); g.lineTo(s * 9.5, -60.5); g.lineTo(s * 6.5, -55); g.lineTo(s * 3.5, -60.5); g.closePath(); g.fillStyle = '#150a2a'; g.fill(); circ(g, s * 6.5, -60.5, 1.4); g.fillStyle = C.red; g.fill(); }
  circ(g, 0, -55.5, 3); fs(g, C.red, 1.4);
  g.beginPath(); g.moveTo(-9, -52); g.quadraticCurveTo(0, -43, 9, -52); g.quadraticCurveTo(0, -48, -9, -52); g.closePath(); fs(g, '#7a1c3c', 1.4);
  g.globalAlpha = 0.6; g.fillStyle = C.pink; for (const s of [-1, 1]) { circ(g, s * 11, -53, 2.4); g.fill(); } g.globalAlpha = 1;
}
function drawManne(g, col) {
  rr(g, -9, -4, 18, 4, 2); fs(g, '#3a2a70'); g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -24); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#8c76da'; g.stroke();
  limb(g, -9, -52, -19, -38, 4.5, col); limb(g, -19, -38, -15, -24, 4.5, col);
  limb(g, 9, -52, 20, -62, 4.5, col); limb(g, 20, -62, 15, -76, 4.5, col);
  g.beginPath(); g.moveTo(-10, -56); g.lineTo(10, -56); g.quadraticCurveTo(12, -44, 6.5, -38); g.quadraticCurveTo(13, -30, 12, -20); g.lineTo(-12, -20); g.quadraticCurveTo(-13, -30, -6.5, -38); g.quadraticCurveTo(-12, -44, -10, -56); g.closePath(); fs(g, col);
  g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-14, -58, 8, 40); g.restore();
  g.strokeStyle = 'rgba(26,15,51,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -55); g.lineTo(0, -21); g.stroke();
  rr(g, -3, -62, 6, 7, 2); fs(g, col, 1.8);
  ell(g, 0, -72, 10, 12); fs(g, col); g.beginPath(); g.moveTo(-3, -83); g.lineTo(-0.5, -77); g.lineTo(-4, -73); g.lineTo(-1, -68); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(0, -72, 7, Math.PI * 1.2, Math.PI * 1.45); g.lineWidth = 1.8; g.strokeStyle = 'rgba(255,255,255,.7)'; g.stroke();
}
const NEWDOLLS = {
  baby: [0, 1].map(i => ({ skin: '#ffe6da', hair: ['#ffd0e6', '#cfe6ff'][i], hairStyle: 'none', bonnet: ['#ffb8dc', '#a9c9ff'][i], eyes: 'glossy', iris: ['#7fc4ff', '#8fe8c8'][i], mouth: 'paci', dress: ['#ffd0e6', '#cfe6ff'][i], dress2: '#fff', blush: '#ff8fb0', shoe: '#fff6fb' })),
  patch: [0, 1].map(i => ({ skin: ['#cfe8c8', '#d9d0f2'][i], hair: ['#5a7a54', '#5a4494'][i], hairStyle: 'none', stitch: true, eyes: 'mismatch', iris: C.butter, mouth: 'stitch', dress: ['#8a6fd6', '#d98a5a'][i], dress2: ['#ffe58a', '#8ff5d8'][i], patch: C.pink, patch2: C.mint, shoe: '#2b1b4d' })),
  buddy: [0, 1].map(i => ({ skin: '#ffd9c2', hair: ['#35c2b0', '#ff9a3c'][i], hairStyle: 'mop', eyes: 'glossy', iris: ['#ffe58a', '#7fe9d0'][i], mouth: 'grin', brows: true, freckles: true, dress: ['#ffe07a', '#8fd0ff'][i], dress2: ['#ff7a5c', '#fff6fb'][i], apron: false, collar: '#fff6fb', cap: ['#ff7a5c', '#ff5fa0'][i], shoe: '#c9303f', scissors: true })),
  hush: [0].map(() => ({ skin: '#e8e2ee', hair: '#9c96b0', hairStyle: 'ringlets', eyes: 'hollow', iris: '#fff', mouth: 'smile', dress: '#17102b', dress2: '#6a58ad', collar: '#cfc8e6', crack: true, bonnet: '#17102b', shoe: '#0b0618' })),
  nova: [0].map(() => ({ skin: '#dfe6f7', hair: '#f6f6ff', hairStyle: 'buns0', bangs: 'blunt', eyes: 'led', iris: '#4ff0ff', mouth: 'flat', dress: '#3a1f6e', dress2: '#4ff0ff', collar: null, panel: true, antenna: true, shoe: '#17102b', leg: '#dfe6f7' })),
};
// extra doll options are drawn as overlays on top of drawDoll
function drawDollX(g, o, p = {}) {
  const hy = -44; drawDoll(g, o, p);
  g.save(); if (p.sit) g.translate(0, 9);
  if (o.hairStyle === 'mop') { for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 6 - 4, hy - 12); g.lineTo(i * 7, hy - 22 - (i % 2 ? 0 : 3)); g.lineTo(i * 6 + 4, hy - 12); g.closePath(); fs(g, o.hair, 1.8); } }
  if (o.bonnet) { g.beginPath(); g.arc(0, hy, 18.5, Math.PI * 0.95, Math.PI * 2.05); g.quadraticCurveTo(0, hy - 13, -18.4, hy + 2.8); g.closePath(); fs(g, o.bonnet); g.beginPath(); for (let i = 0; i <= 6; i++) { const a = Math.PI * (1 + i / 6); circ(g, Math.cos(a) * 18.5, hy + Math.sin(a) * 18.5, 2.6); g.fillStyle = '#fff6fb'; g.fill(); } }
  if (o.cap) { g.beginPath(); g.arc(0, hy - 6, 13, Math.PI, TAU); g.closePath(); fs(g, o.cap); rr(g, -4, hy - 22.5, 8, 3, 1.5); fs(g, C.butter, 1.4); g.beginPath(); g.moveTo(-9, hy - 24); g.lineTo(9, hy - 21); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  if (o.stitch) { g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-12, hy - 11); g.lineTo(11, hy - 12.5); g.stroke(); for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 3.4, hy - 14); g.lineTo(i * 3.4 + 0.6, hy - 9.4); g.stroke(); } if (o.patch2) { g.fillStyle = o.patch2; g.fillRect(-12, -20, 7, 7); g.lineWidth = 1; g.setLineDash([1.5, 1.5]); g.strokeRect(-12, -20, 7, 7); g.setLineDash([]); } }
  if (o.freckles) { g.fillStyle = '#d98a6a'; for (const s of [-1, 1]) for (const [x, y] of [[9, 5], [11.5, 6.5], [8.5, 7.5]]) { circ(g, s * x, hy + y, 0.7); g.fill(); } }
  if (o.brows) { g.strokeStyle = INK; g.lineWidth = 2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 2.5, hy - 3); g.lineTo(s * 10.5, hy - 7); g.stroke(); } }
  if (o.mouth === 'grin') { g.beginPath(); g.moveTo(-7, hy + 8); g.quadraticCurveTo(0, hy + 15, 7, hy + 8); g.closePath(); fs(g, '#fff6fb', 1.4); g.strokeStyle = INK; g.lineWidth = 1; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 2.6, hy + 8); g.lineTo(i * 2.6, hy + 11.5); g.stroke(); } }
  if (o.mouth === 'paci') { circ(g, 0, hy + 9.5, 4); fs(g, C.mint, 1.4); circ(g, 0, hy + 9.5, 1.6); fs(g, '#fff6fb', 1); }
  if (o.mouth === 'flat') { g.beginPath(); g.moveTo(-3.5, hy + 10); g.lineTo(3.5, hy + 10); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); }
  if (o.eyes === 'led') for (const s of [-1, 1]) { ell(g, s * 6.6, hy + 2.5, 4.8, 5.6); fs(g, '#0b0618', 1.4); circ(g, s * 6.6, hy + 2.8, 3); g.lineWidth = 1.6; g.strokeStyle = o.iris; g.stroke(); circ(g, s * 6.6, hy + 2.8, 0.9); g.fillStyle = '#fff'; g.fill(); }
  if (o.panel) { g.strokeStyle = 'rgba(26,15,51,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-16, hy + 5); g.lineTo(-11, hy + 9); g.lineTo(-10.5, hy + 14); g.moveTo(16, hy + 5); g.lineTo(11, hy + 9); g.lineTo(10.5, hy + 14); g.stroke(); }
  if (o.antenna) { for (const s of [-1, 1]) { rr(g, s * 16.5 - 2.5, hy - 4, 5, 9, 2); fs(g, o.dress2, 1.6); } g.beginPath(); g.moveTo(16.5, hy - 4); g.lineTo(20, hy - 17); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); circ(g, 20, hy - 18.5, 2.4); fs(g, o.iris, 1.2); }
  if (o.scissors) { g.save(); g.translate(21, -34); g.rotate(-0.5); g.strokeStyle = INK; g.lineWidth = 4.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(3, -15); g.moveTo(0, 0); g.lineTo(-4, -14); g.stroke(); g.strokeStyle = '#e9e4ff'; g.lineWidth = 2; g.stroke(); circ(g, -2.5, 3.5, 3); g.lineWidth = 2; g.strokeStyle = C.hot; g.stroke(); circ(g, 3, 3.5, 3); g.stroke(); g.restore(); }
  g.restore();
}
function bigSet(draw, k, w, h, ay, ss = 2) { const R = sprite(w * k, h * k, w * k / 2, ay * k, g => { g.scale(k, k); draw(g); }, ss); return { R, L: flipS(R), wR: whiteS(R), wL: whiteS(flipS(R)), sit: R, col: '#fff' }; }
function setOf(draw, w = 64, h = 92, ay = 82) { const R = sprite(w, h, w / 2, ay, draw); return { R, L: flipS(R), wR: whiteS(R), wL: whiteS(flipS(R)), sit: R, col: '#fff' }; }

// ---------- rooms ----------
const TILEFN = {
  main(g) { g.drawImage(A.tile.c, 0, 0, 200, 200); },
  plush(g) { g.fillStyle = '#58b8a4'; g.fillRect(0, 0, 200, 200); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { circ(g, 25 + i * 50 + (j % 2) * 25 - (j % 2 && i === 3 ? 200 : 0), 25 + j * 50, 9); g.fillStyle = (i + j) % 2 ? '#7fd6c2' : '#ffd0e6'; g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1; } for (let k = 0; k < 120; k++) { g.fillStyle = `rgba(${k % 2 ? '255,255,255' : '10,60,50'},${rand(0.03, 0.09)})`; g.fillRect(rand(200), rand(200), 2, 2); } },
  arcade(g) { g.fillStyle = '#1a1440'; g.fillRect(0, 0, 200, 200); g.lineWidth = 2.5; for (let i = 0; i < 4; i++) { g.strokeStyle = i % 2 ? 'rgba(255,79,163,.6)' : 'rgba(79,240,255,.5)'; g.beginPath(); g.moveTo(i * 50, 0); g.lineTo(i * 50, 200); g.moveTo(0, i * 50); g.lineTo(200, i * 50); g.stroke(); } for (let k = 0; k < 8; k++) { star(g, rand(15, 185), rand(15, 185), rand(3, 6), 1.5, 4); g.fillStyle = pick(['rgba(255,229,138,.5)', 'rgba(143,245,216,.5)', 'rgba(255,143,208,.5)']); g.fill(); } },
  antique(g) { for (let i = 0; i < 5; i++) { g.fillStyle = ['#4a2436', '#55293c', '#431f31', '#4f2639', '#472234'][i]; g.fillRect(0, i * 40, 200, 40); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, i * 40 + 38, 200, 2); const off = i % 2 ? 60 : 140; g.fillRect(off, i * 40, 2, 40); g.strokeStyle = 'rgba(255,200,180,.06)'; g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(rand(200), i * 40 + rand(6, 34)); g.bezierCurveTo(rand(200), i * 40 + rand(6, 34), rand(200), i * 40 + rand(6, 34), rand(200), i * 40 + rand(6, 34)); g.stroke(); } } },
  boutique(g) { g.fillStyle = '#f2c4de'; g.fillRect(0, 0, 200, 200); g.fillStyle = '#d99cc4'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { g.beginPath(); const x = i * 100, y = j * 100; g.moveTo(x, y - 50); g.lineTo(x + 50, y); g.lineTo(x, y + 50); g.lineTo(x - 50, y); g.closePath(); g.fill(); } g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(rand(200), rand(200)); g.quadraticCurveTo(rand(200), rand(200), rand(200), rand(200)); g.stroke(); } for (const [x, y] of [[50, 50], [150, 50], [50, 150], [150, 150]]) { circ(g, x, y, 4); g.fillStyle = '#ffe58a'; g.globalAlpha = 0.7; g.fill(); g.globalAlpha = 1; } },
  nursery(g) { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#9fb8ee' : '#e6a6d0'; g.fillRect(i * 100, j * 100, 100, 100); g.fillStyle = 'rgba(255,255,255,.35)'; if ((i + j) % 2) { star(g, i * 100 + 50, j * 100 + 50, 16, 7); g.fill(); } else { moon(g, i * 100 + 46, j * 100 + 50, 15); g.fill(); } g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(i * 100, j * 100, 100, 3); g.fillStyle = 'rgba(20,10,50,.12)'; g.fillRect(i * 100, j * 100 + 97, 100, 3); } },
  workshop(g) { g.fillStyle = '#5a6a62'; g.fillRect(0, 0, 200, 200); for (let k = 0; k < 9; k++) { ell(g, rand(200), rand(200), rand(8, 26), rand(5, 14), rand(3)); g.fillStyle = `rgba(20,30,25,${rand(0.08, 0.2)})`; g.fill(); } g.strokeStyle = 'rgba(15,20,18,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, 198, 198); g.fillStyle = 'rgba(255,229,138,.5)'; for (let i = 0; i < 5; i++) { g.save(); g.translate(20 + i * 18, 186); g.transform(1, 0, -0.6, 1, 0, 0); g.fillRect(0, 0, 9, 10); g.restore(); } for (let k = 0; k < 5; k++) { circ(g, rand(10, 190), rand(10, 170), 2.4); g.fillStyle = 'rgba(255,143,208,.6)'; g.fill(); } },
  stock(g) { g.fillStyle = '#2a2a48'; g.fillRect(0, 0, 200, 200); for (let k = 0; k < 150; k++) { g.fillStyle = `rgba(${k % 2 ? '255,255,255' : '0,0,0'},${rand(0.03, 0.08)})`; g.fillRect(rand(200), rand(200), rand(2, 5), 2); } g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 100); g.lineTo(200, 100); g.moveTo(100, 0); g.lineTo(100, 200); g.stroke(); g.strokeStyle = 'rgba(255,229,138,.28)'; g.lineWidth = 5; g.setLineDash([14, 12]); g.beginPath(); g.moveTo(0, 196); g.lineTo(200, 196); g.stroke(); g.setLineDash([]); },
  checkout(g) { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#7a5cc0' : '#d98ac4'; g.fillRect(i * 100, j * 100, 100, 100); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(i * 100, j * 100, 100, 3); g.fillRect(i * 100, j * 100, 3, 100); g.fillStyle = 'rgba(15,6,40,.16)'; g.fillRect(i * 100, j * 100 + 97, 100, 3); } heart(g, 100, 100, 9); g.fillStyle = 'rgba(255,246,251,.4)'; g.fill(); },
};
const SHELFPAL = { main: ['#524091', '#8c76da', '#231644', '#3a2a70'], plush: ['#3f8a7c', '#8fe8d2', '#173a36', '#2c6a60'], arcade: ['#2a2468', '#4ff0ff', '#0e0a2c', '#1a1648'], antique: ['#5a2a3a', '#b0706a', '#22101a', '#3d1c28'], boutique: ['#c46a9c', '#ffd0ea', '#4a1c3c', '#8a3f6e'], nursery: ['#6a7cc8', '#cfe0ff', '#1c2450', '#4a5a9c'], workshop: ['#4a5850', '#a8c0a0', '#161e1a', '#303c36'], stock: ['#3a3a5c', '#8a8ab8', '#12122a', '#26263e'], checkout: ['#5d4699', '#f3a9d8', '#231644', '#3a2a70'] };
function shelfSprite(v, pal) {
  const [wood, plank, recess, panel] = pal;
  return sprite(436, 124, 8, 44, g => {
    const w = 420;
    rr(g, 0, -38, w, 52, 7); fs(g, wood, 2.6); rr(g, 8, -31, w - 16, 36, 4); g.fillStyle = panel; g.fill();
    g.fillStyle = 'rgba(255,255,255,.05)'; for (let x = 20; x < w - 20; x += 44) g.fillRect(x, -31, 22, 36);
    rr(g, 0, 14, w, 60, 5); fs(g, wood, 2.6); rr(g, 8, 20, w - 16, 34, 4); g.fillStyle = recess; g.fill();
    rr(g, -5, 6, w + 10, 10, 3.5); fs(g, plank, 2.4); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(0, 8, w, 2);
    rr(g, -5, 50, w + 10, 10, 3.5); fs(g, plank, 2.4); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(0, 52, w, 2);
    const tags = [C.butter, C.pink, C.mint, '#fff6fb'];
    for (let i = 0; i < 11; i++) { const x = 30 + i * 36; g.save(); g.translate(x, 67); g.rotate(rand(-0.12, 0.12)); rr(g, -8, -4.5, 16, 9, 2); fs(g, tags[(i + v) % 4], 1.6); g.fillStyle = INK; g.fillRect(-4.5, -1.5, 9, 1.4); g.fillRect(-4.5, 1.2, 5, 1.2); g.restore(); }
    g.beginPath(); g.moveTo(4, -36); for (let i = 0; i < 12; i++) g.quadraticCurveTo(22 + i * 34.5, -25, 39 + i * 34.5, -36); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
    const bc = [C.pink, C.butter, C.mint, C.lilac];
    for (let i = 0; i < 12; i++) { circ(g, 22 + i * 34.5, -30, 3.3); fs(g, bc[i % 4], 1.4); }
  });
}
function buildArt2() {
  for (const t in NEWDOLLS) A.doll[t] = NEWDOLLS[t].map(o => { const R = sprite(64, 88, 32, 78, g => drawDollX(g, o, { arms: t === 'baby' ? 'down' : 'out', sit: t === 'hush' })); return { R, L: flipS(R), wR: whiteS(R), wL: whiteS(flipS(R)), sit: sprite(64, 88, 32, 78, g => drawDollX(g, o, { sit: true, closed: t !== 'nova' && t !== 'patch' })), col: o.dress }; });
  A.doll.teddy = [['#c98a5a', '#f2d2a8'], ['#e69ac0', '#ffe0ee'], ['#8fa8e6', '#e0e8ff']].map(([a, b]) => setOf(g => drawTeddy(g, a, b)));
  A.doll.robot = [['#8fd0ff', '#5a7ad6'], ['#ff9a9a', '#c9506a']].map(([a, b]) => setOf(g => drawRobot(g, a, b), 64, 96, 86));
  A.doll.jack = [['#ff6f9f', '#ffe58a'], ['#7c6cf0', '#8ff5d8']].map(([a, b]) => setOf(g => drawJack(g, a, b), 64, 100, 90));
  A.doll.manne = [['#f4eef8'], ['#e6d2c2']].map(([a]) => setOf(g => drawManne(g, a), 64, 104, 94));
  Object.assign(A.eye, { teddy: eyeSprite('#ff3d7f', 6.5, 6), robot: eyeSprite('#5fffd8', 6, 9), jack: eyeSprite('#ff2244'), manne: eyeSprite('#ffffff', 3.2, 4), baby: eyeSprite('#7fd0ff'), patch: eyeSprite('#ffd24a'), buddy: eyeSprite('#ffd24a'), hush: eyeSprite('#ffffff', 6.6, 6), nova: eyeSprite('#4ff0ff', 6.6, 10) });
  // minibosses
  A.mb = {
    bigted: bigSet(g => drawTeddy(g, '#b06a4a', '#f2d2a8'), 2.7, 64, 92, 82), jackking: bigSet(g => drawJack(g, '#b0123c', '#ffe58a'), 2.4, 64, 100, 90),
    unit9: bigSet(g => drawRobot(g, '#ff7a5c', '#8a2f4a'), 2.5, 64, 96, 86), seam: bigSet(g => drawManne(g, '#d9c2e6'), 2.3, 64, 104, 94),
    crybaby: bigSet(g => drawDollX(g, Object.assign({}, NEWDOLLS.baby[0], { iris: '#ff5577' }), { arms: 'out' }), 3, 64, 88, 78),
    stitch: bigSet(g => drawDollX(g, Object.assign({}, NEWDOLLS.patch[0], { dress: '#3a5a48' }), { arms: 'out' }), 2.6, 64, 88, 78),
    twin: bigSet(g => drawDoll(g, Object.assign({}, DOLLS.por[0], { hair: '#f6f6ff', dress: '#ff5577', bow: '#17102b' }), { arms: 'out' }), 2, 64, 88, 78),
    twin2: bigSet(g => drawDoll(g, Object.assign({}, DOLLS.por[0], { hair: '#17102b', dress: '#7fc4ff', bow: '#fff6fb' }), { arms: 'out' }), 2, 64, 88, 78),
  };
  // floor tiles, shelves
  A.tiles = {}; for (const k in TILEFN) A.tiles[k] = sprite(200, 200, 0, 0, TILEFN[k], 1.5);
  A.shelves = {}; for (const k in SHELFPAL) A.shelves[k] = [shelfSprite(0, SHELFPAL[k]), shelfSprite(1, SHELFPAL[k])];
  // props: anchor = top-left of footprint
  A.prop = {
    beanbag: sprite(110, 90, 10, 40, g => { ell(g, 45, 22, 46, 30); fs(g, pick([C.pink, C.lilac, C.butter, C.blue]), 2.6); ell(g, 45, 4, 30, 16); g.fillStyle = 'rgba(255,255,255,.25)'; g.fill(); g.beginPath(); g.moveTo(10, 26); g.quadraticCurveTo(45, 44, 80, 26); g.lineWidth = 1.6; g.strokeStyle = 'rgba(26,15,51,.4)'; g.stroke(); }),
    claw: sprite(116, 200, 8, 138, g => {
      rr(g, 0, -130, 100, 186, 8); fs(g, '#3a2a8a', 2.8); rr(g, 8, -98, 84, 84, 6); g.fillStyle = '#0e2a3a'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
      for (let i = 0; i < 9; i++) { circ(g, 20 + (i % 5) * 15 + rand(-2, 2), -26 - Math.floor(i / 5) * 13, 8); fs(g, [C.pink, C.mint, C.butter, C.lilac, C.blue][i % 5], 1.6); }
      g.strokeStyle = '#e9e4ff'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(52, -98); g.lineTo(52, -70); g.moveTo(52, -70); g.lineTo(44, -58); g.moveTo(52, -70); g.lineTo(60, -58); g.stroke();
      rr(g, 6, -124, 88, 20, 5); fs(g, C.hot, 2.2); g.fillStyle = '#fff6fb'; g.font = `700 12px ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GRAB ME', 50, -113.5);
      rr(g, 10, -6, 80, 22, 4); fs(g, '#2a1c6a', 2); circ(g, 30, 4, 5); fs(g, C.red, 1.6); rr(g, 54, 0, 26, 9, 3); fs(g, C.butter, 1.6); rr(g, 16, 26, 68, 22, 4); g.fillStyle = '#0e0a2c'; g.fill();
      g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(16, -90); g.lineTo(16, -50); g.stroke();
    }),
    rack: sprite(236, 150, 8, 104, g => {
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(6, 30); g.lineTo(6, -92); g.lineTo(214, -92); g.lineTo(214, 30); g.stroke(); g.strokeStyle = C.butter; g.lineWidth = 2.4; g.stroke();
      const cs = [C.pink, C.lilac, C.mint, '#fff6fb', C.hot, C.blue, C.butter];
      for (let i = 0; i < 7; i++) { const x = 28 + i * 27; g.beginPath(); g.moveTo(x, -92); g.lineTo(x, -84); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(x - 7, -84); g.lineTo(x + 7, -84); g.lineTo(x + 13, -18 - (i % 2) * 8); g.quadraticCurveTo(x, -10 - (i % 2) * 8, x - 13, -18 - (i % 2) * 8); g.closePath(); fs(g, cs[i], 2.2); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - 5, -80, 4, 50); }
      rr(g, -2, 24, 16, 8, 3); fs(g, '#2b1b4d', 2); rr(g, 206, 24, 16, 8, 3); fs(g, '#2b1b4d', 2);
    }),
    crib: sprite(150, 140, 8, 80, g => {
      rr(g, 0, -40, 134, 96, 8); fs(g, '#fff6fb', 2.8); rr(g, 8, -30, 118, 50, 5); g.fillStyle = '#ffd0e6'; g.fill(); ell(g, 36, -12, 20, 12); fs(g, '#fff6fb', 1.6);
      g.strokeStyle = INK; g.lineWidth = 2.2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(10 + i * 14.2, 20); g.lineTo(10 + i * 14.2, 52); g.stroke(); } rr(g, 0, 16, 134, 8, 3); fs(g, '#cfe0ff', 2.2);
      g.beginPath(); g.moveTo(110, -40); g.quadraticCurveTo(116, -78, 86, -74); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); for (const [x, y, c] of [[70, -58, C.butter], [86, -52, C.mint], [100, -60, C.pink]]) { g.beginPath(); g.moveTo(x, -72); g.lineTo(x, y - 6); g.lineWidth = 1; g.stroke(); star(g, x, y, 6, 2.6); fs(g, c, 1.4); }
    }),
    bench: sprite(260, 150, 8, 90, g => {
      rr(g, 0, 4, 240, 56, 5); fs(g, '#5a4a3a', 2.8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(10, 20, 220, 30); rr(g, -6, -10, 252, 18, 5); fs(g, '#a8845c', 2.6);
      circ(g, 40, -24, 15); fs(g, '#fffaf6', 2.2); ell(g, 34, -22, 4, 5); g.fillStyle = '#150a2a'; g.fill(); g.beginPath(); g.moveTo(42, -27); g.lineTo(50, -19); g.moveTo(50, -27); g.lineTo(42, -19); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
      limb(g, 80, -14, 108, -18, 5, '#ffe3d3'); limb(g, 120, -14, 126, -34, 5, '#ffe3d3'); circ(g, 150, -17, 5); fs(g, C.pink, 1.6); circ(g, 163, -15, 4); fs(g, C.mint, 1.6);
      g.beginPath(); g.moveTo(205, -10); g.lineTo(205, -60); g.lineTo(184, -72); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#8a8ab8'; g.stroke(); g.beginPath(); g.moveTo(172, -66); g.lineTo(192, -84); g.lineTo(198, -70); g.closePath(); fs(g, C.butter, 2);
      g.strokeStyle = '#e9e4ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(222, -12); g.lineTo(230, -30); g.stroke();
    }),
    crates: sprite(140, 180, 8, 116, g => {
      const box = (x, y, w, h, c) => { rr(g, x, y, w, h, 3); fs(g, c, 2.6); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x + 3, y + 3, w - 6, 5); g.fillStyle = '#e8d2a0'; g.fillRect(x + w / 2 - 5, y, 10, h); g.strokeStyle = 'rgba(26,15,51,.4)'; g.lineWidth = 1; g.strokeRect(x + w / 2 - 5, y, 10, h); };
      box(0, -6, 120, 64, '#9a7450'); box(8, -60, 70, 56, '#b08a5c'); box(74, -44, 48, 40, '#8a6444'); box(22, -106, 54, 48, '#a47e54');
      g.fillStyle = C.red; g.font = `700 9px ${FONT_UI}`; g.fillText('DOLLS', 86, 30); g.fillStyle = INK; g.fillText('DO NOT', 16, 14); g.fillText('OPEN', 16, 24);
      for (const s of [-1, 1]) { circ(g, 49 + s * 5, -110, 3.4); g.fillStyle = '#fff'; g.fill(); circ(g, 49 + s * 5, -110, 1.6); g.fillStyle = C.red; g.fill(); }
    }),
    cabinet: sprite(116, 170, 8, 96, g => {
      rr(g, 0, -86, 100, 158, 8); fs(g, '#3d1c28', 2.8); rr(g, 8, -76, 84, 96, 5); g.fillStyle = 'rgba(255,120,120,.16)'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
      g.save(); g.translate(50, 16); g.scale(1.1, 1.1); drawDollX(g, NEWDOLLS.hush[0], { sit: true, closed: true }); g.restore();
      g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(50, -76); g.lineTo(50, 20); g.moveTo(8, -28); g.lineTo(92, -28); g.stroke();
      g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(18, -68); g.lineTo(18, -40); g.stroke(); rr(g, 10, 30, 80, 30, 4); g.fillStyle = '#22101a'; g.fill(); circ(g, 50, 45, 4); fs(g, C.butter, 1.6);
      g.beginPath(); g.moveTo(10, -86); g.quadraticCurveTo(50, -104, 90, -86); g.closePath(); fs(g, '#5a2a3a', 2.6);
    }),
    pedestal: sprite(90, 110, 45, 86, g => {
      rr(g, -30, -12, 60, 22, 5); fs(g, '#241746', 2.6); rr(g, -22, -30, 44, 20, 4); fs(g, '#3a2a70', 2.6);
      rr(g, -17, -60, 34, 30, 4); fs(g, '#17102b', 2.6); g.fillStyle = '#b0123c'; g.fillRect(-4, -60, 8, 30); g.fillRect(-17, -49, 34, 7);
      for (const s of [-1, 1]) { ell(g, s * 7, -65, 7.5, 4.6, s * -0.4); fs(g, '#b0123c', 2); } circ(g, 0, -62.5, 3.4); fs(g, '#ff3355', 1.8);
      g.fillStyle = '#fff6fb'; for (const s of [-1, 1]) { circ(g, s * 6, -40, 2.2); g.fill(); }
    }),
    used: sprite(90, 60, 45, 36, g => { rr(g, -30, -12, 60, 22, 5); fs(g, '#241746', 2.6); rr(g, -22, -30, 44, 20, 4); fs(g, '#3a2a70', 2.6); }),
    counter: A.counter, case: A.case,
  };
  A.gbox = sprite(60, 64, 30, 52, g => {
    rr(g, -21, -32, 42, 32, 5); fs(g, C.butter, 2.6); g.fillStyle = '#fff6cf'; g.fillRect(-18, -29, 8, 26); g.fillStyle = C.hot; g.fillRect(-4, -32, 8, 32); rr(g, -24, -41, 48, 12, 4); fs(g, '#ffd24a', 2.6); g.fillStyle = C.hot; g.fillRect(-4, -41, 8, 12);
    for (const s of [-1, 1]) { ell(g, s * 7.5, -46, 8, 5, s * -0.4); fs(g, C.hot, 2); } circ(g, 0, -43.5, 3.6); fs(g, C.hot, 1.8); star(g, 12, -16, 5, 2); g.fillStyle = '#fff'; g.fill();
  });
  A.coin = sprite(22, 22, 11, 11, g => { circ(g, 0, 0, 8); fs(g, '#ffd24a', 2); circ(g, 0, 0, 5.2); g.lineWidth = 1.2; g.strokeStyle = '#b07a12'; g.stroke(); g.fillStyle = '#7a4f08'; for (const [x, y] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) { circ(g, x, y, 1); g.fill(); } });
  A.gem[4] = A.coin; A.gemGlow[4] = 'butter';
  A.scis = sprite(44, 44, 22, 22, g => { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-3, 4); g.lineTo(14, -16); g.moveTo(3, 4); g.lineTo(-14, -16); g.stroke(); g.strokeStyle = '#f0ecff'; g.lineWidth = 3; g.stroke(); for (const s of [-1, 1]) { circ(g, s * 6.5, 11, 5.5); g.lineWidth = 5.5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = C.hot; g.stroke(); } circ(g, 0, 1, 1.8); g.fillStyle = C.butter; g.fill(); });
  A.note = sprite(24, 28, 12, 14, g => { g.beginPath(); g.moveTo(3, 8); g.lineTo(3, -10); g.lineTo(9, -7); g.lineWidth = 2.6; g.strokeStyle = '#fff6fb'; g.stroke(); ell(g, -1, 8, 4.6, 3.4, -0.3); g.fillStyle = '#fff6fb'; g.fill(); });
  A.bub = sprite(64, 64, 32, 32, g => { circ(g, 0, 0, 28); g.fillStyle = 'rgba(160,220,255,.16)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = 'rgba(190,235,255,.9)'; g.stroke(); g.beginPath(); g.arc(0, 0, 21, Math.PI * 1.1, Math.PI * 1.5); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.8)'; g.stroke(); });
  A.portrait = HEROES.map(h => sprite(72, 100, 36, 90, g => drawHero(g, h.o, {}), 3));
  A.icon.coin = (() => { const c = mk(96, 96), g = c.getContext('2d'); g.drawImage(A.coin.c, 4, 4, 88, 88); return c; })();
}
// ---------- more upgrade icons ----------
Object.assign(ICON, {
  spray(g) { rr(g, -14, -8, 24, 40, 6); fs(g, C.lilac, 3); g.fillStyle = C.hot; g.fillRect(-14, 6, 24, 8); rr(g, -8, -20, 12, 13, 3); fs(g, '#2f2157', 3); rr(g, -6, -30, 14, 10, 3); fs(g, C.butter, 3); for (const [x, y, r, c] of [[22, -28, 9, C.butter], [32, -16, 7, C.pink], [30, -36, 6, C.hot]]) { circ(g, x, y, r); fs(g, c, 2); } },
  scissors(g) { g.scale(1.9, 1.9); g.drawImage(A.scis.c, -22, -22, 44, 44); },
  mirror(g) { circ(g, -6, 6, 24); fs(g, C.pink, 3); circ(g, -6, 6, 17); fs(g, '#cfeaff', 2.4); g.beginPath(); g.moveTo(-16, 2); g.lineTo(-6, -8); g.moveTo(-12, 10); g.lineTo(0, -2); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); g.beginPath(); g.moveTo(6, -6); g.lineTo(38, -34); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 5; g.strokeStyle = C.butter; g.stroke(); star(g, 36, -32, 8, 2.6, 4); g.fillStyle = '#fff'; g.fill(); },
  musicbox(g) { rr(g, -26, -4, 52, 34, 6); fs(g, '#8c76da', 3); g.fillStyle = C.butter; g.fillRect(-26, 8, 52, 5); g.beginPath(); g.moveTo(-26, -4); g.lineTo(-20, -24); g.lineTo(32, -24); g.lineTo(26, -4); g.closePath(); fs(g, C.pink, 3); g.beginPath(); g.moveTo(26, 14); g.lineTo(36, 14); g.lineTo(36, 4); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); circ(g, 36, 2, 4); fs(g, C.red, 2); g.save(); g.translate(-10, -34); g.scale(1.3, 1.3); g.drawImage(A.note.c, -12, -14, 24, 28); g.restore(); g.save(); g.translate(14, -38); g.drawImage(A.note.c, -12, -14, 24, 28); g.restore(); },
  lipstick(g) { g.rotate(-0.4); rr(g, -10, 2, 20, 30, 4); fs(g, '#2f2157', 3); g.fillStyle = C.butter; g.fillRect(-10, 4, 20, 5); g.beginPath(); g.moveTo(-7, 2); g.lineTo(-7, -22); g.lineTo(7, -34); g.lineTo(7, 2); g.closePath(); fs(g, '#7fe85a', 3); g.rotate(0.4); for (const [x, y] of [[-26, -18], [26, -6]]) { g.beginPath(); g.moveTo(x, y - 9); g.quadraticCurveTo(x + 8, y + 4, x, y + 7); g.quadraticCurveTo(x - 8, y + 4, x, y - 9); g.closePath(); fs(g, '#7fe85a', 2); } },
  scrunchie(g) { for (let i = 0; i < 9; i++) { const a = i * TAU / 9; circ(g, Math.cos(a) * 22, Math.sin(a) * 22 + 2, 11); fs(g, i % 2 ? C.pink : C.hot, 2.4); } circ(g, 0, 2, 11); g.fillStyle = '#22163f'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); },
  shield(g) { for (const s of [-1, 1]) { circ(g, s * 22, -24, 10); fs(g, '#c98a5a', 3); } g.beginPath(); g.moveTo(-28, -18); g.lineTo(28, -18); g.quadraticCurveTo(30, 18, 0, 36); g.quadraticCurveTo(-30, 18, -28, -18); g.closePath(); fs(g, '#c98a5a', 3); ell(g, 0, 10, 12, 9); fs(g, '#f2d2a8', 2); ell(g, 0, 6, 4, 3); g.fillStyle = INK; g.fill(); circ(g, -11, -4, 3.6); g.fill(); circ(g, 11, -4, 3.6); g.fill(); },
  backpack(g) { rr(g, -24, -20, 48, 54, 12); fs(g, '#3a2a6e', 3); rr(g, -16, 6, 32, 20, 6); fs(g, '#5a4494', 2.4); for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 15 - 6, -19); g.lineTo(i * 15, -38); g.lineTo(i * 15 + 6, -19); g.closePath(); fs(g, '#e9e4ff', 2.4); } for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 25, -6); g.lineTo(s * 38, 2); g.lineTo(s * 25, 10); g.closePath(); fs(g, '#e9e4ff', 2.4); } heart(g, 0, -4, 6); g.fillStyle = C.hot; g.fill(); },
  foot(g) { g.beginPath(); g.arc(0, -30, 7, 0, TAU); g.lineWidth = 3; g.strokeStyle = C.butter; g.stroke(); rr(g, -8, -24, 16, 10, 3); fs(g, C.butter, 2.6); g.beginPath(); g.moveTo(-10, -14); g.lineTo(10, -14); g.quadraticCurveTo(18, 20, 6, 34); g.quadraticCurveTo(-12, 40, -14, 22); g.closePath(); fs(g, '#fff6fb', 3); for (const [x, y] of [[-6, 24], [2, 27], [-9, 15]]) { ell(g, x, y, 3, 2.4); g.fillStyle = C.pink; g.fill(); } },
  hoodie(g) { g.beginPath(); g.moveTo(-14, -26); g.lineTo(14, -26); g.lineTo(36, -8); g.lineTo(28, 6); g.lineTo(20, 0); g.lineTo(20, 34); g.lineTo(-20, 34); g.lineTo(-20, 0); g.lineTo(-28, 6); g.lineTo(-36, -8); g.closePath(); fs(g, '#2f2157', 3); g.beginPath(); g.moveTo(-14, -26); g.quadraticCurveTo(0, -4, 14, -26); g.quadraticCurveTo(0, -38, -14, -26); g.closePath(); fs(g, '#43317f', 3); rr(g, -12, 14, 24, 12, 4); fs(g, '#43317f', 2.4); heart(g, 0, 2, 6); g.fillStyle = C.hot; g.fill(); },
  piggy(g) { ell(g, 0, 6, 30, 23); fs(g, C.pink, 3); for (const s of [-1, 1]) { rr(g, s * 16 - 5, 24, 10, 10, 3); fs(g, C.pink, 3); } g.beginPath(); g.moveTo(-18, -12); g.lineTo(-24, -26); g.lineTo(-8, -17); g.closePath(); fs(g, C.hot, 2.6); ell(g, 24, 6, 9, 8); fs(g, '#ffb8dc', 2.4); circ(g, 21.5, 6, 1.6); g.fillStyle = INK; g.fill(); circ(g, 26.5, 6, 1.6); g.fill(); circ(g, 8, -3, 2.6); g.fill(); rr(g, -8, -18, 14, 4, 2); g.fill(); g.save(); g.translate(-1, -30); g.scale(1, 1); g.drawImage(A.coin.c, -9, -9, 18, 18); g.restore(); },
  notes(g) { g.rotate(-0.12); rr(g, -24, -30, 48, 62, 5); fs(g, C.butter, 3); g.fillStyle = '#fff6fb'; g.fillRect(-16, -22, 36, 46); g.strokeStyle = C.blue; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-12, -14 + i * 9); g.lineTo(16, -14 + i * 9); g.stroke(); } g.fillStyle = INK; for (let i = 0; i < 6; i++) { circ(g, -20, -24 + i * 10, 2.2); g.fill(); } g.rotate(0.12); star(g, 20, -26, 12, 5); fs(g, C.hot, 2.4); },
  clip(g) { for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2 + Math.PI / 4); heart(g, 0, -15, 11); fs(g, '#5fe08a', 2.6); g.restore(); } circ(g, 0, 0, 4); fs(g, C.butter, 2); g.beginPath(); g.moveTo(8, 10); g.quadraticCurveTo(18, 26, 12, 38); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = '#5fe08a'; g.stroke(); },
  battery(g) { rr(g, -16, -22, 32, 54, 6); fs(g, '#3a2a6e', 3); rr(g, -7, -31, 14, 10, 3); fs(g, C.butter, 3); g.fillStyle = C.mint; g.fillRect(-11, 4, 22, 9); g.fillRect(-11, 17, 22, 9); g.fillStyle = C.butter; g.beginPath(); g.moveTo(3, -17); g.lineTo(-7, -3); g.lineTo(-1, -3); g.lineTo(-4, 4); g.lineTo(7, -9); g.lineTo(1, -9); g.closePath(); g.fill(); g.strokeStyle = C.butter; g.lineWidth = 3; for (const [x, y, x2, y2] of [[24, -20, 34, -28], [26, -6, 38, -6], [24, 8, 34, 16]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); } },
  dice(g) { g.rotate(0.2); rr(g, -24, -24, 48, 48, 9); fs(g, '#fff6fb', 3); g.fillStyle = C.hot; for (const [x, y] of [[-11, -11], [11, 11], [0, 0], [-11, 11], [11, -11]]) { circ(g, x, y, 4.4); g.fill(); } },
  gbox(g) { g.translate(0, 34); g.scale(1.5, 1.5); g.drawImage(A.gbox.c, -30, -52, 60, 64); },
  life(g) { heart(g, 0, 4, 26); fs(g, '#ff4f7f', 3); g.fillStyle = '#fff6fb'; g.fillRect(-4, -12, 8, 28); g.fillRect(-14, -2, 28, 8); },
});

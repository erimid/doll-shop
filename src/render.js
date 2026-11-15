// ---------- canvas / view ----------
const canvas = document.getElementById('game'), ctx = canvas.getContext('2d', { alpha: false });
const VIEW = { w: 0, h: 0, vs: 1, cx: 0, cy: 0 }, UI = { w: 0, h: 0, u: 1, ps: 1 }, cam = { x: 1350, y: 900 };
const lightC = mk(4, 4), lg = lightC.getContext('2d');
let qual = 9;
function resize() {
  const w = window.innerWidth, h = window.innerHeight; if (!w || !h) return;
  const sc = Math.max(0.75, Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2.7e6 / (w * h)), qual));
  canvas.width = Math.round(w * sc); canvas.height = Math.round(h * sc);
  UI.w = w; UI.h = h; UI.ps = sc; UI.u = clamp(Math.min(w, h) / 760, 0.55, 1.25);
  if (w >= h) { VIEW.h = h < 520 ? 600 : 760; VIEW.vs = canvas.height / VIEW.h; VIEW.w = canvas.width / VIEW.vs; }
  else { VIEW.w = 640; VIEW.vs = canvas.width / 640; VIEW.h = canvas.height / VIEW.vs; }
  lightC.width = Math.ceil(canvas.width / 6); lightC.height = Math.ceil(canvas.height / 6);
}
function camera(dt) {
  let tx, ty, f;
  if (G.state === 'title') { tx = 1350 + Math.cos(G.rt * 0.11) * 430; ty = 860 + Math.sin(G.rt * 0.16) * 300; f = 1 - Math.exp(-2 * dt); }
  else { tx = P.x + P.vx * 0.2; ty = P.y + P.vy * 0.2 - 24; f = 1 - Math.exp(-6 * dt); }
  cam.x = lerp(cam.x, tx, f); cam.y = lerp(cam.y, ty, f);
  VIEW.cx = VIEW.w > W ? (W - VIEW.w) / 2 : clamp(cam.x - VIEW.w / 2, 0, W - VIEW.w);
  VIEW.cy = clamp(cam.y - VIEW.h / 2, -WALLH, Math.max(-WALLH, H - VIEW.h));
}
const dawnPre = () => G.state === 'title' ? 0 : clamp((G.t - 250) / 50, 0, 1);
function ambient() {
  let r = 92, gg = 74, b = 168;
  if (G.state !== 'title') { const k = clamp(G.t / 240, 0, 1); r = lerp(74, 54, k); gg = lerp(60, 42, k); b = lerp(138, 112, k); }
  if (G.blackout > 0) { const q = Math.min(1, G.blackout * 3) * (Math.random() < 0.07 ? 0.35 : 1); r = lerp(r, 8, q); gg = lerp(gg, 6, q); b = lerp(b, 22, q); }
  const pre = dawnPre(); r = lerp(r, 150, pre * 0.5); gg = lerp(gg, 96, pre * 0.5); b = lerp(b, 120, pre * 0.3);
  if (G.dawn > 0) { r = lerp(r, 255, G.dawn); gg = lerp(gg, 230, G.dawn); b = lerp(b, 208, G.dawn); }
  if (G.state === 'dying') { r += 60 * Math.min(1, G.stateT); }
  const f = G.flash; r += 150 * f; gg += 170 * f; b += 255 * f;
  return `rgb(${Math.min(255, r | 0)},${Math.min(255, gg | 0)},${Math.min(255, b | 0)})`;
}
const RINGC = { red: '255,70,100', pink: '255,120,200', butter: '255,225,130', mint: '120,255,220' };
const dl = [];
function render(dt) {
  const g = ctx, vs = VIEW.vs, cw = canvas.width, ch = canvas.height, rt = G.rt, st = G.state;
  camera(dt);
  if (st === 'scare' || st === 'over') { drawScare(g, cw, ch); if (st === 'scare') return; }
  const cx = VIEW.cx + (Math.random() - 0.5) * 2 * G.shake, cy = VIEW.cy + (Math.random() - 0.5) * 2 * G.shake, vw = VIEW.w, vh = VIEW.h;
  const ox = -Math.round(cx * vs), oy = -Math.round(cy * vs), pre = dawnPre();
  if (st === 'over') return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#0c0718'; g.fillRect(0, 0, cw, ch);
  g.setTransform(vs, 0, 0, vs, ox, oy);
  // floor + wall
  for (let y = Math.max(0, Math.floor(cy / 200) * 200); y < Math.min(H, cy + vh); y += 200) for (let x = Math.max(0, Math.floor(cx / 200) * 200); x < Math.min(W, cx + vw); x += 200) g.drawImage(A.tile.c, x, y, 200.7, 200.7);
  if (cy < 0) {
    for (let x = Math.max(0, Math.floor(cx / 100) * 100); x < Math.min(W, cx + vw); x += 100) g.drawImage(A.wall.c, x, -WALLH, 100.7, WALLH + 0.5);
    for (const d of wallDecor) {
      if (d.x < cx - 150 || d.x > cx + vw + 150) continue;
      ds(g, A[d.s], d.x, -90);
      if (pre > 0 && d.s[0] === 'w') { g.globalAlpha = pre * 0.85; g.fillStyle = '#ffb78a'; rr(g, d.x - 106, -142, 212, 100, 9); g.fill(); g.globalAlpha = 1; }
    }
    g.fillStyle = 'rgba(10,5,30,.4)'; g.fillRect(cx, 0, vw, 12);
  }
  for (const d of decor) { const s = d.s === 'rug' ? A.rug : A.decal[d.i]; if (d.x < cx - 240 || d.x > cx + vw + 240 || d.y < cy - 160 || d.y > cy + vh + 160) continue; ds(g, s, d.x, d.y); }
  // draw list
  dl.length = 0;
  const L = cx - 80, R = cx + vw + 80, T = cy - 40, B = cy + vh + 110;
  for (const s of solids) if (s.x < R && s.x + s.w > L && s.y < B + 60 && s.y + s.h > T - 40) dl.push(s);
  for (const e of enemies) if (!e.dead && e.x > L && e.x < R && e.y > T && e.y < B + (e.boss ? 280 : 0)) dl.push(e);
  for (const b of boxes) if (b.x > L && b.x < R && b.y > T && b.y < B) dl.push(b);
  for (const p of pets) dl.push(p);
  dl.push(P);
  dl.sort((a, b) => a.sy - b.sy);
  // aura + shadows
  if (P.auraR) { g.globalAlpha = 0.2 + 0.04 * Math.sin(rt * 4); g.drawImage(A.glow.pink.c, P.x - P.auraR * 1.25, P.y - P.auraR, P.auraR * 2.5, P.auraR * 2); g.globalAlpha = 1; }
  for (const o of dl) {
    if (o.kind === 'enemy') ds(g, A.shadow, o.x, o.y, o.r / 11 * (1 - o.z / 90));
    else if (o.kind === 'player' || o.kind === 'box') ds(g, A.shadow, o.x, o.y, 1.3);
    else if (o.kind === 'pet') ds(g, A.shadow, o.x, o.y + 6, 0.8);
    else { g.fillStyle = 'rgba(10,5,30,.4)'; rr(g, o.x - 6, o.y + o.h - 8, o.w + 12, 18, 8); g.fill(); }
  }
  for (const r of rings) if (r.warn) { const k = r.t / r.d; g.globalAlpha = 0.16 + 0.2 * k; g.fillStyle = '#ff3355'; ell(g, r.x, r.y, r.r0 * k, r.r0 * 0.8 * k); g.fill(); g.globalAlpha = 1; }
  for (const s of shots) if (s.k === 'star' && s.t > 0) { g.globalAlpha = 0.5; g.strokeStyle = C.butter; g.lineWidth = 3; ell(g, s.x, s.y, s.rad * 0.7, s.rad * 0.5); g.stroke(); g.globalAlpha = 1; }
  for (const q of gems) { if (q.x < L || q.x > R || q.y < T || q.y > B) continue; ds(g, A.gem[q.k], q.x, q.y - 12 + Math.sin(q.t * 5) * 3); }
  // sorted entities
  for (const o of dl) {
    const k = o.kind;
    if (k === 'enemy') {
      const set = o.spr, s = o.flash > 0 ? (o.face > 0 ? set.wR : set.wL) : (o.face > 0 ? set.R : set.L);
      let hop, sq;
      if (o.boss) { hop = Math.abs(Math.sin(o.t * 3.2)) * 10; sq = 1 + Math.sin(o.t * 6.4) * 0.02; if (o.stomp > 0) { hop = (0.85 - o.stomp) * 70; sq = 1.06; } }
      else if (o.type === 'mat') { hop = Math.abs(Math.sin(o.t * 5 + o.ph)) * 4; sq = 1 + Math.sin(o.t * 10 + o.ph) * 0.05; }
      else { hop = Math.abs(Math.sin(o.t * (o.dash > 0 ? 16 : 9) + o.ph)) * 7; sq = 1 + Math.sin(o.t * 18 + o.ph) * 0.05; }
      o._dy = o.y - hop - o.z;
      ds(g, s, o.x, o._dy, o.sc / sq, o.sc * sq);
    } else if (k === 'shelf') {
      ds(g, A.shelf[o.v], o.x, o.y);
      for (const sl of o.slots) {
        if (sl.state === 2) continue; const set = A.doll[sl.type][sl.vr], m = sl.type === 'mat';
        if (sl.state === 1) ds(g, m ? set.R : set.sit, sl.x + rand(-2.2, 2.2), sl.y + rand(-1.5, 1.5) - 2, m ? 0.62 : 0.7);
        else ds(g, set.sit, sl.x, sl.y, m ? 0.6 : 0.68);
      }
    } else if (k === 'player') {
      const fr = P.moving ? (Math.floor(P.walk) % 2 ? 1 : 2) : 0, bob = P.moving ? Math.abs(Math.sin(P.walk * Math.PI)) * 3 : Math.sin(rt * 2.6) * 1.2;
      if (P.inv > 0 && Math.floor(rt * 18) % 2) g.globalAlpha = 0.45;
      const s = G.hurt > 0.8 ? A.pl.w : (P.face > 0 ? A.pl.R : A.pl.L)[fr];
      ds(g, s, P.x, P.y - bob);
      g.save(); g.translate(P.x + Math.cos(P.aim) * 13, P.y - 25 - bob + Math.sin(P.aim) * 5); g.rotate(P.aim); ds(g, A.torch, 0, 0); g.restore();
      g.globalAlpha = 1;
    } else if (k === 'pet') { const s = (o.k === 'kitty' ? A.kitty : A.bunny)[o.face > 0 ? 'R' : 'L']; ds(g, s, o.x, o.y - 14 - Math.sin(o.t * 4) * 4); }
    else if (k === 'box') { const b = Math.abs(Math.sin(o.t * 3)) * 6; ds(g, A.box, o.x, o.y - b, 1 + Math.sin(o.t * 6) * 0.03); }
    else if (k === 'counter') ds(g, A.counter, o.x, o.y);
    else if (k === 'case') ds(g, A.case, o.x, o.y);
  }
  // weapons
  for (let i = 0; i < P.charms.length; i += 2) ds(g, A.charm[(i >> 1) % 3], P.charms[i], P.charms[i + 1] - 22 + Math.sin(rt * 6 + i) * 3);
  for (const s of shots) {
    if (s.k === 'gloss') { g.save(); g.translate(s.x, s.y - 22); g.rotate(s.a); ds(g, A.bolt, 0, 0, s.r / 9); g.restore(); }
    else if (s.k === 'bomb') { ds(g, A.shadow, s.x, s.y, 0.7); ds(g, A.bomb, s.x, s.y - 10 - s.z); }
    else if (s.k === 'star') { if (s.t > 0) { const k = 1 - s.t / s.d; ds(g, A.fstar, s.x + k * 110, s.y - 22 - k * 380); } }
    else if (s.k === 'ball') { const q = Math.max(0, s.sq); ds(g, A.ball, s.x, s.y - 20, (1 + q * 0.45) * s.r / 13, (1 - q * 0.3) * s.r / 13); }
  }
  for (const s of eshots) ds(g, A.ebolt, s.x, s.y - 22);
  for (const p of parts) { if (p.add) continue; g.globalAlpha = Math.min(1, p.life / p.max * 1.4) * 0.8; g.drawImage(p.spr.c, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
  g.globalAlpha = 1;

  // ----- lighting -----
  const lw = lightC.width, lh = lightC.height, ls = vs * lw / cw;
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1;
  lg.fillStyle = ambient(); lg.fillRect(0, 0, lw, lh);
  lg.globalCompositeOperation = 'lighter'; lg.setTransform(ls, 0, 0, ls, -cx * ls, -cy * ls);
  const li = (c, x, y, r, a) => { lg.globalAlpha = a; lg.drawImage(A.light[c], x - r, y - r, r * 2, r * 2); };
  const dim = G.blackout > 0 ? 0.25 : 1;
  for (const d of wallDecor) {
    if (d.x < cx - 520 || d.x > cx + vw + 520) continue;
    if (d.s[0] === 'w') {
      li(pre > 0.4 ? 'warm' : 'blue', d.x, -90, 270, 0.9 * dim);
      if (cy < 420) { const gr = lg.createLinearGradient(0, 0, 0, 430); gr.addColorStop(0, pre > 0.4 ? 'rgba(255,200,150,.6)' : 'rgba(150,180,255,.5)'); gr.addColorStop(1, 'rgba(150,180,255,0)'); lg.globalAlpha = dim; lg.fillStyle = gr; lg.beginPath(); lg.moveTo(d.x - 104, 0); lg.lineTo(d.x + 104, 0); lg.lineTo(d.x + 210, 430); lg.lineTo(d.x - 150, 430); lg.closePath(); lg.fill(); }
    } else if (d.c) li(d.c === 'butter' ? 'warm' : d.c, d.x, -70, 250, (0.75 + 0.1 * Math.sin(rt * 9 + d.x) + (Math.random() < 0.03 ? -0.4 : 0)) * dim);
  }
  for (const o of dl) {
    if (o.kind === 'shelf') { lg.globalAlpha = 0.3 * dim; lg.drawImage(A.light.pink, o.x - 70, o.y - 150, 560, 270); }
    else if (o.kind === 'case') li('mint', o.x + 50, o.y - 10, 200, 0.85 * dim);
    else if (o.kind === 'counter') li('mint', o.x + 95, o.y - 20, 150, 0.6 * dim);
    else if (o.kind === 'box') li('pink', o.x, o.y - 20, 190, 0.9);
    else if (o.kind === 'enemy' && o.boss) { li('red', o.x, o.y - 110, 360, 0.85); li('white', o.x, o.y - 170, 190, 0.75); }
    else if (o.kind === 'pet') li(o.k === 'kitty' ? 'mint' : 'pink', o.x, o.y - 14, 70, 0.5);
  }
  li('white', P.x, P.y - 22, 235, 0.95);
  lg.save(); lg.translate(P.x, P.y - 24); lg.rotate(P.aim); lg.globalAlpha = 1; lg.drawImage(A.cone, 0, -270, 540, 540); lg.restore();
  if (P.auraR) li('pink', P.x, P.y, P.auraR * 1.7, 0.45);
  for (const s of shots) { if (s.k === 'gloss') li('pink', s.x, s.y - 22, 80, 0.7); else if (s.k === 'ball') li('mint', s.x, s.y - 20, 90, 0.6); }
  for (const s of eshots) li('red', s.x, s.y - 22, 60, 0.7);
  for (const f of flashes) { const k = f.t / f.d; li(f.col, f.x, f.y, f.r * (0.6 + 0.4 * k), 1 - k); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(lightC, 0, 0, cw, ch);

  // ----- glow pass -----
  g.setTransform(vs, 0, 0, vs, ox, oy); g.globalCompositeOperation = 'lighter';
  for (const d of wallDecor) if (d.c && d.x > cx - 150 && d.x < cx + vw + 150) { g.globalAlpha = (0.42 + 0.08 * Math.sin(rt * 9 + d.x)) * dim; ds(g, A.glow[d.c], d.x, -90, 3.4); }
  for (const o of dl) {
    const k = o.kind;
    if (k === 'shelf') {
      g.globalAlpha = (0.6 + 0.25 * Math.sin(rt * 2.4 + o.x)) * dim; ds(g, A.shelfGlow, o.x, o.y);
      for (const sl of o.slots) {
        let a = 0; if (sl.state === 1) a = 1; else if (sl.state === 0 && sl.blink < 0) a = Math.sin(-sl.blink / 0.6 * Math.PI) * 0.9;
        if (a > 0.02) { const m = sl.type === 'mat', sc = m ? 0.6 : 0.68; g.globalAlpha = a; ds(g, A.eye[sl.type], sl.x, sl.y - (m ? 44.5 : 32.5) * sc, sc * 1.15); }
      }
    } else if (k === 'enemy') { g.globalAlpha = o.boss ? 0.95 : 0.62; ds(g, A.eye[o.type], o.x, o._dy - o.eye, o.boss ? 3 : o.sc); }
    else if (k === 'box') { g.globalAlpha = 0.35 + 0.15 * Math.sin(rt * 5); g.drawImage(A.glow.pink.c, o.x - 34, o.y - 360, 68, 380); g.globalAlpha = 0.5; ds(g, A.glow.butter, o.x, o.y - 24, 1.6); }
    else if (k === 'pet') { g.globalAlpha = 0.35; ds(g, A.glow[o.k === 'kitty' ? 'mint' : 'lilac'], o.x, o.y - 26, 1.1); }
    else if (k === 'case') { g.globalAlpha = 0.3; ds(g, A.glow.mint, o.x + 50, o.y - 20, 2.6); }
  }
  for (const q of gems) { if (q.x < L || q.x > R || q.y < T || q.y > B) continue; g.globalAlpha = 0.4 + 0.25 * Math.sin(q.t * 6); ds(g, A.glow[A.gemGlow[q.k]], q.x, q.y - 12, 0.55); }
  g.globalAlpha = 0.6;
  for (let i = 0; i < P.charms.length; i += 2) ds(g, A.glow.butter, P.charms[i], P.charms[i + 1] - 22, 0.8);
  for (const s of shots) {
    if (s.k === 'gloss') ds(g, A.glow.pink, s.x, s.y - 22, 0.9);
    else if (s.k === 'bomb') ds(g, A.glow.lilac, s.x, s.y - 10 - s.z, 0.9);
    else if (s.k === 'star' && s.t > 0) { const k = 1 - s.t / s.d; ds(g, A.glow.butter, s.x + k * 110, s.y - 22 - k * 380, 1.5); }
    else if (s.k === 'ball') ds(g, A.glow.mint, s.x, s.y - 20, 0.8);
  }
  g.globalAlpha = 0.8; for (const s of eshots) ds(g, A.glow.red, s.x, s.y - 22, 0.9);
  g.globalAlpha = 0.55; ds(g, A.glow.butter, P.x + Math.cos(P.aim) * 24, P.y - 25 + Math.sin(P.aim) * 9, 0.6);
  for (const p of parts) { if (!p.add) continue; g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.drawImage(p.spr.c, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
  for (const r of rings) { const k = r.t / r.d; g.globalAlpha = r.warn ? 0.9 : 1 - k; g.strokeStyle = `rgb(${RINGC[r.col] || RINGC.pink})`; g.lineWidth = r.lw * (1 - k * 0.5); const q = lerp(r.r0, r.r1, 1 - (1 - k) * (1 - k)); ell(g, r.x, r.y, q, q * 0.8); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  for (const n of nums) {
    const k = n.t / 0.75, sc = (n.t < 0.08 ? lerp(0.5, 1.4, n.t / 0.08) : lerp(1.4, 1, Math.min(1, (n.t - 0.08) / 0.12))) * (n.big ? 1.05 : 0.9);
    g.globalAlpha = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1; ds(g, n.s, n.x + n.vx * n.t, n.y - n.t * 48, sc);
  }
  // ----- screen space -----
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (G.dawn > 0) { g.globalAlpha = G.dawn * 0.38; g.fillStyle = '#ffd9a8'; g.fillRect(0, 0, cw, ch); }
  g.globalAlpha = 1 - G.dawn * 0.8; g.drawImage(A.vig, 0, 0, cw, ch);
  let ra = G.hurt * 0.8; if (st === 'play' && P.hp < P.maxhp * 0.3) ra = Math.max(ra, 0.28 + 0.18 * Math.sin(rt * 7));
  if (st === 'dying') ra = Math.max(ra, Math.min(0.9, G.stateT));
  if (ra > 0.01) { g.globalAlpha = Math.min(1, ra); g.drawImage(A.vigRed, 0, 0, cw, ch); }
  g.globalAlpha = 1;
  if (st === 'play' || st === 'levelup' || st === 'pause') { g.setTransform(UI.ps, 0, 0, UI.ps, 0, 0); hud(g); }
}
function drawScare(g, cw, ch) {
  const t = G.state === 'over' ? 0.85 : G.stateT;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = Math.floor(t * 30) % 3 === 0 && G.state !== 'over' ? '#4a0026' : '#0a0010'; g.fillRect(0, 0, cw, ch);
  const k = (0.66 * ch / 132) * lerp(0.5, 1, 1 - Math.pow(1 - Math.min(1, t / 0.14), 3)) * (1 + t * 0.14), j = G.state === 'over' ? 0 : ch * 0.014;
  g.setTransform(k, 0, 0, k, cw / 2 + rand(-j, j), ch / 2 + 176 * k + rand(-j, j));
  ds(g, A.boss.R, 0, 0); g.globalCompositeOperation = 'lighter'; ds(g, A.eye.boss, 0, -166, 3.4);
  g.globalCompositeOperation = 'source-over'; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.85; g.drawImage(A.vigRed, 0, 0, cw, ch); g.drawImage(A.vig, 0, 0, cw, ch); g.globalAlpha = 1;
}
function txt(g, s, x, y, sz, col, al = 'left', sw = 0, sc = INK) { g.font = `700 ${sz}px ${FONT_UI}`; g.textAlign = al; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (sw) { g.lineWidth = sw; g.strokeStyle = sc; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); }
function hud(g) {
  const u = UI.u, w = UI.w, h = UI.h, bh = 13 * u;
  g.fillStyle = 'rgba(18,11,36,.9)'; g.fillRect(0, 0, w, bh + 5 * u);
  const f = clamp(P.xp / P.need, 0, 1), gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, C.hot); gr.addColorStop(0.5, C.lilac); gr.addColorStop(1, C.mint);
  if (f > 0) { g.fillStyle = gr; rr(g, 3 * u, 2.5 * u, Math.max(bh, (w - 6 * u) * f), bh, bh / 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(3 * u + bh / 2, 4.5 * u, Math.max(0, (w - 6 * u) * f - bh), 2.5 * u); }
  const ly = bh + 28 * u;
  rr(g, 12 * u, ly - 14 * u, 76 * u, 28 * u, 14 * u); fs(g, '#2f2157', 2.5 * u, C.butter); txt(g, 'LV ' + P.lvl, 50 * u, ly + 1 * u, 16 * u, C.butter, 'center');
  const hx = 112 * u, hw = 190 * u, hh = 20 * u, hf = clamp(P.hp / P.maxhp, 0, 1);
  rr(g, hx, ly - hh / 2, hw, hh, hh / 2); fs(g, 'rgba(18,11,36,.88)', 2.5 * u, INK);
  if (hf > 0) { rr(g, hx + 2.5 * u, ly - hh / 2 + 2.5 * u, Math.max(hh - 5 * u, (hw - 5 * u) * hf), hh - 5 * u, hh / 2); g.fillStyle = hf < 0.3 ? '#ff3355' : C.hot; g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(hx + 12 * u, ly - hh / 2 + 5 * u, Math.max(0, (hw - 5 * u) * hf - 20 * u), 3 * u); }
  heart(g, hx - 1 * u, ly - 1 * u, 11 * u); fs(g, '#ff4f7f', 2.5 * u);
  const rem = Math.max(0, NIGHT - G.t), mm = Math.floor(rem / 60), ss = Math.floor(rem % 60);
  txt(g, mm + ':' + (ss < 10 ? '0' : '') + ss, w / 2, bh + 30 * u, 36 * u, rem < 30 ? C.butter : '#fff6fb', 'center', 6 * u);
  txt(g, G.boss ? 'SHE IS AWAKE' : 'UNTIL DAWN', w / 2, bh + 56 * u, 11.5 * u, G.boss ? '#ff6f8f' : C.butter, 'center', 3.5 * u);
  const kx = w - 124;
  txt(g, String(G.kills), kx, ly, 20 * u, '#fff6fb', 'right', 5 * u);
  const tw = g.measureText(String(G.kills)).width, ix = kx - tw - 16 * u;
  circ(g, ix, ly, 10 * u); fs(g, '#f8dcc6', 2.2 * u); g.lineWidth = 2 * u; g.strokeStyle = INK; g.beginPath(); for (const s of [-1, 1]) { g.moveTo(ix + s * 4 * u - 2 * u, ly - 3 * u); g.lineTo(ix + s * 4 * u + 2 * u, ly + 1 * u); g.moveTo(ix + s * 4 * u + 2 * u, ly - 3 * u); g.lineTo(ix + s * 4 * u - 2 * u, ly + 1 * u); } g.stroke();
  if (G.boss) {
    const bw = Math.min(540 * u, w * 0.64), bx = (w - bw) / 2, by = h - 40 * u, bf = clamp(G.boss.hp / G.boss.maxhp, 0, 1);
    txt(g, 'MADAME PORCELAIN', w / 2, by - 15 * u, 14 * u, '#ff8fa8', 'center', 4 * u);
    rr(g, bx, by, bw, 16 * u, 8 * u); fs(g, 'rgba(18,11,36,.9)', 2.5 * u, INK); if (bf > 0) { rr(g, bx + 2.5 * u, by + 2.5 * u, Math.max(11 * u, (bw - 5 * u) * bf), 11 * u, 6 * u); g.fillStyle = '#ff3355'; g.fill(); }
  }
  // off-screen pointers
  const k = VIEW.vs / UI.ps, ptr = (wx, wy, col) => {
    const sx = (wx - VIEW.cx) * k, sy = (wy - VIEW.cy) * k, m = 34 * u; if (sx > m && sx < w - m && sy > 70 * u && sy < h - m) return;
    const px = clamp(sx, m, w - m), py = clamp(sy, 78 * u, h - m), a = Math.atan2(sy - py, sx - px), p = 1 + 0.15 * Math.sin(G.rt * 8);
    g.save(); g.translate(px, py); g.rotate(a); g.scale(u * p, u * p); g.beginPath(); g.moveTo(16, 0); g.lineTo(-8, -13); g.lineTo(-2, 0); g.lineTo(-8, 13); g.closePath(); fs(g, col, 3); g.restore();
  };
  for (const b of boxes) ptr(b.x, b.y - 30, C.butter);
  if (G.boss) ptr(G.boss.x, G.boss.y - 110, '#ff3355');
  if (joy.on && G.state === 'play') {
    const R = 56 * u; g.globalAlpha = 0.9; circ(g, joy.bx, joy.by, R); g.fillStyle = 'rgba(255,143,208,.1)'; g.fill(); g.lineWidth = 3 * u; g.strokeStyle = 'rgba(255,143,208,.55)'; g.stroke();
    circ(g, joy.bx + joy.dx * R, joy.by + joy.dy * R, 25 * u); g.fillStyle = 'rgba(255,246,251,.8)'; g.fill(); g.lineWidth = 3 * u; g.strokeStyle = 'rgba(255,79,163,.8)'; g.stroke(); g.globalAlpha = 1;
  }
}

// ---------- DOM ui ----------
const $ = id => document.getElementById(id);
const show = (id, on = true) => $(id).classList.toggle('on', on);
function banner(t, s) { const b = $('banner'); $('bt').textContent = t; $('bs').textContent = s || ''; b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); }
function hideHud() { show('btns', false); }
let cardLock = false, cardAt = 0;
function showCards(ch) {
  const box = $('cards'); box.innerHTML = ''; $('lvn').textContent = 'LEVEL ' + P.lvl; cardLock = false; cardAt = performance.now();
  for (const u of ch) {
    const L = u.id === 'cake' ? 0 : lv(u.id), el = document.createElement('button'); el.className = 'card'; el.style.setProperty('--c', CATC[u.cat]);
    const ic = document.createElement('canvas'); ic.width = ic.height = 192; ic.getContext('2d').drawImage(A.icon[u.id], 0, 0); el.appendChild(ic);
    let pips = ''; if (u.id !== 'cake') for (let i = 0; i < 5; i++) pips += `<i class="${i < L ? 'f' : i === L ? 'n' : ''}"></i>`;
    el.insertAdjacentHTML('beforeend', `<span class="tag">${L === 0 && u.id !== 'cake' ? 'NEW · ' : ''}${u.cat}</span><h3>${u.name}</h3><p>${Array.isArray(u.desc) ? u.desc[L] : u.desc}</p><div class="pips">${pips}</div>`);
    el.addEventListener('click', () => {
      if (cardLock || performance.now() - cardAt < 380) return; cardLock = true; el.classList.add('sel'); for (const o of box.children) if (o !== el) o.classList.add('dim'); sfx('pick');
      setTimeout(() => { applyUpgrade(u.id); show('levelup', false); P.inv = Math.max(P.inv, 0.9); G.state = 'play'; }, 280);
    });
    box.appendChild(el);
  }
  show('levelup');
}
const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
function stats(el, arr) { el.innerHTML = arr.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join(''); }
function store(k, v) { try { if (v === undefined) return +localStorage.getItem(k) || 0; localStorage.setItem(k, v); } catch (e) { } return 0; }
function showOver() {
  const best = Math.max(store('dss_best'), G.t); store('dss_best', best);
  stats($('oStats'), [[fmt(G.t), 'survived'], [G.kills, 'dolls stopped'], [P.lvl, 'level'], [fmt(best), 'best night']]); show('over');
}
function showWin() {
  store('dss_best', NIGHT); store('dss_wins', store('dss_wins') + 1);
  stats($('wStats'), [[G.kills, 'dolls stopped'], [P.lvl, 'level'], [G.bossDead ? 'Shattered' : 'Escaped', 'Madame Porcelain']]); show('win');
}
function startRun() {
  initAudio(); reset(); G.state = 'play'; G.spawnAcc = 2; AU.mode = 'game'; AU.layer = 0; AU.step = 0;
  for (const id of ['title', 'over', 'win', 'pause', 'levelup']) show(id, false); show('btns');
  banner('SURVIVE UNTIL DAWN', 'Drag anywhere to move');
}
function setPause(p) { if (p && G.state === 'play') { G.state = 'pause'; show('pause'); joy.on = false; joy.dx = joy.dy = 0; } else if (!p && G.state === 'pause') { G.state = 'play'; show('pause', false); } }
for (const id of ['bStart', 'bRetry', 'bAgain', 'bQuit']) $(id).addEventListener('click', startRun);
$('bPause').addEventListener('click', () => setPause(true)); $('bResume').addEventListener('click', () => setPause(false));
$('bMute').addEventListener('click', () => { initAudio(); setMuted(!AU.muted); $('bMute').classList.toggle('off', AU.muted); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { setPause(true); if (AU.ctx) AU.ctx.suspend(); } else if (AU.ctx) AU.ctx.resume(); });

// ---------- input ----------
function joyMove(e) {
  joy.x = e.clientX; joy.y = e.clientY; const R = 56 * UI.u; let dx = joy.x - joy.bx, dy = joy.y - joy.by, d = Math.hypot(dx, dy);
  if (d > R * 1.3) { const k = (d - R * 1.3) / d; joy.bx += dx * k; joy.by += dy * k; dx = joy.x - joy.bx; dy = joy.y - joy.by; d = Math.hypot(dx, dy); }
  if (d < 5) { joy.dx = joy.dy = 0; return; } const m = Math.min(1, d / R); joy.dx = dx / d * m; joy.dy = dy / d * m;
}
canvas.addEventListener('pointerdown', e => { e.preventDefault(); if (AU.ctx && AU.ctx.state !== 'running') AU.ctx.resume(); if (G.state !== 'play' || joy.on) return; joy.on = true; joy.id = e.pointerId; joy.bx = joy.x = e.clientX; joy.by = joy.y = e.clientY; joy.dx = joy.dy = 0; try { canvas.setPointerCapture(e.pointerId); } catch (err) { } });
canvas.addEventListener('pointermove', e => { if (joy.on && e.pointerId === joy.id) { e.preventDefault(); joyMove(e); } });
const joyEnd = e => { if (e.pointerId === joy.id) { joy.on = false; joy.dx = joy.dy = 0; } };
canvas.addEventListener('pointerup', joyEnd); canvas.addEventListener('pointercancel', joyEnd); canvas.addEventListener('lostpointercapture', joyEnd);
for (const ev of ['touchstart', 'touchmove', 'touchend']) document.addEventListener(ev, e => { if (!(e.target.closest && e.target.closest('button'))) e.preventDefault(); }, { passive: false });
for (const ev of ['gesturestart', 'gesturechange', 'dblclick', 'contextmenu']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
const keys = {};
function keySync() { key.x = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0); key.y = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0); }
window.addEventListener('keydown', e => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true; keySync(); if (e.key === 'Escape' || e.key === 'p') setPause(G.state === 'play'); if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; keySync(); });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; keySync(); });
window.addEventListener('resize', resize); window.addEventListener('orientationchange', () => setTimeout(resize, 200));

// ---------- loop ----------
let last = 0, slow = 0; const perf = { ms: 0, fps: 60 };
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000; last = now; if (!(dt > 0)) dt = 1 / 60; perf.fps = lerp(perf.fps, 1 / dt, 0.05); if (dt > 0.05) dt = 0.05;
  if (G.state === 'play') { if (perf.fps < 44) slow += dt; else slow = 0; if (slow > 2.5 && UI.ps > 1) { qual = Math.max(1, UI.ps - 0.25); slow = 0; resize(); } }
  const t0 = performance.now();
  for (let i = 0; i < G.ts; i++) update(dt);
  render(dt);
  perf.ms = lerp(perf.ms, performance.now() - t0, 0.1);
}
function boot() {
  buildArt(); buildWorld(); reset(); G.state = 'title'; G.lightT = 2.5; resize();
  requestAnimationFrame(t => { last = t; frame(t); });
}
const fontsReady = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('700 20px Fredoka'), document.fonts.load('30px "Rubik Wet Paint"')]).catch(() => { }) : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(boot);
window.__ds = { G, sim, perf, UI, VIEW, enemies, gems, start: startRun, apply: applyUpgrade, spawn: spawnEnemy, get P() { return P; } };

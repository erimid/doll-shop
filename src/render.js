// ---------- canvas / view ----------
const canvas = document.getElementById('game'), ctx = canvas.getContext('2d', { alpha: false });
const VIEW = { w: 0, h: 0, vs: 1, cx: 0, cy: 0 }, UI = { w: 0, h: 0, u: 1, ps: 1 }, cam = { x: 2400, y: 1810 };
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
  document.documentElement.style.setProperty('--u', UI.u);
}
function camera(dt) {
  let tx, ty, f;
  if (G.state === 'title') { tx = 2400 + Math.cos(G.rt * 0.045) * 1500; ty = 1800 + Math.sin(G.rt * 0.07) * 1050; f = 1 - Math.exp(-1.2 * dt); }
  else { tx = P.x + P.vx * 0.2; ty = P.y + P.vy * 0.2 - 24; f = 1 - Math.exp(-6 * dt); }
  cam.x = lerp(cam.x, tx, f); cam.y = lerp(cam.y, ty, f);
  VIEW.cx = VIEW.w > W ? (W - VIEW.w) / 2 : clamp(cam.x - VIEW.w / 2, 0, W - VIEW.w);
  VIEW.cy = clamp(cam.y - VIEW.h / 2, -WALLH, Math.max(-WALLH, H - VIEW.h));
}
const dawnPre = () => G.state === 'title' || !G.mode || G.mode.len > 1e8 ? 0 : clamp((G.t - (G.mode.len - 50)) / 50, 0, 1);
function ambient(z, pre) {
  let r = 96, gg = 78, b = 170;
  if (G.state !== 'title') { const k = clamp(G.t / 240, 0, 1); r = lerp(60, 36, k); gg = lerp(48, 27, k); b = lerp(108, 78, k); }
  if (z) { r *= z.amb[0]; gg *= z.amb[1]; b *= z.amb[2]; }
  if (G.dare && G.dare.dark && G.state !== 'title') { r *= 0.38; gg *= 0.38; b *= 0.5; }
  if (G.flick > 0 && G.state !== 'title') { const q = Math.sin(G.rt * 47) > -0.2 || Math.random() < 0.3 ? 0.22 : 0.8; r *= q; gg *= q; b *= q; }
  if (G.blackout > 0) { const q = Math.min(1, G.blackout * 3) * (Math.random() < 0.07 ? 0.35 : 1); r = lerp(r, 8, q); gg = lerp(gg, 6, q); b = lerp(b, 22, q); }
  r = lerp(r, 150, pre * 0.5); gg = lerp(gg, 96, pre * 0.5); b = lerp(b, 120, pre * 0.3);
  if (G.dawn > 0) { r = lerp(r, 255, G.dawn); gg = lerp(gg, 230, G.dawn); b = lerp(b, 208, G.dawn); }
  if (G.state === 'dying') { r += 60 * Math.min(1, G.stateT); }
  const f = G.flash; r += 150 * f; gg += 170 * f; b += 255 * f;
  return `rgb(${Math.min(255, r | 0)},${Math.min(255, gg | 0)},${Math.min(255, b | 0)})`;
}
const RINGC = { red: '255,70,100', pink: '255,120,200', butter: '255,225,130', mint: '120,255,220' };
const ZC = { antique: '#8a3450', boutique: '#d277aa', nursery: '#7fa8e6', plush: '#5fc0a0', main: '#8c76da', arcade: '#3f38b8', workshop: '#4f8a62', checkout: '#a58ad8', stock: '#50508a' };
const slotEye = t => t === 'mat' ? 44.5 : t === 'teddy' || t === 'robot' || t === 'jack' || t === 'manne' ? ET[t].eye : 32.5;
const dl = [];
function render(dt) {
  const g = ctx, vs = VIEW.vs, cw = canvas.width, ch = canvas.height, rt = G.rt, st = G.state;
  camera(dt);
  if (st === 'scare' || st === 'over') { drawScare(g, cw, ch); return; }
  const cx = VIEW.cx + (Math.random() - 0.5) * 2 * G.shake, cy = VIEW.cy + (Math.random() - 0.5) * 2 * G.shake, vw = VIEW.w, vh = VIEW.h;
  const ox = -Math.round(cx * vs), oy = -Math.round(cy * vs), pre = dawnPre();
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#0c0718'; g.fillRect(0, 0, cw, ch);
  g.setTransform(vs, 0, 0, vs, ox, oy);
  // floor + wall
  for (let y = Math.max(0, Math.floor(cy / 200) * 200); y < Math.min(H, cy + vh); y += 200) for (let x = Math.max(0, Math.floor(cx / 200) * 200); x < Math.min(W, cx + vw); x += 200) g.drawImage(A.tiles[zoneAt(x + 1, y + 1).id].c, x, y, 200.7, 200.7);
  g.fillStyle = 'rgba(12,6,30,.55)';
  for (let i = 1; i < 3; i++) { const bx = i * ZW; if (bx > cx - 10 && bx < cx + vw + 10) g.fillRect(bx - 5, Math.max(0, cy), 10, vh + 10); const by = i * ZH; if (by > cy - 10 && by < cy + vh + 10) g.fillRect(cx, by - 5, vw, 10); }
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
  for (const s of solids) if (s.x < R && s.x + s.w > L && s.y < B + 90 && s.y + s.h > T - 40) dl.push(s);
  for (const l of lairs) if (l.x > L && l.x < R && l.y > T && l.y < B) dl.push(l);
  for (const e of enemies) if (!e.dead && e.x > L && e.x < R && e.y > T && e.y < B + (e.boss ? 280 : 0)) dl.push(e);
  for (const b of boxes) if (b.x > L && b.x < R && b.y > T && b.y < B) dl.push(b);
  for (const p of pets) dl.push(p);
  for (const o of toys) dl.push(o);
  dl.push(P);
  dl.sort((a, b) => a.sy - b.sy);
  // ground effects + shadows
  if (P.auraR) { g.globalAlpha = 0.2 + 0.04 * Math.sin(rt * 4); g.drawImage(A.glow[lv('aura') === 6 ? 'mint' : 'pink'].c, P.x - P.auraR * 1.25, P.y - P.auraR, P.auraR * 2.5, P.auraR * 2); g.globalAlpha = 1; }
  const FC = ['pink', 'butter', 'mint', 'blue', 'lilac'];
  for (const f of fields) { g.globalAlpha = (f.q ? 0.42 : 0.3) * Math.min(1, (f.d - f.t) * 2); g.drawImage(A.glow[f.rb ? FC[((f.x + f.y) * 0.02 | 0) % 5] : 'pink'].c, f.x - f.r * 1.3, f.y - f.r * 1.04, f.r * 2.6, f.r * 2.08); } g.globalAlpha = 1;
  for (const o of dl) {
    const k = o.kind;
    if (k === 'enemy') { ds(g, A.shadow, o.x, o.y, o.r / 11 * Math.max(0.35, 1 - o.z / 300)); if (o.elite) { g.globalAlpha = 0.75; g.strokeStyle = C.butter; g.lineWidth = 3; ell(g, o.x, o.y, o.r * 1.5, o.r * 0.75); g.stroke(); g.globalAlpha = 1; } }
    else if (k === 'player' || k === 'box') ds(g, A.shadow, o.x, o.y, 1.3);
    else if (k === 'pet') ds(g, A.shadow, o.x, o.y + 6, 0.8);
    else if (k === 'toy') ds(g, A.shadow, o.x, o.y, 1);
    else if (k === 'lair') { ds(g, A.shadow, o.x, o.y, 2.4); if (!o.used) { g.globalAlpha = 0.35 + 0.2 * Math.sin(rt * 3); g.strokeStyle = '#ff3355'; g.lineWidth = 3; g.setLineDash([10, 8]); ell(g, o.x, o.y, 62, 50); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; } }
    else { g.fillStyle = 'rgba(10,5,30,.4)'; rr(g, o.x - 6, o.y + o.h - 8, o.w + 12, 18, 8); g.fill(); }
  }
  for (const z of ezones) { const k = Math.min(1, z.t / z.d); g.globalAlpha = 0.13 + 0.1 * k; g.fillStyle = '#ff3355'; ell(g, z.x, z.y, z.r, z.r * 0.8); g.fill(); g.globalAlpha = 0.3 + 0.3 * k; ell(g, z.x, z.y, z.r * k, z.r * 0.8 * k); g.fill(); g.globalAlpha = 0.9; g.strokeStyle = '#ff6f8f'; g.lineWidth = 2.5; ell(g, z.x, z.y, z.r, z.r * 0.8); g.stroke(); }
  g.globalAlpha = 1;
  for (const s of shots) if (s.k === 'star' && s.t > 0) { g.globalAlpha = 0.5; g.strokeStyle = C.butter; g.lineWidth = 3; ell(g, s.x, s.y, s.rad * 0.7, s.rad * 0.5); g.stroke(); g.globalAlpha = 1; }
  for (const q of gems) { if (q.x < L || q.x > R || q.y < T || q.y > B) continue; ds(g, A.gem[q.k], q.x, q.y - 12 + Math.sin(q.t * 5) * 3); }
  // sorted entities
  for (const o of dl) {
    const k = o.kind;
    if (k === 'enemy') {
      const set = o.spr, s = o.flash > 0 ? (o.face > 0 ? set.wR : set.wL) : (o.face > 0 ? set.R : set.L);
      let hop, sq;
      if (o.boss) { hop = Math.abs(Math.sin(o.t * 3.2)) * 10; sq = 1 + Math.sin(o.t * 6.4) * 0.02; if (o.act === 'stomp') { hop = (0.85 - o.acT) * 70; sq = 1.06; } }
      else if (o.type === 'mat' || o.type === 'teddy') { hop = Math.abs(Math.sin(o.t * 5 + o.ph)) * 4; sq = 1 + Math.sin(o.t * 10 + o.ph) * 0.05; }
      else if (o.ai === 'blink' || o.ai === 'leap' || (o.ai === 'weep' && o.lit)) { hop = 0; sq = 1 + Math.sin(o.t * 3 + o.ph) * 0.015; }
      else { hop = Math.abs(Math.sin(o.t * (o.dash > 0 ? 16 : 9) + o.ph)) * 7; sq = 1 + Math.sin(o.t * 18 + o.ph) * 0.05; }
      o._dy = o.y - hop - o.z;
      if (o.fade > 0) g.globalAlpha = clamp(1 - o.fade / 0.65, 0.1, 1) * 0.9;
      ds(g, s, o.x, o._dy, o.sc / sq, o.sc * sq); g.globalAlpha = 1;
    } else if (k === 'shelf') {
      ds(g, A.shelves[o.z.id][o.v], o.x, o.y);
      for (const sl of o.slots) {
        if (sl.state === 2) continue; const sets = A.doll[sl.type], set = sets[sl.vr % sets.length], m = sl.type === 'mat';
        if (sl.state === 1) ds(g, m ? set.R : set.sit, sl.x + rand(-2.2, 2.2), sl.y + rand(-1.5, 1.5) - 2, m ? 0.62 : 0.7);
        else ds(g, set.sit, sl.x, sl.y, m ? 0.6 : 0.68);
      }
    } else if (k === 'player') {
      const fr = P.moving ? (Math.floor(P.walk) % 2 ? 1 : 2) : 0, bob = P.moving ? Math.abs(Math.sin(P.walk * Math.PI)) * 3 : Math.sin(rt * 2.6) * 1.2, pl = A.pl;
      if (P.inv > 0 && Math.floor(rt * 18) % 2) g.globalAlpha = 0.45;
      let s; if (G.hurt > 0.8) s = pl.w; else if (P.back) s = (P.face > 0 ? pl.bR : pl.bL)[fr]; else if (!P.moving && P.blinkT < 0) s = P.face > 0 ? pl.blink : pl.blinkL; else s = (P.face > 0 ? pl.R : pl.L)[fr];
      const torch = () => { g.save(); g.translate(P.x + Math.cos(P.aim) * 14, P.y - 28 - bob + Math.sin(P.aim) * 5); g.rotate(P.aim); ds(g, A.torch, 0, 0, 1.1); g.restore(); };
      if (P.back) torch(); ds(g, s, P.x, P.y - bob, 1.12); if (!P.back) torch();
      g.globalAlpha = 1;
      if (P.shieldUp) { g.globalAlpha = 0.7 + 0.2 * Math.sin(rt * 4); ds(g, A.bub, P.x, P.y - 34, 1.55); g.globalAlpha = 1; }
    } else if (k === 'pet') { const s = (o.k === 'kitty' ? A.kitty : A.bunny)[o.face > 0 ? 'R' : 'L']; ds(g, s, o.x, o.y - 14 - Math.sin(o.t * 4) * 4); }
    else if (k === 'box') { const b = Math.abs(Math.sin(o.t * 3)) * 6; ds(g, o.gold ? A.gbox : A.box, o.x, o.y - b, (o.gold ? 1.15 : 1) * (1 + Math.sin(o.t * 6) * 0.03)); }
    else if (k === 'toy') { if (o.life - o.t > 1.2 || Math.floor(rt * 12) % 2) ds(g, A.soldier[o.face > 0 ? 'R' : 'L'], o.x, o.y - Math.abs(Math.sin(o.t * 6)) * 2); }
    else if (k === 'prop') ds(g, A.prop[o.spr], o.x, o.y);
    else if (k === 'lair') ds(g, o.used ? A.prop.used : A.prop.pedestal, o.x, o.y - (o.used ? 0 : Math.abs(Math.sin(rt * 2)) * 3));
  }
  // weapons
  for (let i = 0; i < P.charms.length; i += 2) ds(g, A.charm[(i >> 1) % 3], P.charms[i], P.charms[i + 1] - 22 + Math.sin(rt * 6 + i) * 3);
  for (const s of shots) {
    if (s.k === 'gloss') { g.save(); g.translate(s.x, s.y - 22); g.rotate(s.a); ds(g, A.bolt, 0, 0, s.r / 9); g.restore(); }
    else if (s.k === 'bomb') { ds(g, A.shadow, s.x, s.y, 0.7); ds(g, A.bomb, s.x, s.y - 10 - s.z); }
    else if (s.k === 'star') { if (s.t > 0) { const k = 1 - s.t / s.d; ds(g, A.fstar, s.x + k * 110, s.y - 22 - k * 380, s.rad > 80 ? 1.7 : 1); } }
    else if (s.k === 'ball') { const q = Math.max(0, s.sq); ds(g, A.ball, s.x, s.y - 20, (1 + q * 0.45) * s.r / 13, (1 - q * 0.3) * s.r / 13); }
    else if (s.k === 'bub') { g.globalAlpha = 0.9; ds(g, A.bub, s.x, s.y - 22 + Math.sin(s.t * 3) * 3, s.r / 26); g.globalAlpha = 1; }
    else if (s.k === 'scis') { g.save(); g.translate(s.x, s.y - 22); g.rotate(s.t * 22); ds(g, A.scis, 0, 0, s.r / 20); g.restore(); }
  }
  for (const s of eshots) ds(g, A.ebolt, s.x, s.y - 22, s.r / 9);
  for (const p of parts) { if (p.add) continue; g.globalAlpha = Math.min(1, p.life / p.max * 1.4) * 0.8; g.drawImage(p.spr.c, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
  g.globalAlpha = 1;

  // ----- lighting -----
  const lw = lightC.width, lh = lightC.height, ls = vs * lw / cw;
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1;
  lg.fillStyle = ambient(null, pre); lg.fillRect(0, 0, lw, lh);
  lg.setTransform(ls, 0, 0, ls, -cx * ls, -cy * ls);
  for (const z of ZONES) if (z.id !== 'main' && z.id !== 'checkout' && z.x < cx + vw && z.x + ZW > cx && z.y < cy + vh && z.y + ZH > cy) { lg.fillStyle = ambient(z, pre); lg.fillRect(z.x, z.y, ZW, ZH); }
  lg.globalCompositeOperation = 'lighter';
  const li = (c, x, y, r, a) => { lg.globalAlpha = a; lg.drawImage(A.light[c], x - r, y - r, r * 2, r * 2); };
  const dim = G.blackout > 0 ? 0.25 : G.flick > 0 ? (Math.sin(rt * 47) > -0.2 ? 0.3 : 0.9) : 1;
  for (const d of wallDecor) {
    if (d.x < cx - 520 || d.x > cx + vw + 520 || cy > 500) continue;
    if (d.s[0] === 'w') {
      li(pre > 0.4 ? 'warm' : 'blue', d.x, -90, 270, 0.9 * dim);
      if (cy < 420) { const gr = lg.createLinearGradient(0, 0, 0, 430); gr.addColorStop(0, pre > 0.4 ? 'rgba(255,200,150,.6)' : 'rgba(150,180,255,.5)'); gr.addColorStop(1, 'rgba(150,180,255,0)'); lg.globalAlpha = dim; lg.fillStyle = gr; lg.beginPath(); lg.moveTo(d.x - 104, 0); lg.lineTo(d.x + 104, 0); lg.lineTo(d.x + 210, 430); lg.lineTo(d.x - 150, 430); lg.closePath(); lg.fill(); }
    } else if (d.c) li(d.c === 'butter' ? 'warm' : d.c, d.x, -70, 250, (0.75 + 0.1 * Math.sin(rt * 9 + d.x) + (Math.random() < 0.03 ? -0.4 : 0)) * dim);
  }
  for (const l of lights) { if (l.x < cx - l.r || l.x > cx + vw + l.r || l.y < cy - l.r || l.y > cy + vh + l.r) continue; let a = l.a; if (l.fl) a *= 1 - l.fl * (0.5 + 0.5 * Math.sin(rt * 13 + l.x)) * (Math.sin(rt * 2.3 + l.y) > 0.2 ? 1 : 0.15) - (Math.random() < l.fl * 0.08 ? 0.5 : 0); if (a > 0.02) li(l.c, l.x, l.y, l.r, a * dim); }
  for (const o of dl) {
    const k = o.kind;
    if (k === 'shelf') { lg.globalAlpha = 0.3 * dim; lg.drawImage(A.light[o.z.lc], o.x - 70, o.y - 150, 560, 270); }
    else if (k === 'box') li(o.gold ? 'warm' : 'pink', o.x, o.y - 20, o.gold ? 260 : 190, 0.9);
    else if (k === 'lair') { if (!o.used) li('red', o.x, o.y - 30, 230, (0.6 + 0.25 * Math.sin(rt * 3)) * dim); }
    else if (k === 'enemy' && o.boss) { li('red', o.x, o.y - o.hgt * 0.45, o.hgt * 1.5, 0.85); li('white', o.x, o.y - o.hgt * 0.68, o.hgt * 0.8, 0.75); }
    else if (k === 'enemy' && o.elite) li('warm', o.x, o.y - 30, 110, 0.6);
    else if (k === 'pet') li(o.k === 'kitty' ? 'mint' : 'pink', o.x, o.y - 14, 70, 0.5);
    else if (k === 'toy') li('warm', o.x, o.y - 20, 80, 0.55);
  }
  const fr = 1 + 0.1 * S.batt;
  li('white', P.x, P.y - 22, 235, 0.95);
  lg.save(); lg.translate(P.x, P.y - 24); lg.rotate(P.aim); lg.globalAlpha = 1; lg.drawImage(A.cone, 0, -270 * fr, 540 * fr, 540 * fr); lg.restore();
  if (P.auraR) li(lv('aura') === 6 ? 'mint' : 'pink', P.x, P.y, P.auraR * 1.7, 0.45);
  if (P.sprayR) li(lv('spray') === 6 ? 'blue' : 'warm', P.x + Math.cos(P.sprayDir) * P.sprayR * 0.6, P.y - 20 + Math.sin(P.sprayDir) * P.sprayR * 0.5, P.sprayR * 1.2, 0.8);
  for (const f of fields) li('pink', f.x, f.y, f.r * 1.6, f.q ? 0.3 : 0.5);
  for (const b of bolts) li(b.st ? 'warm' : 'blue', b.x2, b.y2 - 22, 90, 0.7 * (1 - b.t / b.d));
  for (const b of beams) { const k = 1 - b.t / b.d; const st = b.len / 4; for (let i = 1; i <= 4; i++) li(b.evo ? 'mint' : b.whip ? 'warm' : 'white', b.x + Math.cos(b.a) * i * st, b.y - 22 + Math.sin(b.a) * i * st, Math.max(90, st), 0.6 * k); }
  for (const s of shots) { if (s.k === 'gloss') li('pink', s.x, s.y - 22, 80, 0.7); else if (s.k === 'ball') li('mint', s.x, s.y - 20, 90, 0.6); else if (s.k === 'scis') li('white', s.x, s.y - 22, 70, 0.5); }
  for (const s of eshots) li('red', s.x, s.y - 22, 60, 0.7);
  for (const z of ezones) li('red', z.x, z.y, z.r * 1.5, 0.35);
  for (const f of flashes) { const k = f.t / f.d; li(f.col, f.x, f.y, f.r * (0.6 + 0.4 * k), 1 - k); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(lightC, 0, 0, cw, ch);

  // ----- glow pass -----
  g.setTransform(vs, 0, 0, vs, ox, oy); g.globalCompositeOperation = 'lighter';
  for (const d of wallDecor) if (d.c && d.x > cx - 150 && d.x < cx + vw + 150 && cy < 100) { g.globalAlpha = (0.42 + 0.08 * Math.sin(rt * 9 + d.x)) * dim; ds(g, A.glow[d.c], d.x, -90, 3.4); }
  for (const o of dl) {
    const k = o.kind;
    if (k === 'shelf') {
      g.globalAlpha = (0.6 + 0.25 * Math.sin(rt * 2.4 + o.x)) * dim; ds(g, A.shelfGlow, o.x, o.y);
      for (const sl of o.slots) {
        let a = 0; if (sl.state === 1) a = 1; else if (sl.state === 0) { if (sl.blink < 0) a = Math.sin(-sl.blink / 0.6 * Math.PI) * 0.9; if (st !== 'title') { const wx = sl.x - P.x, wy = sl.y - P.y, wd = wx * wx + wy * wy; if (wd < 108900 || G.stare > 0) a = Math.max(a, (G.stare > 0 ? 0.95 : 0.75 * (1 - wd / 108900)) * (Math.sin(rt * 31 + sl.x) > -0.93 ? 1 : 0.1)); } }
        if (a > 0.02) { const sc = sl.type === 'mat' ? 0.6 : 0.68; g.globalAlpha = a; ds(g, A.eye[sl.type], sl.x, sl.y - slotEye(sl.type) * sc, sc * 1.15); }
      }
    } else if (k === 'enemy') { g.globalAlpha = (o.boss ? 0.95 : 0.62) * (o.fade > 0 ? 0.3 : 1); ds(g, A.eye[o.ek] || A.eye.rag, o.x, o._dy - o.eye, o.esc); if (o.elite) { g.globalAlpha = 0.3; ds(g, A.glow.butter, o.x, o._dy - o.hgt * 0.5, 2.2); } }
    else if (k === 'box') { const c = o.gold ? 'butter' : 'pink'; g.globalAlpha = 0.35 + 0.15 * Math.sin(rt * 5); g.drawImage(A.glow[c].c, o.x - 34, o.y - 360, 68, 380); g.globalAlpha = 0.5; ds(g, A.glow.butter, o.x, o.y - 24, o.gold ? 2.4 : 1.6); }
    else if (k === 'pet') { g.globalAlpha = 0.35; ds(g, A.glow[o.k === 'kitty' ? 'mint' : 'lilac'], o.x, o.y - 26, 1.1); }
    else if (k === 'lair' && !o.used) { g.globalAlpha = 0.3 + 0.15 * Math.sin(rt * 3); ds(g, A.glow.red, o.x, o.y - 40, 2.6); }
    else if (k === 'prop' && (o.spr === 'case' || o.spr === 'claw')) { g.globalAlpha = 0.22; ds(g, A.glow.mint, o.x + 50, o.y - 40, 2.6); }
  }
  for (const q of gems) { if (q.x < L || q.x > R || q.y < T || q.y > B) continue; g.globalAlpha = 0.4 + 0.25 * Math.sin(q.t * 6); ds(g, A.glow[A.gemGlow[q.k]], q.x, q.y - 12, 0.55); }
  g.globalAlpha = 0.6;
  for (let i = 0; i < P.charms.length; i += 2) ds(g, A.glow.butter, P.charms[i], P.charms[i + 1] - 22, 0.8);
  for (const s of shots) {
    if (s.k === 'gloss') ds(g, A.glow.pink, s.x, s.y - 22, 0.9);
    else if (s.k === 'bomb') ds(g, A.glow.lilac, s.x, s.y - 10 - s.z, 0.9);
    else if (s.k === 'star' && s.t > 0) { const k = 1 - s.t / s.d; ds(g, A.glow.butter, s.x + k * 110, s.y - 22 - k * 380, 1.5); }
    else if (s.k === 'ball') ds(g, A.glow.mint, s.x, s.y - 20, 0.8);
    else if (s.k === 'bub') ds(g, A.glow.blue, s.x, s.y - 22, 0.5);
  }
  g.lineCap = 'round';
  for (const b of beams) {
    const k = 1 - b.t / b.d, x1 = b.x + Math.cos(b.a) * 22, y1 = b.y - 22 + Math.sin(b.a) * 22, x2 = b.x + Math.cos(b.a) * b.len, y2 = b.y - 22 + Math.sin(b.a) * b.len;
    g.globalAlpha = 0.55 * k; g.strokeStyle = b.evo ? `hsl(${(rt * 500 + b.a * 60) % 360},100%,65%)` : b.whip ? '#ffd24a' : '#ff9fe0'; g.lineWidth = Math.min(46, b.w * 1.5) * (0.4 + 0.6 * k); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.globalAlpha = k; g.strokeStyle = '#ffffff'; g.lineWidth = Math.min(16, b.w * 0.45) * k + 1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  g.lineJoin = 'round';
  for (const b of bolts) {
    const k = 1 - b.t / b.d, dx = b.x2 - b.x1, dy = b.y2 - b.y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, n = b.st ? 1 : 5;
    g.beginPath(); g.moveTo(b.x1, b.y1 - 22); for (let i = 1; i < n; i++) { const q = i / n, o = Math.sin(b.sd * 7 + i * 2.7 + rt * 40) * 14; g.lineTo(b.x1 + dx * q + nx * o, b.y1 - 22 + dy * q + ny * o); } g.lineTo(b.x2, b.y2 - 22);
    g.globalAlpha = 0.5 * k; g.strokeStyle = b.st ? '#ffb347' : '#7fb8ff'; g.lineWidth = b.st ? 5 : 9; g.stroke(); g.globalAlpha = k; g.strokeStyle = '#ffffff'; g.lineWidth = b.st ? 2 : 3; g.stroke();
  }
  for (let i = 0; i < 26; i++) { const mx = cx + ((i * 197.3 + rt * (6 + i % 5 * 3) - cx * 0.3) % (vw + 60) + vw + 60) % (vw + 60) - 30, my = cy + ((i * 131.7 - rt * (4 + i % 4 * 2) - cy * 0.3) % (vh + 60) + vh + 60) % (vh + 60) - 30; g.globalAlpha = 0.1 + 0.1 * Math.sin(rt * 1.3 + i); ds(g, A.spark.white, mx, my, 0.35 + (i % 3) * 0.12); }
  g.lineCap = 'butt';
  g.globalAlpha = 0.8; for (const s of eshots) ds(g, A.glow.red, s.x, s.y - 22, 0.9);
  g.globalAlpha = 0.55; ds(g, A.glow.butter, P.x + Math.cos(P.aim) * 26, P.y - 28 + Math.sin(P.aim) * 9, 0.6);
  for (const p of parts) { if (!p.add) continue; g.globalAlpha = Math.min(1, p.life / p.max * 1.6); g.drawImage(p.spr.c, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
  for (const r of rings) { const k = r.t / r.d; g.globalAlpha = 1 - k; g.strokeStyle = `rgb(${RINGC[r.col] || RINGC.pink})`; g.lineWidth = r.lw * (1 - k * 0.5); const q = lerp(r.r0, r.r1, 1 - (1 - k) * (1 - k)); ell(g, r.x, r.y, q, q * 0.8); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  for (const n of nums) {
    const k = n.t / 0.75, sc = (n.t < 0.08 ? lerp(0.5, 1.4, n.t / 0.08) : lerp(1.4, 1, Math.min(1, (n.t - 0.08) / 0.12))) * (n.big ? 1.05 : 0.9);
    g.globalAlpha = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1; ds(g, n.s, n.x + n.vx * n.t, n.y - n.t * 48, sc);
  }
  // ----- screen space -----
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (G.dawn > 0) { g.globalAlpha = G.dawn * 0.38; g.fillStyle = '#ffd9a8'; g.fillRect(0, 0, cw, ch); }
  if (G.peek > 0 && st !== 'title') {
    const pk = G.peek, pa = Math.min(1, pk * 2.5, (G.peekD - pk) * 1.6), pkS = ch * 0.24 / 132, sd = G.peekS;
    g.setTransform(pkS, 0, 0, pkS, (sd > 0 ? cw : 0) + sd * pkS * (95 - pa * 75), ch * 0.5 + 176 * pkS); g.rotate(-sd * 0.2);
    g.globalAlpha = pa * 0.7 * (Math.random() < 0.12 ? 0.35 : 1); ds(g, A.boss[sd > 0 ? 'L' : 'R'], 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = pa; ds(g, A.eye.boss, 0, -166, 2.2); g.globalCompositeOperation = 'source-over'; g.setTransform(1, 0, 0, 1, 0, 0);
  }
  g.globalAlpha = 1 - G.dawn * 0.8; g.drawImage(A.vig, 0, 0, cw, ch);
  if (st !== 'title' && G.dawn < 0.5) { g.globalAlpha = 0.45 * (1 - G.dawn * 2); g.drawImage(A.vig, 0, 0, cw, ch); }
  if (A.grainP || (A.grainP = g.createPattern(A.grain, 'repeat'))) { const gx = (Math.random() * 256) | 0, gy = (Math.random() * 256) | 0, gs = Math.max(1, Math.round(ch / 500)); g.globalAlpha = 0.06; g.setTransform(gs, 0, 0, gs, -gx * gs, -gy * gs); g.fillStyle = A.grainP; g.fillRect(gx, gy, cw / gs + 1, ch / gs + 1); g.setTransform(1, 0, 0, 1, 0, 0); }
  if (G.msgT > 0 && st !== 'title') {
    const k = G.msgT / 3.2, a = Math.min(1, k * 4, (1 - k) * 3) * 0.85, u = ch / 400;
    g.globalAlpha = a * (Math.random() < 0.12 ? 0.3 : 1); g.font = `italic 700 ${Math.round(20 * u)}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ff2a55'; g.shadowColor = '#ff0033'; g.shadowBlur = 14 * u; g.fillText(G.msg, cw * G.msgX + rand(-1.5, 1.5) * u, ch * G.msgY + rand(-1.5, 1.5) * u); g.shadowBlur = 0;
  }
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
  const u = UI.u, w = UI.w, h = UI.h, bh = 13 * u, M = G.mode, bs = G.bosses;
  g.fillStyle = 'rgba(18,11,36,.9)'; g.fillRect(0, 0, w, bh + 5 * u);
  const f = clamp(P.xp / P.need, 0, 1), gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, C.hot); gr.addColorStop(0.5, C.lilac); gr.addColorStop(1, C.mint);
  if (f > 0) { g.fillStyle = gr; rr(g, 3 * u, 2.5 * u, Math.max(bh, (w - 6 * u) * f), bh, bh / 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(3 * u + bh / 2, 4.5 * u, Math.max(0, (w - 6 * u) * f - bh), 2.5 * u); }
  const ly = bh + 28 * u;
  rr(g, 12 * u, ly - 14 * u, 76 * u, 28 * u, 14 * u); fs(g, '#2f2157', 2.5 * u, C.butter); txt(g, 'LV ' + P.lvl, 50 * u, ly + 1 * u, 16 * u, C.butter, 'center');
  const hx = 112 * u, hw = 190 * u, hh = 20 * u, hf = clamp(P.hp / P.maxhp, 0, 1);
  rr(g, hx, ly - hh / 2, hw, hh, hh / 2); fs(g, 'rgba(18,11,36,.88)', 2.5 * u, INK);
  if (hf > 0) { rr(g, hx + 2.5 * u, ly - hh / 2 + 2.5 * u, Math.max(hh - 5 * u, (hw - 5 * u) * hf), hh - 5 * u, hh / 2); g.fillStyle = hf < 0.3 ? '#ff3355' : C.hot; g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(hx + 12 * u, ly - hh / 2 + 5 * u, Math.max(0, (hw - 5 * u) * hf - 20 * u), 3 * u); }
  heart(g, hx - 1 * u, ly - 1 * u, 11 * u); fs(g, '#ff4f7f', 2.5 * u);
  for (let i = 0; i < P.revives; i++) { heart(g, hx + hw + (16 + i * 20) * u, ly - 1 * u, 8 * u); fs(g, C.butter, 2 * u); }
  // kills + buttons under the health bar
  const sy2 = ly + 30 * u; let x2 = 24 * u;
  circ(g, x2, sy2, 9 * u); fs(g, '#f8dcc6', 2.2 * u); g.lineWidth = 1.8 * u; g.strokeStyle = INK; g.beginPath(); for (const s of [-1, 1]) { g.moveTo(x2 + s * 3.6 * u - 1.8 * u, sy2 - 2.6 * u); g.lineTo(x2 + s * 3.6 * u + 1.8 * u, sy2 + 1 * u); g.moveTo(x2 + s * 3.6 * u + 1.8 * u, sy2 - 2.6 * u); g.lineTo(x2 + s * 3.6 * u - 1.8 * u, sy2 + 1 * u); } g.stroke();
  txt(g, String(G.kills), x2 + 15 * u, sy2 + 1 * u, 17 * u, '#fff6fb', 'left', 4.5 * u); x2 += 28 * u + g.measureText(String(G.kills)).width;
  g.drawImage(A.coin.c, x2, sy2 - 11 * u, 22 * u, 22 * u); txt(g, String(Math.round(G.coins * S.coin)), x2 + 25 * u, sy2 + 1 * u, 17 * u, C.butter, 'left', 4.5 * u);
  // timer
  const end = M.len > 1e8, tt = end ? G.t : Math.max(0, M.len - G.t), mm = Math.floor(tt / 60), ss = Math.floor(tt % 60);
  txt(g, mm + ':' + (ss < 10 ? '0' : '') + ss, w / 2, bh + 30 * u, 36 * u, !end && tt < 30 ? C.butter : '#fff6fb', 'center', 6 * u);
  txt(g, bs.length ? (bs[0].mb.final ? 'SHE IS AWAKE' : 'MINIBOSS') : end ? 'ENDLESS NIGHTMARE' : 'UNTIL DAWN', w / 2, bh + 56 * u, 11.5 * u, bs.length ? '#ff6f8f' : C.butter, 'center', 3.5 * u);
  if (bs.length) {
    let hp = 0, mx = 0; const m0 = bs[0].mb; for (const b of bs) if (b.mb === m0) { hp += b.hp; mx += b.maxhp; }
    const bw = Math.min(540 * u, w * 0.64), bx = (w - bw) / 2, by = h - 40 * u, bf = clamp(hp / mx, 0, 1);
    txt(g, m0.name, w / 2, by - 15 * u, 14 * u, '#ff8fa8', 'center', 4 * u);
    rr(g, bx, by, bw, 16 * u, 8 * u); fs(g, 'rgba(18,11,36,.9)', 2.5 * u, INK); if (bf > 0) { rr(g, bx + 2.5 * u, by + 2.5 * u, Math.max(11 * u, (bw - 5 * u) * bf), 11 * u, 6 * u); g.fillStyle = m0.final ? '#ff3355' : '#ff8a3d'; g.fill(); }
  }
  // minimap
  const mw = 108 * u, mh = mw * 0.75, mx0 = w - 12 - mw, my0 = 13 * u + 68, cw2 = mw / 3, ch2 = mh / 3;
  g.globalAlpha = 0.9; rr(g, mx0 - 3 * u, my0 - 3 * u, mw + 6 * u, mh + 6 * u, 7 * u); fs(g, 'rgba(18,11,36,.85)', 2 * u, '#6a58ad');
  for (const z of ZONES) { const zx = mx0 + (z.i % 3) * cw2, zy = my0 + Math.floor(z.i / 3) * ch2; g.globalAlpha = G.zones[z.id] ? 0.85 : 0.22; g.fillStyle = ZC[z.id]; g.fillRect(zx + 1, zy + 1, cw2 - 2, ch2 - 2); if (z === G.zone) { g.globalAlpha = 1; g.strokeStyle = '#fff6fb'; g.lineWidth = 1.5 * u; g.strokeRect(zx + 1, zy + 1, cw2 - 2, ch2 - 2); } }
  g.globalAlpha = 1; const mp = (x, y) => [mx0 + x / W * mw, my0 + y / H * mh];
  for (const l of lairs) if (!l.used) { const [x, y] = mp(l.x, l.y); g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = '#ff3355'; g.strokeStyle = INK; g.lineWidth = 1.2 * u; g.fillRect(-3 * u, -3 * u, 6 * u, 6 * u); g.strokeRect(-3 * u, -3 * u, 6 * u, 6 * u); g.restore(); }
  for (const b of boxes) { const [x, y] = mp(b.x, b.y); circ(g, x, y, (b.gold ? 3.6 : 2.6) * u); fs(g, b.gold ? '#ffd24a' : C.pink, 1 * u); }
  for (const b of bs) { const [x, y] = mp(b.x, b.y); circ(g, x, y, (3.5 + Math.sin(G.rt * 8)) * u); fs(g, '#ff3355', 1.2 * u); }
  { const [x, y] = mp(P.x, P.y); circ(g, x, y, 3.2 * u); fs(g, '#fff6fb', 1.4 * u); }
  if (G.zone) txt(g, G.zone.name.toUpperCase(), w - 12, my0 + mh + 13 * u, 10 * u, '#e6d8ff', 'right', 3 * u);
  // off-screen pointers
  const k = VIEW.vs / UI.ps, ptr = (wx, wy, col) => {
    const sx = (wx - VIEW.cx) * k, sy = (wy - VIEW.cy) * k, m = 34 * u; if (sx > m && sx < w - m && sy > 104 * u && sy < h - m) return;
    const px = clamp(sx, m, w - m), py = clamp(sy, 112 * u, h - m), a = Math.atan2(sy - py, sx - px), p = 1 + 0.15 * Math.sin(G.rt * 8);
    g.save(); g.translate(px, py); g.rotate(a); g.scale(u * p, u * p); g.beginPath(); g.moveTo(16, 0); g.lineTo(-8, -13); g.lineTo(-2, 0); g.lineTo(-8, 13); g.closePath(); fs(g, col, 3); g.restore();
  };
  for (const b of boxes) if (b.gold || Math.hypot(b.x - P.x, b.y - P.y) < 1500) ptr(b.x, b.y - 30, b.gold ? '#ffd24a' : C.pink);
  for (const b of bs) ptr(b.x, b.y - b.hgt * 0.5, '#ff3355');
  if (joy.on && G.state === 'play') {
    const R = 56 * u; g.globalAlpha = 0.9; circ(g, joy.bx, joy.by, R); g.fillStyle = 'rgba(255,143,208,.1)'; g.fill(); g.lineWidth = 3 * u; g.strokeStyle = 'rgba(255,143,208,.55)'; g.stroke();
    circ(g, joy.bx + joy.dx * R, joy.by + joy.dy * R, 25 * u); g.fillStyle = 'rgba(255,246,251,.8)'; g.fill(); g.lineWidth = 3 * u; g.strokeStyle = 'rgba(255,79,163,.8)'; g.stroke(); g.globalAlpha = 1;
  }
}

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
for (const ev of ['touchstart', 'touchmove', 'touchend']) document.addEventListener(ev, e => { if (!(e.target.closest && e.target.closest('button,.scroll,.panel'))) e.preventDefault(); }, { passive: false });
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
  buildArt(); buildArt2(); buildArt3(); buildIcons(); buildWorld(); reset(SV.mode, heroById(SV.hero)); G.state = 'title'; G.lightT = 2.5; resize(); coinsSync();
  requestAnimationFrame(t => { last = t; frame(t); });
}
const fontsReady = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('700 20px Fredoka'), document.fonts.load('30px "Rubik Wet Paint"')]).catch(() => { }) : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(boot);
window.__ds = { toys, bolts, STYLES, G, SV, A, AU, S, IT, MB, ET, ZONES, lairs, boxes, sim, perf, UI, VIEW, cam, enemies, gems, save, start: startRun, apply: applyUpgrade, evolve, spawn: spawnEnemy, mini: spawnMini, endRun, showTitle, get P() { return P; } };

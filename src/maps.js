// ---------- v4: maps, map challenges, lost dolls, the Shopkeeper ----------
// A map is a grid of rooms (ZW x ZH each) built from room themes, plus one rule that makes it play differently.
const MAPS = {
  store: { name: 'The Toy Store', size: 'MEDIUM', sub: 'Nine rooms. The classic night.', cols: 3, rows: 3, bonus: 0, hint: 'Drag anywhere to move',
    zones: ['antique', 'boutique', 'nursery', 'plush', 'main', 'arcade', 'workshop', 'checkout', 'stock'] },
  attic: { name: 'The Attic', size: 'SMALL', sub: 'Cramped and dark. Things drop from the rafters.', cols: 2, rows: 2, bonus: 0.15, dark: 0.7, dens: 0.8, xp: 1.25, rule: 'rafters', hint: 'Watch the floor. Things fall from the rafters.',
    zones: [{ th: 'attic', name: 'The Rafters' }, { th: 'antique', name: "Grandma's Trunks" }, { th: 'nursery', name: 'The Old Nursery' }, { th: 'attic', name: 'The Crawlspace' }] },
  express: { name: 'The Midnight Express', size: 'LONG', sub: 'One endless hall. A ghost train runs the tracks.', cols: 5, rows: 1, bonus: 0.2, xp: 1.15, rule: 'train', hint: 'When the horn blows, get off the red track.',
    zones: [{ th: 'stock', name: 'The Freight Car' }, { th: 'arcade', name: 'The Arcade Car' }, { th: 'main', name: 'The Platform' }, { th: 'boutique', name: 'The Dining Car' }, { th: 'plush', name: 'The Sleeper Car' }] },
  mall: { name: 'The Department Store', size: 'HUGE', sub: 'Twelve rooms. The power keeps cutting out.', cols: 4, rows: 3, bonus: 0.25, xp: 1.15, rule: 'outage', hint: 'The power keeps failing. They are faster in the dark.',
    zones: ['antique', 'boutique', 'nursery', 'arcade', 'plush', 'main', 'checkout', 'workshop', 'stock', { th: 'attic', name: 'Lost Property' }, { th: 'boutique', name: 'The Bridal Floor' }, { th: 'cellar', name: 'The Loading Dock' }] },
  basement: { name: 'The Basement', size: 'TALL', sub: 'Under the store. Someone still works down here.', cols: 2, rows: 3, bonus: 0.6, xp: 1.2, dark: 0.55, rule: 'hunter', under: true, secret: true, hint: 'Keep your flashlight on her.',
    zones: [{ th: 'cellar', name: 'The Boiler Room' }, { th: 'antique', name: 'The Discards' }, { th: 'workshop', name: 'The Old Doll Hospital' }, { th: 'cellar', name: 'The Bottom Step' }, { th: 'nursery', name: 'The Forgotten Nursery' }, { th: 'cellar', name: 'The Furnace' }] },
};
for (const id in MAPS) MAPS[id].id = id;
const MAP_REQ = { express: 'mini_1', mall: 'win_short', basement: 'lost_all' };
const mapOpen = id => !MAP_REQ[id] || !!SV.ach[MAP_REQ[id]];
// one lost doll hides somewhere on every map
const LOST = {
  store: { name: 'Penny', desc: 'The first doll the shop ever sold. She found her way back.', hint: 'Somewhere in the Toy Store.' },
  attic: { name: 'Mabel', desc: 'Grandma swore she locked her in the trunk.', hint: 'Somewhere in the Attic. Listen for giggling.' },
  express: { name: 'Ticket Girl', desc: 'She is still waiting for a train that left in 1952.', hint: 'Somewhere along the Midnight Express.' },
  mall: { name: 'Little Mannequin', desc: 'She got separated from her mother in the Bridal Floor.', hint: 'Somewhere in the Department Store.' },
  basement: { name: "The Shopkeeper's Daughter", desc: 'Her mother has been looking for her for a very long time.', hint: 'Somewhere in the Basement.' },
};
const LOST_UP = ['store', 'attic', 'express', 'mall'];

function setMap(id) {
  MAP = MAPS[id] || MAPS.store; MCOLS = MAP.cols; MROWS = MAP.rows; W = ZW * MCOLS; H = ZH * MROWS;
  ZONES = MAP.zones.map((d, i) => { const o = typeof d === 'string' ? { th: d } : d, t = ZTHEME[o.th]; return Object.assign({}, t, { th: o.th, name: o.name || t.name, id: o.th + i, i, x: (i % MCOLS) * ZW, y: Math.floor(i / MCOLS) * ZH, out: 0 }); });
  buildWorld();
}
function mapReset() {
  for (const z of ZONES) z.out = 0;
  Object.assign(G, { rafT: 9, train: null, trainT: 24, trainKills: 0, outT: 26, hunter: null, hunterAt: 25, hunterHeart: 0, stareT: 0, lost: null, lostAt: rand(35, 80), lostG: 0, found: false });
}
// ---- the attic: rafters ----
function rafterDrop(z) { if (enemies.length > G.cap + 30) return; spawnEnemy(z.drop, z.x, z.y, { pop: true }); for (let i = 0; i < 6; i++) part(z.x + rand(-30, 30), z.y - rand(60, 200), rand(-10, 10), rand(80, 200), 0.5, rand(8, 14), A.puff, false, 300, 0, 10); }
// ---- the express: ghost train ----
const TRAIN_LEN = 1180, TRAIN_SP = 2300, LANE = 62;
function trainStart() {
  const y = clamp(P.y + rand(-40, 40), 150, H - 90), dir = Math.random() < 0.5 ? 1 : -1;
  G.train = { y, dir, warn: 1.9, x: clamp(P.x - dir * 1000, -260, W + 260), hitP: false, id: G.t }; sfx('horn'); G.flick = 0.3;
}
function trainUpd(dt) {
  const tr = G.train;
  if (tr.warn > 0) { tr.warn -= dt; if (tr.warn <= 0) sfx('train'); return; }
  tr.x += tr.dir * TRAIN_SP * dt;
  const tail = tr.x - tr.dir * TRAIN_LEN, lo = Math.min(tr.x, tail), hi = Math.max(tr.x, tail);
  if (Math.abs(P.y - tr.y) < 500 && P.x > lo - 400 && P.x < hi + 400) shake(4);
  for (const e of enemies) {
    if (e.dead || e.st === 'jump' || Math.abs(e.y - tr.y) > LANE || e.x < lo || e.x > hi) continue;
    if (e.boss) { if (e._tr !== tr.id) { e._tr = tr.id; e.hp -= e.maxhp * 0.08; e.flash = 0.2; if (e.hp <= 0) kill(e); } continue; }
    G.trainKills++; burst(e.x, e.y - e.hgt * 0.4, 'red', 6); e.hp = 0; kill(e);
  }
  if (!tr.hitP && Math.abs(P.y - tr.y) < LANE - 6 && P.x > lo && P.x < hi && P.inv <= 0) { tr.hitP = true; damagePlayer(22); P.y += P.y < tr.y ? -50 : 50; }
  if (tr.dir > 0 ? tail > W + 100 : tail < -100) { G.train = null; G.trainT = Math.max(14, rand(22, 30) - G.t / 60); }
}
// ---- the department store: power cuts ----
function outageStart() {
  const cur = zoneAt(P.x, P.y), opts = ZONES.filter(z => !z.out), z = Math.random() < 0.55 && !cur.out ? cur : pick(opts.length ? opts : ZONES);
  z.out = 16; banner('POWER CUT', z.name + ' just went dark'); sfx('dark'); G.flick = 0.5;
}
// ---- the basement: the Shopkeeper ----
function hunterPlace(dist, behind) {
  const H0 = G.hunter; let a = behind ? P.aim + Math.PI + rand(-0.6, 0.6) : rand(TAU);
  for (let k = 0; k < 12; k++) { const x = P.x + Math.cos(a) * dist, y = P.y + Math.sin(a) * dist * 0.8; if (x > 60 && x < W - 60 && y > 80 && y < H - 60) { H0.x = x; H0.y = y; return; } a += 0.55; }
  H0.x = clamp(P.x + Math.cos(a) * dist, 60, W - 60); H0.y = clamp(P.y + Math.sin(a) * dist, 80, H - 60);
}
function hunterUpd(dt) {
  if (!G.hunter) {
    if (G.t < G.hunterAt) return;
    G.hunter = { kind: 'hunter', x: 0, y: 0, sy: 0, face: 1, t: 0, lit: false, tp: 0, fade: 1 }; hunterPlace(900);
    banner('THE SHOPKEEPER', 'She does not like customers after hours'); sfx('dark'); sfx('whisper'); G.flick = 1; return;
  }
  const h = G.hunter; h.t += dt; if (h.tp > 0) h.tp -= dt; if (h.fade > 0) h.fade -= dt;
  if (G.stopT > 0 || G.stunH > 0) { h.lit = true; return; }
  const dx = P.x - h.x, dy = P.y - h.y, d = Math.hypot(dx, dy) || 1;
  const litR = 540 * (1 + 0.1 * S.batt), litA = 0.5 + 0.03 * S.batt;
  h.lit = d < litR && Math.abs(wrapA(Math.atan2(-dy, -dx) - P.aim)) < litA;
  if (h.lit) G.stareT += dt;
  const sp = (135 + Math.min(55, G.t / 10)) * (G.dare.rush ? 1.1 : 1) * (h.lit ? 0.25 : 1) * (G.bosses.length ? 0.8 : 1) * (G.hideT > 0 ? 0.2 : 1);
  h.x += dx / d * sp * dt; h.y += dy / d * sp * dt; h.sy = h.y; if (Math.abs(dx) > 6) h.face = dx > 0 ? 1 : -1;
  if (d < 420) { G.hunterHeart -= dt; if (G.hunterHeart <= 0) { G.hunterHeart = 0.35 + d / 900; sfx('heart'); } }
  if (d > 1150 && h.tp <= 0) { h.tp = 7; hunterPlace(720, true); h.fade = 0.6; sfx('giggle'); }
  if (d < 40 + P.r && P.inv <= 0 && h.fade <= 0) { damagePlayer(22); G.flick = 0.6; h.tp = 4; hunterPlace(1100); h.fade = 0.8; sfx('whisper'); }
}
// ---- lost dolls ----
function lostPlace() {
  const cur = zoneAt(P.x, P.y), zs = ZONES.filter(z => z !== cur);
  for (let k = 0; k < 60; k++) {
    const z = pick(zs.length ? zs : ZONES), x = z.x + pick([80, 340, ZW - 340, ZW - 80]) + rand(-30, 30), y = z.y + pick([150, 470, 800, ZH - 60]) + rand(-20, 20);
    if (shelfAt(x, y) || solids.some(s => x > s.x - 40 && x < s.x + s.w + 40 && y > s.y - 40 && y < s.y + s.h + 40) || Math.hypot(x - P.x, y - P.y) < 700) continue;
    G.lost = { kind: 'lost', x, y, sy: y, t: 0 }; return;
  }
}
function lostUpd(dt) {
  if (G.found || SV.lost[MAP.id]) return;
  if (!G.lost) { if (G.t >= G.lostAt) { G.lostAt = G.t + 20; lostPlace(); } return; }
  const L = G.lost, d = Math.hypot(L.x - P.x, L.y - P.y); L.t += dt;
  if (d < 420) { G.lostG -= dt; if (G.lostG <= 0) { G.lostG = rand(4, 7); sfx('giggle'); } }
  if (d < 40) {
    SV.lost[MAP.id] = 1; save(); G.found = true; G.lost = null;
    banner('FOUND: ' + LOST[MAP.id].name.toUpperCase(), 'A lost doll. She is in your Collection now.'); sfx('chime'); sfx('giggle');
    flashAt(L.x, L.y, 500, 0.6, 'warm'); boxes.push({ kind: 'box', gold: true, x: L.x, y: L.y + 30, sy: L.y + 30, t: 0, dead: false });
  }
}
// ---- per-frame map logic (only while playing) ----
function mapUpdate(dt) {
  lostUpd(dt);
  for (const z of ZONES) if (z.out > 0) z.out -= dt;
  const r = MAP.rule;
  if (r === 'rafters') { G.rafT -= dt; if (G.rafT <= 0) { G.rafT = Math.max(4.5, 10 - G.t / 70); sfx('creak'); const n = 1 + (G.t > 200) + (G.t > 420), unl = unlocked(); for (let i = 0; i < n; i++) { const a = rand(TAU), q = i ? rand(90, 260) : rand(0, 120), x = clamp(P.x + Math.cos(a) * q, 40, W - 40), y = clamp(P.y + Math.sin(a) * q * 0.8, 60, H - 40); ezone(x, y, 62, 1.3 + i * 0.15, 10, wpick(zoneAt(x, y).types, unl)); } } }
  else if (r === 'train') { if (G.train) trainUpd(dt); else { G.trainT -= dt; if (G.trainT <= 0 && G.t > 10) trainStart(); } }
  else if (r === 'outage') { G.outT -= dt; if (G.outT <= 0) { G.outT = rand(22, 32); outageStart(); } }
  else if (r === 'hunter') hunterUpd(dt);
}
// the practice bot dodges map hazards too
function mapBot(ax, ay) {
  const tr = G.train; if (tr && Math.abs(P.y - tr.y) < LANE + 50) { const s = P.y < tr.y ? -1 : 1; ay += s * 4; if (P.y < 200 || P.y > H - 140) ay = -ay; }
  const h = G.hunter; if (h) { const dx = P.x - h.x, dy = P.y - h.y, d2 = dx * dx + dy * dy; if (d2 < 600 * 600) { const w = 900 / (d2 + 900); ax += dx * w * 0.3; ay += dy * w * 0.3; } }
  return [ax, ay];
}
// ---------- rendering hooks ----------
function mapGround(g, cx, vw, rt) {
  const tr = G.train; if (!tr) return;
  const k = tr.warn > 0 ? 1 : 0.4, p = 0.5 + 0.5 * Math.sin(rt * 18);
  g.globalAlpha = (0.1 + 0.1 * p) * k; g.fillStyle = "#ff2244"; g.fillRect(cx - 20, tr.y - LANE, vw + 40, LANE * 2);
  g.globalAlpha = 0.7 * k; g.strokeStyle = '#ff5577'; g.lineWidth = 3; g.setLineDash([26, 18]); g.lineDashOffset = -rt * 160 * tr.dir;
  g.beginPath(); g.moveTo(cx - 20, tr.y - LANE); g.lineTo(cx + vw + 20, tr.y - LANE); g.moveTo(cx - 20, tr.y + LANE); g.lineTo(cx + vw + 20, tr.y + LANE); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
  if (tr.warn > 0) { g.globalAlpha = 0.55 + 0.4 * p; g.fillStyle = '#ff6f8f'; for (let x = Math.floor(cx / 160) * 160; x < cx + vw + 160; x += 160) { const ox = x + ((rt * 260 * tr.dir) % 160); g.beginPath(); g.moveTo(ox + tr.dir * 22, tr.y); g.lineTo(ox - tr.dir * 10, tr.y - 22); g.lineTo(ox - tr.dir * 10, tr.y + 22); g.closePath(); g.fill(); } }
  g.globalAlpha = 1;
}
function mapDL(dl, L, R, T, B) {
  const h = G.hunter; if (h && h.x > L - 60 && h.x < R + 60 && h.y > T && h.y < B + 260) dl.push(h);
  const l = G.lost; if (l && l.x > L && l.x < R && l.y > T && l.y < B) dl.push(l);
}
function mapEnt(g, o, rt) {
  if (o.kind === 'hunter') { const sway = Math.sin(o.t * 2.2) * 2; g.globalAlpha = o.fade > 0 ? clamp(1 - o.fade, 0.15, 1) : (o.lit ? 1 : 0.88); ds(g, o.face > 0 ? A.keeper.R : A.keeper.L, o.x, o.y - Math.abs(sway), 1, 1 + Math.sin(o.t * 4.4) * 0.01); g.globalAlpha = 1; }
  else ds(g, A.doll.por[0].sit, o.x, o.y, 0.62);
}
function mapShadow(g, o) { ds(g, A.shadow, o.x, o.y, o.kind === 'hunter' ? 1.7 : 0.7); }
function mapTrain(g, rt) {
  const tr = G.train; if (!tr || tr.warn > 0) return;
  const s = tr.dir > 0 ? A.train : A.trainL;
  g.globalAlpha = 0.9;
  for (let i = 0; i < 5; i++) { const x = tr.x - tr.dir * (i * 236 + 118), bob = Math.sin(rt * 30 + i) * 1.5; ds(g, i ? s.car : s.loco, x, tr.y + 46 + bob); }
  g.globalAlpha = 1;
}
function mapLights(li, dim, rt) {
  const tr = G.train; if (tr && tr.warn <= 0) { li('warm', tr.x + tr.dir * 60, tr.y - 10, 420, 1); for (let i = 1; i < 5; i++) li('warm', tr.x - tr.dir * (i * 236 + 118), tr.y - 30, 170, 0.55); }
  const h = G.hunter; if (h) li('red', h.x, h.y - 120, 300, (0.45 + 0.15 * Math.sin(rt * 5)) * (h.fade > 0 ? 0.4 : 1));
  const l = G.lost; if (l) li('white', l.x, l.y - 20, 90, 0.35 + 0.25 * Math.sin(rt * 2.3));
}
function mapGlow(g, rt) {
  const h = G.hunter; if (h && h.fade <= 0) { g.globalAlpha = Math.sin(rt * 31) > -0.9 ? 1 : 0.2; ds(g, A.eye.keeper, h.x + h.face * 1.5, h.y - 209, 1.4); }
  const l = G.lost; if (l) { const a = Math.sin(l.t * 1.7); if (a > 0.3) { g.globalAlpha = (a - 0.3) * 1.2; ds(g, A.eye.hush, l.x, l.y - 27, 0.75); } }
}
// ---------- art ----------
TILEFN.attic = g => {
  for (let i = 0; i < 8; i++) { g.fillStyle = ['#4a382c', '#53402f', '#45342a', '#4e3b2d'][i % 4]; g.fillRect(i * 25, 0, 25, 200); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(i * 25 + 23, 0, 2, 200); const j = rand(20, 180); g.fillRect(i * 25, j, 23, 2); circ(g, i * 25 + 5, j - 8, 1.4); g.fill(); circ(g, i * 25 + 18, j + 8, 1.4); g.fill(); }
  for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(230,210,190,${rand(0.03, 0.08)})`; g.fillRect(rand(200), rand(200), rand(2, 6), 1.5); }
};
TILEFN.cellar = g => {
  g.fillStyle = '#303834'; g.fillRect(0, 0, 200, 200);
  for (let k = 0; k < 7; k++) { ell(g, rand(200), rand(200), rand(14, 40), rand(8, 22), rand(3)); g.fillStyle = `rgba(10,16,14,${rand(0.15, 0.3)})`; g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.strokeRect(1, 1, 198, 198); g.beginPath(); g.moveTo(rand(200), 0); g.lineTo(rand(80, 120), rand(60, 120)); g.lineTo(rand(200), 200); g.lineWidth = 1.2; g.stroke();
  if (Math.random() < 0.7) { circ(g, 100, 100, 13); g.fillStyle = '#1a201e'; g.fill(); g.strokeStyle = '#555f5a'; g.lineWidth = 2; g.stroke(); for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(92, 100 + i * 5); g.lineTo(108, 100 + i * 5); g.stroke(); } }
  ell(g, rand(40, 160), rand(40, 160), rand(10, 22), rand(6, 12)); g.fillStyle = 'rgba(120,10,30,.18)'; g.fill();
};
SHELFPAL.attic = ['#5a4230', '#c9a27a', '#22160e', '#3a2a1e']; SHELFPAL.cellar = ['#34403a', '#7a8c84', '#101614', '#222c28'];
function drawKeeper(g) {
  // long dress
  g.beginPath(); g.moveTo(-17, -176); g.lineTo(17, -176); g.lineTo(30, -60); g.lineTo(44, -4); for (let i = 0; i <= 8; i++) g.lineTo(44 - i * 11, i % 2 ? 4 : -6); g.lineTo(-30, -60); g.closePath(); fs(g, '#140b1e', 2.6);
  g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(-20, -180, 9, 180); g.restore();
  // apron with keys
  rr(g, -13, -150, 26, 104, 5); fs(g, '#3c3346', 2); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-13, -122); g.lineTo(13, -122); g.stroke();
  for (let i = 0; i < 4; i++) { g.save(); g.translate(-6 + i * 4, -104); g.rotate(-0.4 + i * 0.25); rr(g, -1.4, 0, 2.8, 14, 1); fs(g, '#b8a57a', 1); circ(g, 0, 15, 2.4); fs(g, '#b8a57a', 1); g.restore(); }
  circ(g, 0, -106, 5); g.lineWidth = 2; g.strokeStyle = '#b8a57a'; g.stroke();
  // very long arms
  limb(g, -16, -170, -30, -112, 6, '#140b1e'); limb(g, -30, -112, -34, -46, 4.5, '#e9e2ee');
  limb(g, 16, -170, 30, -112, 6, '#140b1e'); limb(g, 30, -112, 33, -46, 4.5, '#e9e2ee');
  for (const s of [-1, 1]) for (let f = -1; f <= 1; f++) { g.beginPath(); g.moveTo(s * 33.5, -46); g.lineTo(s * 33.5 + f * 3, -32); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(); g.lineWidth = 1.6; g.strokeStyle = '#e9e2ee'; g.stroke(); }
  // neck + head
  rr(g, -4, -196, 8, 24, 3); fs(g, '#e9e2ee', 2);
  g.beginPath(); g.moveTo(-15, -224); g.quadraticCurveTo(-26, -190, -22, -168); g.lineTo(22, -168); g.quadraticCurveTo(26, -190, 15, -224); g.closePath(); fs(g, '#0b0612', 2);
  ell(g, 0, -210, 16, 21); fs(g, '#efe8f2', 2.4);
  g.save(); g.clip(); g.fillStyle = 'rgba(80,40,90,.18)'; g.fillRect(4, -234, 14, 46); g.restore();
  for (const s of [-1, 1]) { ell(g, s * 6, -210, 4.6, 6); g.fillStyle = '#05010a'; g.fill(); }
  g.beginPath(); g.moveTo(-9, -197); g.quadraticCurveTo(0, -192, 9, -197); g.lineWidth = 1.6; g.strokeStyle = '#3a0a18'; g.stroke();
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 2.6, -197.5 + Math.abs(i) * 0.3); g.lineTo(i * 2.6, -194 + Math.abs(i) * 0.3); g.lineWidth = 1; g.stroke(); }
  g.beginPath(); g.moveTo(5, -230); g.lineTo(2, -220); g.lineTo(6, -214); g.lineTo(3, -206); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke();
  circ(g, 0, -232, 10); fs(g, '#0b0612', 2); g.beginPath(); g.moveTo(-16, -222); g.quadraticCurveTo(0, -238, 16, -222); g.lineWidth = 5; g.strokeStyle = '#0b0612'; g.stroke();
}
function drawTrainCar(g, loco) {
  const body = '#24122e', trim = '#8a1030';
  for (const x of [-72, 72]) { circ(g, x, -14, 17); fs(g, '#100818', 2.6); circ(g, x, -14, 5); fs(g, trim, 1.6); }
  rr(g, -112, -30, 224, 12, 4); fs(g, '#100818', 2.2);
  if (!loco) {
    rr(g, -108, -104, 216, 76, 9); fs(g, body, 2.8); rr(g, -114, -114, 228, 16, 6); fs(g, '#160a1e', 2.4); g.fillStyle = trim; g.fillRect(-106, -44, 212, 6);
    for (let i = 0; i < 3; i++) { const x = -88 + i * 64; rr(g, x, -94, 48, 38, 6); g.fillStyle = 'rgba(255,200,120,.55)'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); circ(g, x + 24, -66, 11); g.fillStyle = '#0b0612'; g.fill(); rr(g, x + 13, -60, 22, 6, 2); g.fill(); for (const s of [-1, 1]) { circ(g, x + 24 + s * 4.4, -68, 1.8); g.fillStyle = '#ff2244'; g.fill(); g.fillStyle = '#0b0612'; } }
  } else {
    rr(g, -108, -88, 150, 60, 9); fs(g, body, 2.8); rr(g, -108, -128, 70, 46, 6); fs(g, '#160a1e', 2.6); rr(g, -96, -120, 46, 28, 5); g.fillStyle = 'rgba(255,200,120,.6)'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    rr(g, 0, -122, 22, 36, 4); fs(g, '#100818', 2.4); g.fillStyle = trim; g.fillRect(-106, -44, 148, 6);
    // the face on the front of the engine
    ell(g, 70, -66, 44, 46); fs(g, '#e9e2ee', 2.8); for (const s of [-1, 1]) { ell(g, 70 + s * 14, -74, 7, 9); g.fillStyle = '#05010a'; g.fill(); circ(g, 70 + s * 14, -73, 2.4); g.fillStyle = '#ff2244'; g.fill(); }
    g.beginPath(); g.moveTo(46, -50); g.quadraticCurveTo(70, -34, 94, -50); g.lineTo(88, -44); g.lineTo(82, -50); g.lineTo(76, -42); g.lineTo(70, -50); g.lineTo(64, -42); g.lineTo(58, -50); g.lineTo(52, -44); g.closePath(); g.fillStyle = '#05010a'; g.fill();
    g.beginPath(); g.moveTo(78, -108); g.lineTo(72, -92); g.lineTo(80, -84); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
  }
}
function buildArt4() {
  const R = sprite(110, 260, 55, 244, drawKeeper);
  A.keeper = { R, L: flipS(R) };
  A.eye.keeper = eyeSprite('#ff2244', 6, 6);
  const loco = sprite(250, 150, 125, 140, g => drawTrainCar(g, true)), car = sprite(250, 150, 125, 140, g => drawTrainCar(g, false));
  A.train = { loco, car }; A.trainL = { loco: flipS(loco), car: flipS(car) };
}
// a secret girl, unlocked by the last lost doll
HEROES.push({ id: 'wren', name: 'Wren', tag: 'The Lost Girl', start: 'spray', perk: 'Huge flashlight. Dolls in the beam are slower and take more damage. +10% XP', unlock: 'lost_5', mod: { batt: 3, xp: 0.1 },
  o: { skin: '#ece4ee', hair: '#2a1a24', hair2: '#120a10', streak: '#ff3355', style: 'twintails', iris: '#ff3355', top: '#4a1424', top2: '#ece4ee', skirt: '#24080f', sock: '#ece4ee', sock2: '#4a1424', boot: '#120a10', sole: '#ff3355', emblem: 'skull', emb: '#ece4ee' } });

// ---------- world ----------
const W = 2700, H = 2000, WALLH = 170, SH_W = 420, SH_H = 74, NIGHT = 300;
const ROWS = [290, 570, 963, 1356, 1636], SEGX = [180, 760, 1520, 2100];
const shelves = [], solids = [], slots = [], decor = [], wallDecor = [];
const G = { state: 'boot', t: 0, rt: 0, ts: 1, bot: false, best: 0 };
let P = null;
const enemies = [], gems = [], shots = [], eshots = [], parts = [], nums = [], boxes = [], pets = [], rings = [], flashes = [];
const S = { dmg: 1, cd: 1, area: 1, crit: 0.05, pick: 70, regen: 0, xp: 1, spd: 1 };
const joy = { on: false, id: -1, bx: 0, by: 0, x: 0, y: 0, dx: 0, dy: 0 }, key = { x: 0, y: 0 };

const ET = {
  rag: { hp: 10, spd: 76, dmg: 8, r: 13, mass: 1, xp: 0, sc: 1, hgt: 56, eye: 41.5 },
  bal: { hp: 7, spd: 58, dmg: 7, r: 11, mass: 0.8, xp: 0, sc: 0.95, hgt: 58, eye: 41.5 },
  por: { hp: 34, spd: 92, dmg: 12, r: 14, mass: 1.7, xp: 1, sc: 1.14, hgt: 64, eye: 41.5 },
  mat: { hp: 80, spd: 50, dmg: 16, r: 22, mass: 4, xp: 1, sc: 1.3, hgt: 70, eye: 44.5 },
  boss: { hp: 1, spd: 62, dmg: 24, r: 44, mass: 90, xp: 2, sc: 1, hgt: 250, eye: 166 },
};
const UP = [
  { id: 'gloss', name: 'Lip Gloss Blaster', cat: 'MAKEUP', w: 1, desc: ['Fires glossy bolts at the nearest doll.', 'More damage.', 'Fires 2 bolts.', 'Bolts pierce. More damage.', 'Fires 3 bolts, faster.'] },
  { id: 'bomb', name: 'Glitter Bomb', cat: 'MAKEUP', w: 1, desc: ['Lobs a bomb that bursts into glitter.', 'Bigger blast.', 'Throws 2 bombs.', 'Way more damage.', '3 bombs, faster.'] },
  { id: 'charm', name: 'Charm Bracelet', cat: 'CHARM', w: 1, desc: ['2 charms orbit you and smack dolls.', '3 charms.', 'Wider orbit, more damage.', '4 charms.', '6 charms. Max sparkle.'] },
  { id: 'aura', name: 'Poison Perfume', cat: 'MAKEUP', w: 1, desc: ['A cloud around you hurts and slows dolls.', 'Bigger cloud.', 'More damage.', 'Even bigger. Slows more.', 'Toxic. Huge damage.'] },
  { id: 'ball', name: 'Squish Ball', cat: 'TOY', w: 1, desc: ['A squishy ball bounces between 3 dolls.', 'Bounces 5 times.', 'More damage.', 'Throws 2 balls.', '8 bounces. Big damage.'] },
  { id: 'kitty', name: 'Ghost Kitty', cat: 'PET', w: 1, desc: ['A ghost cat pounces on dolls for you.', 'Sharper claws.', 'A second kitty.', 'Pounces faster.', 'Three kitties. Chaos.'] },
  { id: 'bunny', name: 'Spirit Bunny', cat: 'PET', w: 1, desc: ['A bunny fetches gems for you.', 'Faster bunny.', 'A second bunny.', 'Gems give +15% XP.', 'Three bunnies. +30% XP.'] },
  { id: 'storm', name: 'Star Shower', cat: 'CHARM', w: 1, desc: ['Shooting stars strike 2 random dolls.', '3 stars.', 'More damage.', '5 stars.', '7 stars, faster.'] },
  { id: 'boots', name: 'Platform Boots', cat: 'OUTFIT', desc: 'Move 9% faster.' },
  { id: 'choker', name: 'Spiked Choker', cat: 'OUTFIT', desc: '+12% damage on everything.' },
  { id: 'locket', name: 'Heart Locket', cat: 'CHARM', desc: '+20 max health, slow healing. Heals you now.' },
  { id: 'bow', name: 'Magnet Bow', cat: 'OUTFIT', desc: 'Pull in gems from 35% farther.' },
  { id: 'nails', name: 'Press-On Claws', cat: 'MAKEUP', desc: 'Attack 8% faster.' },
  { id: 'ears', name: 'Cat Ears', cat: 'OUTFIT', desc: '+8% chance to crit for double damage.' },
  { id: 'liner', name: 'Winged Liner', cat: 'MAKEUP', desc: 'Every attack hits 12% bigger.' },
];
const CAKE = { id: 'cake', name: 'Midnight Cupcake', cat: 'TREAT', desc: 'Heal 40 health.' };
const CATC = { MAKEUP: C.pink, OUTFIT: C.lilac, CHARM: C.butter, PET: C.mint, TOY: C.blue, TREAT: C.pink };
const lv = id => P.up[id] || 0;
const need = l => Math.round(4 + l * 3.4 + l * l * 0.07);

function buildWorld() {
  ROWS.forEach((y, ri) => SEGX.forEach((x, si) => {
    if (ri === 2 && (si === 1 || si === 2)) return;
    if (ri === 0 && si === 3) { solids.push({ kind: 'counter', x, y, w: SH_W, h: SH_H, sy: y + SH_H }); return; }
    const sh = { kind: 'shelf', x, y, w: SH_W, h: SH_H, sy: y + SH_H, slots: [], v: (ri + si) % 2 };
    for (let row = 0; row < 2; row++) for (let i = 0; i < 11; i++) { const s = { sh, x: x + 30 + i * 36, y: y + (row ? 52 : 8), row, state: 0, type: 'rag', vr: 0, t: 0, blink: rand(1, 12) }; sh.slots.push(s); slots.push(s); }
    shelves.push(sh); solids.push(sh);
  }));
  for (const [x, y] of [[800, 780], [1800, 1150]]) solids.push({ kind: 'case', x, y, w: 100, h: 72, sy: y + 72 });
  decor.push({ s: 'rug', x: 1350, y: 1010, i: 0 });
  const dpos = [[1010, 840, 0], [1042, 866, 1], [1660, 1210, 2], [1700, 1190, 3], [1500, 860, 4], [640, 480, 5], [1960, 1540, 6], [330, 1200, 7], [2300, 760, 5], [1180, 1560, 4], [900, 190, 2], [2400, 1250, 0], [420, 1850, 6], [1350, 480, 7], [2250, 1850, 1], [150, 800, 3]];
  for (const [x, y, i] of dpos) decor.push({ s: 'decal', x, y, i });
  wallDecor.push({ s: 'win', x: 450 }, { s: 'winMoon', x: 1350 }, { s: 'win', x: 2250 }, { s: 'neonHeart', x: 900, c: 'pink' }, { s: 'neonMoon', x: 1800, c: 'mint' }, { s: 'neonStar', x: 2520, c: 'butter' }, { s: 'poster', x: 180 }, { s: 'poster', x: 1080 }, { s: 'poster', x: 1620 });
}
function slotType(t) {
  const k = t / NIGHT, r = Math.random() * (100 + 33 * k);
  if (r < 55) return 'rag'; if (r < 73 + 10 * k) return 'bal'; if (r < 90 + 25 * k) return 'por'; return 'mat';
}
const unlocked = () => ({ rag: true, bal: G.t > 40, por: G.t > 85, mat: G.t > 140 });

function reset() {
  for (const a of [enemies, gems, shots, eshots, parts, nums, boxes, pets, rings, flashes]) a.length = 0;
  Object.assign(G, { t: 0, kills: 0, shake: 0, flash: 0, flash2: 0, blackout: 0, hurt: 0, dawn: 0, spawnAcc: 0, evi: 0, boxT: 22, comboT: 0, pending: 0, boss: null, bossDead: false, dmgDone: 0, dmg210: 0, stateT: 0, cap: 16, lightT: rand(20, 30) });
  P = { kind: 'player', x: 1350, y: 1010, sy: 1010, r: 13, hp: 100, maxhp: 100, vx: 0, vy: 0, face: 1, aim: -Math.PI / 2, inv: 0, lvl: 1, xp: 0, need: need(1), up: { gloss: 1 }, walk: 0, moving: false, tm: { gloss: 0.5, bomb: 1, ball: 0.6, storm: 1.4, aura: 0 }, charms: [], auraR: 0 };
  recalc(); buildPlayerArt(P.up);
  for (const s of slots) { s.state = 0; s.type = slotType(0); s.vr = randi(0, 2); s.blink = rand(1, 12); }
  joy.on = false; joy.dx = joy.dy = 0;
}
function recalc() {
  S.dmg = 1 + 0.12 * lv('choker'); S.cd = Math.pow(0.92, lv('nails')); S.area = 1 + 0.12 * lv('liner'); S.crit = 0.05 + 0.08 * lv('ears');
  S.pick = 70 * (1 + 0.35 * lv('bow')); S.regen = 0.4 * lv('locket'); S.xp = [1, 1, 1, 1, 1.15, 1.3][lv('bunny')]; S.spd = 1 + 0.09 * lv('boots'); P.maxhp = 100 + 20 * lv('locket');
}
function applyUpgrade(id) {
  if (id === 'cake') { heal(40); return; }
  P.up[id] = lv(id) + 1; recalc();
  if (id === 'locket') heal(25);
  if (id === 'ears' || id === 'bow' || id === 'boots' || id === 'choker') buildPlayerArt(P.up);
  const want = { kitty: [0, 1, 1, 2, 2, 3][lv('kitty')], bunny: [0, 1, 1, 2, 2, 3][lv('bunny')] };
  for (const k in want) { let n = pets.filter(p => p.k === k).length; while (n < want[k]) { pets.push({ kind: 'pet', k, x: P.x, y: P.y, sy: P.y, st: 'idle', t: rand(TAU), cd: rand(0.3, 1), face: 1, i: n, hit: [], tg: null }); n++; } }
}
function heal(n) { P.hp = Math.min(P.maxhp, P.hp + n); addNum(P.x, P.y - 70, '+' + n, 3); sfx('heal'); for (let i = 0; i < 8; i++) part(P.x + rand(-14, 14), P.y - rand(10, 50), rand(-20, 20), rand(-90, -40), rand(0.4, 0.8), rand(10, 16), A.spark.red, true); }

// ---------- spatial grid ----------
const GC = 100, GW = Math.ceil(W / GC), GH = Math.ceil(H / GC), grid = Array.from({ length: GW * GH }, () => []);
function gridBuild() { for (const c of grid) c.length = 0; for (const e of enemies) { if (e.dead || e.st === 'jump') continue; grid[clamp((e.y / GC) | 0, 0, GH - 1) * GW + clamp((e.x / GC) | 0, 0, GW - 1)].push(e); } }
function forNear(x, y, r, fn) {
  const m = r + 50, x0 = clamp(((x - m) / GC) | 0, 0, GW - 1), x1 = clamp(((x + m) / GC) | 0, 0, GW - 1), y0 = clamp(((y - m) / GC) | 0, 0, GH - 1), y1 = clamp(((y + m) / GC) | 0, 0, GH - 1);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const c = grid[cy * GW + cx]; for (let i = 0; i < c.length; i++) { const e = c[i]; if (e.dead) continue; const dx = e.x - x, dy = e.y - y, q = r + e.r; if (dx * dx + dy * dy < q * q) fn(e); } }
}
function nearestList(x, y, range, n, skip) {
  const out = [], r2 = range * range;
  for (const e of enemies) { if (e.dead || e.st === 'jump') continue; if (skip && skip.indexOf(e) >= 0) continue; const d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y); if (d < r2) { e._d = d; out.push(e); } }
  out.sort((a, b) => a._d - b._d); if (out.length > n) out.length = n; return out;
}
function compact(a) { let j = 0; for (let i = 0; i < a.length; i++) if (!a[i].dead) a[j++] = a[i]; a.length = j; }
function shelfAt(x, y) { for (const s of shelves) if (x > s.x - 6 && x < s.x + s.w + 6 && y > s.y - 8 && y < s.y + SH_H + 2) return s; return null; }

// ---------- fx ----------
function part(x, y, vx, vy, life, size, spr, add, grav = 0, drag = 0, grow = 0) { if (parts.length > 650) return; parts.push({ x, y, vx, vy, life, max: life, size, spr, add, grav, drag, grow, dead: false }); }
function burst(x, y, col, n = 7) {
  for (let i = 0; i < n; i++) { const a = rand(TAU), s = rand(60, 230); part(x, y, Math.cos(a) * s, Math.sin(a) * s - 50, rand(0.3, 0.65), rand(9, 17), i % 2 ? A.spark[col] : A.glow[col], true, 240, 2); }
  for (let i = 0; i < 3; i++) part(x + rand(-8, 8), y + rand(-8, 8), rand(-36, 36), rand(-60, -10), rand(0.35, 0.6), rand(18, 28), A.puff, false, 0, 1, 34);
}
const numCache = new Map(), NUMC = ['#fff6fb', C.butter, '#ff6f8f', C.mint];
function numSprite(txt, style) {
  const k = txt + '|' + style; let s = numCache.get(k); if (s) return s; if (numCache.size > 500) numCache.clear();
  const sz = style === 1 ? 30 : style === 0 ? 21 : 25, w = txt.length * sz * 0.68 + 14;
  s = sprite(w, sz + 14, w / 2, (sz + 14) / 2, g => { g.font = `700 ${sz}px ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5.5; g.strokeStyle = style === 1 ? '#b0125a' : INK; g.strokeText(txt, 0, 1); g.fillStyle = NUMC[style]; g.fillText(txt, 0, 1); });
  numCache.set(k, s); return s;
}
function addNum(x, y, v, style = 0) { if (nums.length > 70 || (nums.length > 45 && style === 0)) return; nums.push({ x: x + rand(-8, 8), y, s: numSprite(String(v), style), t: 0, vx: rand(-18, 18), big: style !== 0, dead: false }); }
function ring(x, y, r0, r1, d, col, lw = 5, warn = false) { rings.push({ x, y, r0, r1, t: 0, d, col, lw, warn, dead: false }); }
function flashAt(x, y, r, d, col = 'white') { flashes.push({ x, y, r, t: 0, d, col, dead: false }); }
function shake(n) { G.shake = Math.max(G.shake, n); }
function lightning() { G.flash = 1; G.flash2 = 0.2; sfx('thunder'); }

// ---------- enemies ----------
function spawnEnemy(type, x, y, o = {}) {
  const T = ET[type], tier = o.tier || 0, ts = [1, 0.72, 0.5][tier], hm = 1 + G.t / 60 * 0.36;
  const e = { kind: 'enemy', type, x, y, sy: y, z: 0, r: T.r * ts, hp: T.hp * hm * [1, 0.4, 0.16][tier], spd: T.spd * [1, 1.45, 2.1][tier] * rand(0.92, 1.08), dmg: T.dmg * [1, 0.75, 0.5][tier], mass: T.mass * ts, xp: T.xp, sc: T.sc * ts, hgt: T.hgt * ts, eye: T.eye * T.sc * ts, vr: o.vr === undefined ? randi(0, 2) : o.vr, t: rand(10), ph: rand(TAU), flash: 0, kx: 0, ky: 0, slow: 0, slowF: 1, ch: 0, st: 'chase', face: 1, dead: false, tier, dashT: rand(0.5, 1.3), dash: 0, dvx: 0, dvy: 0, over: null, boss: false };
  e.spr = type === 'boss' ? A.boss : A.doll[type][e.vr];
  if (type === 'boss') { e.boss = true; e.sc = 1; e.eye = T.eye; e.hgt = T.hgt; e.spd = T.spd; e.tB = 2.5; e.tS = 6; e.tStomp = 2; e.stomp = 0; }
  e.maxhp = e.hp;
  if (o.jump) { e.st = 'jump'; e.jx0 = o.jump.x; e.jy0 = o.jump.y; e.jx1 = x; e.jy1 = y; e.jt = 0; e.jd = 0.4; e.x = e.jx0; e.y = e.jy0; }
  else if (o.pop) { e.st = 'jump'; e.jx0 = e.jx1 = x; e.jy0 = e.jy1 = y; e.jt = 0; e.jd = 0.3; for (let i = 0; i < 3; i++) part(x + rand(-10, 10), y - rand(0, 20), rand(-30, 30), rand(-50, -10), 0.45, rand(18, 28), A.puff, false, 0, 1, 30); }
  enemies.push(e); return e;
}
function hurt(e, dmg, ax, ay, kb = 120) {
  if (e.dead) return;
  let crit = false; dmg *= S.dmg; if (Math.random() < S.crit) { dmg *= 2; crit = true; }
  dmg = Math.max(1, Math.round(dmg * rand(0.88, 1.12)));
  e.hp -= dmg; e.flash = 0.09; G.dmgDone += dmg;
  if (kb) { const dx = e.x - ax, dy = e.y - ay, d = Math.hypot(dx, dy) || 1, k = kb / e.mass; e.kx += dx / d * k; e.ky += dy / d * k; }
  addNum(e.x, e.y - e.hgt, dmg, crit ? 1 : 0); sfx('hit');
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  e.dead = true; G.kills++;
  const col = e.type === 'bal' ? 'mint' : e.type === 'mat' ? 'butter' : e.type === 'por' ? 'blue' : 'pink';
  burst(e.x, e.y - e.hgt * 0.45, col, e.boss ? 40 : 7); sfx('pop'); if (e.r > 15) shake(3);
  if (e.type === 'mat' && e.tier < 2) for (const s of [-1, 1]) { const c = spawnEnemy('mat', e.x + s * 10, e.y + rand(-6, 6), { tier: e.tier + 1, vr: e.vr }); c.kx = s * 260; c.ky = rand(-120, 120); }
  if (e.boss) { bossDeath(e); return; }
  dropGem(e.x, e.y, e.xp, 0);
  if (Math.random() < 0.011) dropGem(e.x + 10, e.y, 3, 0);
}
function dropGem(x, y, k, scatter) {
  if (gems.length > 320 && k < 3) { const g = gems[(Math.random() * gems.length) | 0]; if (g.k < 3) { g.v += [1, 4, 20][k]; if (g.v >= 4 && g.k === 0) g.k = 1; if (g.v >= 20) g.k = 2; return; } }
  const a = rand(TAU), s = scatter ? rand(80, scatter) : rand(20, 60);
  gems.push({ x, y, k, v: [1, 4, 20, 0][k], t: rand(6), vx: Math.cos(a) * s, vy: Math.sin(a) * s, pull: false, sp: 140, claim: false, dead: false });
}
function ringSpawn(type, n, rad) { const off = rand(TAU); for (let i = 0; i < n; i++) { const a = off + i * TAU / n; spawnEnemy(type, clamp(P.x + Math.cos(a) * rad, 30, W - 30), clamp(P.y + Math.sin(a) * rad * 0.8, 30, H - 30), { pop: true }); } }
function spawnBoss() {
  let dx = 1350 - P.x, dy = 1000 - P.y, d = Math.hypot(dx, dy); if (d < 60) { dx = 0; dy = -1; d = 1; }
  const e = spawnEnemy('boss', clamp(P.x + dx / d * 430, 120, W - 120), clamp(P.y + dy / d * 380, 160, H - 80), { pop: true });
  const dps = Math.max(0, (G.dmgDone - G.dmg210) / 30); e.hp = e.maxhp = clamp(dps * 9, 2500, 30000);
  G.boss = e; lightning(); sfx('boss'); shake(16); AU.layer = 3;
  banner('MADAME PORCELAIN', 'She wants you for her collection');
}
function bossDeath(e) {
  G.boss = null; G.bossDead = true; sfx('bossdie'); shake(22); flashAt(e.x, e.y, 600, 0.6); G.flash = 0.8;
  for (let i = 0; i < 40; i++) { const a = rand(TAU), s = rand(100, 480); part(e.x, e.y - 120, Math.cos(a) * s, Math.sin(a) * s - 120, rand(0.6, 1.3), rand(14, 30), i % 3 ? A.puff : A.spark.white, i % 3 === 0, 500, 1); }
  for (let i = 0; i < 14; i++) dropGem(e.x, e.y, 2, 300);
  P.hp = P.maxhp; for (const o of enemies) if (!o.dead && !o.boss) { o.kx += (o.x - e.x) * 2; o.ky += (o.y - e.y) * 2; }
  banner('SHE SHATTERED!', 'Now hold on until sunrise');
}
function bossAI(e, dt, d) {
  const rage = e.hp < e.maxhp * 0.5; e.tB -= dt; e.tS -= dt; e.tStomp -= dt;
  if (e.tB <= 0) { e.tB = rage ? 2.5 : 3.6; const n = rage ? 18 : 12, off = rand(TAU); for (let i = 0; i < n; i++) { const a = off + i * TAU / n; eshots.push({ x: e.x, y: e.y, vx: Math.cos(a) * 165, vy: Math.sin(a) * 165, r: 9, dmg: 11, life: 4.5, dead: false }); } sfx('zap'); ring(e.x, e.y, 30, 120, 0.4, 'red'); }
  if (e.tS <= 0) { e.tS = rage ? 6 : 8.5; for (let i = 0; i < 7; i++) { const a = rand(TAU); spawnEnemy(pick(['rag', 'bal', 'por']), clamp(e.x + Math.cos(a) * 130, 30, W - 30), clamp(e.y + Math.sin(a) * 110, 30, H - 30), { pop: true }); } }
  if (e.stomp > 0) {
    e.stomp -= dt;
    if (e.stomp <= 0) { sfx('stomp'); shake(15); ring(e.x, e.y, 40, 200, 0.35, 'red', 9); flashAt(e.x, e.y, 260, 0.3, 'red'); for (let i = 0; i < 14; i++) { const a = rand(TAU); part(e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 40, Math.cos(a) * 180, Math.sin(a) * 120 - 40, 0.6, rand(24, 40), A.puff, false, 0, 2, 40); } if (Math.hypot(P.x - e.x, P.y - e.y) < 185) damagePlayer(24); }
    return 0;
  }
  if (d < 175 && e.tStomp <= 0) { e.stomp = 0.85; e.tStomp = 4.2; ring(e.x, e.y, 185, 185, 0.85, 'red', 5, true); }
  return rage ? 88 : 62;
}
function updEnemies(dt) {
  for (const e of enemies) {
    if (e.dead) continue;
    e.t += dt; if (e.flash > 0) e.flash -= dt; if (e.ch > 0) e.ch -= dt;
    if (e.st === 'jump') {
      e.jt += dt / e.jd; const k = Math.min(1, e.jt); e.x = lerp(e.jx0, e.jx1, k); e.y = lerp(e.jy0, e.jy1, k); e.z = Math.sin(Math.PI * k) * 34; e.sy = Math.max(e.y, e.jy1) + 80;
      if (e.jt >= 1) { e.st = 'chase'; e.z = 0; part(e.x, e.y, 0, -10, 0.3, 22, A.puff, false, 0, 0, 40); }
      continue;
    }
    const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1;
    let sp = e.spd, mx = dx / d, my = dy / d;
    if (e.boss) sp = bossAI(e, dt, d);
    else if (e.type === 'bal') {
      e.dashT -= dt;
      if (e.dash > 0) { e.dash -= dt; sp = 265; mx = e.dvx; my = e.dvy; }
      else if (e.dashT <= 0) { e.dash = 0.6; e.dashT = rand(1.1, 1.7); e.dvx = mx; e.dvy = my; }
    }
    if (e.slow > 0) { e.slow -= dt; sp *= e.slowF; }
    e.over = e.boss ? null : shelfAt(e.x, e.y); if (e.over) sp *= 0.55;
    e.x += (mx * sp + e.kx) * dt; e.y += (my * sp + e.ky) * dt;
    const kd = Math.exp(-7 * dt); e.kx *= kd; e.ky *= kd;
    e.x = clamp(e.x, 12, W - 12); e.y = clamp(e.y, 12, H - 12);
    if (Math.abs(dx) > 6) e.face = dx > 0 ? 1 : -1;
    e.sy = e.over ? e.over.y + SH_H + 1 + (e.y - e.over.y) * 0.01 : e.y;
    if (d < e.r + P.r + 2 && P.inv <= 0) damagePlayer(e.dmg);
    if (d > 1350 && !e.boss) e.dead = true;
  }
  // soft separation inside each cell
  for (const c of grid) {
    const n = c.length; if (n < 2) continue;
    for (let i = 0; i < n; i++) { const a = c[i]; if (a.dead || a.boss) continue; for (let j = i + 1; j < n; j++) { const b = c[j]; if (b.dead || b.boss) continue; const dx = b.x - a.x, dy = b.y - a.y, q = (a.r + b.r) * 0.9, d2 = dx * dx + dy * dy; if (d2 < q * q && d2 > 0.01) { const d = Math.sqrt(d2), p = (q - d) / d * 0.5 * Math.min(1, dt * 14), wa = b.mass / (a.mass + b.mass); a.x -= dx * p * wa * 2; a.y -= dy * p * wa * 2; b.x += dx * p * (1 - wa) * 2; b.y += dy * p * (1 - wa) * 2; } } }
  }
}
function damagePlayer(d) {
  if (P.inv > 0 || G.state !== 'play') return;
  P.hp -= d; P.inv = 0.8; G.hurt = 1; shake(9); sfx('hurt'); addNum(P.x, P.y - 74, '-' + Math.round(d), 2);
  for (const e of enemies) { if (e.dead || e.boss) continue; const dx = e.x - P.x, dy = e.y - P.y, q = dx * dx + dy * dy; if (q < 130 * 130) { const k = Math.sqrt(q) || 1; e.kx += dx / k * 420 / e.mass; e.ky += dy / k * 420 / e.mass; } }
  ring(P.x, P.y, 20, 130, 0.3, 'red', 4);
  if (P.hp <= 0) { P.hp = 0; G.state = 'dying'; G.stateT = 0; AU.mode = 'off'; hideHud(); }
}

// ---------- director ----------
function wake(s) { s.state = 1; s.t = 0.55; sfx('wake'); }
function release(s) {
  const sh = s.sh; s.state = 2; s.t = rand(12, 22);
  const north = s.row === 0 && P.y < sh.y, ty = north ? sh.y - rand(12, 22) : sh.y + SH_H + rand(12, 26);
  spawnEnemy(s.type, s.x + rand(-8, 8), ty, { vr: s.vr, jump: { x: s.x, y: s.y } });
}
function updSlots(dt, active) {
  const unl = unlocked(), pw = active ? 0.2 + G.t / NIGHT * 1.1 : 0, full = enemies.length > G.cap + 12;
  for (const s of slots) {
    if (s.state === 0) {
      s.blink -= dt; if (s.blink < -0.6) s.blink = rand(3, 16);
      if (pw && unl[s.type] && !full) { const dx = s.x - P.x, dy = s.y - P.y; if (dx * dx + dy * dy < 172 * 172 && Math.random() < pw * dt) wake(s); }
    } else if (s.state === 1) { s.t -= dt; if (s.t <= 0) release(s); }
    else { s.t -= dt; if (s.t <= 0) { const dx = s.x - P.x, dy = s.y - P.y; if (!active || dx * dx + dy * dy > 800 * 800) { s.state = 0; s.type = slotType(G.t); s.vr = randi(0, 2); s.blink = rand(3, 16); } else s.t = 2; } }
  }
}
function spawnNear() {
  const unl = unlocked(), cand = [];
  for (const s of slots) { if (s.state !== 0 || !unl[s.type]) continue; const dx = s.x - P.x, dy = s.y - P.y, q = dx * dx + dy * dy; if (q > 230 * 230 && q < 700 * 700) cand.push(s); }
  if (cand.length > 4 && Math.random() < 0.8) { wake(pick(cand)); return; }
  const a = rand(TAU), d = rand(600, 690), ty = [];
  for (const k in unl) if (unl[k]) for (let i = 0; i < { rag: 5, bal: 3, por: 2, mat: 1 }[k]; i++) ty.push(k);
  spawnEnemy(pick(ty), clamp(P.x + Math.cos(a) * d, 20, W - 20), clamp(P.y + Math.sin(a) * d * 0.75, 20, H - 20), { pop: true });
}
const EVENTS = [
  [16, () => lightning()],
  [60, () => { banner('PLAYTIME!', 'The ballerinas want to dance'); lightning(); ringSpawn('bal', 20, 520); }],
  [95, () => lightning()],
  [120, () => { banner("DON'T BLINK", 'The porcelain ones are awake'); G.blackout = 1.8; sfx('dark'); ringSpawn('por', 16, 560); }],
  [150, () => lightning()],
  [180, () => { banner('NESTING TIME', 'There is always one more inside'); lightning(); ringSpawn('mat', 5, 560); ringSpawn('rag', 12, 620); }],
  [210, () => { G.dmg210 = G.dmgDone; lightning(); }],
  [237.4, () => { G.blackout = 2.7; sfx('dark'); }],
  [240, () => spawnBoss()],
  [276, () => banner('ALMOST DAWN', 'Hold on'), 0],
];
function director(dt) {
  const t = G.t;
  G.cap = Math.min(205, 24 + t * 0.62);
  AU.layer = G.boss ? 3 : t < 50 ? 0 : t < 125 ? 1 : 2;
  while (G.evi < EVENTS.length && t >= EVENTS[G.evi][0]) EVENTS[G.evi++][1]();
  if (G.blackout > 0) return;
  G.spawnAcc += (1.25 + t * 0.021) * dt * (G.boss ? 0.55 : 1);
  while (G.spawnAcc >= 1) { G.spawnAcc -= 1; if (enemies.length < G.cap) spawnNear(); }
  G.boxT -= dt;
  if (G.boxT <= 0) {
    G.boxT = 30;
    if (boxes.length < 3) for (let k = 0; k < 20; k++) { const x = rand(240, W - 240), y = pick([190, 467, 1533, 1855, 800, 1200]); if (Math.hypot(x - P.x, y - P.y) > 560 && !shelfAt(x, y)) { boxes.push({ kind: 'box', x, y, sy: y, t: 0, dead: false }); break; } }
  }
}
function openBox(b) {
  b.dead = true; sfx('box'); shake(5); flashAt(b.x, b.y, 300, 0.5, 'pink'); ring(b.x, b.y, 10, 160, 0.45, 'butter', 6);
  const cols = ['pink', 'mint', 'butter', 'lilac'];
  for (let i = 0; i < 26; i++) { const a = rand(TAU), s = rand(80, 340); part(b.x, b.y - 20, Math.cos(a) * s, Math.sin(a) * s - 160, rand(0.6, 1.1), rand(10, 18), A.spark[pick(cols)], true, 420, 1.5); }
  for (let i = 0; i < 7; i++) dropGem(b.x, b.y, 1, 150); dropGem(b.x, b.y, 2, 120);
  const r = Math.random(), low = P.hp < P.maxhp * 0.55;
  if (low || r < 0.3) { heal(40); addNum(b.x, b.y - 60, 'CUPCAKE!', 3); }
  else if (r < 0.65) { for (const g of gems) g.pull = true; addNum(b.x, b.y - 60, 'GEM MAGNET!', 3); }
  else { addNum(b.x, b.y - 60, 'GLITTER STORM!', 3); G.flash = 0.7; for (const e of enemies) { if (e.dead || e.st === 'jump') continue; if (Math.abs(e.x - P.x) < 760 && Math.abs(e.y - P.y) < 520) hurt(e, e.boss ? 150 : 60 + G.t * 0.4, P.x, P.y, 260); } }
}

// ---------- weapons ----------
function explode(x, y, rad, dmg, col) {
  forNear(x, y, rad, e => hurt(e, dmg, x, y, 230));
  ring(x, y, rad * 0.25, rad, 0.3, col, 6); flashAt(x, y, rad * 2.4, 0.3, col === 'butter' ? 'warm' : 'pink'); shake(4);
  const cols = col === 'butter' ? ['butter', 'white'] : ['pink', 'lilac', 'mint', 'butter'];
  for (let i = 0; i < 14; i++) { const a = rand(TAU), s = rand(60, rad * 3.2); part(x, y - 12, Math.cos(a) * s, Math.sin(a) * s - 40, rand(0.35, 0.8), rand(9, 18), A.spark[pick(cols)], true, 160, 3); }
  part(x, y - 10, 0, 0, 0.25, rad * 1.5, A.glow[col === 'butter' ? 'butter' : 'pink'], true, 0, 0, rad * 2);
}
function updWeapons(dt) {
  const tm = P.tm; let L;
  if ((L = lv('gloss'))) {
    tm.gloss -= dt;
    if (tm.gloss <= 0) {
      const n = [0, 1, 1, 2, 2, 3][L], tg = nearestList(P.x, P.y, 540, n);
      if (tg.length) {
        tm.gloss = [0, 0.55, 0.52, 0.52, 0.48, 0.4][L] * S.cd; sfx('shoot');
        for (let i = 0; i < n; i++) { const e = tg[i % tg.length], a = Math.atan2(e.y - P.y, e.x - P.x) + (i >= tg.length ? (i - 1) * 0.22 : 0); shots.push({ k: 'gloss', x: P.x + Math.cos(a) * 14, y: P.y + Math.sin(a) * 14, vx: Math.cos(a) * 620, vy: Math.sin(a) * 620, a, r: 9 * S.area, dmg: [0, 10, 14, 14, 19, 21][L], pierce: L >= 4 ? 1 : 0, life: 1, hit: [], dead: false }); }
      } else tm.gloss = 0.12;
    }
  }
  if ((L = lv('bomb'))) {
    tm.bomb -= dt;
    if (tm.bomb <= 0) {
      const n = [0, 1, 1, 2, 2, 3][L], tg = nearestList(P.x, P.y, 430, 12);
      if (tg.length) { tm.bomb = (L >= 5 ? 2.3 : 2.9) * S.cd; for (let i = 0; i < n; i++) { const e = pick(tg); shots.push({ k: 'bomb', x: P.x, y: P.y, sx: P.x, sy0: P.y, tx: e.x + rand(-16, 16), ty: e.y + rand(-16, 16), t: 0, d: 0.55 + i * 0.12, z: 0, dmg: L >= 4 ? 46 : 28, rad: (L >= 2 ? 108 : 86) * S.area, dead: false }); } }
      else tm.bomb = 0.3;
    }
  }
  if ((L = lv('ball'))) {
    tm.ball -= dt;
    if (tm.ball <= 0) {
      const n = L >= 4 ? 2 : 1, tg = nearestList(P.x, P.y, 460, n);
      if (tg.length) { tm.ball = 2.1 * S.cd; for (let i = 0; i < n; i++) shots.push({ k: 'ball', x: P.x, y: P.y, tg: tg[i % tg.length], b: [0, 3, 5, 5, 5, 8][L], dmg: [0, 16, 16, 24, 24, 33][L], hit: [], sq: 0, life: 4, r: 13 * S.area, dead: false }); }
      else tm.ball = 0.3;
    }
  }
  if ((L = lv('storm'))) {
    tm.storm -= dt;
    if (tm.storm <= 0) {
      const n = [0, 2, 3, 3, 5, 7][L], tg = nearestList(P.x, P.y, 520, 40);
      if (tg.length) { tm.storm = (L >= 5 ? 2 : 2.6) * S.cd; for (let i = 0; i < n; i++) { const e = pick(tg); shots.push({ k: 'star', x: e.x, y: e.y, t: -i * 0.09, d: 0.42, dmg: L >= 3 ? 46 : 30, rad: 52 * S.area, dead: false }); } }
      else tm.storm = 0.3;
    }
  }
  P.charms.length = 0;
  if ((L = lv('charm'))) {
    const n = [0, 2, 3, 3, 4, 6][L], R = (L >= 5 ? 112 : L >= 3 ? 96 : 80) * S.area, dmg = [0, 8, 8, 13, 13, 18][L];
    for (let i = 0; i < n; i++) { const a = G.t * 2.7 + i * TAU / n, x = P.x + Math.cos(a) * R, y = P.y + Math.sin(a) * R * 0.8; P.charms.push(x, y); forNear(x, y, 15 * S.area, e => { if (e.ch <= 0) { hurt(e, dmg, P.x, P.y, 170); e.ch = 0.4; part(x, y - 20, 0, 0, 0.2, 26, A.spark.white, true); } }); }
  }
  P.auraR = 0;
  if ((L = lv('aura'))) {
    const R = [0, 96, 118, 118, 142, 142][L] * S.area; P.auraR = R; tm.aura -= dt;
    if (tm.aura <= 0) { tm.aura = 0.5 * S.cd; const dmg = [0, 5, 5, 9, 9, 15][L], sl = L >= 4 ? 0.68 : 0.8; forNear(P.x, P.y, R, e => { hurt(e, dmg, P.x, P.y, 0); e.slow = 0.7; e.slowF = sl; }); ring(P.x, P.y, R * 0.6, R, 0.4, 'pink', 3); }
    if (Math.random() < dt * 14) { const a = rand(TAU), d = rand(R * 0.3, R); part(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d * 0.8 - 10, rand(-10, 10), rand(-30, -10), rand(0.5, 0.9), rand(8, 14), A.spark[pick(['pink', 'mint'])], true); }
  }
}
function updShots(dt) {
  for (const s of shots) {
    if (s.dead) continue;
    if (s.k === 'gloss') {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (s.life <= 0) { s.dead = true; continue; }
      if (Math.random() < dt * 40) part(s.x, s.y - 22, rand(-20, 20), rand(-20, 20), 0.25, rand(8, 13), A.glow.pink, true);
      forNear(s.x, s.y, s.r, e => { if (s.dead || s.hit.indexOf(e) >= 0) return; s.hit.push(e); hurt(e, s.dmg, s.x - s.vx, s.y - s.vy, 100); for (let i = 0; i < 3; i++) part(s.x, s.y - 22, rand(-120, 120), rand(-120, 120), 0.25, rand(8, 14), A.spark.pink, true); if (--s.pierce < 0) s.dead = true; });
    } else if (s.k === 'bomb') {
      s.t += dt; const k = Math.min(1, s.t / s.d); s.x = lerp(s.sx, s.tx, k); s.y = lerp(s.sy0, s.ty, k); s.z = Math.sin(Math.PI * k) * 80;
      if (k >= 1) { s.dead = true; explode(s.tx, s.ty, s.rad, s.dmg, 'pink'); sfx('boom'); }
    } else if (s.k === 'star') {
      s.t += dt; if (s.t >= s.d) { s.dead = true; explode(s.x, s.y, s.rad, s.dmg, 'butter'); sfx('zap'); }
      else if (s.t > 0) { const k = s.t / s.d; part(s.x + (1 - k) * 110, s.y - 22 - (1 - k) * 380, rand(-10, 10), rand(-10, 10), 0.3, 14, A.spark.butter, true); }
    } else if (s.k === 'ball') {
      s.life -= dt; if (s.sq > 0) s.sq -= dt * 5;
      if (!s.tg || s.tg.dead) { const n = nearestList(s.x, s.y, 320, 1, s.hit); s.tg = n[0] || null; }
      if (!s.tg || s.life <= 0) { s.dead = true; burst(s.x, s.y - 20, 'mint', 4); continue; }
      const dx = s.tg.x - s.x, dy = s.tg.y - s.y, d = Math.hypot(dx, dy) || 1, sp = 560 * dt;
      if (d < sp + s.tg.r + 6) {
        s.x = s.tg.x; s.y = s.tg.y; hurt(s.tg, s.dmg, s.x - dx, s.y - dy, 180); sfx('squish'); s.sq = 1; s.hit.push(s.tg); if (s.hit.length > 4) s.hit.shift();
        for (let i = 0; i < 4; i++) part(s.x, s.y - 20, rand(-140, 140), rand(-140, 140), 0.3, rand(8, 14), A.glow.mint, true);
        if (--s.b <= 0) { s.dead = true; burst(s.x, s.y - 20, 'mint', 5); } else { const n = nearestList(s.x, s.y, 320, 1, s.hit); s.tg = n[0] || null; }
      } else { s.x += dx / d * sp; s.y += dy / d * sp; }
    }
  }
  for (const s of eshots) {
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (s.life <= 0) s.dead = true;
    const dx = s.x - P.x, dy = s.y - P.y; if (dx * dx + dy * dy < (s.r + P.r) * (s.r + P.r)) { s.dead = true; damagePlayer(s.dmg); }
  }
}
function updPets(dt) {
  let ki = 0, bi = 0;
  for (const p of pets) {
    p.t += dt;
    if (p.k === 'kitty') {
      const L = lv('kitty'), i = ki++;
      if (p.st === 'idle') {
        const a = p.t * 1.3 + i * 2.1, hx = P.x + Math.cos(a) * 46, hy = P.y - 8 + Math.sin(a) * 30, f = 1 - Math.exp(-6 * dt);
        p.face = hx > p.x ? 1 : -1; p.x = lerp(p.x, hx, f); p.y = lerp(p.y, hy, f); p.cd -= dt;
        if (p.cd <= 0) { const tg = nearestList(P.x, P.y, 340, 6); if (tg.length) { const e = pick(tg), dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; p.st = 'dash'; p.vx = dx / d * 760; p.vy = dy / d * 760; p.dt = (d + 70) / 760; p.hit.length = 0; p.face = dx > 0 ? 1 : -1; sfx('meow'); } else p.cd = 0.25; }
      } else {
        p.x += p.vx * dt; p.y += p.vy * dt; p.dt -= dt; const dmg = [0, 22, 32, 32, 34, 46][L];
        forNear(p.x, p.y, 20 * S.area, e => { if (p.hit.indexOf(e) < 0) { p.hit.push(e); hurt(e, dmg, p.x - p.vx, p.y - p.vy, 150); } });
        if (Math.random() < dt * 50) part(p.x, p.y - 18, 0, 0, 0.28, 26, A.glow.mint, true);
        if (p.dt <= 0) { p.st = 'idle'; p.cd = (L >= 4 ? 0.95 : 1.4) * S.cd; }
      }
    } else {
      const L = lv('bunny'), i = bi++, sp = L >= 2 ? 520 : 400;
      if (p.tg && (p.tg.dead || p.tg.pull)) { p.tg = null; }
      if (!p.tg) { let best = null, bd = 560 * 560; for (const g of gems) { if (g.claim || g.pull || g.dead) continue; const d = (g.x - P.x) * (g.x - P.x) + (g.y - P.y) * (g.y - P.y); if (d < bd && d > S.pick * S.pick) { bd = d; best = g; } } if (best) { best.claim = true; p.tg = best; } }
      let tx, ty; if (p.tg) { tx = p.tg.x; ty = p.tg.y; } else { const a = p.t * 1.1 + i * 2.4 + 1; tx = P.x + Math.cos(a) * 60; ty = P.y + Math.sin(a) * 40; }
      const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, sp * dt); p.x += dx / d * st; p.y += dy / d * st; if (Math.abs(dx) > 4) p.face = dx > 0 ? 1 : -1;
      if (p.tg && d < 16) { collectGem(p.tg); p.tg = null; }
    }
    p.sy = p.y + 6;
  }
}
function collectGem(g) {
  if (g.dead) return; g.dead = true;
  if (g.k === 3) { heal(20); return; }
  P.xp += g.v * S.xp; G.comboT = 0.6; AU.combo = Math.min(10, AU.combo + 1); sfx('gem');
  part(g.x, g.y - 12, 0, -30, 0.25, 22, A.spark[A.gemGlow[g.k]], true);
  while (P.xp >= P.need) { P.xp -= P.need; P.lvl++; P.need = need(P.lvl); G.pending++; }
}
function updGems(dt) {
  const pr2 = S.pick * S.pick;
  for (const g of gems) {
    if (g.dead) continue; g.t += dt;
    if (g.vx || g.vy) { g.x = clamp(g.x + g.vx * dt, 16, W - 16); g.y = clamp(g.y + g.vy * dt, 16, H - 16); const k = Math.exp(-6 * dt); g.vx *= k; g.vy *= k; if (Math.abs(g.vx) + Math.abs(g.vy) < 4) g.vx = g.vy = 0; }
    const dx = P.x - g.x, dy = P.y - g.y, d2 = dx * dx + dy * dy;
    if (!g.pull && d2 < pr2) g.pull = true;
    if (g.pull) { g.sp += 1300 * dt; const d = Math.sqrt(d2) || 1, st = g.sp * dt; if (d < st + 18) collectGem(g); else { g.x += dx / d * st; g.y += dy / d * st; } }
  }
}

// ---------- player ----------
function botInput() {
  let ax = 0, ay = 0;
  for (const e of enemies) { if (e.dead) continue; const dx = P.x - e.x, dy = P.y - e.y, d2 = dx * dx + dy * dy; if (d2 < 280 * 280) { const w = (e.boss ? 400 : 90) / (d2 + 300); ax += dx * w; ay += dy * w; } }
  for (const e of eshots) { const dx = P.x - e.x, dy = P.y - e.y, d2 = dx * dx + dy * dy; if (d2 < 150 * 150) { ax += dx * 120 / (d2 + 100); ay += dy * 120 / (d2 + 100); } }
  let best = null, bd = 1e9; for (const g of gems) { const d = (g.x - P.x) * (g.x - P.x) + (g.y - P.y) * (g.y - P.y); if (d < bd) { bd = d; best = g; } }
  if (best && bd < 500 * 500) { const d = Math.sqrt(bd) || 1; ax += (best.x - P.x) / d * 0.9; ay += (best.y - P.y) / d * 0.9; }
  ax += (1350 - P.x) / 900; ay += (1010 - P.y) / 700;
  ax += Math.cos(G.t * 0.7) * 0.5; ay += Math.sin(G.t * 0.9) * 0.5;
  const m = Math.hypot(ax, ay) || 1; return [ax / m, ay / m];
}
function updPlayer(dt) {
  let ix = joy.dx + key.x, iy = joy.dy + key.y;
  if (G.bot) [ix, iy] = botInput();
  const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
  const sp = 215 * S.spd, f = 1 - Math.exp(-20 * dt);
  P.vx = lerp(P.vx, ix * sp, f); P.vy = lerp(P.vy, iy * sp, f);
  P.x += P.vx * dt; P.y += P.vy * dt;
  for (const s of solids) { const cx = clamp(P.x, s.x, s.x + s.w), cy = clamp(P.y, s.y, s.y + s.h), dx = P.x - cx, dy = P.y - cy, d2 = dx * dx + dy * dy; if (d2 < P.r * P.r) { if (d2 > 0.0001) { const d = Math.sqrt(d2); P.x = cx + dx / d * P.r; P.y = cy + dy / d * P.r; } else { P.y = s.y + s.h + P.r; } } }
  P.x = clamp(P.x, P.r + 4, W - P.r - 4); P.y = clamp(P.y, P.r + 6, H - P.r - 4);
  P.moving = m > 0.12;
  if (P.moving) {
    P.walk += dt * 11 * Math.min(1, m) * S.spd; let d = Math.atan2(iy, ix) - P.aim; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; P.aim += d * (1 - Math.exp(-9 * dt));
    if (Math.abs(ix) > 0.15) P.face = ix > 0 ? 1 : -1;
    if (Math.random() < dt * 5) part(P.x, P.y, rand(-10, 10), -8, 0.35, 14, A.puff, false, 0, 0, 20);
  }
  if (P.inv > 0) P.inv -= dt; P.sy = P.y;
  if (S.regen && P.hp < P.maxhp) P.hp = Math.min(P.maxhp, P.hp + S.regen * dt);
}
function updFx(dt) {
  for (const p of parts) { p.life -= dt; if (p.life <= 0) { p.dead = true; continue; } p.vy += p.grav * dt; if (p.drag) { const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy *= k; } p.x += p.vx * dt; p.y += p.vy * dt; p.size += p.grow * dt; }
  for (const n of nums) { n.t += dt; if (n.t > 0.75) n.dead = true; }
  for (const r of rings) { r.t += dt; if (r.t >= r.d) r.dead = true; }
  for (const f of flashes) { f.t += dt; if (f.t >= f.d) f.dead = true; }
  compact(parts); compact(nums); compact(rings); compact(flashes);
  G.shake *= Math.exp(-9 * dt); if (G.shake < 0.2) G.shake = 0;
  if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * 5);
  if (G.flash2 > 0) { G.flash2 -= dt; if (G.flash2 <= 0) G.flash = 0.8; }
  if (G.hurt > 0) G.hurt = Math.max(0, G.hurt - dt * 2.4);
  if (G.blackout > 0) G.blackout -= dt;
}
function levelUp() {
  sfx('level'); ring(P.x, P.y, 20, 260, 0.5, 'butter', 8); flashAt(P.x, P.y, 420, 0.5, 'warm');
  for (const e of enemies) { if (e.dead || e.boss) continue; const dx = e.x - P.x, dy = e.y - P.y, q = dx * dx + dy * dy; if (q < 230 * 230) { const k = Math.sqrt(q) || 1; e.kx += dx / k * 520 / e.mass; e.ky += dy / k * 520 / e.mass; } }
  const pool = UP.filter(u => lv(u.id) < 5); for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[pool[i], pool[j]] = [pool[j], pool[i]]; }
  if (P.lvl <= 4) pool.sort((a, b) => (b.w || 0) - (a.w || 0) + (Math.random() - 0.5) * 0.9);
  const ch = pool.slice(0, 3); while (ch.length < 3) ch.push(CAKE);
  if (G.bot) { applyUpgrade(pick(ch).id); P.inv = Math.max(P.inv, 0.6); return; }
  G.state = 'levelup'; joy.on = false; joy.dx = joy.dy = 0; showCards(ch);
}

// ---------- main update ----------
function update(dt) {
  G.rt += dt;
  const st = G.state;
  if (st === 'title') { updSlots(dt, false); updFx(dt); G.lightT -= dt; if (G.lightT <= 0) { G.lightT = rand(9, 16); G.flash = 1; G.flash2 = 0.2; } P.aim += dt * 0.5; return; }
  if (st === 'play') {
    G.t += dt;
    if (G.t >= NIGHT) { G.state = 'dawn'; G.stateT = 0; AU.mode = 'off'; sfx('win'); hideHud(); return; }
    updPlayer(dt); director(dt); updSlots(dt, true); gridBuild(); updEnemies(dt); updWeapons(dt); updShots(dt); updPets(dt); updGems(dt);
    for (const b of boxes) { b.t += dt; if (Math.hypot(b.x - P.x, b.y - P.y) < 36) openBox(b); }
    compact(enemies); compact(gems); compact(shots); compact(eshots); compact(boxes);
    G.comboT -= dt; if (G.comboT <= 0) AU.combo = 0;
    updFx(dt);
    if (G.pending > 0 && G.state === 'play') { G.pending--; levelUp(); }
    return;
  }
  if (st === 'dying') { G.stateT += dt; updFx(dt); gridBuild(); const sd = dt * 0.25; for (const e of enemies) e.t += sd; if (G.stateT > 1.0) { G.state = 'scare'; G.stateT = 0; sfx('scare'); } return; }
  if (st === 'scare') { G.stateT += dt; if (G.stateT > 0.85) { G.state = 'over'; showOver(); } return; }
  if (st === 'dawn') {
    G.stateT += dt; G.dawn = Math.min(1, G.stateT / 2.6); updFx(dt);
    for (const e of enemies) { e.t += dt * 0.3; if (!e.dead && Math.random() < dt * (0.8 + G.stateT * 2)) { e.dead = true; burst(e.x, e.y - e.hgt * 0.4, 'butter', e.boss ? 30 : 5); } }
    compact(enemies); eshots.length = 0;
    if (G.stateT > 3.6) { G.state = 'won'; showWin(); }
    return;
  }
}
function sim(maxT = 400) {
  // headless balance run: no rendering
  G.bot = true; reset(); G.state = 'play';
  const log = []; let lastLog = 0, n = 0;
  while (G.state === 'play' && n++ < maxT * 60) { update(1 / 60); if (G.t - lastLog >= 30) { lastLog = G.t; log.push({ t: Math.round(G.t), lvl: P.lvl, hp: Math.round(P.hp), en: enemies.length, kills: G.kills, boss: G.boss ? Math.round(G.boss.hp / G.boss.maxhp * 100) : (G.bossDead ? 'dead' : '-') }); } }
  const r = { state: G.state, t: Math.round(G.t), lvl: P.lvl, kills: G.kills, hp: Math.round(P.hp), bossDead: G.bossDead, up: Object.assign({}, P.up), log };
  G.bot = false; return r;
}

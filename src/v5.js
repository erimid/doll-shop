// ---------- v5: fear rank, abilities, keepsakes, new weapons, kill streaks ----------
const ABIL = {
  scream: { name: 'Banshee Scream', desc: 'Scream so loud the dolls fly back and crack.', cd: 24, rank: 0 },
  hide: { name: 'Hide and Seek', desc: 'Vanish for 4 seconds. They lose you and you slip past, faster.', cd: 30, rank: 2 },
  flash: { name: 'Flashbulb', desc: 'A camera flash stuns every doll on screen.', cd: 26, rank: 5 },
  voodoo: { name: 'Voodoo Double', desc: 'Drop a stitched copy of yourself. They swarm it, then it bursts.', cd: 28, rank: 8 },
  seance: { name: 'Séance', desc: 'Every gem in the store floats to you, and you heal 30%.', cd: 40, rank: 12 },
  toll: { name: 'Midnight Toll', desc: 'The clock strikes twelve. Everything but you stops for 4 seconds.', cd: 48, rank: 17 },
};
const KEEP = {
  button: { name: 'Button Eyes', desc: '+30% buttons, but the dolls are 8% faster.', rank: 1 },
  mirror: { name: 'Cracked Mirror', desc: 'Crits do 60% more damage. 15 less health.', rank: 3 },
  key: { name: 'Wind-Up Key', desc: 'Your ability recharges 35% faster.', rank: 4 },
  wax: { name: 'Wax Heart', desc: '+50 max health, but you move 8% slower.', rank: 6 },
  moth: { name: 'Moth Lantern', desc: 'Bigger flashlight. Dolls in the beam are slower and take 20% more damage.', rank: 9 },
  tooth: { name: 'Tooth Tin', desc: 'Glowing elite dolls always leave a mystery box.', rank: 11 },
  ribbon: { name: 'Grudge Ribbon', desc: '+4% damage every minute you last (up to +60%), but 25% less health.', rank: 14 },
  sister: { name: 'Little Sister', desc: 'A cracked doll follows you and shrieks, freezing dolls nearby.', rank: 19 },
};
// what each fear rank gives you
const RANKS = [null,
  { k: 'keep', id: 'button' }, { k: 'abil', id: 'hide' }, { k: 'keep', id: 'mirror' }, { k: 'keep', id: 'key' }, { k: 'abil', id: 'flash' },
  { k: 'keep', id: 'wax' }, { k: 'item', id: 'pins' }, { k: 'abil', id: 'voodoo' }, { k: 'keep', id: 'moth' }, { k: 'coins', n: 500 },
  { k: 'keep', id: 'tooth' }, { k: 'abil', id: 'seance' }, { k: 'item', id: 'hands' }, { k: 'keep', id: 'ribbon' }, { k: 'slot' },
  { k: 'coins', n: 800 }, { k: 'abil', id: 'toll' }, { k: 'mastery' }, { k: 'keep', id: 'sister' }, { k: 'hero', id: 'ivy' },
];
const RANK_MAX = RANKS.length - 1;
const RANK_NAMES = ['Customer', 'Browser', 'Night Owl', 'Insomniac', 'Shelf Stocker', 'Lights-Out Kid', 'Night Shift', 'Doll Doctor', 'Graveyard Regular', 'Stitch Witch', 'Collector',
  'Closer', 'Medium', 'Haunt', 'Grudge Keeper', 'Two Charms', 'Keyholder', 'Bell Ringer', 'Night Manager', 'Big Sister', 'The Owner'];
const rankNeed = r => 120 + 60 * Math.min(r, 30);
function rankInfo(d) { let r = 0; while (d >= rankNeed(r)) { d -= rankNeed(r); r++; } return { r, into: d, need: rankNeed(r) }; }
const rankName = r => RANK_NAMES[Math.min(r, RANK_NAMES.length - 1)] + (r > RANK_MAX ? ' +' + (r - RANK_MAX) : '');
function rankLine(r) {
  const q = RANKS[r]; if (!q) return { name: '300 buttons', what: 'BONUS', icon: 'coin' };
  if (q.k === 'abil') return { name: ABIL[q.id].name, what: 'ABILITY', icon: 'ab_' + q.id };
  if (q.k === 'keep') return { name: KEEP[q.id].name, what: 'KEEPSAKE', icon: 'kp_' + q.id };
  if (q.k === 'item') return { name: IT[q.id].name, what: 'NEW WEAPON', icon: q.id };
  if (q.k === 'coins') return { name: q.n + ' buttons', what: 'BONUS', icon: 'coin' };
  if (q.k === 'slot') return { name: 'Second keepsake slot', what: 'UPGRADE', icon: 'kp_slot' };
  if (q.k === 'mastery') return { name: 'Abilities recharge 10% faster', what: 'UPGRADE', icon: 'ab_master' };
  return { name: heroById(q.id).name + ', The Medium', what: 'NEW GIRL', icon: 'hero_' + q.id };
}
const abilOpen = id => SV.rank >= ABIL[id].rank;
const keepOpen = id => SV.rank >= KEEP[id].rank;
const keepSlots = () => SV.rank >= 15 ? 2 : 1;
function grantRank(r) { const q = RANKS[r]; if (!q) { SV.coins += 300; return; } if (q.k === 'coins') SV.coins += q.n; if (q.k === 'item') SV.items[q.id] = 1; }
// existing players get credit for the nights they already survived
if (!(SV.dread >= 0)) {
  const s = SV.stats; let w = 0; for (const k in s.wins) w += s.wins[k];
  SV.dread = Math.round(s.kills / 12 + s.runs * 40 + s.minis * 40 + s.bosses * 120 + w * 150);
  const ri = rankInfo(SV.dread); for (let r = 1; r <= ri.r; r++) grantRank(r); SV.rank = ri.r; save();
}
if (!ABIL[SV.abil] || !abilOpen(SV.abil)) SV.abil = 'scream';
SV.keep = (Array.isArray(SV.keep) ? SV.keep : []).filter(k => KEEP[k] && keepOpen(k)).slice(0, keepSlots());

HEROES.push({ id: 'ivy', name: 'Ivy', tag: 'The Medium', start: 'hands', perk: 'Ability recharges 30% faster. Dolls drop more gems near her', rank: 20, mod: { acd: 0.3, pick: 0.2 },
  o: { skin: '#e9e2f2', hair: '#3b1f3f', hair2: '#1c0f22', streak: '#ff5577', style: 'long', iris: '#ff5577', top: '#1c0f22', top2: '#ff5577', skirt: '#3b1f3f', sock: '#1c0f22', sock2: '#ff5577', boot: '#0b0618', sole: '#ff5577', emblem: 'moon', emb: '#ffc2d0', choker: true, bowTop: '#ff5577' } });

Object.assign(IT, {
  pins: { k: 'W', name: 'Pin Cushion', cat: 'TOY', desc: ['Shoots a ring of 6 sewing pins.', '8 pins.', 'More damage.', '10 pins, faster.', '14 pins that go through dolls.'], evo: ['tiara', 'Thousand Needles', 'Two spinning rings of piercing needles, nonstop.'] },
  hands: { k: 'W', name: 'Shadow Hands', cat: 'CHARM', desc: ['A hand reaches up through the floor and grabs a doll.', 'Grabs harder.', 'Two hands.', 'Holds dolls in place longer.', 'Three hands, faster.'], evo: ['nightlight', 'Under the Bed', 'Six hands drag whole crowds down. Even bosses stop.'] },
});
IT.pins.id = 'pins'; IT.hands.id = 'hands';

// ---------- abilities ----------
function abilReset() {
  const hm = G.hero.mod || {};
  G.ab = { id: SV.abil, cd: ABIL[SV.abil].cd * (G.keep.key ? 0.65 : 1) * (SV.rank >= 18 ? 0.9 : 1) * (1 - (hm.acd || 0)), t: 0, uses: 0, ready: false };
  G.ab.t = G.ab.cd * 0.5;
}
const abDmg = b => b * (1 + G.t / 110) * (1 + Math.max(0, G.t - 600) / 300);
function useAbility() {
  const a = G.ab; if (!a || G.state !== 'play' || a.t < a.cd) return false;
  a.t = 0; a.uses++; a.ready = false; G.abFx = 1; G.abFxId = a.id;
  const x = P.x, y = P.y;
  if (a.id === 'scream') {
    SRC = 'ability'; const R = 300 * S.area;
    forNear(x, y, R, e => { hurt(e, abDmg(55) * (e.boss ? 0.6 : 1), x, y, 900); if (!e.dead && !e.boss) { e.slow = 0.8; e.slowF = 0; } });
    for (const s of eshots) if (Math.hypot(s.x - x, s.y - y) < R) s.dead = true;
    for (let i = 0; i < 3; i++) setTimeout(() => ring(P.x, P.y, 20, R * (1 + i * 0.15), 0.5, i ? 'pink' : 'red', 10 - i * 3), i * 90);
    flashAt(x, y, R * 2.2, 0.4, 'red'); shake(14); sfx('scream'); G.flick = 0.25;
    for (let i = 0; i < 24; i++) { const an = rand(TAU), s = rand(200, 520); part(x, y - 30, Math.cos(an) * s, Math.sin(an) * s * 0.8, rand(0.4, 0.7), rand(10, 18), A.spark[pick(['red', 'pink', 'white'])], true, 0, 3); }
  } else if (a.id === 'hide') {
    G.hideT = 4; G.hideX = x; G.hideY = y; sfx('vanish');
    for (let i = 0; i < 14; i++) part(x + rand(-20, 20), y - rand(0, 60), rand(-60, 60), rand(-90, -20), rand(0.5, 0.9), rand(24, 40), A.puff, false, 0, 1, 40);
    addNum(x, y - 90, 'HIDDEN', 3);
  } else if (a.id === 'flash') {
    SRC = 'ability'; G.flash = 1.2; sfx('shutter'); const hw = VIEW.w / 2 + 120, hh = VIEW.h / 2 + 120;
    for (const e of enemies) { if (e.dead || Math.abs(e.x - x) > hw || Math.abs(e.y - y) > hh) continue; hurt(e, abDmg(30), x, y, 0); if (!e.dead) { e.slow = e.boss ? 1 : 2.8; e.slowF = e.boss ? 0.35 : 0; e.flash = 0.2; } }
    G.stunH = 2.5;
  } else if (a.id === 'voodoo') {
    G.decoy = { kind: 'decoy', x, y, sy: y, t: 0, d: 5, face: P.face, dead: false }; sfx('squish'); sfx('giggle');
    ring(x, y, 10, 90, 0.4, 'red', 5);
  } else if (a.id === 'seance') {
    for (const g of gems) g.pull = true; heal(Math.round(P.maxhp * 0.3)); sfx('whisper'); sfx('chime');
    flashAt(x, y, 900, 0.8, 'lilac'); ring(x, y, 600, 20, 0.7, 'mint', 8);
    for (let i = 0; i < 18; i++) { const an = rand(TAU), d = rand(200, 420); part(x + Math.cos(an) * d, y + Math.sin(an) * d * 0.8 - 30, -Math.cos(an) * d * 1.6, -Math.sin(an) * d * 1.3, 0.6, rand(30, 46), A.puff, false, 0, 0, -20); }
  } else if (a.id === 'toll') {
    G.stopT = 4; sfx('bell'); shake(10); flashAt(x, y, 1000, 0.6, 'blue'); ring(x, y, 20, 900, 1.2, 'mint', 12);
  }
  return true;
}
function updAbility(dt) {
  const a = G.ab; if (!a) return;
  if (a.t < a.cd) { a.t += dt; if (a.t >= a.cd && !a.ready) { a.ready = true; sfx('ready'); } }
  if (G.abFx > 0) G.abFx -= dt * 1.5;
  if (G.hideT > 0) { G.hideT -= dt; if (Math.random() < dt * 8) part(P.x + rand(-14, 14), P.y - rand(10, 60), 0, -20, 0.5, rand(16, 26), A.puff, false, 0, 1, 20); if (G.hideT <= 0) { sfx('vanish'); for (let i = 0; i < 8; i++) part(P.x + rand(-20, 20), P.y - rand(0, 60), rand(-40, 40), -30, 0.5, rand(24, 34), A.puff, false, 0, 1, 30); } }
  if (G.stopT > 0) { G.stopT -= dt; if (G.stopT <= 0) { sfx('bell2'); ring(P.x, P.y, 900, 20, 0.5, 'mint', 6); } }
  if (G.stunH > 0) G.stunH -= dt;
  const d = G.decoy;
  if (d) {
    d.t += dt; if (Math.random() < dt * 6) part(d.x + rand(-10, 10), d.y - rand(20, 60), 0, -30, 0.4, rand(8, 12), A.spark.red, true);
    if (d.t >= d.d) { SRC = 'ability'; G.decoy = null; explode(d.x, d.y, 230 * S.area, abDmg(90), 'butter'); sfx('boom'); shake(10); ring(d.x, d.y, 30, 260, 0.5, 'red', 9); }
  }
  if (G.bot && a.t >= a.cd) {
    let n = 0; forNear(P.x, P.y, 220, () => n++);
    if (n > 10 || P.hp < P.maxhp * 0.35 || G.bosses.length) useAbility();
  }
}
// where an enemy is headed: you, your double, or the spot you vanished from
function enemyGoal(e) {
  if (e.boss) return null;
  const d = G.decoy; if (d && (e.x - d.x) * (e.x - d.x) + (e.y - d.y) * (e.y - d.y) < 700 * 700) return d;
  if (G.hideT > 0) { if (!e._hx || e._hs !== G.hideX) { e._hs = G.hideX; e._hx = G.hideX + rand(-140, 140); e._hy = G.hideY + rand(-110, 110); } return { x: e._hx, y: e._hy }; }
  return null;
}

// ---------- keepsakes ----------
function keepRecalc() {
  const K = G.keep;
  if (K.button) S.coin *= 1.3;
  if (K.mirror) { S.critM += 0.6; P.maxhp -= 15; }
  if (K.wax) { P.maxhp += 50; S.spd -= 0.08; }
  if (K.moth) { S.batt += 2; S.moth = 0.08; } else S.moth = 0;
  if (K.ribbon) P.maxhp = Math.round(P.maxhp * 0.75);
}
const grudge = () => G.keep.ribbon ? 1 + Math.min(0.6, G.t / 60 * 0.04) : 1;

// ---------- kill streaks ----------
function streakKill(e) {
  if (e.boss) return; const n = ++G.streak; if (n > G.streakBest) G.streakBest = n;
  if (n % 50) return;
  addNum(P.x, P.y - 100, n + ' STREAK!', 3); sfx('chime'); ring(P.x, P.y, 20, 200, 0.4, 'butter', 6);
  if (n % 100 === 0) dropBoxNear();
  if (n % 250 === 0) { G.flash = 0.6; SRC = 'other'; for (const o of enemies) if (!o.dead && !o.boss && Math.abs(o.x - P.x) < 700 && Math.abs(o.y - P.y) < 500) hurt(o, 60 + G.t * 0.4, P.x, P.y, 260); banner('UNTOUCHABLE', n + ' without a scratch'); }
}
function streakLost() { if (G.streak >= 25) addNum(P.x, P.y - 112, 'STREAK LOST', 2); G.streak = 0; }
function dropBoxNear(x = P.x, y = P.y) {
  for (let k = 0; k < 16; k++) { const a = rand(TAU), d = rand(150, 260), bx = clamp(x + Math.cos(a) * d, 140, W - 140), by = clamp(y + Math.sin(a) * d * 0.8, 160, H - 120); if (!shelfAt(bx, by)) { boxes.push({ kind: 'box', x: bx, y: by, sy: by, t: 0, dead: false }); return; } }
}

// ---------- new weapons ----------
function updV5Weapons(dt) {
  const tm = P.tm; let L;
  if ((L = lv('pins'))) {
    tm.pins = (tm.pins === undefined ? 0.4 : tm.pins) - dt;
    if (tm.pins <= 0) {
      tm.pins = [0, 1.6, 1.6, 1.5, 1.3, 1.2, 0.55][L] * S.cd; echo(tm, 'pins'); sfx('pins');
      const n = [0, 6, 8, 8, 10, 14, 18][L], dmg = [0, 12, 12, 18, 18, 22, 30][L], off = G.t * 1.7, rings = L === 6 ? 2 : 1;
      for (let r = 0; r < rings; r++) for (let i = 0; i < n; i++) {
        const a = off + (i + r * 0.5) * TAU / n, sp = r ? 520 : 620;
        if (shots.length < 360) shots.push({ k: 'pin', x: P.x + Math.cos(a) * 16, y: P.y + Math.sin(a) * 12, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.85, a, r: 8 * S.area, dmg, pierce: L >= 5 ? (L === 6 ? 3 : 1) : 0, life: 0.75, hit: [], dead: false });
      }
    }
  }
  if ((L = lv('hands'))) {
    tm.hands = (tm.hands === undefined ? 0.6 : tm.hands) - dt;
    if (tm.hands <= 0) {
      const n = [0, 1, 1, 2, 2, 3, 6][L], pool = nearestList(P.x, P.y, 520, 24);
      if (pool.length) {
        tm.hands = [0, 2.4, 2.4, 2.4, 2.2, 1.8, 1.3][L] * S.cd; echo(tm, 'hands');
        pool.sort((a, b) => b.hp - a.hp);
        for (let i = 0; i < n; i++) { const e = pool[i % pool.length]; shots.push({ k: 'hand', x: e.x + (i >= pool.length ? rand(-40, 40) : 0), y: e.y + 4, tg: e, t: 0, d: 0.42, life: 1.25, done: false, dmg: [0, 40, 58, 58, 70, 90, 120][L], hold: [0, 0.7, 0.7, 0.7, 1.3, 1.3, 1.7][L], evo: L === 6, fl: rand() < 0.5 ? -1 : 1, dead: false }); }
        sfx('creak');
      } else tm.hands = 0.3;
    }
  }
}
function updV5Shot(s, dt) {
  if (s.k === 'pin') {
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (s.life <= 0) { s.dead = true; return; }
    forNear(s.x, s.y, s.r, e => { if (s.dead || s.hit.indexOf(e) >= 0) return; s.hit.push(e); hurt(e, s.dmg, s.x - s.vx, s.y - s.vy, 70); part(s.x, s.y - 22, 0, 0, 0.15, 16, A.spark.white, true); if (--s.pierce < 0) s.dead = true; });
  } else if (s.k === 'hand') {
    s.t += dt; if (s.tg && !s.tg.dead && !s.done) { s.x = lerp(s.x, s.tg.x, 0.3); s.y = lerp(s.y, s.tg.y + 4, 0.3); }
    if (!s.done && s.t >= s.d) {
      s.done = true; const R = (s.evo ? 90 : 34) * S.area;
      forNear(s.x, s.y, R, e => { hurt(e, s.dmg * (e === s.tg ? 1 : 0.6), s.x, s.y, 0); if (!e.dead) { const bs = e.boss; e.slow = bs ? (s.evo ? s.hold * 0.5 : 0) : s.hold; e.slowF = bs ? 0.4 : 0; if (s.evo && !bs) { e.kx += (s.x - e.x) * 4; e.ky += (s.y - e.y) * 4; } } });
      if (s.tg && !s.tg.dead) { s.tg.slow = Math.max(s.tg.slow, s.tg.boss ? 0.3 : s.hold); s.tg.slowF = s.tg.boss ? 0.4 : 0; }
      shake(2); for (let i = 0; i < 5; i++) part(s.x + rand(-20, 20), s.y - rand(0, 10), rand(-30, 30), rand(-60, -20), 0.5, rand(16, 26), A.puff, false, 0, 1, 20);
    }
    if (s.t >= s.life) s.dead = true;
  }
}
function updSister(p, dt) {
  const a = Math.atan2(P.vy, P.vx), back = Math.hypot(P.vx, P.vy) > 30 ? a + Math.PI : p.t * 0.6;
  const hx = P.x + Math.cos(back) * 52, hy = P.y + Math.sin(back) * 34, f = 1 - Math.exp(-3 * dt);
  p.face = P.x > p.x ? 1 : -1; p.x = lerp(p.x, hx, f); p.y = lerp(p.y, hy, f); p.cd -= dt;
  if (p.cd <= 0) {
    let n = 0; forNear(p.x, p.y, 210, () => n++);
    if (n >= 3 || p.cd < -4) {
      p.cd = 7; p.shriek = 0.5; SRC = 'sister'; sfx('shriek');
      forNear(p.x, p.y, 210 * S.area, e => { hurt(e, abDmg(14), p.x, p.y, 300); if (!e.dead && !e.boss) { e.slow = 1.3; e.slowF = 0; } });
      ring(p.x, p.y, 10, 210 * S.area, 0.45, 'red', 6); flashAt(p.x, p.y, 380, 0.3, 'red');
    }
  }
  if (p.shriek > 0) p.shriek -= dt;
}

// ---------- art ----------
function buildArt5() {
  A.needle = sprite(36, 12, 18, 6, g => { g.beginPath(); g.moveTo(-13, 0); g.lineTo(13, 0); g.lineWidth = 4.2; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#e6e9ff'; g.stroke(); g.beginPath(); g.moveTo(12, -2.2); g.lineTo(17, 0); g.lineTo(12, 2.2); g.closePath(); g.fillStyle = '#e6e9ff'; g.fill(); circ(g, -14, 0, 3.6); fs(g, C.hot, 1.6); circ(g, -15, -1.2, 1.1); g.fillStyle = '#fff'; g.fill(); });
  A.hand = sprite(84, 130, 42, 120, g => {
    const sk = '#22143a', nail = '#d9ccff';
    g.beginPath(); g.moveTo(-13, 6); g.bezierCurveTo(-17, -24, -10, -48, -15, -66); g.lineTo(14, -66); g.bezierCurveTo(10, -46, 17, -22, 13, 6); g.closePath(); fs(g, sk, 2.6, '#06020e');
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, -8); g.quadraticCurveTo(-9, -36, -6, -60); g.stroke();
    ell(g, 0, -74, 17, 13); fs(g, sk, 2.6, '#06020e');
    const F = [[-16, -76, -30, -96, -24, -114], [-7, -84, -12, -110, -4, -124], [4, -84, 6, -112, 14, -122], [13, -78, 24, -100, 30, -112], [16, -68, 30, -70, 34, -82]];
    for (const [x0, y0, x1, y1, x2, y2] of F) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.lineWidth = 9; g.strokeStyle = '#06020e'; g.stroke(); g.lineWidth = 5.5; g.strokeStyle = sk; g.stroke(); circ(g, x2, y2, 2.6); fs(g, nail, 1.2, '#06020e'); }
  });
  A.pool = sprite(110, 50, 55, 25, g => { const gr = g.createRadialGradient(0, 0, 4, 0, 0, 52); gr.addColorStop(0, 'rgba(4,0,12,.95)'); gr.addColorStop(0.7, 'rgba(10,2,24,.7)'); gr.addColorStop(1, 'rgba(10,2,24,0)'); g.scale(1, 0.42); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 52, 0, TAU); g.fill(); });
  { const R = sprite(64, 88, 32, 78, g => { g.scale(0.62, 0.62); drawDoll(g, DOLLS.por[1], {}); scareFace(g, { crack: true, col: '#ff2244' }); }); A.sister = { R, L: flipS(R) }; }
  A.icon.coin = A.icon.coin || A.icon.cake;
  // hero ivy portrait (pushed after art2 built the others)
  if (A.portrait.length < HEROES.length) for (let i = A.portrait.length; i < HEROES.length; i++) A.portrait[i] = sprite(72, 100, 36, 90, g => drawHero(g, HEROES[i].o, {}), 3);
  A.icon.hero_ivy = (() => { const c = mk(192, 192), g = c.getContext('2d'); const p = A.portrait[HEROES.findIndex(h => h.id === 'ivy')]; g.drawImage(p.c, 34, 4, 124, 172); return c; })();
}
Object.assign(ICON, {
  pins(g) { ell(g, 0, 12, 30, 22); fs(g, '#ff5577', 3); for (const x of [-14, 0, 14]) { g.beginPath(); g.moveTo(x, -8); g.quadraticCurveTo(x + 4, 12, x, 32); g.lineWidth = 2; g.strokeStyle = 'rgba(26,15,51,.5)'; g.stroke(); } rr(g, -8, -16, 16, 8, 3); fs(g, '#5fe08a', 2.4); for (const [x, y, a, c] of [[-16, -2, -0.5, C.butter], [4, -10, 0.1, C.mint], [18, 0, 0.6, C.lilac]]) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26); g.lineWidth = 3; g.strokeStyle = '#e6e9ff'; g.stroke(); circ(g, 0, -28, 5); fs(g, c, 2.2); g.restore(); } },
  hands(g) { ell(g, 0, 28, 34, 10); g.fillStyle = '#06020e'; g.fill(); g.save(); g.translate(0, 30); g.scale(0.56, 0.56); g.drawImage(A.hand.c, -42, -120, 84, 130); g.restore(); circ(g, -18, 27, 2.2); g.fillStyle = '#ff2244'; g.fill(); circ(g, -11, 27, 2.2); g.fill(); },
  ab_scream(g) { circ(g, -8, 2, 25); fs(g, '#f6e6f0', 3); for (const s of [-1, 1]) { ell(g, -8 + s * 9, -7, 4.5, 5.5); g.fillStyle = INK; g.fill(); } ell(g, -8, 13, 7, 10); fs(g, '#2a0b2e', 2.4); g.beginPath(); g.moveTo(-18, -18); g.lineTo(-12, -8); g.lineTo(-16, 0); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(12, 4, 14 + i * 9, -0.7, 0.7); g.lineWidth = 4; g.strokeStyle = ['#ff4f7f', '#ff8fd0', '#ffc2e6'][i]; g.stroke(); } },
  ab_hide(g) { rr(g, -30, -36, 60, 72, 7); fs(g, '#2f2157', 3); g.fillStyle = '#06020e'; g.fillRect(-3, -32, 6, 64); for (let i = 0; i < 6; i++) { g.fillStyle = '#1c1238'; g.fillRect(-26, -28 + i * 9, 20, 4); g.fillRect(6, -28 + i * 9, 20, 4); } for (const y of [-4]) { circ(g, -1, y, 2.2); g.fillStyle = C.mint; g.fill(); circ(g, 1, y + 8, 2.2); g.fill(); } circ(g, 22, 4, 3.5); fs(g, C.butter, 2); },
  ab_flash(g) { rr(g, -32, -12, 64, 40, 7); fs(g, '#2f2157', 3); rr(g, -14, -22, 28, 12, 3); fs(g, '#43317f', 3); circ(g, 0, 8, 15); fs(g, '#120b24', 3); circ(g, 0, 8, 8); fs(g, '#7fb8ff', 2); circ(g, -3, 5, 2.6); g.fillStyle = '#fff'; g.fill(); rr(g, 18, -8, 10, 7, 2); fs(g, C.butter, 2); star(g, 24, -26, 14, 4, 8); fs(g, '#fff6fb', 1.6); },
  ab_voodoo(g) { g.beginPath(); circ(g, 0, -18, 15); fs(g, '#d9b98a', 3); rr(g, -14, -4, 28, 36, 8); fs(g, '#d9b98a', 3); for (const s of [-1, 1]) { rr(g, s * 22 - 6, -2, 12, 22, 5); fs(g, '#d9b98a', 2.6); } for (const [x, y] of [[-6, -20], [6, -20]]) { g.beginPath(); g.moveTo(x - 3, y - 3); g.lineTo(x + 3, y + 3); g.moveTo(x + 3, y - 3); g.lineTo(x - 3, y + 3); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); } g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(i * 5, -10); g.lineTo(i * 5, -7); } g.stroke(); heart(g, 0, 10, 6); fs(g, '#ff4f7f', 1.6); for (const [x, y, a, c] of [[14, -24, 0.7, C.mint], [-10, 20, -0.9, C.butter]]) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -22); g.lineWidth = 2.6; g.strokeStyle = '#e6e9ff'; g.stroke(); circ(g, 0, -24, 4.5); fs(g, c, 2); g.restore(); } },
  ab_seance(g) { rr(g, -10, -4, 20, 40, 3); fs(g, '#f6eedc', 3); g.fillStyle = 'rgba(26,15,51,.25)'; g.fillRect(-10, 4, 20, 3); g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -10); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(0, -34); g.quadraticCurveTo(9, -18, 0, -10); g.quadraticCurveTo(-9, -18, 0, -34); fs(g, C.butter, 2); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 18, 10); g.quadraticCurveTo(s * 34, -6, s * 24, -26); g.quadraticCurveTo(s * 36, -18, s * 34, -34); g.lineWidth = 5; g.strokeStyle = 'rgba(201,167,255,.9)'; g.stroke(); } },
  ab_toll(g) { circ(g, 0, 4, 30); fs(g, '#f6eedc', 3); circ(g, 0, 4, 24); fs(g, null, 1.6); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.fillStyle = INK; circ(g, Math.cos(a) * 20, 4 + Math.sin(a) * 20, i % 3 ? 1.4 : 2.6); g.fill(); } g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, -15); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(0, 4); g.lineTo(2, -9); g.lineWidth = 5; g.stroke(); circ(g, 0, 4, 3.5); fs(g, '#ff4f7f', 1.6); for (const s of [-1, 1]) { circ(g, s * 24, -26, 8); fs(g, '#ffd24a', 2.6); } },
  ab_master(g) { star(g, 0, 2, 32, 14); fs(g, C.butter, 3); star(g, 0, 2, 14, 6); fs(g, '#fff6fb', 2); },
  kp_slot(g) { rr(g, -30, -24, 60, 48, 10); g.setLineDash([6, 5]); fs(g, '#22163f', 3, C.lilac); g.setLineDash([]); g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 12); g.moveTo(-12, 0); g.lineTo(12, 0); g.lineWidth = 5; g.strokeStyle = C.lilac; g.stroke(); },
  kp_button(g) { for (const [x, c] of [[-16, '#ff4f7f'], [16, '#8ff5d8']]) { circ(g, x, 0, 18); fs(g, c, 3); circ(g, x, 0, 13); fs(g, null, 1.6); g.fillStyle = INK; for (const [dx, dy] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) { circ(g, x + dx, dy, 2.4); g.fill(); } } g.beginPath(); g.moveTo(-24, 22); g.quadraticCurveTo(0, 34, 24, 22); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); },
  kp_mirror(g) { g.save(); g.rotate(-0.4); rr(g, -5, 14, 10, 26, 4); fs(g, '#b98aff', 3); ell(g, 0, -10, 22, 27); fs(g, '#b98aff', 3); ell(g, 0, -10, 16, 21); fs(g, '#cfeaff', 2); g.beginPath(); g.moveTo(-6, -30); g.lineTo(2, -14); g.lineTo(-4, -8); g.lineTo(6, 6); g.moveTo(2, -14); g.lineTo(12, -18); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.restore(); },
  kp_key(g) { for (const s of [-1, 1]) { ell(g, s * 18, -14, 15, 11); fs(g, C.butter, 3); ell(g, s * 18, -14, 6, 4); g.fillStyle = INK; g.fill(); } rr(g, -5, -10, 10, 42, 4); fs(g, '#ffd24a', 3); rr(g, -9, 20, 18, 8, 3); fs(g, '#ffd24a', 2.4); },
  kp_wax(g) { heart(g, 0, 0, 28); fs(g, '#f6eedc', 3); for (const [x, l] of [[-14, 14], [-2, 22], [12, 10]]) { rr(g, x - 3.5, 6, 7, l, 3.5); fs(g, '#f6eedc', 2.2); } heart(g, 0, -2, 12); g.fillStyle = 'rgba(255,79,127,.6)'; g.fill(); g.beginPath(); g.moveTo(0, -24); g.lineTo(0, -32); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(0, -48); g.quadraticCurveTo(6, -38, 0, -32); g.quadraticCurveTo(-6, -38, 0, -48); fs(g, C.butter, 1.8); },
  kp_moth(g) { for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, -6); g.bezierCurveTo(s * 20, -36, s * 40, -24, s * 34, -2); g.bezierCurveTo(s * 30, 8, s * 10, 4, 0, 0); g.closePath(); fs(g, '#cbb89a', 3); g.beginPath(); g.moveTo(0, 2); g.bezierCurveTo(s * 18, 6, s * 30, 18, s * 18, 26); g.bezierCurveTo(s * 10, 28, s * 4, 14, 0, 4); g.closePath(); fs(g, '#a8916e', 3); circ(g, s * 20, -14, 5); fs(g, '#2f2157', 1.6); circ(g, s * 20, -14, 2); g.fillStyle = C.butter; g.fill(); } ell(g, 0, 2, 4.5, 16); fs(g, '#5a4632', 2.4); },
  kp_tooth(g) { rr(g, -30, -14, 60, 36, 6); fs(g, '#9fb4e6', 3); rr(g, -32, -20, 64, 10, 4); fs(g, '#7f94c6', 3); g.beginPath(); g.moveTo(-10, -6); g.quadraticCurveTo(-12, -30, 0, -26); g.quadraticCurveTo(12, -30, 10, -6); g.lineTo(6, 10); g.lineTo(2, 0); g.lineTo(-2, 0); g.lineTo(-6, 10); g.closePath(); fs(g, '#fff6fb', 2.6); },
  kp_ribbon(g) { for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, -4); g.bezierCurveTo(s * 16, -30, s * 38, -22, s * 32, -2); g.bezierCurveTo(s * 38, 14, s * 14, 16, 0, -4); g.closePath(); fs(g, '#17102b', 3, '#ff2244'); g.beginPath(); g.moveTo(s * 4, 2); g.lineTo(s * 16, 34); g.lineTo(s * 6, 28); g.closePath(); fs(g, '#17102b', 2.4, '#ff2244'); } rr(g, -7, -11, 14, 16, 4); fs(g, '#ff2244', 2.4); },
  kp_sister(g) { g.translate(0, 34); g.scale(1.05, 1.05); g.drawImage(A.sister.R.c, -32, -78, 64, 88); },
});
// rank-up icons need A.sister & A.hand, so icons built after art5: patched into boot below

// ---------- results: dread ----------
function dreadFor(r, earned) {
  let d = G.kills / 10 + Math.min(r.t, 1800) / 2 + G.minisKilled * 40 + G.bossKills * 120 + (r.win ? (G.mode.id === 'short' ? 150 : 400) : 0) + (G.found ? 100 : 0) + Math.min(60, G.streakBest / 5);
  let dm = 0; for (const k in G.dare) if (G.dare[k] && DARES[k]) dm += DARES[k].mul;
  return Math.round(d * (1 + (MAP.bonus || 0) + dm));
}
function dreadHtml(from, to) {
  const a = rankInfo(from), b = rankInfo(to), ups = [];
  for (let r = a.r + 1; r <= b.r; r++) { grantRank(r); ups.push(r); }
  SV.rank = b.r;
  const f0 = a.r < b.r ? 0 : a.into / a.need, f1 = b.into / b.need;
  let h = `<div class="dread"><div class="dr"><b>FEAR RANK ${b.r}</b><span>${rankName(b.r)}</span><em>+${to - from} dread</em></div><div class="dbar"><u style="width:${f0 * 100}%" data-w="${f1 * 100}"></u></div>`;
  if (ups.length) h += '<div class="dups">' + ups.map(r => { const L = rankLine(r); return `<span><img src="${iconUrl(L.icon)}"><i>RANK ${r} · ${L.what}</i><b>${L.name}</b></span>`; }).join('') + '</div>';
  return { html: h + '</div>', ups };
}

// ---------- loadout screen ----------
function renderLoadout() {
  const ks = keepSlots();
  let h = `<h4>ABILITY <small>tap the round button in the corner, or press space</small></h4><div class="lgrid">`;
  for (const id in ABIL) { const a = ABIL[id], open = abilOpen(id), on = SV.abil === id; h += `<button class="tile lo${on ? ' on' : ''}${open ? '' : ' lockd'}" data-a="${id}" style="--c:${on ? '#ff5577' : '#6a58ad'}"><img src="${iconUrl('ab_' + id)}"><h3>${open ? a.name : '???'}</h3><p>${open ? a.desc : 'Reach Fear Rank ' + a.rank}</p><span class="cost">${open ? (on ? 'EQUIPPED' : a.cd + 's recharge') : '🔒 RANK ' + a.rank}</span></button>`; }
  h += `</div><h4>KEEPSAKES <small>${SV.keep.length}/${ks} carried${ks < 2 ? ' · second slot at Fear Rank 15' : ''}</small></h4><div class="lgrid">`;
  for (const id in KEEP) { const k = KEEP[id], open = keepOpen(id), on = SV.keep.indexOf(id) >= 0; h += `<button class="tile lo${on ? ' on' : ''}${open ? '' : ' lockd'}" data-k="${id}" style="--c:${on ? '#ffd24a' : '#6a58ad'}"><img src="${iconUrl('kp_' + id)}"><h3>${open ? k.name : '???'}</h3><p>${open ? k.desc : 'Reach Fear Rank ' + k.rank}</p><span class="cost">${open ? (on ? 'CARRYING' : 'TAP TO CARRY') : '🔒 RANK ' + k.rank}</span></button>`; }
  $('loGrid').innerHTML = h + '</div>'; coinsSync();
}
$('loGrid').addEventListener('click', e => {
  const b = e.target.closest('.tile'); if (!b) return; initAudio();
  if (b.dataset.a) { const id = b.dataset.a; if (!abilOpen(id)) { sfx('nope'); return; } SV.abil = id; }
  else { const id = b.dataset.k; if (!keepOpen(id)) { sfx('nope'); return; } const i = SV.keep.indexOf(id); if (i >= 0) SV.keep.splice(i, 1); else { SV.keep.push(id); while (SV.keep.length > keepSlots()) SV.keep.shift(); } }
  save(); sfx('pick'); const sc = $('loGrid').scrollTop; renderLoadout(); $('loGrid').scrollTop = sc;
});
tap($('bLoBack'), () => { sfx('ui'); renderSetup(); screen('setup'); });
function loadoutHtml() {
  const a = ABIL[SV.abil], ks = SV.keep.map(k => `<img src="${iconUrl('kp_' + k)}" title="${KEEP[k].name}">`).join('');
  const empty = keepSlots() - SV.keep.length, newDot = SV.seenRank < SV.rank ? '<i class="dot"></i>' : '';
  return `<button id="bLoad" class="load">${newDot}<img src="${iconUrl('ab_' + SV.abil)}"><span><small>ABILITY</small><b>${a.name}</b></span><span class="ks">${ks}${'<i class="es"></i>'.repeat(Math.max(0, empty))}<small>KEEPSAKE${keepSlots() > 1 ? 'S' : ''}</small></span></button>`;
}
function openLoadout() { sfx('ui'); SV.seenRank = SV.rank; save(); renderLoadout(); screen('loadout'); }

// ---------- title rank badge ----------
function rankBadge() {
  const ri = rankInfo(SV.dread || 0), el = $('rankb');
  el.innerHTML = `<b>${ri.r}</b><span><small>FEAR RANK</small>${rankName(ri.r)}</span><i><u style="width:${ri.into / ri.need * 100}%"></u></i>`;
  // toy chest badge: something affordable?
  let can = false; for (const u of SHOP) { const n = SV.shop[u.id] || 0; if (n < u.max && SV.coins >= shopCost(u, n)) can = true; } for (const id in ITEM_COST) if (!SV.items[id] && SV.coins >= ITEM_COST[id]) can = true;
  $('bShop').classList.toggle('has', can);
}
tap($('rankb'), () => { sfx('ui'); collTab = 'rank'; renderColl(); screen('coll'); });
function rankTiles() {
  let h = ''; const top = Math.max(RANK_MAX, SV.rank + 1);
  for (let r = 1; r <= top; r++) { const L = rankLine(r), d = SV.rank >= r; h += `<div class="tile dex rk${d ? ' done' : ''}" style="--c:${d ? '#ff5577' : '#43317f'}"><span class="tag">RANK ${r} · ${L.what}</span><img src="${iconUrl(L.icon)}"><h3>${d || r <= SV.rank + 2 ? L.name : '???'}</h3><p>${rankName(r)}</p><span class="cost">${d ? 'UNLOCKED' : r === SV.rank + 1 ? 'NEXT' : ''}</span></div>`; }
  const ri = rankInfo(SV.dread || 0);
  return `<div class="tile rec rkhead" style="--c:#ff5577"><h3>Fear Rank ${ri.r}</h3><p>${rankName(ri.r)} · ${ri.into}/${ri.need} dread to the next rank. Earn dread by surviving, stopping dolls and beating bosses. Dares and harder maps give more.</p></div>` + h;
}

function runKit() {
  if (!G.ab) return '';
  return `<div class="bg"><span>ABILITY</span><div><i><img src="${iconUrl('ab_' + G.ab.id)}"></i></div></div>` + (SV.keep.length ? `<div class="bg"><span>KEEPSAKE${SV.keep.length > 1 ? 'S' : ''}</span><div>${Object.keys(G.keep).map(k => `<i><img src="${iconUrl('kp_' + k)}"></i>`).join('')}</div></div>` : '') + (G.streakBest >= 25 ? `<div class="bg"><span>BEST STREAK</span><div><b class="stk">${G.streakBest}</b></div></div>` : '');
}
// ---------- skill button ----------
let skLast = '';
function skillUI() {
  const el = $('bSkill'), on = G.state === 'play' && !!G.ab;
  if (!on) { if (skLast !== 'off') { el.classList.remove('on'); skLast = 'off'; } return; }
  const a = G.ab, p = Math.min(1, a.t / a.cd), k = (p * 40 | 0) + (a.id) + (p >= 1);
  if (k === skLast) return; skLast = k;
  el.classList.add('on'); el.classList.toggle('rdy', p >= 1); el.style.setProperty('--p', (p * 100).toFixed(1) + '%');
  if (el.dataset.id !== a.id) { el.dataset.id = a.id; el.querySelector('img').src = iconUrl('ab_' + a.id); }
}
tap($('bSkill'), () => { if (!useAbility()) sfx('nope'); });
window.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'e' || e.key === 'E') && G.state === 'play') useAbility(); });

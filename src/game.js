// ---------- world ----------
const ZW = 1600, ZH = 1200, W = ZW * 3, H = ZH * 3, WALLH = 170, SH_W = 420, SH_H = 74;
const ZONES = [
  { id: 'antique', name: 'The Antique Room', amb: [0.62, 0.42, 0.5], types: { por: 5, hush: 2, mat: 2, rag: 1 }, mb: 'twin', lc: 'red' },
  { id: 'boutique', name: 'The Boutique', amb: [1.12, 0.95, 1.05], types: { manne: 4, bal: 4, por: 2, rag: 2 }, mb: 'seam', lc: 'pink' },
  { id: 'nursery', name: 'The Nursery', amb: [0.9, 0.96, 1.12], types: { baby: 6, rag: 3, teddy: 2 }, mb: 'crybaby', lc: 'blue' },
  { id: 'plush', name: 'Plush Meadow', amb: [1.05, 1.15, 1.0], types: { teddy: 6, rag: 3, baby: 1 }, mb: 'bigted', lc: 'mint' },
  { id: 'main', name: 'The Shop Floor', amb: [1, 1, 1], types: { rag: 6, bal: 2, por: 2, mat: 1, buddy: 1 }, lc: 'pink' },
  { id: 'arcade', name: 'The Arcade', amb: [0.55, 0.55, 0.95], types: { robot: 5, jack: 2, nova: 1, bal: 2 }, mb: 'unit9', lc: 'mint' },
  { id: 'workshop', name: 'The Doll Hospital', amb: [0.58, 0.8, 0.62], types: { patch: 5, rag: 3, buddy: 2 }, mb: 'stitch', lc: 'mint' },
  { id: 'checkout', name: 'The Checkout', amb: [1, 1, 1], types: { rag: 5, mat: 3, buddy: 2, bal: 2 }, lc: 'pink' },
  { id: 'stock', name: 'The Stockroom', amb: [0.42, 0.46, 0.7], types: { jack: 5, mat: 3, patch: 2 }, mb: 'jackking', lc: 'blue' },
];
ZONES.forEach((z, i) => { z.i = i; z.x = (i % 3) * ZW; z.y = Math.floor(i / 3) * ZH; });
const zoneAt = (x, y) => ZONES[clamp((y / ZH) | 0, 0, 2) * 3 + clamp((x / ZW) | 0, 0, 2)];
const shelves = [], solids = [], slots = [], decor = [], wallDecor = [], lairs = [], lights = [];
const G = { state: 'boot', t: 0, rt: 0, ts: 1, bot: false, mode: null, hero: null };
let P = null;
const enemies = [], gems = [], shots = [], eshots = [], parts = [], nums = [], boxes = [], pets = [], rings = [], flashes = [], ezones = [], fields = [], beams = [];
const S = {};
const joy = { on: false, id: -1, bx: 0, by: 0, x: 0, y: 0, dx: 0, dy: 0 }, key = { x: 0, y: 0 };
const MODES = {
  short: { id: 'short', name: 'Closing Shift', sub: '5 minutes. One boss.', len: 300, minis: [150], boss: 240 },
  long: { id: 'long', name: 'Graveyard Shift', sub: '15 minutes. Five minibosses. It keeps getting worse.', len: 900, minis: [150, 300, 450, 600, 720], boss: 770 },
  endless: { id: 'endless', name: 'Endless Nightmare', sub: 'No dawn. How long can you last?', len: Infinity, minis: [], boss: 600, every: 150 },
};
const ET = {
  rag: { name: 'Raggedy', blurb: 'Button eyes. Bad attitude.', hp: 10, spd: 76, dmg: 8, r: 13, mass: 1, gem: 0, sc: 1, hgt: 56, eye: 41.5, ai: 'chase', u: 0, wt: 6 },
  bal: { name: 'Wind-Up Ballerina', blurb: 'Winds up, then dashes.', hp: 7, spd: 58, dmg: 7, r: 11, mass: 0.8, gem: 0, sc: 0.95, hgt: 58, eye: 41.5, ai: 'dash', u: 35, wt: 3 },
  teddy: { name: 'Hugsy Bear', blurb: 'Slow, soft and very hard to stop.', hp: 28, spd: 66, dmg: 10, r: 15, mass: 2.6, gem: 0, sc: 1, hgt: 60, eye: 47, ai: 'chase', u: 50, wt: 3 },
  baby: { name: 'Lil Crawler', blurb: 'Tiny, fast and never alone.', hp: 5, spd: 128, dmg: 5, r: 9, mass: 0.5, gem: 0, sc: 0.72, hgt: 44, eye: 41.5, ai: 'chase', u: 70, wt: 3, pack: 3 },
  por: { name: 'Porcelain Darling', blurb: 'Cracked, glossy and quick.', hp: 34, spd: 92, dmg: 12, r: 14, mass: 1.7, gem: 1, sc: 1.14, hgt: 64, eye: 41.5, ai: 'chase', u: 85, wt: 3 },
  jack: { name: 'Jack-in-the-Box', blurb: 'Waits. Then pounces.', hp: 24, spd: 0, dmg: 13, r: 15, mass: 2, gem: 1, sc: 1, hgt: 76, eye: 60.5, ai: 'leap', u: 110, wt: 2 },
  mat: { name: 'Nesting Doll', blurb: 'There is always one more inside.', hp: 80, spd: 50, dmg: 16, r: 22, mass: 4, gem: 1, sc: 1.3, hgt: 70, eye: 44.5, ai: 'chase', u: 140, wt: 1 },
  robot: { name: 'Tin Bot', blurb: 'Keeps its distance and shoots.', hp: 22, spd: 62, dmg: 9, r: 14, mass: 1.8, gem: 1, sc: 1, hgt: 72, eye: 52, ai: 'shoot', u: 150, wt: 2 },
  patch: { name: 'Stitchling', blurb: 'Runs up and bursts at the seams.', hp: 16, spd: 108, dmg: 14, r: 13, mass: 1, gem: 0, sc: 1, hgt: 56, eye: 41.5, ai: 'boom', u: 170, wt: 2 },
  manne: { name: 'Mannequin', blurb: 'Freezes in your flashlight. Sprints in the dark.', hp: 42, spd: 170, dmg: 14, r: 13, mass: 2.2, gem: 1, sc: 1, hgt: 88, eye: 72, ai: 'weep', u: 190, wt: 1.5 },
  buddy: { name: 'Buddy Boy', blurb: 'Your friend till the end. Has scissors.', hp: 48, spd: 124, dmg: 14, r: 13, mass: 1.4, gem: 1, sc: 1.05, hgt: 60, eye: 41.5, ai: 'zig', u: 210, wt: 1.2 },
  hush: { name: 'Miss Hush', blurb: 'Never walks. Is always closer.', hp: 62, spd: 0, dmg: 15, r: 14, mass: 3, gem: 1, sc: 1.1, hgt: 52, eye: 32.5, ai: 'blink', u: 250, wt: 0.8 },
  nova: { name: 'Bestie-9', blurb: 'Dances first. Then she lunges.', hp: 115, spd: 96, dmg: 18, r: 14, mass: 2.4, gem: 1, sc: 1.2, hgt: 66, eye: 41.5, ai: 'dance', u: 290, wt: 0.8 },
};
const MB = {
  bigted: { name: 'BIG TED', sub: 'He just wants a hug', r: 40, spd: 68, dmg: 20, hgt: 215, eye: 127, ek: 'teddy', k: 2.7, atk: ['charge', 'stomp', 'summon:teddy:5'] },
  jackking: { name: 'THE BOX KING', sub: 'Pop goes the weasel', r: 38, spd: 40, dmg: 20, hgt: 200, eye: 145, ek: 'jack', k: 2.4, atk: ['leap', 'ring:10', 'summon:jack:3', 'leap'] },
  unit9: { name: 'UNIT 9', sub: 'Batteries very much included', r: 38, spd: 54, dmg: 18, hgt: 200, eye: 130, ek: 'robot', k: 2.5, atk: ['spiral', 'fan', 'summon:robot:3'] },
  twin: { name: 'THE TWINS', sub: 'Come play with us', r: 28, spd: 96, dmg: 16, hgt: 150, eye: 83, ek: 'por', k: 2, atk: ['fan', 'charge'], pair: true },
  seam: { name: 'THE SEAMSTRESS', sub: 'Hold still for your fitting', r: 34, spd: 74, dmg: 18, hgt: 215, eye: 166, ek: 'manne', k: 2.3, atk: ['fan', 'ring:14', 'summon:manne:3'] },
  crybaby: { name: 'CRY BABY', sub: 'Somebody needs a nap', r: 42, spd: 58, dmg: 18, hgt: 200, eye: 125, ek: 'baby', k: 3, atk: ['rain', 'summon:baby:8', 'ring:10'] },
  stitch: { name: 'DR. STITCH', sub: 'The doctor will sew you now', r: 38, spd: 66, dmg: 20, hgt: 190, eye: 108, ek: 'patch', k: 2.6, atk: ['summon:patch:4', 'charge', 'rain'] },
  madame: { name: 'MADAME PORCELAIN', sub: 'She wants you for her collection', r: 44, spd: 62, dmg: 24, hgt: 250, eye: 166, ek: 'boss', k: 4, atk: ['ring:12', 'stomp', 'summon:mix:7', 'spiral', 'rain'], final: true },
};
// items: k = W weapon, O offense, D defense, S support
const IT = {
  gloss: { k: 'W', name: 'Lip Gloss Blaster', cat: 'MAKEUP', desc: ['Fires glossy bolts at the nearest doll.', 'More damage.', 'Fires 2 bolts.', 'Bolts pierce. More damage.', 'Fires 3 bolts, faster.'], evo: ['nails', 'Lacquer Storm', 'A nonstop stream of piercing gloss.'] },
  bomb: { k: 'W', name: 'Glitter Bomb', cat: 'MAKEUP', desc: ['Lobs a bomb that bursts into glitter.', 'Bigger blast.', 'Throws 2 bombs.', 'Way more damage.', '3 bombs, faster.'], evo: ['liner', 'Disco Nova', 'Huge blasts that leave burning glitter.'] },
  charm: { k: 'W', name: 'Charm Bracelet', cat: 'CHARM', desc: ['2 charms orbit you and smack dolls.', '3 charms.', 'Wider orbit, more damage.', '4 charms.', '6 charms. Max sparkle.'], evo: ['shield', 'Guardian Halo', '9 charms that also swat enemy shots.'] },
  aura: { k: 'W', name: 'Poison Perfume', cat: 'MAKEUP', desc: ['A cloud around you hurts and slows dolls.', 'Bigger cloud.', 'More damage.', 'Even bigger. Slows more.', 'Toxic. Huge damage.'], evo: ['lipstick', 'Toxic Bloom', 'A giant cloud that halves their speed.'] },
  ball: { k: 'W', name: 'Squish Ball', cat: 'TOY', desc: ['A squishy ball bounces between 3 dolls.', 'Bounces 5 times.', 'More damage.', 'Throws 2 balls.', '8 bounces. Big damage.'], evo: ['boots', 'Mega Squish', '3 giant balls with 20 bounces each.'] },
  kitty: { k: 'W', name: 'Ghost Kitty', cat: 'PET', desc: ['A ghost cat pounces on dolls for you.', 'Sharper claws.', 'A second kitty.', 'Pounces faster.', 'Three kitties. Chaos.'], evo: ['ears', 'Nine Lives', '5 kitties with exploding pounces.'] },
  bunny: { k: 'W', name: 'Spirit Bunny', cat: 'PET', desc: ['A bunny fetches gems for you.', 'Faster bunny.', 'A second bunny.', 'Gems give +15% XP.', 'Three bunnies. +30% XP.'], evo: ['bow', 'Moon Rabbit', '4 bunnies that stomp where they land. +50% XP.'] },
  storm: { k: 'W', name: 'Star Shower', cat: 'CHARM', desc: ['Shooting stars strike 2 random dolls.', '3 stars.', 'More damage.', '5 stars.', '7 stars, faster.'], evo: ['clip', 'Meteor Crush', '10 huge meteors at a time.'] },
  spray: { k: 'W', name: 'Hairspray Torch', cat: 'MAKEUP', desc: ['A cone of flame where your flashlight points.', 'Longer reach.', 'Wider and hotter.', 'Longer reach.', 'Much hotter.'], evo: ['choker', 'Dragon Curl', 'A huge blue flame that melts anything.'] },
  scissors: { k: 'W', name: 'Fabric Scissors', cat: 'TOY', desc: ['Scissors fly out, then boomerang back.', 'More damage.', 'Throws 2.', 'More damage.', 'Throws 3, faster.'], evo: ['scrunchie', 'Shear Madness', 'Giant scissors that never stop cutting.'] },
  mirror: { k: 'W', name: 'Mirror Compact', cat: 'MAKEUP', desc: ['Fires a light beam through a line of dolls.', 'More damage.', 'Wider beam, faster.', '2 beams.', 'Wider and faster.'], evo: ['battery', 'Prism Laser', '3 rainbow beams, almost nonstop.'] },
  musicbox: { k: 'W', name: 'Music Box', cat: 'TOY', desc: ['A shockwave pushes dolls away every few seconds.', 'Bigger wave.', 'More damage, faster.', 'Bigger wave.', 'More damage, faster.'], evo: ['locket', 'Lullaby of Doom', 'A giant wave that puts dolls in slow motion.'] },
  choker: { k: 'O', name: 'Spiked Choker', cat: 'OUTFIT', desc: '+12% damage on everything.' },
  nails: { k: 'O', name: 'Press-On Claws', cat: 'MAKEUP', desc: 'Attack 8% faster.' },
  liner: { k: 'O', name: 'Winged Liner', cat: 'MAKEUP', desc: 'Every attack hits 12% bigger.' },
  ears: { k: 'O', name: 'Cat Ears', cat: 'OUTFIT', desc: '+8% chance to crit for double damage.' },
  scrunchie: { k: 'O', name: 'Double Scrunchie', cat: 'OUTFIT', desc: '+10% chance for a weapon to fire twice.' },
  lipstick: { k: 'O', name: 'Venom Lipstick', cat: 'MAKEUP', desc: 'Hits poison dolls for 20% extra damage over time.' },
  locket: { k: 'D', name: 'Heart Locket', cat: 'CHARM', desc: '+20 max health, slow healing. Heals you now.' },
  hoodie: { k: 'D', name: 'Oversized Hoodie', cat: 'OUTFIT', desc: 'Take 7% less damage.' },
  shield: { k: 'D', name: 'Teddy Shield', cat: 'TOY', desc: 'A bubble blocks one hit, then recharges faster each level.' },
  backpack: { k: 'D', name: 'Spiky Backpack', cat: 'OUTFIT', desc: 'Dolls that hit you get hurt and thrown back.' },
  foot: { k: 'D', name: 'Lucky Foot', cat: 'CHARM', desc: '+6% chance to dodge a hit completely.' },
  boots: { k: 'S', name: 'Platform Boots', cat: 'OUTFIT', desc: 'Move 9% faster.' },
  bow: { k: 'S', name: 'Magnet Bow', cat: 'OUTFIT', desc: 'Pull in gems from 35% farther.' },
  piggy: { k: 'S', name: 'Piggy Bank', cat: 'TOY', desc: '+20% buttons from this night.' },
  notes: { k: 'S', name: 'Study Notes', cat: 'TOY', desc: '+8% XP from gems.' },
  clip: { k: 'S', name: 'Lucky Clover Clip', cat: 'CHARM', desc: 'More hearts, buttons and mystery boxes. +2% crit.' },
  battery: { k: 'S', name: 'Extra Batteries', cat: 'TOY', desc: 'Bigger flashlight. Dolls in the beam are slower and take more damage.' },
};
for (const id in IT) IT[id].id = id;
const CAKE = { id: 'cake', name: 'Midnight Cupcake', cat: 'TREAT', desc: 'Heal 40 health.' };
const CAPS = { W: 6, O: 4, D: 3, S: 3 }, KNAME = { W: 'WEAPON', O: 'POWER', D: 'DEFENSE', S: 'SUPPORT' };
const BASE_ITEMS = ['gloss', 'bomb', 'charm', 'aura', 'ball', 'kitty', 'bunny', 'storm', 'choker', 'nails', 'liner', 'ears', 'locket', 'hoodie', 'boots', 'bow'];
const CATC = { MAKEUP: C.pink, OUTFIT: C.lilac, CHARM: C.butter, PET: C.mint, TOY: C.blue, TREAT: C.pink, EVOLUTION: '#ffd24a' };
const lv = id => P.up[id] || 0;
const need = l => Math.round(5 + l * 3.6 + l * l * 0.3);

function addShelf(z, lx, ly, v) {
  const x = z.x + lx, y = z.y + ly, sh = { kind: 'shelf', x, y, w: SH_W, h: SH_H, sy: y + SH_H, slots: [], v, z };
  for (let row = 0; row < 2; row++) for (let i = 0; i < 11; i++) { const s = { sh, x: x + 30 + i * 36, y: y + (row ? 52 : 8), row, state: 0, type: 'rag', vr: 0, t: 0, blink: rand(1, 12) }; sh.slots.push(s); slots.push(s); }
  shelves.push(sh); solids.push(sh);
}
function addProp(z, spr, lx, ly, w, h, light) { const x = z.x + lx, y = z.y + ly; solids.push({ kind: 'prop', spr, x, y, w, h, sy: y + h }); if (light) lights.push({ x: x + w / 2, y: y - 20, r: light[1], c: light[0], a: light[2] || 0.8, fl: light[3] || 0 }); }
function buildWorld() {
  for (const z of ZONES) {
    const rows = z.id === 'main' ? [200, 920] : z.id === 'checkout' ? [230, 890] : [230, 560, 890];
    rows.forEach((ly, ri) => [170, 1010].forEach((lx, si) => addShelf(z, lx, ly, (ri + si) % 2)));
    const P4 = [[640, 240], [860, 240], [640, 960], [860, 960]];
    if (z.id === 'main') { addProp(z, 'case', 400, 560, 100, 72, ['mint', 200]); addProp(z, 'case', 1100, 560, 100, 72, ['mint', 200]); decor.push({ s: 'rug', x: z.x + 800, y: z.y + 610 }); }
    if (z.id === 'checkout') { addProp(z, 'counter', 170, 560, 420, 74, ['mint', 150, 0.6]); addProp(z, 'counter', 1010, 560, 420, 74, ['mint', 150, 0.6]); decor.push({ s: 'rug', x: z.x + 800, y: z.y + 600 }); }
    if (z.id === 'plush') for (const [x, y] of [[660, 300], [880, 330], [640, 1000], [900, 960], [760, 880]]) addProp(z, 'beanbag', x, y, 90, 40);
    if (z.id === 'arcade') P4.forEach(([x, y], i) => addProp(z, 'claw', x, y, 100, 56, [i % 2 ? 'pink' : 'mint', 260, 0.95, 0.15]));
    if (z.id === 'antique') P4.forEach(([x, y]) => addProp(z, 'cabinet', x, y, 100, 72, ['red', 220, 0.8, 0.1]));
    if (z.id === 'boutique') { addProp(z, 'rack', 690, 300, 220, 30, ['pink', 240, 0.6]); addProp(z, 'rack', 690, 1010, 220, 30, ['pink', 240, 0.6]); }
    if (z.id === 'nursery') { for (const [x, y] of [[610, 290], [860, 290], [735, 1010]]) addProp(z, 'crib', x, y, 134, 56, ['blue', 200, 0.6]); }
    if (z.id === 'workshop') { addProp(z, 'bench', 680, 300, 240, 60, ['warm', 280, 1, 0.5]); addProp(z, 'bench', 680, 1010, 240, 60, ['warm', 280, 1, 0.5]); }
    if (z.id === 'stock') { for (const [x, y] of [[620, 270], [860, 300], [640, 990], [880, 960], [1300, 400], [200, 760]]) addProp(z, 'crates', x, y, 120, 58); lights.push({ x: z.x + 800, y: z.y + 600, r: 420, c: 'white', a: 0.7, fl: 0.9 }); }
    if (z.mb) lairs.push({ kind: 'lair', x: z.x + 800, y: z.y + 600, sy: z.y + 600, z, used: false });
    for (let i = 0; i < 5; i++) { const x = z.x + rand(100, ZW - 100), y = z.y + rand(120, ZH - 80); if (!shelfAt(x, y)) decor.push({ s: 'decal', x, y, i: randi(0, 7) }); }
    if (z.y === 0) {
      wallDecor.push({ s: 'win', x: z.x + 400 }, { s: z.id === 'boutique' ? 'winMoon' : 'win', x: z.x + 1200 }, { s: 'poster', x: z.x + 150 }, { s: 'poster', x: z.x + 1450 });
      wallDecor.push(z.id === 'antique' ? { s: 'poster', x: z.x + 800 } : z.id === 'boutique' ? { s: 'neonHeart', x: z.x + 800, c: 'pink' } : { s: 'neonMoon', x: z.x + 800, c: 'mint' });
    }
  }
}
function wpick(tbl, unl) { let tot = 0; for (const k in tbl) if (!unl || unl[k]) tot += tbl[k]; if (!tot) return 'rag'; let r = Math.random() * tot; for (const k in tbl) { if (unl && !unl[k]) continue; r -= tbl[k]; if (r <= 0) return k; } return 'rag'; }
function unlocked() { const o = {}; for (const k in ET) o[k] = G.t >= ET[k].u; return o; }
const SPAWNW = {}; for (const k in ET) SPAWNW[k] = ET[k].wt;

function reset(mode, hero) {
  for (const a of [enemies, gems, shots, eshots, parts, nums, boxes, pets, rings, flashes, ezones, fields, beams]) a.length = 0;
  G.mode = MODES[mode] || MODES.short; G.hero = hero || HEROES[0];
  const M = G.mode;
  Object.assign(G, { t: 0, kills: 0, coins: 0, shake: 0, flash: 0, flash2: 0, blackout: 0, hurt: 0, dawn: 0, spawnAcc: 0, boxT: 22, comboT: 0, pending: 0, bosses: [], bossDead: false, dmgDone: 0, dps: 0, dpsT: 0, dpsLast: 0, stateT: 0, cap: 24, lightT: rand(14, 22), nextWave: 60, wi: 0, minis: M.minis.slice(), nextMini: M.every || 0, bossAt: M.boss, bossWarn: false, eliteT: 50, hm: 1, kbR: 1, spdMul: 1, dmgMul: 1, minisKilled: 0, bossKills: 0, evos: 0, seen: {}, zone: null, zones: {}, mbOrder: Object.keys(MB).filter(k => !MB[k].final).sort(() => Math.random() - 0.5), mbi: 0, earned: 0 });
  P = { kind: 'player', x: 2400, y: 1810, sy: 1810, r: 13, hp: 100, maxhp: 100, vx: 0, vy: 0, face: 1, back: false, aim: -Math.PI / 2, inv: 0, lvl: 1, xp: 0, need: need(1), up: {}, walk: 0, moving: false, tm: { gloss: 0.5, bomb: 1, ball: 0.6, storm: 1.4, aura: 0, spray: 0, scissors: 0.8, mirror: 1, musicbox: 1.5 }, charms: [], auraR: 0, sprayR: 0, sprayA: 0, shieldUp: false, shieldT: 3, revives: 0, rerolls: 0, blinkT: 3 };
  P.up[G.hero.start] = 1;
  const sh = SV.shop, hm = G.hero.mod;
  P.revives = (sh.revive || 0) + (hm.revive || 0); P.rerolls = (sh.reroll || 0) + (hm.reroll || 0);
  recalc(); P.hp = P.maxhp; buildPlayerArt(P.up, G.hero); syncPets();
  for (let i = 0; i < (sh.head || 0); i++) { P.lvl++; P.need = need(P.lvl); G.pending++; }
  for (const s of slots) { s.state = 0; s.type = wpick(s.sh.z.types); s.vr = randi(0, 2); s.blink = rand(1, 12); }
  for (const l of lairs) l.used = false;
  joy.on = false; joy.dx = joy.dy = 0;
}
function recalc() {
  const sh = SV.shop, hm = G.hero.mod, n = k => sh[k] || 0;
  S.dmg = (1 + 0.12 * lv('choker')) * (1 + 0.05 * n('pow'));
  S.cd = Math.pow(0.92, lv('nails')) * (1 - 0.03 * n('haste')) * (1 - (hm.cd || 0));
  S.area = 1 + 0.12 * lv('liner');
  S.luck = lv('clip') + n('luck') * 0.6;
  S.crit = 0.05 + 0.08 * lv('ears') + 0.02 * lv('clip') + (hm.crit || 0);
  S.pick = 70 * (1 + 0.35 * lv('bow') + 0.1 * n('mag') + (hm.pick || 0));
  S.regen = 0.4 * lv('locket') + (hm.regen || 0);
  S.xp = [1, 1, 1, 1, 1.15, 1.3, 1.5][lv('bunny')] * (1 + 0.08 * lv('notes') + 0.04 * n('grow') + (hm.xp || 0));
  S.spd = 1 + 0.09 * lv('boots') + 0.03 * n('spd') + (hm.spd || 0);
  S.armor = (1 - 0.07 * lv('hoodie')) * (1 - 0.03 * n('armor'));
  S.dodge = 0.06 * lv('foot') + (hm.dodge || 0);
  S.coin = 1 + 0.2 * lv('piggy') + 0.1 * n('greed');
  S.echo = 0.1 * lv('scrunchie'); S.venom = 0.2 * lv('lipstick'); S.batt = lv('battery'); S.thorns = [0, 20, 35, 50, 65, 80][lv('backpack')];
  S.shieldCd = [0, 18, 16, 14, 12, 10][lv('shield')];
  P.maxhp = 100 + 20 * lv('locket') + 10 * n('vit') + (hm.hp || 0);
}
function syncPets() {
  const want = { kitty: [0, 1, 1, 2, 2, 3, 5][lv('kitty')], bunny: [0, 1, 1, 2, 2, 3, 4][lv('bunny')] };
  for (const k in want) { let n = pets.filter(p => p.k === k).length; while (n < want[k]) { pets.push({ kind: 'pet', k, x: P.x, y: P.y, sy: P.y, st: 'idle', t: rand(TAU), cd: rand(0.3, 1), face: 1, i: n, hit: [], tg: null }); n++; } }
}
function applyUpgrade(id) {
  if (id === 'cake') { heal(40); return; }
  if (id.slice(0, 4) === 'evo:') { evolve(id.slice(4)); return; }
  P.up[id] = lv(id) + 1; recalc();
  if (id === 'locket') heal(25);
  if (id === 'shield' && lv(id) === 1) { P.shieldUp = true; }
  if (id === 'ears' || id === 'bow' || id === 'boots' || id === 'choker') buildPlayerArt(P.up, G.hero);
  syncPets();
}
function evolve(id) { P.up[id] = 6; G.evos++; recalc(); syncPets(); banner(IT[id].evo[1].toUpperCase() + '!', IT[id].name + ' evolved'); sfx('win'); flashAt(P.x, P.y, 700, 0.8, 'warm'); G.flash = 0.7; ring(P.x, P.y, 30, 420, 0.7, 'butter', 10); P.inv = Math.max(P.inv, 1.5); }
function evoReady() { return Object.keys(P.up).filter(id => IT[id] && IT[id].evo && P.up[id] === 5 && lv(IT[id].evo[0]) > 0); }
function heal(n) { P.hp = Math.min(P.maxhp, P.hp + n); addNum(P.x, P.y - 78, '+' + n, 3); sfx('heal'); for (let i = 0; i < 8; i++) part(P.x + rand(-14, 14), P.y - rand(10, 50), rand(-20, 20), rand(-90, -40), rand(0.4, 0.8), rand(10, 16), A.spark.red, true); }

// ---------- spatial grid ----------
const GC = 100, GW = Math.ceil(W / GC), GH = Math.ceil(H / GC), grid = Array.from({ length: GW * GH }, () => []);
const gridUsed = [];
function gridBuild() { for (const c of gridUsed) c.length = 0; gridUsed.length = 0; for (const e of enemies) { if (e.dead || e.st === 'jump') continue; const c = grid[clamp((e.y / GC) | 0, 0, GH - 1) * GW + clamp((e.x / GC) | 0, 0, GW - 1)]; if (!c.length) gridUsed.push(c); c.push(e); } }
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
const wrapA = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };

// ---------- fx ----------
function part(x, y, vx, vy, life, size, spr, add, grav = 0, drag = 0, grow = 0) { if (parts.length > 700) return; parts.push({ x, y, vx, vy, life, max: life, size, spr, add, grav, drag, grow, dead: false }); }
function burst(x, y, col, n = 7) {
  for (let i = 0; i < n; i++) { const a = rand(TAU), s = rand(60, 230); part(x, y, Math.cos(a) * s, Math.sin(a) * s - 50, rand(0.3, 0.65), rand(9, 17), i % 2 ? A.spark[col] : A.glow[col], true, 240, 2); }
  for (let i = 0; i < 3; i++) part(x + rand(-8, 8), y + rand(-8, 8), rand(-36, 36), rand(-60, -10), rand(0.35, 0.6), rand(18, 28), A.puff, false, 0, 1, 34);
}
const numCache = new Map(), NUMC = ['#fff6fb', C.butter, '#ff6f8f', C.mint];
function numSprite(txt, style) {
  const k = txt + '|' + style; let s = numCache.get(k); if (s) return s; if (numCache.size > 600) numCache.clear();
  const sz = style === 1 ? 30 : style === 0 ? 21 : 25, w = txt.length * sz * 0.68 + 14;
  s = sprite(w, sz + 14, w / 2, (sz + 14) / 2, g => { g.font = `700 ${sz}px ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5.5; g.strokeStyle = style === 1 ? '#b0125a' : INK; g.strokeText(txt, 0, 1); g.fillStyle = NUMC[style]; g.fillText(txt, 0, 1); });
  numCache.set(k, s); return s;
}
function addNum(x, y, v, style = 0) { if (nums.length > 70 || (nums.length > 40 && style === 0)) return; nums.push({ x: x + rand(-8, 8), y, s: numSprite(String(v), style), t: 0, vx: rand(-18, 18), big: style !== 0, dead: false }); }
function ring(x, y, r0, r1, d, col, lw = 5) { rings.push({ x, y, r0, r1, t: 0, d, col, lw, dead: false }); }
function flashAt(x, y, r, d, col = 'white') { flashes.push({ x, y, r, t: 0, d, col, dead: false }); }
function shake(n) { G.shake = Math.max(G.shake, n); }
function lightning() { G.flash = 1; G.flash2 = 0.2; sfx('thunder'); }

// ---------- enemies ----------
function spawnEnemy(type, x, y, o = {}) {
  const T = ET[type], tier = o.tier || 0, ts = [1, 0.72, 0.5][tier], el = o.elite ? 1.45 : 1;
  const e = { kind: 'enemy', type, x, y, sy: y, z: 0, r: T.r * ts * el, hp: T.hp * G.hm * [1, 0.4, 0.16][tier] * (o.elite ? 7 : 1), spd: T.spd * [1, 1.45, 2.1][tier] * rand(0.92, 1.08), dmg: T.dmg * [1, 0.75, 0.5][tier], mass: T.mass * ts * (o.elite ? 4 : 1), gem: T.gem, sc: T.sc * ts * el, hgt: T.hgt * ts * el * T.sc, eye: T.eye * T.sc * ts * el, esc: T.sc * ts * el, ek: type, ai: T.ai, vr: o.vr === undefined ? randi(0, 2) : o.vr, t: rand(10), ph: rand(TAU), flash: 0, kx: 0, ky: 0, slow: 0, slowF: 1, ch: 0, st: 'chase', face: 1, dead: false, tier, dashT: rand(0.5, 1.3), dash: 0, dvx: 0, dvy: 0, over: null, boss: false, lit: false, pois: 0, poisT: 0, fade: 0, fuse: 0, elite: !!o.elite, jh: 34 };
  const set = A.doll[type]; e.spr = set[e.vr % set.length];
  if (type === 'hush' || type === 'manne' || type === 'jack' || type === 'robot') e.hgt = T.hgt * el;
  e.maxhp = e.hp;
  if (o.jump) { e.st = 'jump'; e.jx0 = o.jump.x; e.jy0 = o.jump.y; e.jx1 = x; e.jy1 = y; e.jt = 0; e.jd = 0.4; e.x = e.jx0; e.y = e.jy0; }
  else if (o.pop) { e.st = 'jump'; e.jx0 = e.jx1 = x; e.jy0 = e.jy1 = y; e.jt = 0; e.jd = 0.3; for (let i = 0; i < 3; i++) part(x + rand(-10, 10), y - rand(0, 20), rand(-30, 30), rand(-50, -10), 0.45, rand(18, 28), A.puff, false, 0, 1, 30); }
  enemies.push(e); return e;
}
function spawnMini(id, x, y) {
  const M = MB[id], n = M.pair ? 2 : 1, dps = Math.max(G.dps, 12 * G.hm), out = [];
  for (let i = 0; i < n; i++) {
    const e = spawnEnemy('rag', clamp(x + (i ? 120 : 0), 100, W - 100), clamp(y, 140, H - 80), { pop: true });
    const hp = M.final ? clamp(dps * (G.mode.id === 'short' ? 7 : 10), 2200, 2e6) : clamp(dps * 6.5, 450 * G.hm, 1e6) / n;
    Object.assign(e, { type: id, boss: true, mb: M, ai: 'mb', spr: M.final ? A.boss : A.mb[id === 'twin' && i ? 'twin2' : id], r: M.r, hp, maxhp: hp, spd: M.spd, dmg: M.dmg, mass: 90, sc: 1, hgt: M.hgt, eye: M.eye, ek: M.ek, esc: M.k, atk: i, aT: 2 + i, act: null, acT: 0, cnt: 0, sa: 0, gem: 2, elite: false });
    G.bosses.push(e); out.push(e);
  }
  shake(M.final ? 16 : 10); sfx('boss'); lightning(); if (M.final) AU.layer = 3;
  banner(M.name, M.sub);
  return out;
}
function hurt(e, dmg, ax, ay, kb = 120, dot = false) {
  if (e.dead) return;
  let crit = false; dmg *= S.dmg; if (e.lit && S.batt) dmg *= 1 + 0.06 * S.batt;
  if (!dot && Math.random() < S.crit) { dmg *= 2; crit = true; }
  dmg = Math.max(1, Math.round(dmg * rand(0.88, 1.12)));
  e.hp -= dmg; e.flash = 0.09; G.dmgDone += dmg;
  if (kb) { const dx = e.x - ax, dy = e.y - ay, d = Math.hypot(dx, dy) || 1, k = kb / e.mass / G.kbR; e.kx += dx / d * k; e.ky += dy / d * k; }
  if (S.venom && !dot) { e.pois += dmg * S.venom / S.dmg; e.poisT = 2; }
  addNum(e.x, e.y - e.hgt, dmg, crit ? 1 : 0); if (!dot) sfx('hit');
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  e.dead = true; G.kills++; G.seen[e.type] = (G.seen[e.type] || 0) + 1;
  const col = e.type === 'bal' || e.type === 'robot' ? 'mint' : e.type === 'mat' || e.type === 'buddy' ? 'butter' : e.type === 'por' || e.type === 'baby' ? 'blue' : 'pink';
  burst(e.x, e.y - e.hgt * 0.45, col, e.boss ? 40 : 7); sfx('pop'); if (e.r > 15) shake(3);
  if (e.type === 'mat' && e.tier < 2) for (const s of [-1, 1]) { const c = spawnEnemy('mat', e.x + s * 10, e.y + rand(-6, 6), { tier: e.tier + 1, vr: e.vr }); c.kx = s * 260; c.ky = rand(-120, 120); }
  if (e.boss) { bossDeath(e); return; }
  dropGem(e.x, e.y, e.gem, 0);
  if (e.elite) { for (let i = 0; i < 5; i++) dropGem(e.x, e.y, 4, 120); for (let i = 0; i < 4; i++) dropGem(e.x, e.y, 1, 120); }
  if (Math.random() < 0.011 * (1 + 0.3 * S.luck)) dropGem(e.x + 10, e.y, 3, 0);
  if (Math.random() < 0.06 * (1 + 0.15 * S.luck)) dropGem(e.x - 10, e.y, 4, 0);
}
function dropGem(x, y, k, scatter) {
  if (gems.length > 340 && k < 3) { const g = gems[(Math.random() * gems.length) | 0]; if (g.k < 3) { g.v += [1, 4, 20][k]; if (g.v >= 4 && g.k === 0) g.k = 1; if (g.v >= 20) g.k = 2; return; } }
  const a = rand(TAU), s = scatter ? rand(80, scatter) : rand(20, 60);
  gems.push({ x, y, k, v: [1, 4, 20, 0, 1][k], t: rand(6), vx: Math.cos(a) * s, vy: Math.sin(a) * s, pull: false, sp: 140, claim: false, dead: false });
}
function ringSpawn(type, n, rad) { const off = rand(TAU); for (let i = 0; i < n; i++) { const a = off + i * TAU / n; spawnEnemy(type, clamp(P.x + Math.cos(a) * rad, 30, W - 30), clamp(P.y + Math.sin(a) * rad * 0.8, 30, H - 30), { pop: true }); } }
function bossDeath(e) {
  const i = G.bosses.indexOf(e); if (i >= 0) G.bosses.splice(i, 1);
  const M = e.mb; sfx('bossdie'); shake(M.final ? 22 : 14); flashAt(e.x, e.y, 600, 0.6); G.flash = 0.8;
  for (let k = 0; k < 40; k++) { const a = rand(TAU), s = rand(100, 480); part(e.x, e.y - 100, Math.cos(a) * s, Math.sin(a) * s - 120, rand(0.6, 1.3), rand(14, 30), k % 3 ? A.puff : A.spark.white, k % 3 === 0, 500, 1); }
  for (const o of enemies) if (!o.dead && !o.boss) { o.kx += (o.x - e.x) * 2; o.ky += (o.y - e.y) * 2; }
  if (M.pair && G.bosses.some(b => b.mb === M)) { for (let k = 0; k < 6; k++) dropGem(e.x, e.y, 1, 200); return; }
  for (let k = 0; k < (M.final ? 14 : 6); k++) dropGem(e.x, e.y, 2, 300);
  for (let k = 0; k < (M.final ? 40 : 12); k++) dropGem(e.x, e.y, 4, 260);
  boxes.push({ kind: 'box', gold: true, x: e.x, y: e.y, sy: e.y, t: 0, dead: false });
  if (M.final) { G.bossDead = true; G.bossKills++; P.hp = P.maxhp; AU.layer = 2; banner('SHE SHATTERED!', G.mode.id === 'endless' ? 'She will be back' : 'Now hold on until sunrise'); if (G.mode.every) G.bossAt = G.t + 600, G.bossWarn = false; }
  else { G.minisKilled++; banner(M.name + ' DEFEATED', 'Grab the golden gift'); }
}
function eb(x, y, a, sp, dmg, r = 9) { if (eshots.length < 220) eshots.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, dmg, life: 4.5, dead: false }); }
function ezone(x, y, r, d, dmg) { ezones.push({ x, y, r, t: 0, d, dmg, dead: false }); }
function mbAI(e, dt, d, mx, my) {
  const M = e.mb, rage = e.hp < e.maxhp * 0.5, pa = Math.atan2(my, mx);
  if (!e.act) {
    e.aT -= dt; if (e.aT > 0) return M.spd * (rage ? 1.3 : 1);
    const a = M.atk[e.atk++ % M.atk.length].split(':'); e.act = a[0]; e.aT = (rage ? 1.5 : 2.3) + rand(0.7); e.acT = 0;
    if (a[0] === 'ring') { const n = +a[1] + (rage ? 6 : 0), off = rand(TAU); for (let i = 0; i < n; i++) eb(e.x, e.y, off + i * TAU / n, 165, 11); sfx('zap'); ring(e.x, e.y, 30, 120, 0.4, 'red'); e.act = null; }
    else if (a[0] === 'summon') { const n = +a[2] + (rage ? 2 : 0); for (let i = 0; i < n; i++) { const an = rand(TAU), ty = a[1] === 'mix' ? pick(['rag', 'bal', 'por']) : a[1]; spawnEnemy(ty, clamp(e.x + Math.cos(an) * 130, 30, W - 30), clamp(e.y + Math.sin(an) * 110, 30, H - 30), { pop: true }); } sfx('wake'); e.act = null; }
    else if (a[0] === 'rain') { for (let i = 0; i < (rage ? 8 : 6); i++) ezone(P.x + rand(-230, 230), P.y + rand(-180, 180), 78, 0.9 + i * 0.14, 16); ezone(P.x, P.y, 78, 1, 16); e.act = null; }
    else if (a[0] === 'stomp') { e.acT = 0.85; ezone(e.x, e.y, 190, 0.85, 24); }
    else if (a[0] === 'fan') { e.cnt = rage ? 4 : 3; e.acT = 0.3; }
    else if (a[0] === 'spiral') { e.acT = rage ? 2.6 : 2; e.cnt = 0; e.sa = rand(TAU); }
    else if (a[0] === 'charge') { e.acT = 1.5; e.dvx = mx; e.dvy = my; for (let i = 1; i <= 5; i++) ezone(e.x + mx * i * 85, e.y + my * i * 85, 46, 0.8, 0); }
    else if (a[0] === 'leap') { const L = Math.min(d, 520); e.st = 'jump'; e.jx0 = e.x; e.jy0 = e.y; e.jx1 = clamp(e.x + mx * L, 60, W - 60); e.jy1 = clamp(e.y + my * L, 80, H - 60); e.jt = 0; e.jd = 0.95; e.jh = 230; ezone(e.jx1, e.jy1, 165, 0.95, 22); e.act = null; }
    return 0;
  }
  e.acT -= dt;
  if (e.act === 'stomp') { if (e.acT <= 0) { e.act = null; sfx('stomp'); shake(15); for (let i = 0; i < 14; i++) { const a = rand(TAU); part(e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 40, Math.cos(a) * 180, Math.sin(a) * 120 - 40, 0.6, rand(24, 40), A.puff, false, 0, 2, 40); } } return 0; }
  if (e.act === 'fan') { if (e.acT <= 0) { for (let i = -2; i <= 2; i++) eb(e.x, e.y, pa + i * 0.2, 210, 11, 7); sfx('zap'); e.acT = 0.32; if (--e.cnt <= 0) e.act = null; } return M.spd * 0.3; }
  if (e.act === 'spiral') { e.cnt -= dt; if (e.cnt <= 0) { e.cnt = 0.1; e.sa += 0.36; eb(e.x, e.y, e.sa, 150, 10, 7); eb(e.x, e.y, e.sa + Math.PI, 150, 10, 7); if (rage) eb(e.x, e.y, e.sa + Math.PI / 2, 150, 10, 7); } if (e.acT <= 0) e.act = null; return 0; }
  if (e.act === 'charge') { if (e.acT <= 0) { e.act = null; return 0; } if (e.acT > 0.7) { e.flash = 0.04; return 0; } e._mx = e.dvx; e._my = e.dvy; if (Math.random() < dt * 30) part(e.x, e.y, 0, 0, 0.4, 40, A.puff, false, 0, 0, 30); return 620; }
  e.act = null; return 0;
}
function enemyBlast(x, y, r, dmg) { ring(x, y, r * 0.3, r, 0.3, 'red', 6); flashAt(x, y, r * 2.2, 0.3, 'red'); sfx('boom'); shake(5); for (let i = 0; i < 10; i++) { const a = rand(TAU), s = rand(60, 260); part(x, y - 12, Math.cos(a) * s, Math.sin(a) * s, rand(0.3, 0.6), rand(10, 18), A.spark.red, true, 100, 3); } if (Math.hypot(P.x - x, P.y - y) < r + P.r) damagePlayer(dmg); }
function updEnemies(dt) {
  const litR = 540 * (1 + 0.1 * S.batt), litA = 0.5 + 0.03 * S.batt, litSlow = 1 - 0.07 * S.batt;
  for (const e of enemies) {
    if (e.dead) continue;
    e.t += dt; if (e.flash > 0) e.flash -= dt; if (e.ch > 0) e.ch -= dt;
    if (e.poisT > 0) { const q = Math.min(dt, e.poisT); e.poisT -= q; e._pa = (e._pa || 0) + e.pois * q / 2; if (e.poisT <= 0) { e.pois = 0; } if (e._pa >= 3 || e.poisT <= 0) { const v = e._pa; e._pa = 0; if (v >= 1) hurt(e, v, 0, 0, 0, true); if (e.dead) continue; } }
    if (e.st === 'jump') {
      e.jt += dt / e.jd; const k = Math.min(1, e.jt); e.x = lerp(e.jx0, e.jx1, k); e.y = lerp(e.jy0, e.jy1, k); e.z = Math.sin(Math.PI * k) * e.jh; e.sy = Math.max(e.y, e.jy1) + 80;
      if (e.jt >= 1) { e.st = 'chase'; e.z = 0; e.jh = 34; part(e.x, e.y, 0, -10, 0.3, 22, A.puff, false, 0, 0, 40); if (e.boss) { sfx('stomp'); shake(14); } }
      continue;
    }
    const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1;
    let sp = e.spd * G.spdMul, mx = dx / d, my = dy / d;
    e.lit = d < litR && Math.abs(wrapA(Math.atan2(-dy, -dx) - P.aim)) < litA;
    switch (e.ai) {
      case 'mb': e._mx = undefined; sp = mbAI(e, dt, d, mx, my); if (e.st === 'jump') continue; if (e._mx !== undefined) { mx = e._mx; my = e._my; } break;
      case 'dash': e.dashT -= dt; if (e.dash > 0) { e.dash -= dt; sp = 265; mx = e.dvx; my = e.dvy; } else if (e.dashT <= 0) { e.dash = 0.6; e.dashT = rand(1.1, 1.7); e.dvx = mx; e.dvy = my; } break;
      case 'zig': { const a = Math.atan2(dy, dx) + Math.sin(e.t * 5 + e.ph) * 0.9; mx = Math.cos(a); my = Math.sin(a); if (d < 170) sp *= 1.5; break; }
      case 'dance': e.dashT -= dt; if (e.dash > 0) { e.dash -= dt; sp = 450; mx = e.dvx; my = e.dvy; } else if (e.dashT <= 0) { e.dash = 0.45; e.dashT = rand(2.2, 3); e.dvx = mx; e.dvy = my; } else if (e.dashT < 0.5) { sp = 0; e.flash = 0.04; } break;
      case 'leap': e.dashT -= dt; sp = 0; if (e.dashT <= 0) { e.dashT = rand(1.1, 1.6); const L = Math.min(d, 250); e.st = 'jump'; e.jx0 = e.x; e.jy0 = e.y; e.jx1 = e.x + mx * L; e.jy1 = e.y + my * L; e.jt = 0; e.jd = 0.5; e.jh = 64; continue; } break;
      case 'shoot': if (d < 250) sp = 0; e.dashT -= dt; if (e.dashT <= 0 && d < 540) { e.dashT = 2.5; eb(e.x, e.y, Math.atan2(dy, dx), 150, e.dmg * 0.8, 7); } break;
      case 'weep': if (e.lit) { sp = 0; } break;
      case 'blink': sp = 0; if (e.fade > 0) e.fade -= dt; e.dashT -= dt; if (e.dashT <= 0) { e.dashT = 2.6; part(e.x, e.y - 20, 0, 0, 0.4, 50, A.puff, false, 0, 0, 40); const a = rand(TAU), r = rand(80, 150); e.x = clamp(P.x + Math.cos(a) * r, 20, W - 20); e.y = clamp(P.y + Math.sin(a) * r * 0.8, 20, H - 20); e.fade = 0.65; part(e.x, e.y - 20, 0, 0, 0.4, 50, A.puff, false, 0, 0, 40); } break;
      case 'boom': if (e.fuse > 0) { e.fuse -= dt; sp = 0; e.flash = 0.04; if (e.fuse <= 0) { e.dead = true; burst(e.x, e.y - 20, 'red', 6); enemyBlast(e.x, e.y, 92, e.dmg * 1.5); continue; } } else if (d < 72) { e.fuse = 0.65; ezone(e.x, e.y, 92, 0.65, 0); } break;
    }
    if (e.slow > 0) { e.slow -= dt; sp *= e.slowF; }
    if (e.lit && S.batt) sp *= litSlow;
    e.over = e.boss ? null : shelfAt(e.x, e.y); if (e.over) sp *= 0.55;
    e.x += (mx * sp + e.kx) * dt; e.y += (my * sp + e.ky) * dt;
    const kd = Math.exp(-7 * dt); e.kx *= kd; e.ky *= kd;
    e.x = clamp(e.x, 12, W - 12); e.y = clamp(e.y, 12, H - 12);
    if (Math.abs(dx) > 6) e.face = dx > 0 ? 1 : -1;
    e.sy = e.over ? e.over.y + SH_H + 1 + (e.y - e.over.y) * 0.01 : e.y;
    if (d < e.r + P.r + 2 && P.inv <= 0 && e.fade <= 0) damagePlayer(e.dmg, e);
    if (d > 1400 && !e.boss) e.dead = true;
  }
  for (const c of gridUsed) {
    const n = c.length; if (n < 2) continue;
    for (let i = 0; i < n; i++) { const a = c[i]; if (a.dead || a.boss) continue; for (let j = i + 1; j < n; j++) { const b = c[j]; if (b.dead || b.boss) continue; const dx = b.x - a.x, dy = b.y - a.y, q = (a.r + b.r) * 0.9, d2 = dx * dx + dy * dy; if (d2 < q * q && d2 > 0.01) { const d = Math.sqrt(d2), p = (q - d) / d * 0.5 * Math.min(1, dt * 14), wa = b.mass / (a.mass + b.mass); a.x -= dx * p * wa * 2; a.y -= dy * p * wa * 2; b.x += dx * p * (1 - wa) * 2; b.y += dy * p * (1 - wa) * 2; } } }
  }
  for (const z of ezones) {
    z.t += dt; if (z.t < z.d) continue; z.dead = true; if (!z.dmg) continue;
    ring(z.x, z.y, z.r * 0.3, z.r, 0.3, 'red', 6); flashAt(z.x, z.y, z.r * 2, 0.25, 'red'); for (let i = 0; i < 5; i++) part(z.x + rand(-z.r, z.r) * 0.6, z.y + rand(-z.r, z.r) * 0.4, 0, -40, 0.4, rand(20, 34), A.puff, false, 0, 1, 30);
    if (Math.hypot(P.x - z.x, P.y - z.y) < z.r + P.r) damagePlayer(z.dmg);
  }
  compact(ezones);
}
function pushAway(r, f) { for (const e of enemies) { if (e.dead || e.boss) continue; const dx = e.x - P.x, dy = e.y - P.y, q = dx * dx + dy * dy; if (q < r * r) { const k = Math.sqrt(q) || 1; e.kx += dx / k * f / e.mass; e.ky += dy / k * f / e.mass; } } }
function damagePlayer(d, src) {
  if (P.inv > 0 || G.state !== 'play') return;
  if (Math.random() < S.dodge) { addNum(P.x, P.y - 78, 'MISS', 3); P.inv = 0.4; return; }
  if (S.thorns) { forNear(P.x, P.y, 115, e => hurt(e, S.thorns, P.x, P.y, 320)); ring(P.x, P.y, 20, 115, 0.3, 'butter', 5); }
  if (P.shieldUp) { P.shieldUp = false; P.shieldT = S.shieldCd; P.inv = 0.7; ring(P.x, P.y, 30, 140, 0.4, 'mint', 7); sfx('squish'); pushAway(140, 480); addNum(P.x, P.y - 78, 'BLOCK', 3); return; }
  d = Math.max(1, d * G.dmgMul * S.armor);
  P.hp -= d; P.inv = 0.8; G.hurt = 1; shake(9); sfx('hurt'); addNum(P.x, P.y - 78, '-' + Math.round(d), 2);
  pushAway(130, 420); ring(P.x, P.y, 20, 130, 0.3, 'red', 4);
  if (P.hp <= 0) {
    if (P.revives > 0) { P.revives--; P.hp = P.maxhp * 0.5; P.inv = 2.5; pushAway(420, 900); forNear(P.x, P.y, 300, e => hurt(e, 80 + G.t * 0.3, P.x, P.y, 0)); ring(P.x, P.y, 30, 420, 0.6, 'butter', 10); flashAt(P.x, P.y, 700, 0.7, 'warm'); G.flash = 0.8; banner('NOT TONIGHT!', 'Extra life used'); sfx('level'); return; }
    P.hp = 0; G.state = 'dying'; G.stateT = 0; AU.mode = 'off'; hideHud();
  }
}

// ---------- director ----------
function wake(s) { s.state = 1; s.t = 0.55; sfx('wake'); }
function release(s) {
  const sh = s.sh; s.state = 2; s.t = rand(12, 22);
  const north = s.row === 0 && P.y < sh.y, ty = north ? sh.y - rand(12, 22) : sh.y + SH_H + rand(12, 26);
  spawnEnemy(s.type, s.x + rand(-8, 8), ty, { vr: s.vr, jump: { x: s.x, y: s.y } });
}
let slotCur = 0;
function updSlots(dt, active) {
  const unl = unlocked(), pw = active ? 0.2 + Math.min(1.4, G.t / 300 * 1.1) : 0, full = enemies.length > G.cap + 12;
  for (const s of slots) {
    if (s.state === 0) {
      s.blink -= dt; if (s.blink < -0.6) s.blink = rand(3, 16);
      if (pw && !full) { const dx = s.x - P.x; if (dx < 172 && dx > -172) { const dy = s.y - P.y; if (dx * dx + dy * dy < 172 * 172 && unl[s.type] && Math.random() < pw * dt) wake(s); } }
    } else if (s.state === 1) { s.t -= dt; if (s.t <= 0) release(s); }
    else { s.t -= dt; if (s.t <= 0) { const dx = s.x - P.x, dy = s.y - P.y; if (!active || dx * dx + dy * dy > 800 * 800) { s.state = 0; s.type = wpick(s.sh.z.types); s.vr = randi(0, 2); s.blink = rand(3, 16); } else s.t = 2; } }
  }
}
function spawnNear() {
  const unl = unlocked(), cand = [];
  for (const s of slots) { if (s.state !== 0) continue; const dx = s.x - P.x; if (dx > 700 || dx < -700) continue; const dy = s.y - P.y, q = dx * dx + dy * dy; if (q > 230 * 230 && q < 700 * 700 && unl[s.type]) cand.push(s); }
  if (cand.length > 4 && Math.random() < 0.7) { wake(pick(cand)); return; }
  const a = rand(TAU), d = rand(600, 690), x = clamp(P.x + Math.cos(a) * d, 20, W - 20), y = clamp(P.y + Math.sin(a) * d * 0.75, 20, H - 20);
  const ty = Math.random() < 0.5 ? wpick(zoneAt(x, y).types, unl) : wpick(SPAWNW, unl), n = ET[ty].pack || 1;
  for (let i = 0; i < n; i++) spawnEnemy(ty, clamp(x + rand(-30, 30) * i, 20, W - 20), clamp(y + rand(-30, 30) * i, 20, H - 20), { pop: true });
}
const WAVES = [['bal', 20, 'PLAYTIME!', 'The ballerinas want to dance'], ['por', 16, "DON'T BLINK", 'The porcelain ones are awake', 1], ['mat', 5, 'NESTING TIME', 'There is always one more inside'], ['teddy', 14, 'GROUP HUG', 'The teddies missed you'], ['baby', 28, 'NAP TIME IS OVER', 'Somebody woke the babies'], ['jack', 10, 'POP GOES THE WEASEL', 'Wind them up'], ['robot', 10, 'BATTERIES INCLUDED', 'Beep. Boop. Bye.', 1], ['patch', 14, 'SPARE PARTS', 'They burst at the seams'], ['manne', 10, 'STRIKE A POSE', 'They only move in the dark', 1], ['buddy', 10, 'WANNA PLAY?', 'Friends till the end'], ['hush', 5, 'SHHH', 'She is right behind you', 1], ['nova', 5, 'BESTIES FOREVER', 'She learned your dance']];
function doWave() {
  const w = WAVES[G.wi++ % WAVES.length], n = Math.round(w[1] * (1 + G.t / 500));
  banner(w[2], w[3]); if (w[4]) { G.blackout = 1.8; sfx('dark'); } else lightning();
  ringSpawn(w[0], n, 540); if (G.t > 200) ringSpawn('rag', Math.round(10 + G.t / 60), 620);
}
function nearSpot(dist) { let dx = 2400 - P.x, dy = 1800 - P.y, d = Math.hypot(dx, dy); if (d < 60) { dx = 0; dy = -1; d = 1; } return [clamp(P.x + dx / d * dist, 140, W - 140), clamp(P.y + dy / d * dist * 0.85, 180, H - 100)]; }
function director(dt) {
  const t = G.t, m = t / 60, M = G.mode;
  const lm = Math.max(0, m - 5); G.hm = 1 + m * 0.38 + m * m * 0.045 + lm * lm * lm * 0.05; G.spdMul = 1 + Math.min(0.3, t / 900 * 0.3) + Math.max(0, t - 600) / 600 * 0.5; G.dmgMul = 1 + Math.min(3, t / 600 * 0.7);
  G.cap = Math.min(250, 24 + t * 0.62); G.kbR = Math.sqrt(G.hm);
  if (!G.bosses.some(b => b.mb.final)) AU.layer = t < 50 ? 0 : t < 125 ? 1 : 2;
  G.dpsT += dt; if (G.dpsT >= 10) { G.dps = lerp((G.dmgDone - G.dpsLast) / G.dpsT, G.dps, 0.4); G.dpsLast = G.dmgDone; G.dpsT = 0; }
  G.lightT -= dt; if (G.lightT <= 0) { G.lightT = rand(24, 40); lightning(); }
  if (t >= G.nextWave) { G.nextWave += 60; doWave(); }
  if (G.minis.length && t >= G.minis[0]) { G.minis.shift(); const p = nearSpot(420); spawnMini(G.mbOrder[G.mbi++ % G.mbOrder.length], p[0], p[1]); if (t > 700) { const q = nearSpot(-420); spawnMini(G.mbOrder[G.mbi++ % G.mbOrder.length], q[0], q[1]); } }
  if (M.every && t >= G.nextMini + M.every) { G.nextMini += M.every; const p = nearSpot(420); spawnMini(G.mbOrder[G.mbi++ % G.mbOrder.length], p[0], p[1]); }
  if (G.bossAt && !G.bossWarn && t >= G.bossAt - 2.6) { G.bossWarn = true; G.blackout = 2.7; sfx('dark'); }
  if (G.bossAt && t >= G.bossAt) { G.bossAt = 0; const p = nearSpot(430); spawnMini('madame', p[0], p[1]); }
  if (M.len < 1e9 && t > M.len - 24 && !G.almost) { G.almost = true; banner('ALMOST DAWN', 'Hold on'); }
  if (G.blackout > 0) return;
  G.spawnAcc += (Math.min(9, 1.5 + t * 0.026) + Math.max(0, t - 300) * 0.013) * dt * (G.bosses.length ? 0.6 : 1);
  while (G.spawnAcc >= 1) { G.spawnAcc -= 1; if (enemies.length < G.cap) spawnNear(); }
  G.eliteT -= dt; if (G.eliteT <= 0) { G.eliteT = Math.max(18, 45 - t / 40); const unl = unlocked(), a = rand(TAU); spawnEnemy(wpick(SPAWNW, unl), clamp(P.x + Math.cos(a) * 620, 30, W - 30), clamp(P.y + Math.sin(a) * 480, 30, H - 30), { pop: true, elite: true }); }
  G.boxT -= dt;
  if (G.boxT <= 0) {
    G.boxT = 30 * (1 - 0.08 * Math.min(5, S.luck));
    if (boxes.length < 4) for (let k = 0; k < 20; k++) { const a = rand(TAU), d = rand(600, 1100), x = clamp(P.x + Math.cos(a) * d, 200, W - 200), y = clamp(P.y + Math.sin(a) * d, 160, H - 140); if (Math.hypot(x - P.x, y - P.y) > 520 && !shelfAt(x, y)) { boxes.push({ kind: 'box', x, y, sy: y, t: 0, dead: false }); break; } }
  }
  for (const l of lairs) { if (l.used) continue; const dx = l.x - P.x, dy = l.y - P.y; if (dx * dx + dy * dy < 62 * 62) { l.used = true; G.blackout = 0.9; shake(8); spawnMini(l.z.mb, l.x, l.y - 200); for (let i = 0; i < 10; i++) part(l.x, l.y - 40, rand(-200, 200), rand(-300, -80), 0.8, rand(12, 20), A.spark.red, true, 300, 1); } }
  const z = zoneAt(P.x, P.y); if (z !== G.zone) { G.zone = z; G.zones[z.id] = 1; if (G.t > 1) zoneToast(z.name); }
  AU.want = Math.floor(G.t / 95) % 3;
}
function openBox(b) {
  b.dead = true; sfx('box'); shake(5); flashAt(b.x, b.y, 300, 0.5, 'pink'); ring(b.x, b.y, 10, 160, 0.45, 'butter', 6);
  const cols = ['pink', 'mint', 'butter', 'lilac'];
  for (let i = 0; i < 26; i++) { const a = rand(TAU), s = rand(80, 340); part(b.x, b.y - 20, Math.cos(a) * s, Math.sin(a) * s - 160, rand(0.6, 1.1), rand(10, 18), A.spark[pick(cols)], true, 420, 1.5); }
  if (b.gold) {
    const ev = evoReady();
    if (ev.length) evolve(pick(ev));
    else { const own = Object.keys(P.up).filter(id => P.up[id] < 5); let n = 0; for (let i = 0; i < 2 && own.length; i++) { const id = own.splice((Math.random() * own.length) | 0, 1)[0]; applyUpgrade(id); n++; } for (let i = 0; i < 15; i++) dropGem(b.x, b.y, 4, 200); banner('GOLDEN GIFT', n ? n + ' free upgrades' : 'A pile of buttons'); heal(30); }
    return;
  }
  for (let i = 0; i < 7; i++) dropGem(b.x, b.y, 1, 150); dropGem(b.x, b.y, 2, 120); for (let i = 0; i < 3; i++) dropGem(b.x, b.y, 4, 140);
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
  for (let i = 0; i < 12; i++) { const a = rand(TAU), s = rand(60, rad * 3.2); part(x, y - 12, Math.cos(a) * s, Math.sin(a) * s - 40, rand(0.35, 0.8), rand(9, 18), A.spark[pick(cols)], true, 160, 3); }
  part(x, y - 10, 0, 0, 0.25, rad * 1.5, A.glow[col === 'butter' ? 'butter' : 'pink'], true, 0, 0, rad * 2);
}
const echo = (tm, k) => { if (S.echo && Math.random() < S.echo) tm[k] = Math.min(tm[k], 0.16); };
function updWeapons(dt) {
  const tm = P.tm; let L;
  if ((L = lv('gloss'))) {
    tm.gloss -= dt;
    if (tm.gloss <= 0) {
      const n = [0, 1, 1, 2, 2, 3, 3][L], tg = nearestList(P.x, P.y, 540, n);
      if (tg.length) {
        tm.gloss = [0, 0.55, 0.52, 0.52, 0.48, 0.4, 0.15][L] * S.cd; sfx('shoot'); echo(tm, 'gloss');
        for (let i = 0; i < n; i++) { const e = tg[i % tg.length], a = Math.atan2(e.y - P.y, e.x - P.x) + (i >= tg.length ? (i - 1) * 0.22 : 0) + (L === 6 ? rand(-0.08, 0.08) : 0); shots.push({ k: 'gloss', x: P.x + Math.cos(a) * 14, y: P.y + Math.sin(a) * 14, vx: Math.cos(a) * 660, vy: Math.sin(a) * 660, a, r: 9 * S.area * (L === 6 ? 1.3 : 1), dmg: [0, 10, 14, 14, 19, 21, 24][L], pierce: [0, 0, 0, 0, 1, 1, 4][L], life: 1, hit: [], dead: false }); }
      } else tm.gloss = 0.12;
    }
  }
  if ((L = lv('bomb'))) {
    tm.bomb -= dt;
    if (tm.bomb <= 0) {
      const n = [0, 1, 1, 2, 2, 3, 4][L], tg = nearestList(P.x, P.y, 430, 12);
      if (tg.length) { tm.bomb = [0, 2.9, 2.9, 2.9, 2.9, 2.3, 1.9][L] * S.cd; echo(tm, 'bomb'); for (let i = 0; i < n; i++) { const e = pick(tg); shots.push({ k: 'bomb', x: P.x, y: P.y, sx: P.x, sy0: P.y, tx: e.x + rand(-16, 16), ty: e.y + rand(-16, 16), t: 0, d: 0.55 + i * 0.12, z: 0, dmg: [0, 28, 28, 28, 46, 46, 75][L], rad: [0, 86, 108, 108, 108, 108, 150][L] * S.area, evo: L === 6, dead: false }); } }
      else tm.bomb = 0.3;
    }
  }
  if ((L = lv('ball'))) {
    tm.ball -= dt;
    if (tm.ball <= 0) {
      const n = [0, 1, 1, 1, 2, 2, 3][L], tg = nearestList(P.x, P.y, 460, n);
      if (tg.length) { tm.ball = 2.1 * S.cd; echo(tm, 'ball'); for (let i = 0; i < n; i++) shots.push({ k: 'ball', x: P.x, y: P.y, tg: tg[i % tg.length], b: [0, 3, 5, 5, 5, 8, 20][L], dmg: [0, 16, 16, 24, 24, 33, 50][L], hit: [], sq: 0, life: L === 6 ? 8 : 4, r: 13 * S.area * (L === 6 ? 1.8 : 1), dead: false }); }
      else tm.ball = 0.3;
    }
  }
  if ((L = lv('storm'))) {
    tm.storm -= dt;
    if (tm.storm <= 0) {
      const n = [0, 2, 3, 3, 5, 7, 10][L], tg = nearestList(P.x, P.y, 520, 40);
      if (tg.length) { tm.storm = [0, 2.6, 2.6, 2.6, 2.6, 2, 1.6][L] * S.cd; echo(tm, 'storm'); for (let i = 0; i < n; i++) { const e = pick(tg); shots.push({ k: 'star', x: e.x, y: e.y, t: -i * 0.08, d: 0.42, dmg: [0, 30, 30, 46, 46, 46, 85][L], rad: (L === 6 ? 92 : 52) * S.area, dead: false }); } }
      else tm.storm = 0.3;
    }
  }
  if ((L = lv('scissors'))) {
    tm.scissors -= dt;
    if (tm.scissors <= 0) {
      const n = [0, 1, 1, 2, 2, 3, 3][L], tg = nearestList(P.x, P.y, 420, n);
      if (tg.length) { tm.scissors = [0, 1.8, 1.8, 1.8, 1.8, 1.5, 1.1][L] * S.cd; echo(tm, 'scissors'); sfx('shoot'); for (let i = 0; i < n; i++) { const e = tg[i % tg.length], a = Math.atan2(e.y - P.y, e.x - P.x) + (i >= tg.length ? (i - 1) * 0.5 : 0); shots.push({ k: 'scis', x: P.x, y: P.y, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, t: 0, ret: false, hit: [], dmg: [0, 18, 26, 26, 34, 34, 56][L], r: 20 * S.area * (L === 6 ? 1.7 : 1), out: L === 6 ? 0.75 : 0.5, dead: false }); } }
      else tm.scissors = 0.3;
    }
  }
  if ((L = lv('mirror'))) {
    tm.mirror -= dt;
    if (tm.mirror <= 0) {
      const n = [0, 1, 1, 1, 2, 2, 3][L], tg = nearestList(P.x, P.y, 560, n);
      if (tg.length) {
        tm.mirror = [0, 2.2, 2.2, 1.9, 1.9, 1.6, 0.9][L] * S.cd; echo(tm, 'mirror'); sfx('zap');
        const w = [0, 14, 14, 19, 19, 23, 36][L] * S.area, dmg = [0, 24, 34, 34, 48, 48, 62][L];
        for (let i = 0; i < n; i++) {
          const e = tg[i % tg.length], a = Math.atan2(e.y - P.y, e.x - P.x) + (i >= tg.length ? i * 0.6 : 0), cx = Math.cos(a), sy = Math.sin(a);
          beams.push({ x: P.x, y: P.y, a, len: 640, w, t: 0, d: 0.24, evo: L === 6, dead: false });
          for (const o of enemies) { if (o.dead || o.st === 'jump') continue; const rx = o.x - P.x, ry = o.y - P.y, al = rx * cx + ry * sy; if (al < 0 || al > 640) continue; if (Math.abs(rx * sy - ry * cx) < w + o.r) hurt(o, dmg, P.x, P.y, 60); }
        }
      } else tm.mirror = 0.3;
    }
  }
  if ((L = lv('musicbox'))) {
    tm.musicbox -= dt;
    if (tm.musicbox <= 0) {
      tm.musicbox = [0, 3.2, 3.2, 2.8, 2.8, 2.4, 1.8][L] * S.cd; echo(tm, 'musicbox');
      const R = [0, 150, 182, 182, 216, 216, 300][L] * S.area, dmg = [0, 18, 18, 28, 28, 40, 66][L];
      forNear(P.x, P.y, R, e => { hurt(e, dmg, P.x, P.y, 340); if (L === 6) { e.slow = 1.4; e.slowF = 0.3; } });
      ring(P.x, P.y, 20, R, 0.45, L === 6 ? 'mint' : 'butter', 9); ring(P.x, P.y, 10, R * 0.7, 0.45, 'pink', 5); sfx('chime');
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8; part(P.x + Math.cos(a) * 30, P.y - 20 + Math.sin(a) * 24, Math.cos(a) * R * 1.6, Math.sin(a) * R * 1.3, 0.6, 20, A.note, true, 0, 2); }
    }
  }
  P.sprayR = 0;
  if ((L = lv('spray'))) {
    const R = [0, 150, 172, 172, 204, 204, 280][L] * S.area, ha = [0, 0.42, 0.42, 0.5, 0.5, 0.56, 0.8][L]; P.sprayR = R; P.sprayA = ha; tm.spray -= dt;
    if (tm.spray <= 0) { tm.spray = 0.28 * S.cd; const dmg = [0, 6, 6, 9, 9, 13, 25][L]; forNear(P.x, P.y, R, e => { if (Math.abs(wrapA(Math.atan2(e.y - P.y, e.x - P.x) - P.aim)) < ha) hurt(e, dmg, P.x, P.y, 70); }); }
    for (let i = 0; i < 2; i++) { const a = P.aim + rand(-ha, ha), sp = R * 2.3; part(P.x + Math.cos(a) * 18, P.y - 24 + Math.sin(a) * 12, Math.cos(a) * sp, Math.sin(a) * sp * 0.85, 0.42, rand(14, 22), A.glow[L === 6 ? pick(['blue', 'mint', 'white']) : pick(['butter', 'pink', 'red'])], true, 0, 1.4, 46); }
  }
  P.charms.length = 0;
  if ((L = lv('charm'))) {
    const n = [0, 2, 3, 3, 4, 6, 9][L], R = [0, 80, 80, 96, 96, 112, 126][L] * S.area, dmg = [0, 8, 8, 13, 13, 18, 30][L];
    for (let i = 0; i < n; i++) {
      const a = G.t * 2.7 * (L === 6 && i % 2 ? -1 : 1) + i * TAU / n, rr2 = L === 6 && i % 2 ? R * 0.62 : R, x = P.x + Math.cos(a) * rr2, y = P.y + Math.sin(a) * rr2 * 0.8; P.charms.push(x, y);
      forNear(x, y, 15 * S.area, e => { if (e.ch <= 0) { hurt(e, dmg, P.x, P.y, 170); e.ch = 0.4; part(x, y - 20, 0, 0, 0.2, 26, A.spark.white, true); } });
      if (L === 6) for (const s of eshots) { const dx = s.x - x, dy = s.y - y; if (dx * dx + dy * dy < 26 * 26) { s.dead = true; part(s.x, s.y - 20, 0, 0, 0.2, 24, A.spark.butter, true); } }
    }
  }
  P.auraR = 0;
  if ((L = lv('aura'))) {
    const R = [0, 96, 118, 118, 142, 142, 188][L] * S.area; P.auraR = R; tm.aura -= dt;
    if (tm.aura <= 0) { tm.aura = 0.5 * S.cd; const dmg = [0, 5, 5, 9, 9, 15, 27][L], sl = [0, 0.8, 0.8, 0.8, 0.68, 0.68, 0.5][L]; forNear(P.x, P.y, R, e => { hurt(e, dmg, P.x, P.y, 0); e.slow = 0.7; e.slowF = sl; }); ring(P.x, P.y, R * 0.6, R, 0.4, L === 6 ? 'mint' : 'pink', 3); }
    if (Math.random() < dt * 14) { const a = rand(TAU), d = rand(R * 0.3, R); part(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d * 0.8 - 10, rand(-10, 10), rand(-30, -10), rand(0.5, 0.9), rand(8, 14), A.spark[pick(['pink', 'mint'])], true); }
  }
  if (S.shieldCd && !P.shieldUp) { P.shieldT -= dt; if (P.shieldT <= 0) { P.shieldUp = true; ring(P.x, P.y, 60, 30, 0.3, 'mint', 4); } }
  for (const f of fields) { f.t += dt; f.tick -= dt; if (f.tick <= 0) { f.tick = 0.4; forNear(f.x, f.y, f.r, e => hurt(e, f.dps * 0.4, f.x, f.y, 0, true)); } if (Math.random() < dt * 20) part(f.x + rand(-f.r, f.r) * 0.7, f.y + rand(-f.r, f.r) * 0.5, 0, -50, 0.5, rand(10, 18), A.spark[pick(['pink', 'butter', 'mint', 'lilac'])], true); if (f.t > f.d) f.dead = true; }
  compact(fields);
  for (const b of beams) { b.t += dt; if (b.t >= b.d) b.dead = true; } compact(beams);
}
function updShots(dt) {
  for (const s of shots) {
    if (s.dead) continue;
    if (s.k === 'gloss') {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (s.life <= 0) { s.dead = true; continue; }
      if (Math.random() < dt * 30) part(s.x, s.y - 22, rand(-20, 20), rand(-20, 20), 0.25, rand(8, 13), A.glow.pink, true);
      forNear(s.x, s.y, s.r, e => { if (s.dead || s.hit.indexOf(e) >= 0) return; s.hit.push(e); hurt(e, s.dmg, s.x - s.vx, s.y - s.vy, 100); for (let i = 0; i < 2; i++) part(s.x, s.y - 22, rand(-120, 120), rand(-120, 120), 0.25, rand(8, 14), A.spark.pink, true); if (--s.pierce < 0) s.dead = true; });
    } else if (s.k === 'bomb') {
      s.t += dt; const k = Math.min(1, s.t / s.d); s.x = lerp(s.sx, s.tx, k); s.y = lerp(s.sy0, s.ty, k); s.z = Math.sin(Math.PI * k) * 80;
      if (k >= 1) { s.dead = true; explode(s.tx, s.ty, s.rad, s.dmg, 'pink'); sfx('boom'); if (s.evo && fields.length < 8) fields.push({ x: s.tx, y: s.ty, r: s.rad * 0.8, t: 0, d: 3, dps: 34, tick: 0.2, dead: false }); }
    } else if (s.k === 'star') {
      s.t += dt; if (s.t >= s.d) { s.dead = true; explode(s.x, s.y, s.rad, s.dmg, 'butter'); sfx('zap'); }
      else if (s.t > 0) { const k = s.t / s.d; part(s.x + (1 - k) * 110, s.y - 22 - (1 - k) * 380, rand(-10, 10), rand(-10, 10), 0.3, 14, A.spark.butter, true); }
    } else if (s.k === 'scis') {
      s.t += dt;
      if (!s.ret) { const k = Math.exp(-3.4 * dt); s.vx *= k; s.vy *= k; if (s.t > s.out) { s.ret = true; s.hit.length = 0; } s.x += s.vx * dt; s.y += s.vy * dt; }
      else { const dx = P.x - s.x, dy = P.y - s.y, d = Math.hypot(dx, dy) || 1, sp = (240 + (s.t - s.out) * 1300) * dt; if (d < sp + 20) { s.dead = true; continue; } s.x += dx / d * sp; s.y += dy / d * sp; }
      forNear(s.x, s.y, s.r, e => { if (s.hit.indexOf(e) < 0) { s.hit.push(e); hurt(e, s.dmg, s.x, s.y, 120); part(e.x, e.y - 24, 0, 0, 0.2, 30, A.spark.white, true); } });
    } else if (s.k === 'ball') {
      s.life -= dt; if (s.sq > 0) s.sq -= dt * 5;
      if (!s.tg || s.tg.dead) { const n = nearestList(s.x, s.y, 320, 1, s.hit); s.tg = n[0] || null; }
      if (!s.tg || s.life <= 0) { s.dead = true; burst(s.x, s.y - 20, 'mint', 4); continue; }
      const dx = s.tg.x - s.x, dy = s.tg.y - s.y, d = Math.hypot(dx, dy) || 1, sp = 560 * dt;
      if (d < sp + s.tg.r + 6) {
        s.x = s.tg.x; s.y = s.tg.y; hurt(s.tg, s.dmg, s.x - dx, s.y - dy, 180); sfx('squish'); s.sq = 1; s.hit.push(s.tg); if (s.hit.length > 4) s.hit.shift();
        for (let i = 0; i < 3; i++) part(s.x, s.y - 20, rand(-140, 140), rand(-140, 140), 0.3, rand(8, 14), A.glow.mint, true);
        if (--s.b <= 0) { s.dead = true; burst(s.x, s.y - 20, 'mint', 5); } else { const n = nearestList(s.x, s.y, 320, 1, s.hit); s.tg = n[0] || null; }
      } else { s.x += dx / d * sp; s.y += dy / d * sp; }
    }
  }
  for (const s of eshots) {
    if (s.dead) continue;
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
        p.x += p.vx * dt; p.y += p.vy * dt; p.dt -= dt; const dmg = [0, 22, 32, 32, 34, 46, 60][L];
        forNear(p.x, p.y, 20 * S.area, e => { if (p.hit.indexOf(e) < 0) { p.hit.push(e); hurt(e, dmg, p.x - p.vx, p.y - p.vy, 150); if (L === 6 && p.hit.length === 1) explode(e.x, e.y, 64 * S.area, 30, 'pink'); } });
        if (Math.random() < dt * 50) part(p.x, p.y - 18, 0, 0, 0.28, 26, A.glow.mint, true);
        if (p.dt <= 0) { p.st = 'idle'; p.cd = [0, 1.4, 1.4, 1.4, 0.95, 0.95, 0.6][L] * S.cd; }
      }
    } else {
      const L = lv('bunny'), i = bi++, sp = L >= 2 ? 540 : 400;
      if (p.tg && (p.tg.dead || p.tg.pull)) p.tg = null;
      if (!p.tg) { let best = null, bd = 600 * 600; for (const g of gems) { if (g.claim || g.pull || g.dead) continue; const d = (g.x - P.x) * (g.x - P.x) + (g.y - P.y) * (g.y - P.y); if (d < bd && d > S.pick * S.pick) { bd = d; best = g; } } if (best) { best.claim = true; p.tg = best; } }
      let tx, ty; if (p.tg) { tx = p.tg.x; ty = p.tg.y; } else { const a = p.t * 1.1 + i * 2.4 + 1; tx = P.x + Math.cos(a) * 60; ty = P.y + Math.sin(a) * 40; }
      const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, sp * dt); p.x += dx / d * st; p.y += dy / d * st; if (Math.abs(dx) > 4) p.face = dx > 0 ? 1 : -1;
      if (p.tg && d < 16) { if (L === 6) { forNear(p.x, p.y, 72, e => hurt(e, 32, p.x, p.y, 200)); ring(p.x, p.y, 10, 72, 0.3, 'pink', 4); } collectGem(p.tg); p.tg = null; }
    }
    p.sy = p.y + 6;
  }
}
function collectGem(g) {
  if (g.dead) return; g.dead = true;
  if (g.k === 3) { heal(20); return; }
  if (g.k === 4) { G.coins++; sfx('coin'); part(g.x, g.y - 12, 0, -30, 0.25, 20, A.spark.butter, true); return; }
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
    else if (d2 > 1700 * 1700) g.dead = true;
  }
}

// ---------- player ----------
function botInput() {
  let ax = 0, ay = 0;
  for (const e of enemies) { if (e.dead) continue; const dx = P.x - e.x, dy = P.y - e.y, d2 = dx * dx + dy * dy; if (d2 < 280 * 280) { const w = (e.boss ? 400 : 90) / (d2 + 300); ax += dx * w; ay += dy * w; } }
  for (const e of eshots) { const dx = P.x - e.x, dy = P.y - e.y, d2 = dx * dx + dy * dy; if (d2 < 150 * 150) { ax += dx * 120 / (d2 + 100); ay += dy * 120 / (d2 + 100); } }
  for (const z of ezones) { const dx = P.x - z.x, dy = P.y - z.y, d2 = dx * dx + dy * dy; if (d2 < (z.r + 50) * (z.r + 50)) { ax += dx * 300 / (d2 + 100); ay += dy * 300 / (d2 + 100); } }
  let best = null, bd = 1e12; for (const g of gems) { const d = (g.x - P.x) * (g.x - P.x) + (g.y - P.y) * (g.y - P.y); if (d < bd) { bd = d; best = g; } }
  if (best && bd < 500 * 500) { const d = Math.sqrt(bd) || 1; ax += (best.x - P.x) / d * 0.9; ay += (best.y - P.y) / d * 0.9; }
  for (const b of boxes) { const dx = b.x - P.x, dy = b.y - P.y, d = Math.hypot(dx, dy) || 1; if (b.gold || d < 700) { ax += dx / d * (b.gold ? 1.6 : 0.8); ay += dy / d * (b.gold ? 1.6 : 0.8); } }
  ax += (2400 - P.x) / 1400; ay += (1810 - P.y) / 1100;
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
  for (const s of solids) { if (s.x > P.x + 40 || s.x + s.w < P.x - 40 || s.y > P.y + 40 || s.y + s.h < P.y - 40) continue; const cx = clamp(P.x, s.x, s.x + s.w), cy = clamp(P.y, s.y, s.y + s.h), dx = P.x - cx, dy = P.y - cy, d2 = dx * dx + dy * dy; if (d2 < P.r * P.r) { if (d2 > 0.0001) { const d = Math.sqrt(d2); P.x = cx + dx / d * P.r; P.y = cy + dy / d * P.r; } else { P.y = s.y + s.h + P.r; } } }
  P.x = clamp(P.x, P.r + 4, W - P.r - 4); P.y = clamp(P.y, P.r + 6, H - P.r - 4);
  P.moving = m > 0.12;
  if (P.moving) {
    P.walk += dt * 11 * Math.min(1, m) * S.spd; P.aim += wrapA(Math.atan2(iy, ix) - P.aim) * (1 - Math.exp(-9 * dt));
    if (Math.abs(ix) > 0.15) P.face = ix > 0 ? 1 : -1;
    P.back = iy < -0.45;
    if (Math.random() < dt * 5) part(P.x, P.y, rand(-10, 10), -8, 0.35, 14, A.puff, false, 0, 0, 20);
  }
  if (P.inv > 0) P.inv -= dt; P.sy = P.y; P.blinkT -= dt; if (P.blinkT < -0.12) P.blinkT = rand(2, 5);
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
const itemOk = id => BASE_ITEMS.indexOf(id) >= 0 || SV.items[id] || id === G.hero.start;
function rollChoices() {
  const cnt = { W: 0, O: 0, D: 0, S: 0 }; for (const id in P.up) if (IT[id]) cnt[IT[id].k]++;
  const pool = Object.values(IT).filter(u => itemOk(u.id) && lv(u.id) < 5 && (lv(u.id) > 0 || cnt[u.k] < CAPS[u.k]));
  for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[pool[i], pool[j]] = [pool[j], pool[i]]; }
  // favour things you already own a little, and weapons early
  pool.sort((a, b) => ((lv(b.id) > 0 ? 0.5 : 0) + (P.lvl <= 5 && b.k === 'W' ? 0.6 : 0) + Math.random()) - ((lv(a.id) > 0 ? 0.5 : 0) + (P.lvl <= 5 && a.k === 'W' ? 0.6 : 0) + Math.random()));
  const ch = pool.slice(0, 3); while (ch.length < 3) ch.push(CAKE);
  const ev = evoReady(); if (ev.length) { const id = pick(ev); ch[0] = { id: 'evo:' + id, evoOf: id, k: 'E', name: IT[id].evo[1], cat: 'EVOLUTION', desc: IT[id].evo[2] }; }
  return ch;
}
function levelUp() {
  sfx('level'); ring(P.x, P.y, 20, 260, 0.5, 'butter', 8); flashAt(P.x, P.y, 420, 0.5, 'warm'); pushAway(230, 520);
  const ch = rollChoices();
  if (G.bot) { const own = ch[0].evoOf ? [ch[0]] : ch.filter(c => c.k === 'W' || lv(c.id) > 0); applyUpgrade(pick(own.length ? own : ch).id); P.inv = Math.max(P.inv, 0.6); return; }
  G.state = 'levelup'; joy.on = false; joy.dx = joy.dy = 0; showCards(ch);
}

// ---------- main update ----------
function update(dt) {
  G.rt += dt;
  const st = G.state;
  if (st === 'title') { updSlots(dt, false); updFx(dt); G.lightT -= dt; if (G.lightT <= 0) { G.lightT = rand(9, 16); G.flash = 1; G.flash2 = 0.2; } P.aim += dt * 0.5; return; }
  if (st === 'play') {
    G.t += dt;
    if (G.t >= G.mode.len) { G.state = 'dawn'; G.stateT = 0; AU.mode = 'off'; sfx('win'); hideHud(); return; }
    updPlayer(dt); director(dt); updSlots(dt, true); gridBuild(); updEnemies(dt); updWeapons(dt); updShots(dt); updPets(dt); updGems(dt);
    for (const b of boxes) { b.t += dt; if (Math.hypot(b.x - P.x, b.y - P.y) < 36) openBox(b); }
    compact(enemies); compact(gems); compact(shots); compact(eshots); compact(boxes);
    G.comboT -= dt; if (G.comboT <= 0) AU.combo = 0;
    updFx(dt);
    if (G.pending > 0 && G.state === 'play') { G.pending--; levelUp(); }
    return;
  }
  if (st === 'dying') { G.stateT += dt; updFx(dt); const sd = dt * 0.25; for (const e of enemies) e.t += sd; if (G.stateT > 1.0) { G.state = 'scare'; G.stateT = 0; sfx('scare'); } return; }
  if (st === 'scare') { G.stateT += dt; if (G.stateT > 0.85) { G.state = 'over'; endRun(false); } return; }
  if (st === 'dawn') {
    G.stateT += dt; G.dawn = Math.min(1, G.stateT / 2.6); updFx(dt);
    for (const e of enemies) { e.t += dt * 0.3; if (!e.dead && Math.random() < dt * (0.8 + G.stateT * 2)) { e.dead = true; burst(e.x, e.y - e.hgt * 0.4, 'butter', e.boss ? 30 : 5); } }
    compact(enemies); eshots.length = 0; ezones.length = 0;
    if (G.stateT > 3.6) { G.state = 'won'; endRun(true); }
    return;
  }
}
function sim(mode = 'short', heroId = 'luna', maxT = 1000) {
  G.bot = true; reset(mode, HEROES.find(h => h.id === heroId)); G.state = 'play';
  const log = []; let lastLog = 0, n = 0;
  while (G.state === 'play' && n++ < maxT * 60) { update(1 / 60); if (G.t - lastLog >= 60) { lastLog = G.t; log.push(`${Math.round(G.t)}s L${P.lvl} hp${Math.round(P.hp)} en${enemies.length} k${G.kills} dps${Math.round(G.dps)} hm${G.hm.toFixed(1)} mb${G.minisKilled} c${G.coins}`); } }
  const r = { state: G.state, t: Math.round(G.t), lvl: P.lvl, kills: G.kills, hp: Math.round(P.hp), bossDead: G.bossDead, minis: G.minisKilled, coins: G.coins, evos: G.evos, up: Object.assign({}, P.up), log };
  G.bot = false; G.state = 'title'; return r;
}

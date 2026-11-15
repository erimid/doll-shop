// ---------- save / meta progression ----------
const SAVE_KEY = 'dss_save_v2';
function loadSave() {
  const d = { coins: 0, shop: {}, items: {}, heroes: { luna: 1 }, ach: {}, seen: {}, stats: { runs: 0, kills: 0, minis: 0, bosses: 0, evos: 0, earned: 0, best: {}, wins: {}, heroWins: {} }, hero: 'luna', mode: 'short', muted: false };
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s) for (const k in d) if (s[k] !== undefined && typeof s[k] === typeof d[k]) d[k] = typeof d[k] === 'object' ? Object.assign(d[k], s[k]) : s[k]; } catch (e) { }
  for (const k of ['best', 'wins', 'heroWins']) if (!d.stats[k] || typeof d.stats[k] !== 'object') d.stats[k] = {};
  d.heroes.luna = 1; return d;
}
const SV = loadSave();
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); } catch (e) { } }
const SHOP = [
  { id: 'pow', g: '★', c: C.hot, name: 'Glitter Polish', desc: '+5% damage', max: 5, cost: 60 },
  { id: 'haste', g: '⚡︎', c: C.butter, name: 'Quick Hands', desc: 'Attack 3% faster', max: 5, cost: 60 },
  { id: 'vit', g: '♥︎', c: '#ff4f7f', name: 'Extra Heart', desc: '+10 max health', max: 5, cost: 50 },
  { id: 'armor', g: '◆', c: C.blue, name: 'Thick Skin', desc: 'Take 3% less damage', max: 5, cost: 60 },
  { id: 'spd', g: '➤', c: C.mint, name: 'Fast Feet', desc: 'Move 3% faster', max: 5, cost: 50 },
  { id: 'mag', g: '◎', c: C.lilac, name: 'Sticky Fingers', desc: 'Grab gems from 10% farther', max: 5, cost: 40 },
  { id: 'grow', g: '▲', c: C.mint, name: 'Fast Learner', desc: '+4% XP', max: 5, cost: 60 },
  { id: 'luck', g: '♣︎', c: '#5fe08a', name: 'Lucky Streak', desc: 'More hearts, buttons and boxes', max: 5, cost: 50 },
  { id: 'greed', g: '●', c: '#ffd24a', name: 'Deep Pockets', desc: '+10% buttons every night', max: 5, cost: 70 },
  { id: 'reroll', g: '↻', c: C.pink, name: 'Second Opinion', desc: '+1 reroll every night', max: 3, cost: [150, 400, 900] },
  { id: 'head', g: '⇧', c: C.butter, name: 'Head Start', desc: 'Start one level higher', max: 2, cost: [400, 1100] },
  { id: 'revive', g: '✚', c: '#ff4f7f', name: 'Nine Lives', desc: 'Come back once when you fall', max: 1, cost: [1500] },
];
const shopCost = (u, n) => Array.isArray(u.cost) ? u.cost[n] : Math.round(u.cost * Math.pow(1.7, n) / 10) * 10;
const ITEM_COST = { piggy: 80, scrunchie: 120, lipstick: 120, foot: 120, notes: 120, spray: 150, backpack: 180, scissors: 200, shield: 200, clip: 200, battery: 220, mirror: 300, musicbox: 350 };
const ACH = [
  { id: 'mini_1', name: 'Giant Slayer', desc: 'Defeat a miniboss', rw: 50, ok: r => r.minis >= 1 },
  { id: 'win_short', name: 'Closing Time', desc: 'Survive the Closing Shift', rw: 100, ok: r => r.win && r.mode === 'short' },
  { id: 'boss_1', name: 'Shattered', desc: 'Defeat Madame Porcelain', rw: 150, ok: r => r.boss >= 1 },
  { id: 'evo_1', name: 'Glow Up', desc: 'Evolve a weapon', rw: 75, ok: r => r.evos >= 1 },
  { id: 'mini_3', name: 'Bully', desc: 'Defeat 3 minibosses in one night', rw: 150, ok: r => r.minis >= 3 },
  { id: 'full', name: 'Overpacked', desc: 'Carry 6 weapons at once', rw: 100, ok: r => r.weapons >= 6 },
  { id: 'zones', name: 'Window Shopper', desc: 'Visit all nine rooms in one night', rw: 100, ok: r => r.zones >= 9 },
  { id: 'lvl_30', name: 'Overachiever', desc: 'Reach level 30', rw: 150, ok: r => r.lvl >= 30 },
  { id: 'win_long', name: 'Graveyard Champ', desc: 'Survive the Graveyard Shift', rw: 300, ok: r => r.win && r.mode === 'long' },
  { id: 'evo_3', name: 'Full Glam', desc: 'Evolve 3 weapons in one night', rw: 250, ok: r => r.evos >= 3 },
  { id: 'end_10', name: 'Insomniac', desc: 'Last 10 minutes of Endless Nightmare', rw: 300, ok: r => r.mode === 'endless' && r.t >= 600 },
  { id: 'end_20', name: 'No Sleep Club', desc: 'Last 20 minutes of Endless Nightmare', rw: 600, ok: r => r.mode === 'endless' && r.t >= 1200 },
  { id: 'kills_1k', name: 'Toy Recall', desc: 'Stop 1,000 dolls in total', rw: 100, ok: () => SV.stats.kills >= 1000 },
  { id: 'kills_10k', name: 'Clearance Sale', desc: 'Stop 10,000 dolls in total', rw: 400, ok: () => SV.stats.kills >= 10000 },
  { id: 'squad', name: 'Squad Goals', desc: 'Win a night with 3 different girls', rw: 300, ok: () => Object.keys(SV.stats.heroWins).length >= 3 },
  { id: 'dex', name: 'Shelf Complete', desc: 'Stop every kind of doll and boss', rw: 500, ok: () => Object.keys(ET).concat(Object.keys(MB)).every(k => SV.seen[k]) },
];
const MODE_REQ = { long: 'mini_1', endless: 'win_short' };
const achById = id => ACH.find(a => a.id === id);
const heroById = id => HEROES.find(h => h.id === id) || HEROES[0];
const heroOwned = h => (!h.cost && !h.unlock) || !!SV.heroes[h.id] || (h.unlock && !!SV.ach[h.unlock]);
const modeOpen = id => !MODE_REQ[id] || !!SV.ach[MODE_REQ[id]];

// ---------- DOM helpers ----------
const $ = id => document.getElementById(id);
const show = (id, on = true) => $(id).classList.toggle('on', on);
const SCREENS = ['title', 'setup', 'shop', 'coll', 'levelup', 'pause', 'res'];
function screen(id) { for (const s of SCREENS) show(s, s === id); }
const urlCache = new Map();
function cUrl(c) { let u = urlCache.get(c); if (!u) { u = c.toDataURL(); urlCache.set(c, u); } return u; }
const iconUrl = id => cUrl(A.icon[id] || A.icon.cake);
const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
function coinsSync() { for (const el of document.querySelectorAll('.cn')) el.textContent = SV.coins; }
function banner(t, s) { const b = $('banner'); $('bt').textContent = t; $('bs').textContent = s || ''; b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); }
let ztLast = '', ztAt = -9;
function zoneToast(n) { if (n === ztLast && G.rt - ztAt < 20) return; if (G.rt - ztAt < 2.5) return; ztLast = n; ztAt = G.rt; const z = $('zt'); z.textContent = n; z.classList.remove('go'); void z.offsetWidth; z.classList.add('go'); }
function hideHud() { show('btns', false); $('zt').classList.remove('go'); $('banner').classList.remove('go'); }
function tap(el, fn) { el.addEventListener('click', e => { initAudio(); fn(e); }); }

// ---------- level-up cards ----------
let cardLock = false, cardAt = 0;
function buildHtml() {
  const by = { W: [], O: [], D: [], S: [] }; for (const id in P.up) if (IT[id]) by[IT[id].k].push(id);
  return ['W', 'O', 'D', 'S'].map(k => `<div class="bg"><span>${KNAME[k]} ${by[k].length}/${CAPS[k]}</span><div>${by[k].map(id => `<i class="${P.up[id] >= 6 ? 'e' : ''}"><img src="${iconUrl(id)}"><b>${P.up[id] >= 6 ? '★' : P.up[id]}</b></i>`).join('')}${'<i class="x"></i>'.repeat(Math.max(0, CAPS[k] - by[k].length))}</div></div>`).join('');
}
function evoHint(u) {
  if (u.evoOf || u.id === 'cake') return '';
  if (u.k === 'W') { const p = IT[u.evo[0]], have = lv(p.id) > 0, locked = !itemOk(p.id); return `<em class="${have ? 'have' : ''}">✦ Evolves with ${p.name}${locked ? ' (Toy Chest)' : ''}</em>`; }
  const w = Object.values(IT).find(x => x.evo && x.evo[0] === u.id); if (!w) return '';
  return `<em class="${lv(w.id) > 0 ? 'have' : ''}">✦ Evolves ${w.name}</em>`;
}
function showCards(ch) {
  const box = $('cards'); box.innerHTML = ''; $('lvn').textContent = 'LEVEL ' + P.lvl; cardLock = false; cardAt = performance.now();
  for (const u of ch) {
    const evo = !!u.evoOf, plain = u.id === 'cake' || evo, L = plain ? 0 : lv(u.id), el = document.createElement('button'); el.className = 'card' + (evo ? ' evo' : ''); el.style.setProperty('--c', CATC[u.cat]);
    let pips = ''; if (!plain) for (let i = 0; i < 5; i++) pips += `<i class="${i < L ? 'f' : i === L ? 'n' : ''}"></i>`;
    const tag = evo ? 'EVOLUTION' : u.id === 'cake' ? 'TREAT' : (L === 0 ? 'NEW ' : '') + KNAME[u.k];
    el.innerHTML = `<img src="${iconUrl(evo ? u.evoOf : u.id)}"><span class="tag">${tag}</span><h3>${u.name}</h3><p>${Array.isArray(u.desc) ? u.desc[L] : u.desc}</p>${evoHint(u)}<div class="pips">${pips}</div>`;
    el.addEventListener('click', () => {
      if (cardLock || performance.now() - cardAt < 380) return; cardLock = true; el.classList.add('sel'); for (const o of box.children) if (o !== el) o.classList.add('dim'); sfx('pick');
      setTimeout(() => { applyUpgrade(u.id); show('levelup', false); P.inv = Math.max(P.inv, 0.9); G.state = 'play'; }, 280);
    });
    box.appendChild(el);
  }
  const rb = $('bReroll'); rb.textContent = 'REROLL (' + P.rerolls + ')'; rb.style.display = P.rerolls > 0 ? '' : 'none';
  $('build').innerHTML = buildHtml();
  show('levelup');
}
tap($('bReroll'), () => { if (cardLock || P.rerolls <= 0 || G.state !== 'levelup') return; P.rerolls--; sfx('ui'); showCards(rollChoices()); });

// ---------- title / setup ----------
let selHero = SV.hero, selMode = SV.mode;
function showTitle() { coinsSync(); screen('title'); G.state = 'title'; AU.mode = 'title'; AU.want = 0; show('btns', false); }
function renderSetup() {
  const h = heroById(selHero), own = heroOwned(h);
  $('heroes').innerHTML = HEROES.map((x, i) => `<button class="hero${x.id === selHero ? ' on' : ''}${heroOwned(x) ? '' : ' lock'}" data-h="${x.id}"><img src="${cUrl(A.portrait[i].c)}"><b>${x.name}</b></button>`).join('');
  const st = IT[h.start];
  let how = ''; if (!own) how = h.cost ? `<button id="bBuyHero" class="btn buy${SV.coins >= h.cost ? '' : ' no'}"><i class="bi"></i>${h.cost} UNLOCK</button>` : `<span class="lockmsg">🔒 ${achById(h.unlock).desc} to unlock</span>`;
  $('heroInfo').innerHTML = `<img class="hbig${own ? '' : ' lock'}" src="${cUrl(A.portrait[HEROES.indexOf(h)].c)}"><div class="hi"><h3>${h.name} <small>${h.tag}</small></h3><p><img src="${iconUrl(h.start)}"> Starts with <b>${st.name}</b></p><p class="perk">${h.perk}</p>${how}</div>`;
  if (!modeOpen(selMode)) selMode = 'short';
  $('modes').innerHTML = Object.values(MODES).map(m => { const open = modeOpen(m.id), best = SV.stats.best[m.id]; return `<button class="mode${m.id === selMode ? ' on' : ''}${open ? '' : ' lock'}" data-m="${m.id}"><b>${m.name}</b><span>${open ? m.sub : '🔒 ' + achById(MODE_REQ[m.id]).desc}</span>${open && best ? `<em>Best ${fmt(best)}${SV.stats.wins[m.id] ? ' · ' + SV.stats.wins[m.id] + ' win' + (SV.stats.wins[m.id] > 1 ? 's' : '') : ''}</em>` : ''}</button>`; }).join('');
  $('bGo').classList.toggle('no', !own); coinsSync();
  const bb = $('bBuyHero'); if (bb) tap(bb, () => { if (SV.coins < h.cost) { sfx('nope'); return; } SV.coins -= h.cost; SV.heroes[h.id] = 1; save(); sfx('buy'); renderSetup(); });
}
$('heroes').addEventListener('click', e => { const b = e.target.closest('[data-h]'); if (!b) return; initAudio(); selHero = b.dataset.h; sfx('ui'); renderSetup(); });
$('modes').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; initAudio(); if (!modeOpen(b.dataset.m)) { sfx('nope'); return; } selMode = b.dataset.m; sfx('ui'); renderSetup(); });
tap($('bStart'), () => { sfx('ui'); selHero = heroOwned(heroById(SV.hero)) ? SV.hero : 'luna'; selMode = SV.mode; renderSetup(); screen('setup'); });
tap($('bGo'), () => { if (!heroOwned(heroById(selHero))) { sfx('nope'); return; } startRun(selMode, selHero); });
for (const b of document.querySelectorAll('[data-back]')) tap(b, () => { sfx('ui'); showTitle(); });

// ---------- toy chest (shop) ----------
let shopTab = 'up';
function renderShop() {
  for (const b of $('shopTabs').children) b.classList.toggle('on', b.dataset.t === shopTab);
  let h = '';
  if (shopTab === 'up') for (const u of SHOP) {
    const n = SV.shop[u.id] || 0, maxed = n >= u.max, cost = maxed ? 0 : shopCost(u, n); let pips = ''; for (let i = 0; i < u.max; i++) pips += `<i class="${i < n ? 'f' : ''}"></i>`;
    h += `<button class="tile${maxed ? ' done' : SV.coins >= cost ? '' : ' no'}" data-u="${u.id}" style="--c:${u.c}"><span class="glyph">${u.g}</span><h3>${u.name}</h3><p>${u.desc}</p><div class="pips">${pips}</div><span class="cost">${maxed ? 'MAX' : '<i class="bi"></i>' + cost}</span></button>`;
  } else for (const id in ITEM_COST) {
    const u = IT[id], own = !!SV.items[id], cost = ITEM_COST[id], ev = u.evo ? `Evolves with ${IT[u.evo[0]].name}` : (() => { const w = Object.values(IT).find(x => x.evo && x.evo[0] === id); return w ? `Evolves ${w.name}` : ''; })();
    h += `<button class="tile${own ? ' done' : SV.coins >= cost ? '' : ' no'}" data-i="${id}" style="--c:${CATC[u.cat]}"><img src="${iconUrl(id)}"><span class="tag">${KNAME[u.k]}</span><h3>${u.name}</h3><p>${Array.isArray(u.desc) ? u.desc[0] : u.desc}</p><em>${ev ? '✦ ' + ev : ''}</em><span class="cost">${own ? 'OWNED' : '<i class="bi"></i>' + cost}</span></button>`;
  }
  $('shopGrid').innerHTML = h; coinsSync();
}
$('shopGrid').addEventListener('click', e => {
  const b = e.target.closest('.tile'); if (!b) return; initAudio();
  if (b.dataset.u) { const u = SHOP.find(x => x.id === b.dataset.u), n = SV.shop[u.id] || 0; if (n >= u.max) return; const c = shopCost(u, n); if (SV.coins < c) { sfx('nope'); return; } SV.coins -= c; SV.shop[u.id] = n + 1; }
  else { const id = b.dataset.i; if (SV.items[id]) return; const c = ITEM_COST[id]; if (SV.coins < c) { sfx('nope'); return; } SV.coins -= c; SV.items[id] = 1; }
  save(); sfx('buy'); const sc = $('shopGrid').scrollTop; renderShop(); $('shopGrid').scrollTop = sc;
});
$('shopTabs').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (!b) return; initAudio(); shopTab = b.dataset.t; sfx('ui'); renderShop(); $('shopGrid').scrollTop = 0; });
function openShop() { sfx('ui'); renderShop(); screen('shop'); }
tap($('bShop'), openShop);

// ---------- collection ----------
let collTab = 'dolls';
function renderColl() {
  for (const b of $('collTabs').children) b.classList.toggle('on', b.dataset.t === collTab);
  let h = '';
  if (collTab === 'dolls') {
    const row = (id, name, blurb, spr, boss) => { const n = SV.seen[id] || 0; return `<div class="tile dex${n ? '' : ' unk'}${boss ? ' boss' : ''}" style="--c:${boss ? C.red : C.lilac}"><img src="${cUrl(spr.c)}"><h3>${n ? name : '???'}</h3><p>${n ? blurb : 'Not stopped yet'}</p><span class="cost">${n ? '× ' + n : ''}</span></div>`; };
    for (const k in ET) h += row(k, ET[k].name, ET[k].blurb, A.doll[k][0].R, false);
    for (const k in MB) h += row(k, MB[k].name, MB[k].sub, MB[k].final ? A.boss.R : A.mb[k].R, true);
  } else if (collTab === 'ach') {
    for (const a of ACH) { const d = !!SV.ach[a.id]; h += `<div class="tile ach${d ? ' done' : ''}" style="--c:${d ? C.butter : '#6a58ad'}"><span class="glyph">${d ? '★' : '☆'}</span><h3>${a.name}</h3><p>${a.desc}</p><span class="cost"><i class="bi"></i>${a.rw}${d ? ' ✓' : ''}</span></div>`; }
  } else {
    const s = SV.stats, rec = [[s.runs, 'nights played'], [s.kills, 'dolls stopped'], [s.minis, 'minibosses beaten'], [s.bosses, 'Madames shattered'], [s.evos, 'evolutions'], [s.earned, 'buttons earned'], [s.best.short ? fmt(s.best.short) : '-', 'best Closing Shift'], [s.best.long ? fmt(s.best.long) : '-', 'best Graveyard Shift'], [s.best.endless ? fmt(s.best.endless) : '-', 'best Endless'], [Object.keys(SV.ach).length + '/' + ACH.length, 'stickers']];
    h = rec.map(([v, l]) => `<div class="tile rec" style="--c:${C.mint}"><h3>${v}</h3><p>${l}</p></div>`).join('');
  }
  $('collGrid').innerHTML = h; coinsSync();
}
$('collTabs').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (!b) return; initAudio(); collTab = b.dataset.t; sfx('ui'); renderColl(); $('collGrid').scrollTop = 0; });
tap($('bColl'), () => { sfx('ui'); renderColl(); screen('coll'); });

// ---------- run start / end ----------
function startRun(mode, heroId) {
  initAudio(); SV.mode = mode; SV.hero = heroId; save();
  reset(mode, heroById(heroId)); G.state = 'play'; G.spawnAcc = 2; AU.mode = 'game'; AU.layer = 0; AU.step = 0; AU.want = AU.song = 0;
  screen(null); show('btns'); cam.x = P.x; cam.y = P.y;
  banner(G.mode.id === 'endless' ? 'ENDLESS NIGHTMARE' : 'SURVIVE UNTIL DAWN', 'Drag anywhere to move');
}
function endRun(win, quit) {
  const M = G.mode, t = Math.min(G.t, M.len), st = SV.stats;
  const parts = [['Buttons picked up', Math.round(G.coins * S.coin)], ['Time survived', Math.floor(Math.min(t, 1800) / 6)], ['Minibosses', G.minisKilled * 25], ['Madame Porcelain', G.bossKills * 100], ['Made it to dawn', win ? (M.id === 'short' ? 100 : 400) : 0]];
  st.runs++; st.kills += G.kills; st.minis += G.minisKilled; st.bosses += G.bossKills; st.evos += G.evos;
  for (const k in G.seen) SV.seen[k] = (SV.seen[k] || 0) + G.seen[k];
  const newBest = t > (st.best[M.id] || 0); if (newBest) st.best[M.id] = Math.round(t);
  if (win) { st.wins[M.id] = (st.wins[M.id] || 0) + 1; st.heroWins[G.hero.id] = 1; }
  const r = { win, mode: M.id, t, minis: G.minisKilled, boss: G.bossKills, evos: G.evos, lvl: P.lvl, zones: Object.keys(G.zones).length, weapons: Object.keys(P.up).filter(id => IT[id] && IT[id].k === 'W').length };
  const fresh = []; for (let pass = 0; pass < 2; pass++) for (const a of ACH) if (!SV.ach[a.id] && a.ok(r)) { SV.ach[a.id] = 1; fresh.push(a); }
  let earned = 0; for (const p of parts) earned += p[1]; for (const a of fresh) earned += a.rw;
  SV.coins += earned; st.earned += earned; save();
  // results screen
  const el = $('res'); el.className = 'ov ' + (win ? 'dawn' : 'dead');
  $('rT').textContent = win ? 'DAWN!' : quit ? 'YOU SNUCK OUT' : 'THEY GOT YOU'; $('rT').className = 'big' + (win ? '' : ' drip');
  $('rS').textContent = win ? 'You survived the night.' : quit ? 'The dolls will remember this.' : 'The dolls put you on the shelf.';
  $('rStats').innerHTML = [[fmt(t) + (newBest && !win ? ' ★' : ''), 'survived'], [G.kills, 'dolls stopped'], [P.lvl, 'level'], [G.minisKilled + G.bossKills, 'bosses beaten']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
  let h = `<div class="earn"><i class="bi"></i><b>+${earned}</b><span>buttons</span></div><ul>` + parts.filter(p => p[1] > 0).map(p => `<li>${p[0]}<b>+${p[1]}</b></li>`).join('');
  for (const a of fresh) h += `<li class="new">★ Sticker: ${a.name}<b>+${a.rw}</b></li>`;
  for (const a of fresh) { for (const x of HEROES) if (x.unlock === a.id) h += `<li class="new">New girl unlocked: ${x.name}</li>`; for (const m in MODE_REQ) if (MODE_REQ[m] === a.id) h += `<li class="new">New shift unlocked: ${MODES[m].name}</li>`; }
  $('rEarn').innerHTML = h + '</ul>'; coinsSync(); show('btns', false); screen('res');
  if (fresh.length) setTimeout(() => sfx('box'), 500);
}
tap($('bAgain'), () => startRun(SV.mode, SV.hero));
tap($('bResShop'), openShop);
tap($('bMenu'), () => { sfx('ui'); showTitle(); });
function setPause(p) {
  if (p && G.state === 'play') { G.state = 'pause'; $('pBuild').innerHTML = buildHtml(); show('pause'); joy.on = false; joy.dx = joy.dy = 0; }
  else if (!p && G.state === 'pause') { G.state = 'play'; show('pause', false); }
}
tap($('bPause'), () => setPause(true)); tap($('bResume'), () => setPause(false));
tap($('bQuit'), () => { if (G.state !== 'pause') return; show('pause', false); G.state = 'quit'; AU.mode = 'off'; hideHud(); endRun(false, true); });
tap($('bMute'), () => { setMuted(!AU.muted); SV.muted = AU.muted; save(); $('bMute').classList.toggle('off', AU.muted); });
if (SV.muted) { AU.muted = true; $('bMute').classList.add('off'); }
document.addEventListener('visibilitychange', () => { if (document.hidden) { setPause(true); if (AU.ctx) AU.ctx.suspend(); } else if (AU.ctx) AU.ctx.resume(); });

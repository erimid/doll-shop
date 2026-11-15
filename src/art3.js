// ---------- v3: more heroes, icons, toy soldier ----------
HEROES.push(
  { id: 'coco', name: 'Coco', tag: 'The Bubble Queen', start: 'bubble', perk: 'Everything hits 15% bigger', cost: 900, mod: { area: 0.15 },
    o: { skin: '#c98f6b', hair: '#6fe0ff', hair2: '#2fb0e0', streak: '#fff6fb', style: 'buns', iris: '#ffd24a', top: '#ff8fd0', top2: '#fff6fb', skirt: '#6fe0ff', sock: '#fff6fb', sock2: '#ff8fd0', boot: '#fff6fb', sole: '#6fe0ff', emblem: 'star', emb: '#fff6fb' } },
  { id: 'vex', name: 'Vex', tag: 'The Live Wire', start: 'zap', perk: '+12% damage and faster attacks, but 25 less health', unlock: 'style', mod: { dmg: 0.12, cd: 0.06, hp: -25 },
    o: { skin: '#ffe3d3', hair: '#ffe58a', hair2: '#ffb347', streak: '#7c6cf0', style: 'short', iris: '#4ff0ff', top: '#3a2a8a', top2: '#ffe58a', skirt: '#17102b', sock: '#17102b', sock2: '#ffe58a', boot: '#ffe58a', sole: '#17102b', emblem: 'bolt', emb: '#ffe58a' } },
);
function buildArt3() {
  const R = sprite(44, 70, 22, 60, g => {
    for (const s of [-1, 1]) { rr(g, s * 5 - 4, -16, 8, 16, 2.5); fs(g, '#2f2157', 2); }
    rr(g, -10, -36, 20, 23, 5); fs(g, '#e0304e', 2.2); g.strokeStyle = C.butter; g.lineWidth = 2; g.beginPath(); g.moveTo(-7, -32); g.lineTo(7, -20); g.moveTo(7, -32); g.lineTo(-7, -20); g.stroke();
    limb(g, 8, -30, 17, -24, 3.5, '#e0304e'); g.beginPath(); g.moveTo(10, -18); g.lineTo(21, -34); g.lineWidth = 4.5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#b8b8d8'; g.stroke();
    circ(g, 0, -43, 8); fs(g, '#ffe3d3', 2.2); circ(g, -3, -43, 1.5); g.fillStyle = INK; g.fill(); circ(g, 3, -43, 1.5); g.fill(); circ(g, -5.5, -40, 1.8); g.fillStyle = '#ff9db5'; g.fill(); circ(g, 5.5, -40, 1.8); g.fill();
    rr(g, -8, -63, 16, 16, 3); fs(g, '#17102b', 2.2); g.fillStyle = C.butter; g.fillRect(-8, -51, 16, 3); circ(g, 0, -64, 2.6); fs(g, C.hot, 1.4);
  });
  A.soldier = { R, L: flipS(R) };
}
Object.assign(ICON, {
  whip(g) { g.beginPath(); g.moveTo(-26, 8); g.bezierCurveTo(-34, -46, 34, -46, 26, 8); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4; g.strokeStyle = C.butter; g.stroke(); for (const s of [-1, 1]) { rr(g, s * 26 - 6, 4, 12, 30, 5); fs(g, s < 0 ? C.hot : C.mint, 3); } },
  bubble(g) { g.save(); g.rotate(-0.5); rr(g, -5, 2, 10, 34, 4); fs(g, C.pink, 3); circ(g, 0, -12, 14); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4; g.strokeStyle = C.pink; g.stroke(); g.restore(); for (const [x, y, r] of [[22, -22, 11], [34, 2, 7], [8, -38, 6]]) { circ(g, x, y, r); g.fillStyle = 'rgba(160,230,255,.5)'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#dff6ff'; g.stroke(); } },
  zap(g) { g.save(); g.rotate(0.5); rr(g, -6, 8, 12, 30, 5); fs(g, C.lilac, 3); rr(g, -17, -30, 34, 40, 12); fs(g, C.hot, 3); g.fillStyle = '#fff6fb'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { circ(g, -9 + i * 9, -21 + j * 10, 2.4); g.fill(); } g.restore(); g.beginPath(); g.moveTo(-18, -38); g.lineTo(-32, -16); g.lineTo(-23, -16); g.lineTo(-30, 2); g.lineTo(-10, -22); g.lineTo(-20, -22); g.lineTo(-12, -38); g.closePath(); fs(g, C.butter, 2.6); },
  trail(g) { g.beginPath(); g.moveTo(-22, -30); g.lineTo(-4, -30); g.lineTo(-2, -4); g.lineTo(24, 2); g.lineTo(26, 16); g.lineTo(-24, 16); g.closePath(); fs(g, C.mint, 3); g.fillStyle = C.hot; g.fillRect(-23, 9, 48, 6); for (const x of [-14, 14]) { circ(g, x, 26, 9); fs(g, C.butter, 3); circ(g, x, 26, 3); g.fillStyle = INK; g.fill(); } star(g, 22, -22, 9, 4); fs(g, C.pink, 2); },
  turret(g) { g.translate(0, 38); g.scale(1.25, 1.25); g.drawImage(A.soldier.R.c, -22, -60, 44, 70); },
  bracelet(g) { ell(g, 0, 6, 28, 20); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3; g.strokeStyle = C.mint; g.stroke(); const cs = [C.pink, C.butter, C.lilac, C.hot, C.blue]; for (let i = 0; i < 5; i++) { const a = Math.PI * (0.15 + i * 0.175); circ(g, Math.cos(a) * 28, 6 + Math.sin(a) * 20, 6.5); fs(g, cs[i], 2.4); } heart(g, 0, -16, 9); fs(g, C.hot, 2.4); },
  tiara(g) { g.beginPath(); g.moveTo(-30, 20); g.lineTo(-34, -8); g.lineTo(-17, 6); g.lineTo(0, -26); g.lineTo(17, 6); g.lineTo(34, -8); g.lineTo(30, 20); g.closePath(); fs(g, '#cfeaff', 3); circ(g, 0, -26, 5); fs(g, C.pink, 2.4); circ(g, -34, -8, 4); fs(g, C.mint, 2.2); circ(g, 34, -8, 4); fs(g, C.mint, 2.2); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(-24, 11, 48, 4); },
  sour(g) { g.save(); g.rotate(0.3); rr(g, -12, -2, 24, 36, 6); fs(g, '#b6f05a', 3); rr(g, -10, -24, 20, 24, 5); fs(g, '#eaffc0', 3); g.fillStyle = INK; circ(g, -4, 10, 2.2); g.fill(); circ(g, 4, 10, 2.2); g.fill(); g.beginPath(); g.moveTo(-5, 20); g.quadraticCurveTo(0, 15, 5, 20); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); g.restore(); },
  plaster(g) { g.save(); g.rotate(-0.6); rr(g, -34, -12, 68, 24, 12); fs(g, '#ffd0b0', 3); rr(g, -12, -12, 24, 24, 3); fs(g, '#fff6fb', 2.4); g.restore(); star(g, 0, 0, 8, 3.4); fs(g, C.hot, 2); star(g, -24, 24, 6, 2.4); fs(g, C.butter, 1.6); star(g, 26, -22, 6, 2.4); fs(g, C.butter, 1.6); },
  nightlight(g) { rr(g, -12, 18, 24, 14, 4); fs(g, '#2f2157', 3); moon(g, -4, -6, 24); fs(g, C.butter, 3); star(g, 18, -24, 8, 3.4); fs(g, '#fff6fb', 2); },
  alarm(g) { for (const s of [-1, 1]) { circ(g, s * 20, -22, 9); fs(g, C.hot, 3); } circ(g, 0, 6, 26); fs(g, C.mint, 3); circ(g, 0, 6, 19); fs(g, '#fff6fb', 2.4); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, -7); g.moveTo(0, 6); g.lineTo(9, 11); g.stroke(); },
  coupon(g) { g.rotate(-0.15); rr(g, -32, -18, 64, 36, 5); fs(g, C.butter, 3); g.setLineDash([4, 4]); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(-12, -18); g.lineTo(-12, 18); g.stroke(); g.setLineDash([]); g.fillStyle = C.hot; g.font = `700 24px ${FONT_UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('%', 10, 1); star(g, -22, 0, 6, 2.6); g.fillStyle = C.hot; g.fill(); },
});

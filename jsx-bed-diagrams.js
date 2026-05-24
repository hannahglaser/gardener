/* ============================================================
 *   JSX-style hand-laid bed diagrams (left / right / unfenced / bags)
 *
 *   These are direct ports of the user's `garden_final_v6.jsx` SVGs.
 *   They render INSIDE the existing diagram frame and hover/click
 *   wires into the existing setActivePlant() detail panel by mapping
 *   each plant code in the diagram to a queue of matching plant ids
 *   from BEDS[bedKey].plants.
 * ============================================================ */

/* Plant-code → plant name in PLANT_INFO. Two of these (sfr for the
 * right-bed sunflowers, na for nasturtium variants) just collapse to
 * the same name as their left-bed twin. */
const JSX_CODE_TO_NAME = {
  sf:  'Sunflower',          sfr: 'Sunflower',
  bw:  'Brandywine',         sm:  'San Marzano',
  tl:  'Tomatillo',          sg:  'Sungold',
  ju:  'Juliette',           na:  'Nasturtium',
  bp:  'Bell pepper',        sh:  'Shishito pepper',
  ba:  'Basil',              hb:  'Habanero',
  jl:  'Jalapeño',           tb:  'Thai basil',
  zu:  'Zucchini (bush)',    ss:  'Summer squash (bush)',
  dl:  'Dill',               ec:  'Echinacea',
  cu:  'Cucumber',
  cit: 'Citronella',
  bk:  'Bok choy',           sc:  'Swiss chard',
  kl:  'Kale',               gc:  'Green cabbage',
  rc:  'Red cabbage',        br:  'Broccoli',
  cf:  'Cauliflower',        brl: 'Broccolini',
  rb:  'Red beet',           yb:  'Yellow beet',
  ca:  'Carrots',            sn:  'Scallion',
  lk:  'Leek',
  bn:  'Butternut squash',   de:  'Delicata squash',
};

/* Build a code → queue<plant-id> map from a bed's plant list, so each
 * diagram dot can pop the next matching id. */
function buildJsxIdQueue(bed) {
  const byName = {};
  (bed.plants || []).forEach(p => {
    (byName[p.name] = byName[p.name] || []).push(p.id);
  });
  const queues = {};
  Object.entries(JSX_CODE_TO_NAME).forEach(([code, name]) => {
    queues[code] = (byName[name] || []).slice();
  });
  return queues;
}

/* SVG element builders — pure-string concat, glued together at the end. */
function jp(code, cx, cy, r, fill, lbl) {
  const rr = r || 13;
  const fs = rr < 10 ? 7 : 9;
  return (
    `<g class="jsx-plant" data-code="${code}">` +
      `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${fill}" fill-opacity="0.22" stroke="${fill}" stroke-width="0.8"/>` +
      `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="${fs}" fill="${fill}" font-weight="700">${lbl || code.slice(0, 2).toUpperCase()}</text>` +
    `</g>`
  );
}
function jsq(code, cx, cy, fill, lbl) {
  return (
    `<g class="jsx-plant" data-code="${code}">` +
      `<rect x="${cx - 9}" y="${cy - 9}" width="18" height="18" rx="3" fill="${fill}" fill-opacity="0.3" stroke="${fill}" stroke-width="0.8"/>` +
      `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="8" fill="${fill}" font-weight="700">${lbl || 'B'}</text>` +
    `</g>`
  );
}
function jn(cx, cy) {
  return (
    `<g class="jsx-plant" data-code="na">` +
      `<circle cx="${cx}" cy="${cy}" r="7" fill="#5a9e1e" fill-opacity="0.45" stroke="#5a9e1e" stroke-width="0.7"/>` +
      `<text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-size="7" fill="#1a3a05">N</text>` +
    `</g>`
  );
}
function jmound(code, cx, cy, rx, ry, fill, lbl) {
  return (
    `<g class="jsx-plant" data-code="${code}">` +
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx || 30}" ry="${ry || 19}" fill="${fill}" fill-opacity="0.18" stroke="${fill}" stroke-width="0.9"/>` +
      `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="${fill}" font-weight="700">${lbl}</text>` +
    `</g>`
  );
}
function jpath(x, w, y, h, label) {
  return (
    `<g>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#b96b3e" fill-opacity="0.08" stroke="#b96b3e" stroke-width="0.5" stroke-dasharray="5 3" stroke-opacity="0.4"/>` +
      (label
        ? `<text x="${x + w / 2}" y="${y + h / 2 + 3}" text-anchor="middle" font-size="8" fill="#8b4a26" fill-opacity="0.7">${'⤳  ' + label}</text>`
        : '') +
    `</g>`
  );
}
function jband(x, w, y, h, fill, label) {
  return (
    `<g>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h || 38}" rx="4" fill="${fill}" fill-opacity="0.07" stroke="${fill}" stroke-width="0.5" stroke-opacity="0.3"/>` +
      `<text x="${x + 7}" y="${y + 12}" font-size="8" fill="${fill}" fill-opacity="0.75">${label}</text>` +
    `</g>`
  );
}
function jnote(text) { return `<p class="jsx-note">${text}</p>`; }

/* ── LEFT BED ─────────────────────────────────────────────────────── */
function jsxLeftSvg() {
  const W = 780, x0 = 40;
  let s = '';
  s += `<svg class="jsx-bed-svg" viewBox="0 0 860 412" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="30" y="20" width="800" height="380" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="430" y="13" text-anchor="middle" font-size="10" fill="#94886a">LEFT BED — north at top | hover any plant for details</text>`;
  s += `<text x="18"  y="210" text-anchor="middle" font-size="9" fill="#c9bd9f" transform="rotate(-90,18,210)">WEST</text>`;
  s += `<text x="842" y="210" text-anchor="middle" font-size="9" fill="#c9bd9f" transform="rotate(90,842,210)">EAST</text>`;
  s += `<text x="430" y="408" text-anchor="middle" font-size="9" fill="#c9bd9f">SOUTH</text>`;
  s += `<text x="830" y="34"  font-size="10" fill="#b96b3e" text-anchor="middle" font-weight="700">N</text>`;
  s += `<polygon points="830,38 827,50 830,48 833,50" fill="#b96b3e" opacity="0.55"/>`;

  /* Row 1: SF x12 */
  s += jband(x0, W, 28, 30, '#d9b13a', 'Row 1 (north edge) — sunflowers x12');
  [58,116,174,232,300,368,436,504,572,640,708,780].forEach(cx => s += jp('sf', cx, 44, 12, '#c79628', 'SF'));

  /* Path 1 */
  s += jpath(x0, W, 58, 28, '24″ harvest path');

  /* Row 2: Tomatoes as planted — BW x4 | SM SM | JU | SM | JU | SG | TL TL */
  s += jband(x0, W, 86, 38, '#a32d2d', `Row 2 — BW x4 | SM x3 | JU x2 | SG x1 | TL x2 (as planted)`);
  [68, 142, 216, 290].forEach(cx => s += jp('bw', cx, 107, 13, '#a32d2d', 'BW'));
  s += jp('sm', 362, 107, 13, '#d85a30', 'SM');
  s += jp('sm', 420, 107, 13, '#d85a30', 'SM');
  s += jp('ju', 478, 107, 13, '#d4537e', 'JU');
  s += jp('sm', 536, 107, 13, '#d85a30', 'SM');
  s += jp('ju', 594, 107, 13, '#d4537e', 'JU');
  s += jp('sg', 648, 107, 13, '#ef9f27', 'SG');
  s += jn(326, 97);
  s += jp('tl', 718, 100, 11, '#854f0b', 'TL');
  s += jn(738, 90);
  s += jp('tl', 758, 100, 11, '#854f0b', 'TL');
  s += `<text x="42" y="138" font-size="8" fill="#94886a" font-style="italic">48″ gap</text>`;

  /* Row 3: main row + sub-row (SG x4 | TB x2 | JL | HB | BP B BP B SH) */
  s += jband(x0, W, 142, 80, '#ef9f27', `Row 3 — SG x4 | TB x2 | JL | HB | peppers inline (sub-row below)`);
  [68, 152, 236, 320].forEach(cx => s += jp('sg', cx, 163, 13, '#ef9f27', 'SG'));
  s += jn(110, 153);
  s += jsq('tb', 408, 163, '#0f6e56', 'TB');
  s += jsq('tb', 448, 163, '#0f6e56', 'TB');
  s += jp('jl', 492, 163, 13, '#993556', 'JL');
  s += jp('hb', 548, 163, 13, '#993556', 'HB');
  s += jp('bp', 604, 163, 13, '#3c3489', 'BP');
  s += jsq('ba', 642, 163, '#1d9e75', 'B');
  s += jp('bp', 676, 163, 13, '#3c3489', 'BP');
  s += jsq('ba', 714, 163, '#1d9e75', 'B');
  s += jp('sh', 750, 163, 13, '#534ab7', 'SH');

  /* Sub-row below: BP · SH · B */
  s += `<line x1="588" y1="182" x2="780" y2="182" stroke="#534ab7" stroke-width="0.6" stroke-dasharray="4 2" opacity="0.3"/>`;
  s += jp('bp', 604, 203, 13, '#3c3489', 'BP');
  s += jp('sh', 676, 203, 13, '#534ab7', 'SH');
  s += jsq('ba', 750, 203, '#1d9e75', 'B');
  s += jn(428, 203);
  s += jn(800, 163);
  s += `<text x="592" y="218" font-size="7.5" fill="#534ab7" opacity="0.45" font-style="italic">↑ sub-row</text>`;

  /* Path 2: peppers to squash row */
  s += jpath(x0, W, 228, 22, 'harvest path');

  /* Row 4: ZU + SS mounds + Swiss chard east + herb strip */
  s += jband(x0, W, 250, 44, '#639922', 'Row 4 — squash mounds (ZU x1, SS x2) + swiss chard x4 + herb strip');
  s += jmound('zu', 120, 273, 26, 18, '#639922', 'ZU');
  s += jn(170, 262);
  s += jmound('ss', 230, 273, 26, 18, '#97c459', 'SS');
  s += jmound('ss', 330, 273, 26, 18, '#97c459', 'SS');
  s += jn(382, 262);
  /* Swiss chard x4 east of squash mounds, 12" apart */
  s += jp('sc', 470, 273, 11, '#639922', 'SC');
  s += jp('sc', 510, 273, 11, '#639922', 'SC');
  s += jp('sc', 550, 273, 11, '#639922', 'SC');
  s += jp('sc', 590, 273, 11, '#639922', 'SC');
  /* Herb strip — east end: DL, EC, CI, CI, TR */
  s += jsq('dl', 650, 263, '#97c459', 'DL');
  s += jp('ec', 690, 263, 11, '#d4537e', 'EC');
  s += jp('cit', 730, 263, 11, '#7daf3a', 'CI');
  s += jp('cit', 770, 263, 11, '#7daf3a', 'CI');
  s += jsq('tr', 810, 263, '#c9a227', 'TR');
  s += `<text x="730" y="293" text-anchor="middle" font-size="7.5" fill="#1d9e75" opacity="0.6" font-style="italic">herb strip (east)</text>`;

  /* Path: row 4 to cucumbers */
  s += jpath(x0, W, 298, 26, 'harvest path');

  /* Cucumbers */
  s += jband(x0, W, 324, 34, '#185fa5', `Cucumbers x8 trellised (18″ apart)`);
  [58, 169, 280, 391, 501, 590, 682, 770].forEach(cx => s += jp('cu', cx, 343, 12, '#185fa5', 'CU'));
  s += jn(335, 332);
  s += jn(636, 332);

  /* Path 5 south */
  s += jpath(x0, W, 358, 26, '30″ south access — cuke harvest');
  s += `<text x="430" y="396" text-anchor="middle" font-size="9" fill="#94886a" font-style="italic">spare — south end of bed</text>`;
  s += `</svg>`;

  const legend = [
    {c:'#c79628', l:'SF (12)'}, {c:'#a32d2d', l:'BW (4)'},
    {c:'#d85a30', l:'SM (3)'}, {c:'#854f0b', l:'TL (2)'},
    {c:'#ef9f27', l:'SG (5)'}, {c:'#d4537e', l:'JU (2)'},
    {c:'#5a9e1e', l:'N · Nasturtium'}, {c:'#3c3489', l:'BP (3)'},
    {c:'#534ab7', l:'SH (2)'}, {c:'#993556', l:'HB / JL'},
    {c:'#1d9e75', l:'B · Basil', sq:true}, {c:'#0f6e56', l:'TB · Thai basil', sq:true},
    {c:'#97c459', l:'DL · Dill', sq:true}, {c:'#d4537e', l:'EC · Echinacea'},
    {c:'#7daf3a', l:'CI · Citronella (2)'}, {c:'#c9a227', l:'TR · Tarragon', sq:true},
    {c:'#185fa5', l:'CU (8)'}, {c:'#639922', l:'ZU mound · SC (4)'},
    {c:'#97c459', l:'SS mound x2'}, {c:'#b96b3e', l:'harvest paths'},
  ];

  return { note: 'Left bed — 400″ E-W × 350″ N-S · 318″ used incl. harvest paths · 32″ spare', svg: s, legend };
}

/* ── RIGHT BED ────────────────────────────────────────────────────── */
function jsxRightSvg() {
  let s = '';
  const ys = { sf:28, pSF:56, A:80, B:108, C:136, D:164, pMid:192, E:222, F:244, G:266, open:298 };
  const mid = (y, h) => y + h / 2 + 4;
  const RB = (y, h, fill, label) => jband(148, 470, y, h, fill, label);

  s += `<svg class="jsx-bed-svg" viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="30" y="18" width="700" height="372" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="380" y="11" text-anchor="middle" font-size="10" fill="#94886a">RIGHT BED — north at top</text>`;
  s += `<text x="718" y="30" font-size="10" fill="#b96b3e" text-anchor="middle" font-weight="700">N</text>`;
  s += `<polygon points="718,34 715,46 718,44 721,46" fill="#b96b3e" opacity="0.55"/>`;
  s += `<rect x="38"  y="26" width="102" height="356" rx="4" fill="#3b6d11" fill-opacity="0.09" stroke="#3b6d11" stroke-width="0.6" stroke-opacity="0.35"/>`;
  s += `<text x="89"  y="205" text-anchor="middle" font-size="8.5" fill="#27500a" opacity="0.75" transform="rotate(-90,89,205)" font-style="italic">Asparagus (established N-S)</text>`;
  s += `<rect x="622" y="26" width="70"  height="356" rx="4" fill="#3c3489" fill-opacity="0.09" stroke="#3c3489" stroke-width="0.6" stroke-opacity="0.35"/>`;
  s += `<text x="657" y="205" text-anchor="middle" font-size="8.5" fill="#26215c" opacity="0.75" transform="rotate(90,657,205)" font-style="italic">Blueberries 4ft</text>`;
  s += `<rect x="694" y="26" width="30"  height="356" rx="3" fill="#97c459" fill-opacity="0.08" stroke="#97c459" stroke-width="0.5" stroke-opacity="0.35"/>`;
  s += `<text x="709" y="205" text-anchor="middle" font-size="7.5" fill="#27500a" opacity="0.6" transform="rotate(90,709,205)" font-style="italic">24″ strip (open)</text>`;

  s += RB(ys.sf, 26, '#c9bd9f', 'Row 1 (north edge) — open buffer (no sunflowers — all 12 on left bed)');
  s += jpath(148, 470, ys.pSF, 22, '24″ path');

  s += RB(ys.A, 24, '#0f6e56', `A — bok choy x4 (10″) + swiss chard x4 (12″)`);
  [160, 206, 252, 298].forEach(cx => s += jp('bk', cx, mid(ys.A, 24), 10, '#0f6e56', 'BK'));
  [378, 424, 470, 516].forEach(cx => s += jp('sc', cx, mid(ys.A, 24), 10, '#639922', 'SC'));

  s += RB(ys.B, 24, '#185fa5', `B — kale x4 (15″) + green cabbage x4 (18″)`);
  [160, 210, 260, 310].forEach(cx => s += jp('kl', cx, mid(ys.B, 24), 10, '#1d7a3c', 'KL'));
  [388, 440, 492, 540].forEach(cx => s += jp('gc', cx, mid(ys.B, 24), 10, '#185fa5', 'GC'));
  s += jn(348, ys.B + 8);

  s += RB(ys.C, 24, '#993556', `C — red cab x4 + broccoli x2 + cauli x2 (18″, ID pending)`);
  [160, 210, 260, 310].forEach(cx => s += jp('rc', cx, mid(ys.C, 24), 10, '#993556', 'RC'));
  [378, 428].forEach(cx => s += jp('br', cx, mid(ys.C, 24), 10, '#7080c4', 'B?'));
  [476, 540].forEach(cx => s += jp('cf', cx, mid(ys.C, 24), 10, '#534ab7', 'C?'));
  s += jn(348, ys.C + 8);

  s += RB(ys.D, 24, '#1d9e75', `D — broccolini x4 (15″)`);
  [175, 295, 415, 535].forEach(cx => s += jp('brl', cx, mid(ys.D, 24), 10, '#1d9e75', 'BR'));

  s += jpath(148, 470, ys.pMid, 28, '24″ harvest path — mid bed');

  s += RB(ys.E, 22, '#a32d2d', `E — red beet x4 + yellow beet x4 (direct sow, thin to 4″)`);
  [160, 204, 248, 292].forEach(cx => s += jp('rb', cx, mid(ys.E, 22), 9, '#a32d2d', 'RB'));
  [378, 422, 466, 510].forEach(cx => s += jp('yb', cx, mid(ys.E, 22), 9, '#ef9f27', 'YB'));

  /* Carrot band: hover-able rect */
  s += `<g class="jsx-plant" data-code="ca">` +
    `<rect x="148" y="${ys.F}" width="470" height="18" rx="3" fill="#d85a30" fill-opacity="0.12" stroke="#d85a30" stroke-width="0.7" stroke-dasharray="5 2" stroke-opacity="0.55"/>` +
    `<text x="383" y="${ys.F + 12}" text-anchor="middle" font-size="8.5" fill="#712b13" font-weight="600">F — Carrots (direct sow full row, thin to 3″)</text>` +
    `</g>`;

  s += RB(ys.G, 24, '#5f5e5a', `G — scallions x4 (3″) + leeks x4 (6″)`);
  [160, 206, 252, 298].forEach(cx => s += jp('sn', cx, mid(ys.G, 24), 9, '#5f5e5a', 'SN'));
  [378, 424, 468, 512].forEach(cx => s += jp('lk', cx, mid(ys.G, 24), 9, '#888780', 'LK'));

  s += `<rect x="148" y="${ys.open}" width="470" height="78" rx="4" fill="#fbf6ea" fill-opacity="0.6" stroke="#c9bd9f" stroke-width="0.5" stroke-dasharray="3 3" stroke-opacity="0.4"/>`;
  s += `<text x="383" y="${ys.open + 42}" text-anchor="middle" font-size="9" fill="#94886a" font-style="italic">90″ open — succession / south harvest access</text>`;
  s += `</svg>`;

  const legend = [
    {c:'#0f6e56', l:'BK (4)'},
    {c:'#639922', l:'SC (4)'}, {c:'#1d7a3c', l:'KL (4)'},
    {c:'#185fa5', l:'GC (4)'}, {c:'#993556', l:'RC (4)'},
    {c:'#7080c4', l:'B? (2)'}, {c:'#534ab7', l:'C? (2)'},
    {c:'#1d9e75', l:'BR (4)'}, {c:'#a32d2d', l:'RB (4)'},
    {c:'#ef9f27', l:'YB (4)'}, {c:'#d85a30', l:'Carrots band'},
    {c:'#5f5e5a', l:'SN (4)'}, {c:'#888780', l:'LK (4)'},
    {c:'#5a9e1e', l:'N · Nasturtium'}, {c:'#b96b3e', l:'harvest paths'},
  ];

  return { note: 'Right bed — 296″ usable E-W × 300″ N-S · 210″ used · 90″ open south', svg: s, legend };
}

/* ── UNFENCED ─────────────────────────────────────────────────────── */
function jsxUnfencedSvg() {
  let s = '';
  s += `<svg class="jsx-bed-svg" viewBox="0 0 480 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<text x="240" y="13" text-anchor="middle" font-size="10" fill="#94886a">UNFENCED — north at top, vines sprawl south</text>`;
  s += `<rect x="26" y="20" width="428" height="368" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="14"  y="205" text-anchor="middle" font-size="8" fill="#c9bd9f" transform="rotate(-90,14,205)">WEST (fence)</text>`;
  s += `<text x="466" y="205" text-anchor="middle" font-size="8" fill="#c9bd9f" transform="rotate(90,466,205)">EAST (compost)</text>`;
  s += `<text x="240" y="396" text-anchor="middle" font-size="8" fill="#c9bd9f">SOUTH</text>`;
  s += `<rect x="34" y="26" width="412" height="18" rx="3" fill="#ede4cf" fill-opacity="0.5"/>`;
  s += `<text x="240" y="38" text-anchor="middle" font-size="8" fill="#94886a" font-style="italic">No sunflowers — all 12 on left bed north edge</text>`;
  s += jpath(34, 412, 44, 26, '36″ north access buffer');

  s += `<rect x="34" y="72" width="412" height="52" rx="3" fill="#854f0b" fill-opacity="0.07" stroke="#854f0b" stroke-width="0.5" stroke-opacity="0.3"/>`;
  s += `<text x="40" y="85" font-size="8" fill="#854f0b" fill-opacity="0.85" font-style="italic">BN row 1 — 3 mounds × 48″ apart (96″ EW of 126″)</text>`;
  s += jmound('bn', 120, 105, 30, 19, '#854f0b', 'BN');
  s += jmound('bn', 240, 105, 30, 19, '#854f0b', 'BN');
  s += jmound('bn', 360, 105, 30, 19, '#854f0b', 'BN');

  s += `<rect x="34" y="128" width="412" height="86" rx="3" fill="none" stroke="#c9bd9f" stroke-width="0.6" stroke-dasharray="4 3"/>`;
  s += `<text x="240" y="165" text-anchor="middle" font-size="9" fill="#94886a" font-style="italic">72″ vine clearance</text>`;
  s += `<text x="240" y="180" text-anchor="middle" font-size="8" fill="#94886a">also harvest access to row 1 from south</text>`;

  s += `<rect x="34" y="218" width="412" height="60" rx="3" fill="#854f0b" fill-opacity="0.07" stroke="#854f0b" stroke-width="0.5" stroke-opacity="0.3"/>`;
  s += `<text x="40" y="231" font-size="8" fill="#854f0b" fill-opacity="0.85" font-style="italic">BN row 2 west (×2) + DE east (×2) — 24″ buffer between</text>`;
  s += jmound('bn', 110, 252, 28, 18, '#854f0b', 'BN');
  s += jmound('bn', 208, 252, 28, 18, '#854f0b', 'BN');
  s += `<line x1="254" y1="222" x2="254" y2="280" stroke="#c9bd9f" stroke-width="0.8" stroke-dasharray="3 2"/>`;
  s += `<text x="254" y="292" text-anchor="middle" font-size="7" fill="#94886a">24″</text>`;
  s += jmound('de', 312, 252, 26, 18, '#ba7517', 'DE');
  s += jmound('de', 404, 252, 26, 18, '#ba7517', 'DE');

  s += jpath(34, 412, 286, 34, '36″ south vine buffer + harvest access');
  s += `<text x="240" y="338" text-anchor="middle" font-size="8" fill="#94886a" font-style="italic">18″ spare</text>`;
  s += `</svg>`;

  const legend = [
    {c:'#854f0b', l:'BN · Butternut squash x5'},
    {c:'#ba7517', l:'DE · Delicata squash x2'},
    {c:'#b96b3e', l:'harvest paths'},
  ];

  return { note: 'Unfenced — 264″ N-S long axis (22 ft) × 126″ E-W short axis (10.5 ft) · vines sprawl south', svg: s, legend };
}

/* ── BAGS ─────────────────────────────────────────────────────────── */
/* Port of the JSX bag grid, but each tile is wired to a real bag.plant.id
 * from BEDS.bags so the side detail panel still works. */
function renderJsxBags(schem, bed) {
  schem.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'jsx-bed-wrap';

  const note = document.createElement('p');
  note.className = 'jsx-note';
  note.textContent = 'Grow bags — 10 × 10-gallon · hover any bag for details · check moisture daily in summer';
  wrap.appendChild(note);

  /* Tile look config — keyed off plant name so all spinach tiles share style. */
  const tileFor = {
    'Eggplant':                 { color: '#5C1A7A', emoji: '🍆', l1: 'Eggplant',  l2: 'x1',     note: 'hottest spot' },
    'Spinach':                  { color: '#1D9E75', emoji: '🥬', l1: 'Spinach',   l2: 'x2/bag', note: 'shade @ 70°F' },
    'Romaine':                  { color: '#0F6E56', emoji: '🥗', l1: 'Romaine',   l2: 'x2/bag', note: 'shade in July' },
    'Mystery cuke/cantaloupe':  { color: '#185FA5', emoji: '❓', l1: 'Mystery',   l2: 'x1/bag', note: 'ID first!' },
    'Pole bean':                { color: '#639922', emoji: '🌿', l1: 'Pole bean', l2: 'pergola',note: 'sow 3–4, thin 2' },
  };

  const cols = 6, bw = 84, bh = 96, gx = 96, gy = 110, x0 = 14, y0 = 28;
  const rows = Math.ceil(bed.bags.length / cols);
  const vbH = y0 + rows * gy + 8;

  let svg = `<svg class="jsx-bed-svg" viewBox="0 0 600 ${vbH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  svg += `<text x="300" y="14" text-anchor="middle" font-size="10" fill="#94886a">GROW BAGS — ${bed.bags.length} × 10 gal</text>`;

  bed.bags.forEach((bag, i) => {
    const tile = tileFor[bag.plant.name] || { color:'#5F5E5A', emoji:'🪴', l1: bag.plant.name, l2:'', note:'' };
    const col = i % cols, row = Math.floor(i / cols);
    const x = x0 + col * gx, y = y0 + row * gy;
    svg += (
      `<g class="jsx-plant" data-pid="${bag.plant.id}">` +
        `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="${tile.color}" fill-opacity="0.1" stroke="${tile.color}" stroke-width="1.1" stroke-dasharray="5 2"/>` +
        `<text x="${x + bw/2}" y="${y + 22}" text-anchor="middle" font-size="18">${tile.emoji}</text>` +
        `<text x="${x + bw/2}" y="${y + 42}" text-anchor="middle" font-size="9" fill="${tile.color}" font-weight="700">${tile.l1}</text>` +
        `<text x="${x + bw/2}" y="${y + 56}" text-anchor="middle" font-size="8.5" fill="${tile.color}">${tile.l2}</text>` +
        `<text x="${x + bw/2}" y="${y + 71}" text-anchor="middle" font-size="7.5" fill="${tile.color}" fill-opacity="0.75">${tile.note}</text>` +
        `<text x="${x + bw/2}" y="${y + 86}" text-anchor="middle" font-size="7" fill="#94886a">${bag.id} · 10 gal</text>` +
      `</g>`
    );
  });
  svg += `</svg>`;

  const svgWrap = document.createElement('div');
  svgWrap.className = 'jsx-bed-svg-wrap';
  svgWrap.innerHTML = svg;
  wrap.appendChild(svgWrap);
  schem.appendChild(wrap);

  /* wire each tile to the bag's real plant id */
  wrap.querySelectorAll('[data-pid]').forEach(g => {
    const pid = g.getAttribute('data-pid');
    g.addEventListener('mouseenter', () => setActivePlant(pid));
    g.addEventListener('click', () => setActivePlant(pid, true));
    if (pid === activePlantId) g.classList.add('is-active');
  });
}

/* ── DISPATCHER ───────────────────────────────────────────────────── */
function renderJsxBed(schem, bed, bedKey) {
  schem.innerHTML = '';

  const draw = bedKey === 'left' ? jsxLeftSvg
             : bedKey === 'right' ? jsxRightSvg
             : bedKey === 'unfenced' ? jsxUnfencedSvg
             : null;
  if (!draw) { schem.textContent = 'No diagram for ' + bedKey; return; }

  const { note, svg, legend } = draw();

  const wrap = document.createElement('div');
  wrap.className = 'jsx-bed-wrap';

  const noteEl = document.createElement('p');
  noteEl.className = 'jsx-note';
  noteEl.textContent = note;
  wrap.appendChild(noteEl);

  const svgWrap = document.createElement('div');
  svgWrap.className = 'jsx-bed-svg-wrap';
  svgWrap.innerHTML = svg;
  wrap.appendChild(svgWrap);

  /* Legend */
  if (legend && legend.length) {
    const leg = document.createElement('div');
    leg.className = 'jsx-bed-legend';
    legend.forEach(item => {
      const chip = document.createElement('span');
      chip.className = 'jsx-leg-chip';
      const sw = document.createElement('i');
      sw.className = 'jsx-leg-sw' + (item.sq ? ' sq' : '');
      sw.style.background = item.c;
      chip.appendChild(sw);
      chip.appendChild(document.createTextNode(item.l));
      leg.appendChild(chip);
    });
    wrap.appendChild(leg);
  }

  schem.appendChild(wrap);

  /* Wire hover/click — each .jsx-plant pops the next plant id matching its code */
  const queue = buildJsxIdQueue(bed);
  wrap.querySelectorAll('.jsx-plant[data-code]').forEach(g => {
    const code = g.getAttribute('data-code');
    const q = queue[code];
    if (!q || !q.length) return;
    const pid = q.shift();
    g.setAttribute('data-pid', pid);
    g.addEventListener('mouseenter', () => setActivePlant(pid));
    g.addEventListener('click', () => setActivePlant(pid, true));
    if (pid === activePlantId) g.classList.add('is-active');
  });
}

/* expose for the main script */
window.renderJsxBed = renderJsxBed;
window.renderJsxBags = renderJsxBags;

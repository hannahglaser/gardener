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
  rr:  'Red raspberry',  bkr: 'Black raspberry',  bkb: 'Blackberry',
  bk:  'Bok choy',           sc:  'Swiss chard',    cm:  'Chinese mustard',
  kl:  'Kale',               gc:  'Green cabbage',
  rc:  'Red cabbage',        br:  'Broccoli',
  cf:  'Cauliflower',        brl: 'Broccolini',
  rb:  'Red beet',           yb:  'Yellow beet',
  ca:  'Carrots',            sn:  'Scallion',
  lk:  'Leek',
  bn:  'Butternut squash',   de:  'Delicata squash',
  lb:  'Lowbush blueberry',
  ga:  'Garlic',             sl:  'Shallots',
  ow:  'Overwintering onions', ry: 'Annual rye',
  as:  'Asparagus',   tr:  'French Tarragon',
  bm:  'Bee balm',   rh:  'Rhubarb',   pc: 'Reliance peach',  cn: 'Cilantro',
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
      (label ? `<text x="${x + 7}" y="${y + 9}" font-size="7.5" fill="${fill}" fill-opacity="0.85">${label}</text>` : '') +
    `</g>`
  );
}
function jnote(text) { return `<p class="jsx-note">${text}</p>`; }

/* ── LEFT BED ─────────────────────────────────────────────────────── */
function jsxLeftSvg() {
  const W = 780, x0 = 40;
  let s = '';
  s += `<svg class="jsx-bed-svg" viewBox="0 0 860 464" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="30" y="20" width="800" height="432" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="430" y="13" text-anchor="middle" font-size="10" fill="#94886a">LEFT BED — north at top | hover any plant for details</text>`;
  s += `<text x="18"  y="237" text-anchor="middle" font-size="9" fill="#c9bd9f" transform="rotate(-90,18,237)">WEST</text>`;
  s += `<text x="842" y="237" text-anchor="middle" font-size="9" fill="#c9bd9f" transform="rotate(90,842,237)">EAST</text>`;
  s += `<text x="430" y="460" text-anchor="middle" font-size="9" fill="#c9bd9f">SOUTH</text>`;
  s += `<text x="830" y="34"  font-size="10" fill="#b96b3e" text-anchor="middle" font-weight="700">N</text>`;
  s += `<polygon points="830,38 827,50 830,48 833,50" fill="#b96b3e" opacity="0.55"/>`;

  /* Row 1: SF x12 */
  s += jband(x0, W, 28, 30, '#d9b13a', 'Sunflowers × 12 (north edge)');
  [58,116,174,232,300,368,436,504,572,640,708,780].forEach(cx => s += jp('sf', cx, 44, 12, '#c79628', 'SF'));

  /* Path 1 */
  s += jpath(x0, W, 58, 28, '24″ harvest path');

  /* Row 2: Tomatoes as planted — BW x4 | SM SM | JU | SM | JU | SG | TL TL */
  s += jband(x0, W, 86, 38, '#a32d2d', `Tomatoes — BW × 4 | SM × 3 | JU × 2 | SG × 1 | TL × 2`);
  [68, 142, 216, 290].forEach(cx => s += jp('bw', cx, 107, 13, '#a32d2d', 'BW'));
  s += jp('sm', 362, 107, 13, '#d85a30', 'SM');
  s += jp('sm', 420, 107, 13, '#d85a30', 'SM');
  s += jp('ju', 478, 107, 13, '#d4537e', 'JU');
  s += jp('sm', 536, 107, 13, '#d85a30', 'SM');
  s += jp('ju', 594, 107, 13, '#d4537e', 'JU');
  s += jp('sg', 648, 107, 13, '#ef9f27', 'SG');
  s += jn(326, 97);
  s += jp('tl', 718, 107, 11, '#854f0b', 'TL');
  s += jn(738, 94);
  s += jp('tl', 758, 107, 11, '#854f0b', 'TL');
  s += jpath(x0, W, 124, 48, 'harvest path · breathing room for tomatoes');

  /* Row 3: main row + sub-row (SG x4 | TB x2 | JL | HB | BP B BP B SH) */
  s += jband(x0, W, 172, 80, '#ef9f27', `SG × 4 | TB × 2 | JL | HB | peppers (sub-row below)`);
  [68, 152, 236, 320].forEach(cx => s += jp('sg', cx, 193, 13, '#ef9f27', 'SG'));
  s += jn(110, 193);
  s += jsq('tb', 408, 193, '#0f6e56', 'TB');
  s += jsq('tb', 448, 193, '#0f6e56', 'TB');
  s += jp('jl', 492, 193, 13, '#993556', 'JL');
  s += jp('hb', 548, 193, 13, '#993556', 'HB');
  s += jp('bp', 604, 193, 13, '#3c3489', 'BP');
  s += jsq('ba', 642, 193, '#1d9e75', 'B');
  s += jp('bp', 676, 193, 13, '#3c3489', 'BP');
  s += jsq('ba', 714, 193, '#1d9e75', 'B');
  s += jp('sh', 750, 193, 13, '#534ab7', 'SH');

  /* Sub-row below: BP · SH · B */
  s += `<line x1="588" y1="212" x2="780" y2="212" stroke="#534ab7" stroke-width="0.6" stroke-dasharray="4 2" opacity="0.3"/>`;
  s += jp('bp', 604, 233, 13, '#3c3489', 'BP');
  s += jp('sh', 676, 233, 13, '#534ab7', 'SH');
  s += jsq('ba', 750, 233, '#1d9e75', 'B');
  s += jn(428, 233);
  s += jn(800, 193);
  s += `<text x="592" y="248" font-size="7.5" fill="#534ab7" opacity="0.45" font-style="italic">↑ sub-row</text>`;

  /* Path 2: peppers to squash row */
  s += jpath(x0, W, 258, 22, 'harvest path');

  /* Row 4: ZU×2 + SS×2 mounds + herb strip */
  s += jband(x0, W, 280, 44, '#639922', 'Squash mounds (ZU × 2, SS × 2) + herb strip');
  s += jmound('zu', 100, 303, 26, 18, '#639922', 'ZU');
  s += jn(155, 302);
  s += jmound('ss', 210, 303, 26, 18, '#97c459', 'SS');
  s += jmound('ss', 320, 303, 26, 18, '#97c459', 'SS');
  s += jn(375, 302);
  s += jmound('zu', 430, 303, 26, 18, '#639922', 'ZU');
  /* Herb strip — east end: DL, EC, TR, CI, CI */
  s += jsq('dl', 620, 302, '#97c459', 'DL');
  s += jp('ec', 660, 302, 11, '#d4537e', 'EC');
  s += jsq('tr', 700, 302, '#c9a227', 'TR');
  s += jp('cit', 740, 302, 11, '#7daf3a', 'CI');
  s += jp('cit', 780, 302, 11, '#7daf3a', 'CI');
  s += `<text x="700" y="323" text-anchor="middle" font-size="7.5" fill="#1d9e75" opacity="0.6" font-style="italic">herb strip (east)</text>`;

  /* Path: row 4 to cucumbers — nasturtiums here deter cucumber beetles + squash pests */
  s += jpath(x0, W, 328, 48, 'harvest path · wider for squash leaf clearance + cucurbit pest separation');

  /* Cucumbers — 12 plants evenly across 780-unit row */
  s += jband(x0, W, 376, 34, '#185fa5', `Cucumbers x12 trellised (18″ apart)`);
  [58, 123, 188, 253, 318, 383, 448, 513, 578, 643, 708, 773].forEach(cx => s += jp('cu', cx, 395, 12, '#185fa5', 'CU'));
  s += jn(91, 393); s += jn(280, 393); s += jn(415, 393); s += jn(613, 393); s += jn(742, 393);

  /* Path 5 south */
  s += jpath(x0, W, 410, 26, '30″ south access — cuke harvest');
  s += `<text x="430" y="452" text-anchor="middle" font-size="9" fill="#94886a" font-style="italic">spare — south end of bed</text>`;
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
    {c:'#185fa5', l:'CU (12)'}, {c:'#639922', l:'ZU mound · SC (4)'},
    {c:'#97c459', l:'SS mound x2'}, {c:'#b96b3e', l:'harvest paths'},
  ];

  return { note: 'Left bed — 400″ E-W × 350″ N-S', svg: s, legend };
}

/* ── RIGHT BED ────────────────────────────────────────────────────── */
function jsxRightSvg() {
  let s = '';
  /* ys: A–D rows h=34; D h=50 (2 beet sub-rows); E=CM perennial h=22; then path→F→G→open */
  const ys = { sf:28, pSF:56, A:80, B:124, C:168, D:212, E:272, F:340, pFG:368, G:384, open:420 };
  const ROW_H = 34;
  const pc = (y) => y + 22;   /* circle center: text at y+9, circles r=10 y+12→y+32 ≤ y+34 */
  const RB = (y, h, fill, label) => jband(148, 470, y, h, fill, label);

  s += `<svg class="jsx-bed-svg" viewBox="0 0 760 462" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="30" y="18" width="700" height="432" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="380" y="11" text-anchor="middle" font-size="10" fill="#94886a">RIGHT BED — north at top</text>`;
  s += `<text x="718" y="30" font-size="10" fill="#b96b3e" text-anchor="middle" font-weight="700">N</text>`;
  s += `<polygon points="718,34 715,46 718,44 721,46" fill="#b96b3e" opacity="0.55"/>`;
  s += `<rect x="38"  y="26" width="102" height="424" rx="4" fill="#3b6d11" fill-opacity="0.09" stroke="#3b6d11" stroke-width="0.6" stroke-opacity="0.35"/>`;
  s += `<text x="89"  y="238" text-anchor="middle" font-size="8.5" fill="#27500a" opacity="0.75" transform="rotate(-90,89,238)" font-style="italic">Asparagus (established N-S)</text>`;
  s += `<rect x="622" y="26" width="70"  height="424" rx="4" fill="#3c3489" fill-opacity="0.09" stroke="#3c3489" stroke-width="0.6" stroke-opacity="0.35"/>`;
  s += `<text x="657" y="238" text-anchor="middle" font-size="8.5" fill="#26215c" opacity="0.75" transform="rotate(90,657,238)" font-style="italic">Blueberries 4ft</text>`;
  s += `<rect x="694" y="26" width="30"  height="424" rx="3" fill="#97c459" fill-opacity="0.08" stroke="#97c459" stroke-width="0.5" stroke-opacity="0.35"/>`;
  s += `<text x="709" y="238" text-anchor="middle" font-size="7.5" fill="#27500a" opacity="0.6" transform="rotate(90,709,238)" font-style="italic">24″ strip (open)</text>`;

  /* Asparagus — ~4 established crowns: 2 clustered N, 2 clustered S (cx=89) */
  [75, 148, 315, 388].forEach(cy => s += jp('as', 89, cy, 14, '#27500a', 'AS'));

  /* Blueberry hedge — 2 lowbush (N) + 4 highbush (S) — spread N→S */
  [58, 106].forEach(cy => s += jp('lb', 657, cy, 12, '#6a7ec2', 'LB'));
  [165, 235, 305, 375].forEach(cy => s += jp('bb', 657, cy, 14, '#3c3489', 'BB'));

  /* Bee balm — NE corner of east strip */
  s += jp('bm', 709, 65, 10, '#c03a6e', 'BM');


  s += RB(ys.sf, 26, '#c9bd9f', 'Row 1 (north edge) — open buffer (no sunflowers — all 12 on left bed)');
  s += jpath(148, 470, ys.pSF, 22, '24″ path');

  s += RB(ys.A, ROW_H, '#0f6e56', `A — bok choy x4 (10″) + swiss chard x4 (12″)`);
  [180, 226, 272, 318].forEach(cx => s += jp('bk', cx, pc(ys.A), 10, '#0f6e56', 'BK'));
  [390, 430, 470, 510].forEach(cx => s += jp('sc', cx, pc(ys.A), 10, '#d4793a', 'SC'));
  s += jn(340, pc(ys.A)); s += jn(545, pc(ys.A));

  s += jpath(148, 470, ys.A + ROW_H, 10, '10″');

  s += RB(ys.B, ROW_H, '#185fa5', `B — kale x4 (15″) + green cabbage x4 (18″) + cilantro x1`);
  [172, 216, 260, 304].forEach(cx => s += jp('kl', cx, pc(ys.B), 10, '#1d7a3c', 'KL'));
  [362, 408, 454, 500].forEach(cx => s += jp('gc', cx, pc(ys.B), 10, '#185fa5', 'GC'));
  s += jn(194, pc(ys.B)); s += jn(282, pc(ys.B));  /* nasturtiums between kale */
  s += jp('cn', 548, pc(ys.B), 8, '#7a9e3a', 'CN');

  s += jpath(148, 470, ys.B + ROW_H, 10, '10″');

  s += RB(ys.C, ROW_H, '#993556', `C — red cab x4 + broccoli x2 + cauli x2 (18″) + cilantro x1`);
  [172, 216, 260, 304].forEach(cx => s += jp('rc', cx, pc(ys.C), 10, '#993556', 'RC'));
  [382, 430].forEach(cx => s += jp('br', cx, pc(ys.C), 10, '#7080c4', 'BR'));
  [478, 526].forEach(cx => s += jp('cf', cx, pc(ys.C), 10, '#534ab7', 'CF'));
  s += jn(342, pc(ys.C));
  s += jp('cn', 572, pc(ys.C), 8, '#7a9e3a', 'CN');

  s += jpath(148, 470, ys.C + ROW_H, 10, '10″');

  s += RB(ys.D, 50, '#1d9e75', `D — broccolini ×4 (18″)  ·  red beet ×6 / yellow beet ×6 sub-row (5″)`);
  [193, 268, 328, 403].forEach(cx => s += jp('brl', cx, pc(ys.D), 10, '#1d9e75', 'BRL'));
  s += jn(231, pc(ys.D)); s += jn(366, pc(ys.D));
  /* Divider tick */
  s += `<line x1="453" y1="${ys.D + 12}" x2="453" y2="${ys.D + 47}" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="2 2"/>`;
  /* Red beets — upper sub-row (right half) */
  [463, 479, 495, 511, 527, 543].forEach(cx => s += jp('rb', cx, ys.D + 22, 7, '#a32d2d', 'RB'));
  /* Yellow beets — lower sub-row */
  [463, 479, 495, 511, 527, 543].forEach(cx => s += jp('yb', cx, ys.D + 40, 7, '#ef9f27', 'YB'));
  /* Red cabbage — 1 plant east of beet sub-rows */
  s += jp('rc', 575, ys.D + 31, 10, '#993556', 'RC');

  s += jpath(148, 470, ys.D + 50, 10, '10″');

  /* Row E — Chinese mustard perennial (h=26, centered) + RC ×2 to its left */
  s += `<rect x="148" y="${ys.E}" width="470" height="26" rx="4" fill="#4a7a28" fill-opacity="0.07" stroke="#4a7a28" stroke-width="0.5" stroke-opacity="0.3"/>`;
  s += `<g class="jsx-plant" data-code="cm">` +
    `<ellipse cx="383" cy="${ys.E + 13}" rx="130" ry="8" fill="#4a7a28" fill-opacity="0.22" stroke="#4a7a28" stroke-width="0.8" stroke-dasharray="3 2"/>` +
    `<text x="383" y="${ys.E + 16}" text-anchor="middle" font-size="7.5" fill="#2a4d14" font-weight="600">E — Chinese mustard · spreads ~24″</text>` +
    `</g>`;
  s += jp('rc', 175, ys.E + 13, 10, '#993556', 'RC');
  s += jn(197, ys.E + 13);
  s += jp('rc', 219, ys.E + 13, 10, '#993556', 'RC');

  s += jpath(148, 470, ys.E + 26, 40, '40″ harvest path — mid bed');

  /* Carrot band: hover-able rect */
  s += `<g class="jsx-plant" data-code="ca">` +
    `<rect x="148" y="${ys.F}" width="470" height="26" rx="3" fill="#d85a30" fill-opacity="0.12" stroke="#d85a30" stroke-width="0.7" stroke-dasharray="5 2" stroke-opacity="0.55"/>` +
    `<text x="383" y="${ys.F + 16}" text-anchor="middle" font-size="8.5" fill="#712b13" font-weight="600">F — Carrots (direct sow full row, thin to 3″)</text>` +
    `</g>`;

  s += jpath(148, 470, ys.pFG, 14, '12″ path');

  s += RB(ys.G, ROW_H, '#5f5e5a', `G — leeks x6 (6″) + scallions x6 (3″)`);
  [172, 206, 240, 274, 308, 342].forEach(cx => s += jp('lk', cx, pc(ys.G), 7, '#888780', 'LK'));
  [412, 446, 480, 514, 548, 582].forEach(cx => s += jp('sn', cx, pc(ys.G), 7, '#5f5e5a', 'SN'));

  s += `<rect x="148" y="${ys.open}" width="470" height="20" rx="4" fill="#fbf6ea" fill-opacity="0.6" stroke="#c9bd9f" stroke-width="0.5" stroke-dasharray="3 3" stroke-opacity="0.4"/>`;
  s += `<text x="383" y="${ys.open + 13}" text-anchor="middle" font-size="9" fill="#94886a" font-style="italic">24″ open — succession / south harvest access</text>`;
  s += `</svg>`;

  const legend = [
    {c:'#0f6e56', l:'BK (4)'}, {c:'#d4793a', l:'CH · Swiss chard (4)'},
    {c:'#1d7a3c', l:'KL (4)'}, {c:'#185fa5', l:'GC (4)'},
    {c:'#993556', l:'RC (4)'}, {c:'#7080c4', l:'BR · Broccoli (2)'},
    {c:'#534ab7', l:'CF (2)'},
    {c:'#1d9e75', l:'BRL · Broccolini (4)'}, {c:'#a32d2d', l:'RB · Red beet (6)'},
    {c:'#ef9f27', l:'YB · Yellow beet (6)'}, {c:'#4a7a28', l:'CM · Chinese mustard (perennial)'},
    {c:'#993556', l:'RC row E · ×2 west of CM'},
    {c:'#d85a30', l:'Carrots band'},
    {c:'#7a9e3a', l:'CN · Cilantro (×2 — east of GC/CF)'},
    {c:'#888780', l:'LK (6 west)'}, {c:'#5f5e5a', l:'SN (6 east)'},
    {c:'#5a9e1e', l:'N · Nasturtium'}, {c:'#27500a', l:'AS · Asparagus (~4)'},
    {c:'#6a7ec2', l:'LB · Lowbush (2 N)'}, {c:'#3c3489', l:'BB · Highbush (4 S)'},
    {c:'#c03a6e', l:'BM · Bee balm (NE corner)'},
    {c:'#b96b3e', l:'harvest paths'},
  ];

  return { note: 'Right bed — 296″ usable E-W × 300″ N-S · ~250″ used · ~50″ open south', svg: s, legend };
}

/* ── UNFENCED ─────────────────────────────────────────────────────── */
function jsxUnfencedSvg() {
  let s = '';
  /* Two N-S columns: LX=left(BN×4), RX=right(BN+DE×3), CX=center(ZU+nasturtiums) */
  const LX = 145, RX = 335, CX = 240;
  const rowY = [54, 136, 218, 300];
  const zuY = 346;

  s += `<svg class="jsx-bed-svg" viewBox="0 -55 480 475" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<text x="240" y="13" text-anchor="middle" font-size="10" fill="#94886a">UNFENCED — north at top, vines sprawl south</text>`;
  s += `<rect x="26" y="20" width="428" height="390" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="14"  y="215" text-anchor="middle" font-size="8" fill="#c9bd9f" transform="rotate(-90,14,215)">WEST (fence)</text>`;
  s += `<text x="466" y="215" text-anchor="middle" font-size="8" fill="#c9bd9f" transform="rotate(90,466,215)">EAST (compost)</text>`;
  s += `<text x="240" y="416" text-anchor="middle" font-size="8" fill="#c9bd9f">SOUTH</text>`;

  /* Reliance peach tree — NE corner, north of bed boundary */
  s += `<g class="jsx-plant" data-code="pc">` +
    `<circle cx="420" cy="-20" r="26" fill="#e8832a" fill-opacity="0.15" stroke="#e8832a" stroke-width="1.2" stroke-dasharray="4 2"/>` +
    `<circle cx="420" cy="-20" r="12" fill="#e8832a" fill-opacity="0.5" stroke="none"/>` +
    `<text x="420" y="-16" text-anchor="middle" font-size="7.5" fill="#8b4513" font-weight="700">PC</text>` +
    `<text x="420" y="-50" text-anchor="middle" font-size="7" fill="#8b4513" fill-opacity="0.75">Reliance peach</text>` +
    `</g>`;

  /* Left col guide line */
  s += `<line x1="${LX}" y1="28" x2="${LX}" y2="${zuY - 22}" stroke="#854f0b" stroke-width="0.5" stroke-dasharray="3 3" stroke-opacity="0.25"/>`;
  /* Right col guide line */
  s += `<line x1="${RX}" y1="28" x2="${RX}" y2="${rowY[3] + 20}" stroke="#ba7517" stroke-width="0.5" stroke-dasharray="3 3" stroke-opacity="0.25"/>`;

  /* Row 1 — BN left, BN right */
  s += jmound('bn', LX, rowY[0], 30, 19, '#854f0b', 'BN');
  s += jmound('bn', RX, rowY[0], 30, 19, '#854f0b', 'BN');
  s += jn(CX, rowY[0]);

  /* Row 2 — BN left, DE right */
  s += jmound('bn', LX, rowY[1], 30, 19, '#854f0b', 'BN');
  s += jmound('de', RX, rowY[1], 28, 18, '#ba7517', 'DE');
  s += jn(CX, rowY[1]);

  /* Row 3 — BN left, DE right */
  s += jmound('bn', LX, rowY[2], 30, 19, '#854f0b', 'BN');
  s += jmound('de', RX, rowY[2], 28, 18, '#ba7517', 'DE');
  s += jn(CX, rowY[2]);

  /* Row 4 — BN left, DE right */
  s += jmound('bn', LX, rowY[3], 30, 19, '#854f0b', 'BN');
  s += jmound('de', RX, rowY[3], 28, 18, '#ba7517', 'DE');
  s += jn(CX, rowY[3]);

  /* Final row — ZU centered + 5th nasturtium to the west */
  s += jmound('zu', CX, zuY, 28, 18, '#639922', 'ZU');
  s += jn(CX - 60, zuY);

  s += jpath(34, 412, zuY + 22, 46, '36″ south vine buffer + access');
  s += `</svg>`;

  const legend = [
    {c:'#854f0b', l:'BN · Butternut squash (5)'},
    {c:'#ba7517', l:'DE · Delicata squash (3)'},
    {c:'#639922', l:'ZU · Zucchini (1)'},
    {c:'#5a9e1e', l:'N · Nasturtium (5)'},
    {c:'#e8832a', l:'PC · Reliance peach (NE corner · perennial)'},
    {c:'#b96b3e', l:'harvest paths'},
  ];

  return { note: 'Unfenced — 264″ N-S × 126″ E-W · left col BN × 4 · right col BN + DE × 3 · ZU center south', svg: s, legend };
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
  note.textContent = 'Grow bags — 7 × 10-gallon · hover any bag for details · check moisture daily in summer';
  wrap.appendChild(note);

  const tileFor = {
    'Eggplant':  { color: '#7a3d9c', code: 'EG', l1: 'Eggplant',  sub: 'hottest spot' },
    'Spinach':   { color: '#1D9E75', code: 'SP', l1: 'Spinach',   sub: 'shade @ 70°F' },
    'Romaine':   { color: '#0F6E56', code: 'RM', l1: 'Romaine',   sub: 'shade in July' },
    'Pole bean': { color: '#639922', code: 'PB', l1: 'Pole bean', sub: 'pergola' },
  };

  const cols = 3, bw = 180, bh = 108, gx = 194, gy = 122, x0 = 13, y0 = 30;
  const numRows = Math.ceil(bed.bags.length / cols);
  const vbH = y0 + numRows * gy + 14;

  let svg = `<svg class="jsx-bed-svg" viewBox="0 0 600 ${vbH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  svg += `<text x="300" y="16" text-anchor="middle" font-size="10" fill="#94886a">GROW BAGS — ${bed.bags.length} × 10 gal · hover for care notes</text>`;

  bed.bags.forEach((bag, i) => {
    const tile = tileFor[bag.plant.name] || { color: '#6b5e4a', code: '?', l1: bag.plant.name, sub: '' };
    const col = i % cols, row = Math.floor(i / cols);
    const x = x0 + col * gx, y = y0 + row * gy;
    const cx = x + bw / 2;
    const n = bag.n || 1;

    /* dot positions spaced to avoid overlap (r=12 each) */
    const dotOffsets = n === 1 ? [0]
      : n === 2 ? [-22, 22]
      : Array.from({length: n}, (_, k) => (k - (n-1)/2) * 26);

    let dots = '';
    dotOffsets.forEach(dx => {
      dots += `<circle cx="${cx + dx}" cy="${y + 26}" r="${n === 1 ? 14 : 12}" fill="${tile.color}" fill-opacity="0.22" stroke="${tile.color}" stroke-width="0.8"/>`;
      dots += `<text x="${cx + dx}" y="${y + 30}" text-anchor="middle" font-size="${n === 1 ? 10 : 8.5}" fill="${tile.color}" font-weight="700">${tile.code}</text>`;
    });

    svg += (
      `<g class="jsx-plant" data-pid="${bag.plant.id}">` +
        `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="${tile.color}" fill-opacity="0.08" stroke="${tile.color}" stroke-width="1"/>` +
        dots +
        `<text x="${cx}" y="${y + 54}" text-anchor="middle" font-size="10" fill="${tile.color}" font-weight="600">${tile.l1}</text>` +
        `<text x="${cx}" y="${y + 67}" text-anchor="middle" font-size="8.5" fill="${tile.color}" fill-opacity="0.85">× ${n}</text>` +
        `<text x="${cx}" y="${y + 80}" text-anchor="middle" font-size="8" fill="${tile.color}" fill-opacity="0.65">${tile.sub}</text>` +
        `<text x="${cx}" y="${y + 96}" text-anchor="middle" font-size="7.5" fill="#94886a">${bag.id} · 10 gal</text>` +
      `</g>`
    );
  });
  svg += `</svg>`;

  const svgWrap = document.createElement('div');
  svgWrap.className = 'jsx-bed-svg-wrap';
  svgWrap.innerHTML = svg;
  wrap.appendChild(svgWrap);
  schem.appendChild(wrap);

  wrap.querySelectorAll('[data-pid]').forEach(g => {
    const pid = g.getAttribute('data-pid');
    g.addEventListener('mouseenter', () => setActivePlant(pid));
    g.addEventListener('click', () => setActivePlant(pid, true));
    if (pid === activePlantId) g.classList.add('is-active');
  });
}

/* ── RIGHT BED — FALL ─────────────────────────────────────────────── */
function jsxRightBedFallSvg() {
  let s = '';
  const ys = { sf:28, pSF:56, A:80, B:108, C:136, D:160, pMid:192, E:222, pEF:244, F:258, pFG:276, G:290, open:316 };
  const mid = (y, h) => y + h / 2;
  const RB = (y, h, fill, label) => jband(148, 470, y, h, fill, label);

  s += `<svg class="jsx-bed-svg" viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="30" y="18" width="700" height="372" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="380" y="11" text-anchor="middle" font-size="10" fill="#94886a">RIGHT BED — fall / winter layout</text>`;
  s += `<text x="718" y="30" font-size="10" fill="#b96b3e" text-anchor="middle" font-weight="700">N</text>`;
  s += `<polygon points="718,34 715,46 718,44 721,46" fill="#b96b3e" opacity="0.55"/>`;

  /* Asparagus zone */
  s += `<rect x="38" y="26" width="102" height="356" rx="4" fill="#3b6d11" fill-opacity="0.09" stroke="#3b6d11" stroke-width="0.6" stroke-opacity="0.35"/>`;
  s += `<text x="89" y="205" text-anchor="middle" font-size="8.5" fill="#27500a" opacity="0.75" transform="rotate(-90,89,205)" font-style="italic">Asparagus (established N-S)</text>`;
  [75, 148, 315, 388].forEach(cy => s += jp('as', 89, cy, 14, '#27500a', 'AS'));

  /* Blueberry hedge */
  s += `<rect x="622" y="26" width="70" height="356" rx="4" fill="#3c3489" fill-opacity="0.09" stroke="#3c3489" stroke-width="0.6" stroke-opacity="0.35"/>`;
  s += `<text x="657" y="205" text-anchor="middle" font-size="8.5" fill="#26215c" opacity="0.75" transform="rotate(90,657,205)" font-style="italic">Blueberries 4ft</text>`;
  [79, 129].forEach(cy => s += jp('lb', 657, cy, 9, '#6a7ec2', 'LB'));
  [179, 229, 279, 329].forEach(cy => s += jp('bb', 657, cy, 11, '#3c3489', 'BB'));

  /* East strip */
  s += `<rect x="694" y="26" width="30" height="356" rx="3" fill="#97c459" fill-opacity="0.08" stroke="#97c459" stroke-width="0.5" stroke-opacity="0.35"/>`;
  s += `<text x="709" y="205" text-anchor="middle" font-size="7.5" fill="#27500a" opacity="0.6" transform="rotate(90,709,205)" font-style="italic">24″ strip (open)</text>`;

  s += RB(ys.sf, 26, '#c9bd9f', 'North buffer');
  s += jpath(148, 470, ys.pSF, 22, '24″ path');

  /* Row A — Garlic × 49 (showing 12 representative) */
  s += RB(ys.A, 24, '#c49a2a', 'A — Garlic × 49 cloves (6″ spacing)');
  [163,200,237,274,311,348,385,422,459,496,533,570].forEach(cx => s += jp('ga', cx, mid(ys.A, 24), 9, '#c49a2a', 'GA'));

  /* Row B — Shallots (W) + Overwintering onions (E) */
  s += RB(ys.B, 24, '#8d8a82', 'B — Shallots × 25 (west)  +  Overwintering onions × 25 (east)');
  [163,210,257,304,351].forEach(cx => s += jp('sl', cx, mid(ys.B, 24), 9, '#a07d55', 'SL'));
  [415,462,509,556,603].forEach(cx => s += jp('ow', cx, mid(ys.B, 24), 9, '#7d9e6b', 'OW'));

  /* Rows C-D — annual rye after brassicas clear */
  s += `<g class="jsx-plant" data-code="ry">` +
    `<rect x="148" y="${ys.C}" width="470" height="${ys.pMid - ys.C}" rx="3" fill="#7a9e6b" fill-opacity="0.10" stroke="#7a9e6b" stroke-width="0.7" stroke-dasharray="5 2" stroke-opacity="0.5"/>` +
    `<text x="383" y="${ys.C + (ys.pMid - ys.C)/2 + 4}" text-anchor="middle" font-size="9" fill="#3d5a2a">Annual rye — rows C–D</text>` +
    `</g>`;

  s += jpath(148, 470, ys.pMid, 28, '24″ harvest path');

  /* Rows E-G — persist through frost */
  s += RB(ys.E, 22, '#a32d2d', 'E — beets (hold through frost)');
  [160, 204, 248, 292].forEach(cx => s += jp('rb', cx, mid(ys.E, 22), 9, '#a32d2d', 'RB'));
  [378, 422, 466, 510].forEach(cx => s += jp('yb', cx, mid(ys.E, 22), 9, '#ef9f27', 'YB'));

  s += jpath(148, 470, ys.pEF, 14, '12″ path');

  s += `<g class="jsx-plant" data-code="ca">` +
    `<rect x="148" y="${ys.F}" width="470" height="18" rx="3" fill="#d85a30" fill-opacity="0.12" stroke="#d85a30" stroke-width="0.7" stroke-dasharray="5 2" stroke-opacity="0.55"/>` +
    `<text x="383" y="${ys.F + 12}" text-anchor="middle" font-size="8.5" fill="#712b13" font-weight="600">F — Carrots (harvest through Oct 5 · last frost)</text>` +
    `</g>`;

  s += jpath(148, 470, ys.pFG, 14, '12″ path');

  s += RB(ys.G, 24, '#5f5e5a', 'G — scallions + leeks (frost-hardy)');
  [160, 206, 252, 298].forEach(cx => s += jp('sn', cx, mid(ys.G, 24), 9, '#5f5e5a', 'SN'));
  [378, 424, 468, 512].forEach(cx => s += jp('lk', cx, mid(ys.G, 24), 9, '#888780', 'LK'));

  /* Open zone — annual rye */
  s += `<g class="jsx-plant" data-code="ry">` +
    `<rect x="148" y="${ys.open}" width="470" height="60" rx="4" fill="#7a9e6b" fill-opacity="0.12" stroke="#7a9e6b" stroke-width="0.7" stroke-dasharray="5 2" stroke-opacity="0.55"/>` +
    `<text x="383" y="${ys.open + 28}" text-anchor="middle" font-size="9" fill="#3d5a2a" font-weight="600">Annual rye — cover crop</text>` +
    `<text x="383" y="${ys.open + 44}" text-anchor="middle" font-size="7.5" fill="#3d5a2a" fill-opacity="0.7">Seeded Sept · till under May before planting</text>` +
    `</g>`;

  s += `</svg>`;

  const legend = [
    {c:'#c49a2a', l:'GA · Garlic (49 cloves)'},
    {c:'#a07d55', l:'SL · Shallots (~25)'},
    {c:'#7d9e6b', l:'OW · Overwintering onions (~25)'},
    {c:'#a32d2d', l:'RB (4)'}, {c:'#ef9f27', l:'YB (4)'},
    {c:'#d85a30', l:'Carrots band'},
    {c:'#5f5e5a', l:'SN (4)'}, {c:'#888780', l:'LK (4)'},
    {c:'#7a9e6b', l:'RY · Annual rye'},
    {c:'#27500a', l:'AS · Asparagus (~4)'},
    {c:'#6a7ec2', l:'LB · Lowbush (2 N)'}, {c:'#3c3489', l:'BB · Highbush (4 S)'},
  ];

  return { note: 'Right bed — fall / winter · garlic & alliums Oct–July · cover crop open zone', svg: s, legend };
}

/* ── LEFT BED — FALL ──────────────────────────────────────────────── */
function jsxLeftBedFallSvg() {
  const W = 780, x0 = 40;
  let s = '';
  s += `<svg class="jsx-bed-svg" viewBox="0 0 860 464" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="30" y="20" width="800" height="432" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="430" y="13" text-anchor="middle" font-size="10" fill="#94886a">LEFT BED — fall / winter layout</text>`;
  s += `<text x="830" y="34" font-size="10" fill="#b96b3e" text-anchor="middle" font-weight="700">N</text>`;
  s += `<polygon points="830,38 827,50 830,48 833,50" fill="#b96b3e" opacity="0.55"/>`;

  /* Annual rye — whole bed */
  s += `<g class="jsx-plant" data-code="ry">` +
    `<rect x="${x0}" y="30" width="${W}" height="390" rx="6" fill="#7a9e6b" fill-opacity="0.10" stroke="#7a9e6b" stroke-width="1" stroke-dasharray="7 4" stroke-opacity="0.5"/>` +
    `<text x="430" y="200" text-anchor="middle" font-size="18" fill="#3d5a2a" fill-opacity="0.5" font-style="italic">Annual rye cover crop</text>` +
    `<text x="430" y="224" text-anchor="middle" font-size="10" fill="#3d5a2a" fill-opacity="0.4">Seeded after Oct 5 frost · tilled under May before planting</text>` +
    `</g>`;

  /* Perennials — stay in ground */
  s += jp('ec', 660, 302, 11, '#d4537e', 'EC');
  s += `<text x="660" y="323" text-anchor="middle" font-size="7.5" fill="#d4537e" opacity="0.6" font-style="italic">EC</text>`;
  s += jsq('tr', 700, 302, '#c9a227', 'TR');
  s += `<text x="700" y="323" text-anchor="middle" font-size="7.5" fill="#c9a227" opacity="0.6" font-style="italic">TR</text>`;
  s += `<text x="680" y="340" text-anchor="middle" font-size="7.5" fill="#94886a" font-style="italic">perennials — mulch after ground freezes</text>`;

  s += `</svg>`;

  const legend = [
    {c:'#7a9e6b', l:'Annual rye — whole bed'},
    {c:'#d4537e', l:'EC · Echinacea (perennial)'},
    {c:'#c9a227', l:'TR · French tarragon (perennial)', sq:true},
  ];

  return { note: 'Left bed — all summer crops cleared after Oct 5 frost · annual rye cover crop', svg: s, legend };
}

/* ── UNFENCED — FALL ──────────────────────────────────────────────── */
function jsxUnfencedFallSvg() {
  let s = '';
  s += `<svg class="jsx-bed-svg" viewBox="0 0 480 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<text x="240" y="13" text-anchor="middle" font-size="10" fill="#94886a">UNFENCED — fall / winter layout</text>`;
  s += `<rect x="26" y="20" width="428" height="368" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;

  /* Annual rye — whole area */
  s += `<g class="jsx-plant" data-code="ry">` +
    `<rect x="34" y="26" width="412" height="320" rx="6" fill="#7a9e6b" fill-opacity="0.10" stroke="#7a9e6b" stroke-width="1" stroke-dasharray="7 4" stroke-opacity="0.5"/>` +
    `<text x="240" y="170" text-anchor="middle" font-size="16" fill="#3d5a2a" fill-opacity="0.5" font-style="italic">Annual rye cover crop</text>` +
    `<text x="240" y="192" text-anchor="middle" font-size="9" fill="#3d5a2a" fill-opacity="0.4">Seeded after squash harvest clears · tilled under May</text>` +
    `</g>`;

  s += `<text x="240" y="380" text-anchor="middle" font-size="8" fill="#94886a" font-style="italic">Winter squash cured and in storage by mid-Oct</text>`;
  s += `</svg>`;

  const legend = [
    {c:'#7a9e6b', l:'Annual rye — whole area'},
  ];

  return { note: 'Unfenced — squash harvested and cured · annual rye seeded after clearing', svg: s, legend };
}

/* ── MIDDLE BED ───────────────────────────────────────────────────── */
function jsxMiddleSvg() {
  let s = '';
  /* 6 columns: A=90, B=174, C=258, D=342, E=426, F=510 (spacing=84, gap=56 between strips) */
  const colX = { A:90, B:174, C:258, D:342, E:426, F:510 };
  const RED = '#a13e6e', RHB = '#c23a30', BLK = '#6a2e8e', BKB = '#312080';

  s += `<svg class="jsx-bed-svg" viewBox="0 0 600 430" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="30" y="20" width="540" height="400" rx="6" fill="none" stroke="#c9bd9f" stroke-width="1" stroke-dasharray="5 3" opacity="0.5"/>`;
  s += `<text x="300" y="13" text-anchor="middle" font-size="10" fill="#94886a">MIDDLE BED · BERRY PATCH — north at top · hover any plant for details</text>`;
  s += `<text x="580" y="34" font-size="10" fill="#b96b3e" text-anchor="middle" font-weight="700">N</text>`;
  s += `<polygon points="580,38 577,50 580,48 583,50" fill="#b96b3e" opacity="0.55"/>`;
  s += `<text x="18" y="222" text-anchor="middle" font-size="9" fill="#c9bd9f" transform="rotate(-90,18,222)">WEST</text>`;
  s += `<text x="590" y="222" text-anchor="middle" font-size="9" fill="#c9bd9f" transform="rotate(90,590,222)">EAST</text>`;
  s += `<text x="300" y="427" text-anchor="middle" font-size="9" fill="#c9bd9f">SOUTH</text>`;

  /* Red raspberry — rows A, B, C */
  ['A','B','C'].forEach(r => {
    const cx = colX[r];
    s += `<rect x="${cx-14}" y="28" width="28" height="372" rx="5" fill="${RED}" fill-opacity="0.05" stroke="${RED}" stroke-width="0.5" stroke-opacity="0.3"/>`;
    s += `<text x="${cx}" y="408" text-anchor="middle" font-size="9" fill="${RED}" fill-opacity="0.65" font-style="italic">${r}</text>`;
    for (let i = 0; i < 12; i++) s += jp('rr', cx, 40 + i * 29, 9, RED, 'RR');
  });
  s += `<text x="132" y="35" text-anchor="middle" font-size="7" fill="${RED}" fill-opacity="0.5" font-style="italic">70″</text>`;
  s += `<text x="216" y="35" text-anchor="middle" font-size="7" fill="${RED}" fill-opacity="0.5" font-style="italic">70″</text>`;

  /* Rhubarb — row D */
  s += `<rect x="${colX.D-14}" y="28" width="28" height="372" rx="5" fill="${RHB}" fill-opacity="0.06" stroke="${RHB}" stroke-width="0.5" stroke-opacity="0.3"/>`;
  for (let i = 0; i < 8; i++) s += jp('rh', colX.D, 40 + i * 44, 9, RHB, 'RH');
  s += `<text x="${colX.D}" y="408" text-anchor="middle" font-size="9" fill="${RHB}" fill-opacity="0.65" font-style="italic">D</text>`;

  /* Black raspberry — row E */
  s += `<rect x="${colX.E-14}" y="28" width="28" height="372" rx="5" fill="${BLK}" fill-opacity="0.05" stroke="${BLK}" stroke-width="0.5" stroke-opacity="0.3"/>`;
  for (let i = 0; i < 10; i++) s += jp('bkr', colX.E, 44 + i * 34, 9, BLK, 'BR');
  s += `<text x="${colX.E}" y="408" text-anchor="middle" font-size="9" fill="${BLK}" fill-opacity="0.65" font-style="italic">E</text>`;

  /* Blackberry — row F */
  s += `<rect x="${colX.F-14}" y="28" width="28" height="372" rx="5" fill="${BKB}" fill-opacity="0.05" stroke="${BKB}" stroke-width="0.5" stroke-opacity="0.3"/>`;
  for (let i = 0; i < 8; i++) s += jp('bkb', colX.F, 44 + i * 44, 10, BKB, 'BK');
  s += `<text x="${colX.F}" y="408" text-anchor="middle" font-size="9" fill="${BKB}" fill-opacity="0.65" font-style="italic">F</text>`;

  s += `</svg>`;
  const legend = [
    { c: RED, l: 'Red raspberry (rows A–C · 36 canes)' },
    { c: RHB, l: 'Rhubarb (row D · 8 crowns · perennial)' },
    { c: BLK, l: 'Black raspberry (row E · 10 canes)' },
    { c: BKB, l: 'Blackberry (row F · 8 canes)' },
  ];
  return { note: 'All rows run N–S · floricane pruning: red/black in Aug, blackberry in Oct', svg: s, legend };
}

/* ── DISPATCHER ───────────────────────────────────────────────────── */
function renderJsxBed(schem, bed, bedKey, season) {
  schem.innerHTML = '';

  const draw =
    (season === 'fall' && bedKey === 'right')    ? jsxRightBedFallSvg :
    (season === 'fall' && bedKey === 'left')     ? jsxLeftBedFallSvg :
    (season === 'fall' && bedKey === 'unfenced') ? jsxUnfencedFallSvg :
    bedKey === 'left'     ? jsxLeftSvg :
    bedKey === 'right'    ? jsxRightSvg :
    bedKey === 'unfenced' ? jsxUnfencedSvg :
    bedKey === 'middle'   ? jsxMiddleSvg :
    null;
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

/* ── SITE PLAN (all-beds overview) ────────────────────────────────── */
function jsxSitePlanSvg() {
  /* Coordinates derived from aerial-photo annotation.
     Origin = top-left of photo at pixel (51, 3). N is up. */
  const sc = 0.565, PAD = 10;
  const X = x => Math.round((x - 51) * sc) + PAD;
  const Y = y => Math.round((y - 3)  * sc) + PAD;
  const W = w => Math.round(w * sc);

  const VW = 775, VH = 500;

  const HEM  = { x:X(51),   y:Y(3),   w:W(1327), h:W(105) };  // 0,0,750,59
  const PATH = { x:X(51),   y:Y(123), w:W(1327), h:W(62)  };  // 0,68,750,35
  const ZONE = { x:X(211),  y:Y(190), w:W(961),  h:W(249) };  // 90,106,543,141
  const PERG = { x:X(417),  y:Y(565), w:W(325),  h:W(130) };  // 207,318,184,73
  const GAR  = { x:X(759),  y:Y(637), w:W(132),  h:W(206) };  // 400,358,75,116
  const WOOD = { x:X(891),  y:Y(637), w:36,       h:W(206) };  // narrowed to give B1 room
  const HERB = { x:X(1001), y:Y(671), w:W(100),  h:W(141) };  // 537,377,57,80
  const FALL = { x:X(85),   y:Y(479), w:W(279)            };  // 19,269,158
  const SUM  = { x:X(1113), y:Y(479), w:W(273)            };  // 600,269,154

  /* bed subdivisions within ZONE (proportional to actual inch widths) */
  const totalIn = 400 + 400 + 368 + 126;
  const lW = Math.round(ZONE.w * 400 / totalIn);  // 168
  const mW = Math.round(ZONE.w * 400 / totalIn);  // 168
  const rW = Math.round(ZONE.w * 368 / totalIn);  // 154
  const uW = ZONE.w - lW - mW - rW;               // 53

  const zBot = ZONE.y + ZONE.h;  // 247
  const lH = ZONE.h;
  const mH = ZONE.h;
  const rH = Math.round(ZONE.h * 300 / 350);  // 121
  const uH = Math.round(ZONE.h * 264 / 350);  // 106

  const lX = ZONE.x, mX = lX + lW, rX = mX + mW, uX = rX + rW;
  const lY = ZONE.y, mY = ZONE.y, rY = zBot - rH, uY = zBot - uH;

  const beds = [
    { id:'left',     x:lX, y:lY, w:lW, h:lH, color:'#5a7a3c' },
    { id:'middle',   x:mX, y:mY, w:mW, h:mH, color:'#8a3e8e' },
    { id:'right',    x:rX, y:rY, w:rW, h:rH, color:'#3e5e9e' },
    { id:'unfenced', x:uX, y:uY, w:uW, h:uH, color:'#8a6e3e' },
  ];

  const shrubY = PERG.y - 14;  // 304 — shrub row just above pergola
  const WOOD_C = '#a07840', GREEN = '#4a8a2c', HERB_C = '#5a8a3c';

  let s = `<svg class="jsx-bed-svg" viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect width="${VW}" height="${VH}" fill="#faf7f2"/>`;

  /* hemlock row */
  s += `<rect x="${HEM.x}" y="${HEM.y}" width="${HEM.w}" height="${HEM.h}" fill="#2a4a2a" fill-opacity="0.14" stroke="#2a4a2a" stroke-opacity="0.25" stroke-width="0.5"/>`;
  s += `<text x="${HEM.w/2}" y="${HEM.h/2+4}" text-anchor="middle" font-size="10" fill="#2a4a2a" fill-opacity="0.65" font-style="italic">hemlock row</text>`;

  /* garden path */
  s += `<rect x="${PATH.x}" y="${PATH.y}" width="${PATH.w}" height="${PATH.h}" fill="${GREEN}" fill-opacity="0.08" stroke="${GREEN}" stroke-opacity="0.18" stroke-width="0.5"/>`;
  s += `<text x="${PATH.w/2}" y="${PATH.y+PATH.h/2+3}" text-anchor="middle" font-size="9" fill="${GREEN}" fill-opacity="0.6" font-style="italic">garden path</text>`;

  /* lawn strip — between bed zone bottom and shrub row */
  s += `<rect x="0" y="${zBot}" width="${VW}" height="${shrubY-zBot}" fill="#7a9a3c" fill-opacity="0.06"/>`;
  s += `<text x="${VW/2}" y="${zBot+(shrubY-zBot)/2+3}" text-anchor="middle" font-size="9" fill="#5a7a2c" fill-opacity="0.5" font-style="italic">lawn</text>`;

  /* shrub row — at pergola x/width, just above pergola */
  s += `<rect x="${PERG.x}" y="${shrubY}" width="${PERG.w}" height="14" rx="3" fill="#3a5e2a" fill-opacity="0.13" stroke="#3a5e2a" stroke-opacity="0.32" stroke-width="0.6"/>`;
  s += `<text x="${PERG.x+PERG.w/2}" y="${shrubY+10}" text-anchor="middle" font-size="6.5" fill="#3a5e2a" fill-opacity="0.7" font-style="italic">shrubs</text>`;

  /* fall garden (west, clipped at bottom of viewBox) */
  const fallH = VH - FALL.y;
  s += `<rect x="${FALL.x}" y="${FALL.y}" width="${FALL.w}" height="${fallH}" rx="8" fill="${HERB_C}" fill-opacity="0.07" stroke="${HERB_C}" stroke-opacity="0.35" stroke-width="0.8" stroke-dasharray="5 3"/>`;
  s += `<text x="${FALL.x+FALL.w/2}" y="${FALL.y+fallH/2-5}" text-anchor="middle" font-size="9" fill="${HERB_C}" fill-opacity="0.7" font-weight="600">Fall</text>`;
  s += `<text x="${FALL.x+FALL.w/2}" y="${FALL.y+fallH/2+7}" text-anchor="middle" font-size="9" fill="${HERB_C}" fill-opacity="0.7" font-weight="600">garden</text>`;

  /* summer garden (east, clipped at bottom) */
  const sumH = VH - SUM.y;
  s += `<rect x="${SUM.x}" y="${SUM.y}" width="${SUM.w}" height="${sumH}" rx="8" fill="${HERB_C}" fill-opacity="0.07" stroke="${HERB_C}" stroke-opacity="0.35" stroke-width="0.8" stroke-dasharray="5 3"/>`;
  s += `<text x="${SUM.x+SUM.w/2}" y="${SUM.y+sumH/2-5}" text-anchor="middle" font-size="9" fill="${HERB_C}" fill-opacity="0.7" font-weight="600">Summer</text>`;
  s += `<text x="${SUM.x+SUM.w/2}" y="${SUM.y+sumH/2+7}" text-anchor="middle" font-size="9" fill="${HERB_C}" fill-opacity="0.7" font-weight="600">garden</text>`;

  /* pergola */
  s += `<rect x="${PERG.x}" y="${PERG.y}" width="${PERG.w}" height="${PERG.h}" rx="3" fill="${WOOD_C}" fill-opacity="0.07" stroke="${WOOD_C}" stroke-opacity="0.55" stroke-width="1"/>`;
  for (let i = 1; i < 7; i++) {
    const rx = Math.round(PERG.x + i * PERG.w / 7);
    s += `<line x1="${rx}" y1="${PERG.y}" x2="${rx}" y2="${PERG.y+PERG.h}" stroke="${WOOD_C}" stroke-opacity="0.18" stroke-width="0.5"/>`;
  }
  s += `<line x1="${PERG.x}" y1="${PERG.y+14}" x2="${PERG.x+PERG.w}" y2="${PERG.y+14}" stroke="${WOOD_C}" stroke-opacity="0.25" stroke-width="0.6"/>`;
  s += `<text x="${PERG.x+PERG.w/2}" y="${PERG.y+10}" text-anchor="middle" font-size="8" fill="${WOOD_C}" fill-opacity="0.9" font-weight="600" letter-spacing="1">PERGOLA</text>`;

  /* grow bags — right end of pergola (B2 spinach, B3 spinach, B4 romaine, B5 romaine, B7) */
  const bSz = 9, bGap = 4;
  const pBags = ['B2','B3','B4','B5','B7'];
  const pFill = ['#5a8a5e','#5a8a5e','#c47c3e','#c47c3e','#5a8a5e'];
  const bRowW = pBags.length * bSz + (pBags.length-1) * bGap;
  const bX0 = PERG.x + PERG.w - bRowW - 5;
  const bY0 = PERG.y + 22;
  pBags.forEach((lbl, i) => {
    const bx = bX0 + i*(bSz+bGap);
    s += `<rect x="${bx}" y="${bY0}" width="${bSz}" height="${bSz}" rx="2" fill="${pFill[i]}" fill-opacity="0.5" stroke="${pFill[i]}" stroke-opacity="0.85" stroke-width="0.7"/>`;
    s += `<text x="${bx+bSz/2}" y="${bY0+bSz+6}" text-anchor="middle" font-size="5" fill="#7a6a58">${lbl}</text>`;
  });

  /* garage */
  s += `<rect x="${GAR.x}" y="${GAR.y}" width="${GAR.w}" height="${GAR.h}" fill="#c8bfb0" fill-opacity="0.3" stroke="#a09080" stroke-opacity="0.45" stroke-width="0.7"/>`;
  s += `<text x="${GAR.x+GAR.w/2}" y="${GAR.y+GAR.h/2+3}" text-anchor="middle" font-size="8" fill="#7a6a58">garage</text>`;

  /* wood pile */
  s += `<rect x="${WOOD.x}" y="${WOOD.y}" width="${WOOD.w}" height="${WOOD.h}" fill="#c4a060" fill-opacity="0.2" stroke="#a07840" stroke-opacity="0.45" stroke-width="0.7"/>`;
  s += `<text x="${WOOD.x+WOOD.w/2}" y="${WOOD.y+WOOD.h/2-2}" text-anchor="middle" font-size="6.5" fill="#7a5030">wood</text>`;
  s += `<text x="${WOOD.x+WOOD.w/2}" y="${WOOD.y+WOOD.h/2+8}" text-anchor="middle" font-size="6.5" fill="#7a5030">pile</text>`;

  /* herb garden (SE) */
  s += `<rect x="${HERB.x}" y="${HERB.y}" width="${HERB.w}" height="${HERB.h}" rx="4" fill="${HERB_C}" fill-opacity="0.08" stroke="${HERB_C}" stroke-opacity="0.5" stroke-width="0.8" stroke-dasharray="4 2"/>`;
  s += `<text x="${HERB.x+HERB.w/2}" y="${HERB.y+11}" text-anchor="middle" font-size="7" fill="${HERB_C}" font-weight="600">HERB</text>`;
  s += `<text x="${HERB.x+HERB.w/2}" y="${HERB.y+21}" text-anchor="middle" font-size="7" fill="${HERB_C}" font-weight="600">GARDEN</text>`;

  /* B1 eggplant bag — on asphalt between wood pile and herb garden */
  const b1x = Math.round((WOOD.x + WOOD.w + HERB.x) / 2 - bSz / 2);
  const b1y = HERB.y + 5;
  s += `<rect x="${b1x}" y="${b1y}" width="${bSz}" height="${bSz}" rx="2" fill="#7a3e8e" fill-opacity="0.5" stroke="#7a3e8e" stroke-opacity="0.85" stroke-width="0.7"/>`;
  s += `<text x="${b1x+bSz/2}" y="${b1y+bSz+6}" text-anchor="middle" font-size="5" fill="#7a6a58">B1</text>`;

  /* bed outlines + labels */
  const bedLabels = { left:'LEFT BED', middle:'MIDDLE BED', right:'RIGHT BED', unfenced:'UNFENCED' };
  beds.forEach(b => {
    s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3" fill="${b.color}" fill-opacity="0.08" stroke="${b.color}" stroke-opacity="0.65" stroke-width="1"/>`;
    s += `<text x="${b.x+b.w/2}" y="${b.y+10}" text-anchor="middle" font-size="7.5" font-weight="700" fill="${b.color}" fill-opacity="0.9">${bedLabels[b.id]}</text>`;
  });

  /* left bed rows (N→S): sunflowers, tomatoes, squash+peppers, herbs, cucumbers */
  {
    const b = beds[0];
    [
      { h:13, c:'#c4a03e', t:'sunflowers'       },
      { h: 3, c:null },
      { h:20, c:'#c44d3b', t:'tomatoes'         },
      { h: 3, c:null },
      { h:16, c:'#c47c2e', t:'squash · peppers' },
      { h: 3, c:null },
      { h:11, c:'#5a8a3c', t:'herbs'            },
      { h: 3, c:null },
      { h:13, c:'#3a6e3e', t:'cucumbers'        },
    ].reduce((y, {h, c, t}) => {
      if (c) {
        s += `<rect x="${b.x+3}" y="${y}" width="${b.w-6}" height="${h}" rx="1.5" fill="${c}" fill-opacity="0.15" stroke="${c}" stroke-opacity="0.22" stroke-width="0.4"/>`;
        if (t) s += `<text x="${b.x+b.w/2}" y="${y+h/2+2}" text-anchor="middle" font-size="5" fill="${c}" fill-opacity="0.9">${t}</text>`;
      }
      return y + h;
    }, b.y + 13);
  }

  /* middle bed vertical columns (W→E): RR×3, rhubarb, black rasp, blackberry */
  {
    const b = beds[1];
    const sw = 22, sg = 4;
    const sx0 = b.x + (b.w - (6*sw+5*sg)) / 2;
    const sy = b.y + 13, sh = b.h - 20;
    [
      {c:'#a13e6e',t:'RR'},{c:'#a13e6e',t:'RR'},{c:'#a13e6e',t:'RR'},
      {c:'#c23a30',t:'RH'},{c:'#6a2e8e',t:'BR'},{c:'#312080',t:'BK'},
    ].forEach(({c,t}, i) => {
      const sx = Math.round(sx0 + i*(sw+sg));
      s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="2.5" fill="${c}" fill-opacity="0.13" stroke="${c}" stroke-opacity="0.35" stroke-width="0.4"/>`;
      s += `<text x="${sx+sw/2}" y="${sy+sh+7}" text-anchor="middle" font-size="5" fill="${c}" fill-opacity="0.8">${t}</text>`;
    });
  }

  /* right bed: asparagus (west strip) + veg rows + blueberry hedge + squash strip */
  {
    const b = beds[2];
    // actual widths: asp ~18", veg ~278", blueberry 48", squash 24" of 368" total
    const asW = Math.round(b.w * 18/368);
    const bbW = Math.round(b.w * 48/368);
    const sqW = Math.round(b.w * 24/368);
    const vegW = b.w - asW - bbW - sqW;
    const rowX = b.x + asW + 2, rowW = vegW - 4;

    /* asparagus strip (west) */
    const asCx = b.x + asW/2, asCy = b.y + b.h/2;
    s += `<rect x="${b.x}" y="${b.y+3}" width="${asW}" height="${b.h-6}" rx="2" fill="#5a8a3c" fill-opacity="0.13" stroke="#5a8a3c" stroke-opacity="0.4" stroke-width="0.4"/>`;
    s += `<text x="${asCx}" y="${asCy+2}" text-anchor="middle" font-size="4.5" fill="#5a8a3c" fill-opacity="0.85" transform="rotate(-90,${asCx},${asCy})">asp.</text>`;

    /* veg rows A, B-D, F, G */
    [
      { h:12, c:'#5a7a9e', t:'bok choy · chard'       },
      { h: 3, c:null },
      { h:21, c:'#5a7a9e', t:'brassicas · beets · CM'  },
      { h: 5, c:null },
      { h:11, c:'#c4864c', t:'carrots'                  },
      { h: 3, c:null },
      { h:11, c:'#7a6a9e', t:'leeks · scallions'        },
    ].reduce((y, {h, c, t}) => {
      if (c) {
        s += `<rect x="${rowX}" y="${y}" width="${rowW}" height="${h}" rx="1.5" fill="${c}" fill-opacity="0.14" stroke="${c}" stroke-opacity="0.22" stroke-width="0.4"/>`;
        if (t) s += `<text x="${rowX+rowW/2}" y="${y+h/2+2}" text-anchor="middle" font-size="4.5" fill="${c}" fill-opacity="0.9">${t}</text>`;
      }
      return y + h;
    }, b.y + 13);

    /* blueberry hedge (east) */
    const bbX = b.x + asW + vegW;
    const bbCx = bbX + bbW/2, bbCy = b.y + b.h/2;
    s += `<rect x="${bbX}" y="${b.y+3}" width="${bbW}" height="${b.h-6}" rx="2" fill="#8a3e6e" fill-opacity="0.10" stroke="#8a3e6e" stroke-opacity="0.35" stroke-width="0.4"/>`;
    s += `<text x="${bbCx}" y="${bbCy+2}" text-anchor="middle" font-size="4" fill="#8a3e6e" fill-opacity="0.85" transform="rotate(-90,${bbCx},${bbCy})">blub.</text>`;

    /* squash strip (far east) */
    const sqX = bbX + bbW;
    if (sqW > 2) s += `<rect x="${sqX}" y="${b.y+3}" width="${sqW}" height="${b.h-6}" rx="1.5" fill="#c4a03e" fill-opacity="0.10" stroke="#c4a03e" stroke-opacity="0.3" stroke-width="0.4"/>`;
  }

  /* unfenced: peach tree (NE corner) + winter squash */
  {
    const b = beds[3];
    const tR = 7, tx = b.x + b.w - tR - 2, ty = b.y + tR + 3;
    s += `<circle cx="${tx}" cy="${ty}" r="${tR}" fill="#e8763e" fill-opacity="0.2" stroke="#e8763e" stroke-opacity="0.6" stroke-width="0.6"/>`;
    s += `<text x="${tx}" y="${ty+2.5}" text-anchor="middle" font-size="5" fill="#c05a2a">P</text>`;
    const mY = b.y+17, mH = b.h-21;
    s += `<rect x="${b.x+2}" y="${mY}" width="${b.w-4}" height="${mH}" rx="2" fill="#c4a03e" fill-opacity="0.10" stroke="#c4a03e" stroke-opacity="0.3" stroke-width="0.4"/>`;
    s += `<text x="${b.x+b.w/2}" y="${mY+mH/2+2}" text-anchor="middle" font-size="5" fill="#8a6e3e">sqsh</text>`;
  }

  /* transparent click overlays (must be last so they receive pointer events) */
  beds.forEach(b => {
    s += `<rect data-bed="${b.id}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3" fill="transparent" stroke="none" style="cursor:pointer"/>`;
  });

  /* compass (top-right) */
  const compX = VW - 20, compY = 16;
  s += `<text x="${compX}" y="${compY}" text-anchor="middle" font-size="10" fill="#b96b3e" font-weight="700">N</text>`;
  s += `<polygon points="${compX},${compY+3} ${compX-4},${compY+14} ${compX},${compY+11} ${compX+4},${compY+14}" fill="#b96b3e" fill-opacity="0.55"/>`;

  s += `</svg>`;
  return { svg: s };
}

/* expose for the main script */
window.renderJsxBed = renderJsxBed;
window.renderJsxBags = renderJsxBags;
window.jsxSitePlanSvg = jsxSitePlanSvg;

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local development

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

No install, no build step. Edit files and reload. Deployed via GitHub Pages from `main` branch root.

## Architecture

Three files, no framework, no dependencies:

- **`plants.js`** — `PLANT_INFO` object keyed by plant name. Each entry has `fam`, `code`, `variety`, `sun`, `water`, `soil`, `days`, `spacing`, `care`, `companions[]`, and `cal{}`. Calendar windows are decimal months: `5.33` = May 10, `10.17` = Oct 5.
- **`index.html`** — everything else: CSS tokens, `BEDS` data, all rendering logic, five tabs.
- **`jsx-bed-diagrams.js`** — SVG bed diagram generators. viewBox units are inches; beds are drawn to true scale.

## Data model

`BEDS` is built inside a `<script>` block in `index.html`. Helper functions used to populate it:
- `p(name, opts)` — create a single plant entry
- `line(y, items, opts)` — lay out a row of evenly-spaced plants
- `plantAt(name, x, y, opts)` — place a named plant at exact coordinates

Each `BEDS[key]` has: `title`, `dims`, `lead`, `totals[]`, `rows[]`, `bands[]`, `plants[]`.

After BEDS is built, `indexPlants()` creates `PLANT_PLACEMENTS` (name → plant array) used by the All Plants tab and the detail panel.

Fall/succession beds (`BEDS.rightFall`, `BEDS.leftFall`, `BEDS.unfencedFall`) follow the same structure and represent the same spaces in their fall configuration.

## SVG diagrams (`jsx-bed-diagrams.js`)

Each bed has its own function (e.g. `jsxLeftBedSvg()`). SVG helper primitives:
- `jp(code, cx, cy, r, fill, lbl)` — plant circle
- `jmound(code, cx, cy, rx, ry, fill, lbl)` — squash/mound oval
- `jband(x, w, y, h, fill, lbl)` — row band rectangle
- `jpath(x, w, y, h, lbl)` — harvest path band
- `jn(cx, cy)` — nasturtium companion dot (green, r=7)
- `jsq(code, cx, cy, fill, lbl)` — square herb marker

`JSX_CODE_TO_NAME` maps short lowercase SVG codes (e.g. `bw`, `sg`, `kl`) to `PLANT_INFO` keys. Each diagram function uses `buildJsxIdQueue(bed)` to wire SVG clicks to plant detail panel entries.

## CSS conventions

Plant family colors use `--c-tom`, `--c-pep`, `--c-cuke`, `--c-bras`, `--c-root`, `--c-alli`, `--c-squash`, `--c-herb`, `--c-flw`, `--c-berry`, `--c-cane`, `--c-legume`, `--c-peren`, `--c-cover`.

Calendar activity colors: `--cal-indoor`, `--cal-harden`, `--cal-transplant`, `--cal-direct`, `--cal-harvest`, `--cal-bloom`.

## Tab structure

`data-view` values: `map`, `plants`, `calendar`, `expert`, `tasks`. Active tab and active bed sub-tab are persisted in `localStorage`.

## Garden context

Zone 5b/6a, Greenfield MA. Last frost: May 10. First frost: Oct 5.

Five spaces: Left Bed (rows A–E, 400″ E-W), Right Bed (rows A–G, 368″ E-W + blueberry hedge + squash strip), Middle Bed (berry patch), Unfenced (winter squash), Grow Bags (11 × 10-gal).

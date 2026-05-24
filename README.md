# Gardener

A garden planner for Hannah and Dom's 2026 season in Greenfield, Massachusetts (Zone 5b/6a). Tracks five growing spaces, plant care data, a planting calendar, and watering guidance.

**Live site:** https://hannahglaser.github.io/gardener/

---

## What's in it

**I. Garden Map** — Scaled bed diagrams for each space with true-to-measurement SVG layouts, row indexes, harvest paths, and a plant detail panel. Sub-tabs for each bed.

**II. All Plants** — Care card for every variety: sun, water, soil, spacing, days to harvest, care notes, and location across beds. Filterable by plant family. Covers 40+ varieties across tomatoes, peppers, brassicas, roots, alliums, squash, herbs, flowers, berries, brambles, legumes, and perennials.

**III. Planting Calendar** — Zone 5b/6a timeline bar chart showing indoor start, hardening, transplant, direct sow, bloom, and harvest windows for each plant. Frost dates: last frost May 10, first frost Oct 5.

**IV. Garden Expert** — Opens Claude with the full garden context (all beds, plants, zone, location) pre-loaded. Also offers a copy button for pasting into any chat.

**Weather widget** — Live 7-day rainfall and evapotranspiration for Greenfield MA from [Open-Meteo](https://open-meteo.com/) (no API key). Shows a net watering recommendation that accounts for the 3-day rain forecast.

---

## The garden

| Bed | What's there |
|-----|-------------|
| Left Bed · 400″ E-W | Sunflowers, tomatoes (Brandywine, San Marzano, Sungold, Juliette, Tomatillo), peppers, squash, cucumbers, herbs, asparagus |
| Middle Bed · Berry Patch | Red raspberry (36 canes), Black raspberry (10), Blackberry (8) |
| Right Bed · 368″ E-W | Brassicas (bok choy, kale, cabbage, broccoli, cauliflower, broccolini), beets, carrots, scallions, leeks, blueberry hedge, squash strip |
| Unfenced | Butternut squash × 5, Delicata squash × 2 |
| Grow Bags · 11 × 10-gal | Eggplant, spinach, romaine, pole beans, mystery seedlings |

Spacing confirmed against ISU, Cornell, CSU, and UMass Extension resources.

---

## Stack

Single-file static app — no build step, no framework, no dependencies.

- `index.html` — all data, styles, and rendering logic
- `jsx-bed-diagrams.js` — SVG bed diagram generators for the Map view

Deployed via GitHub Pages directly from the `main` branch root.

---

## Local development

```sh
# Any static file server works — e.g.:
python3 -m http.server 8000
# then open http://localhost:8000
```

No install, no build. Edit `index.html` and reload.

---

## Data notes

- Plant positions in the Map view are true-to-scale in inches (SVG viewBox units = inches)
- Bed dimensions reflect physical measurements; harvest paths are to-scale
- Calendar month values are decimals: `5.33` = May 10, `10.17` = Oct 5
- Grow bag `n` field = number of plants per bag (not number of bags)

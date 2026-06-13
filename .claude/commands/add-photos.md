# Add Photos to Garden Journal

Add one or more photos to the garden journal at `/Users/hannahglaser/dev/gardener/`.

## Step 1 — View each photo

Use the Read tool on each source file to see what it shows. Use this to write the caption — do not ask the user to describe the photo.

Caption style: concise and plain, like a field note. Describe what's in the frame without drama or filler.
- Good: `'Right Bed — looking north, brassicas and roots in rows'`
- Good: `'Peach — fruit setting'`
- Bad: `'A beautiful view of the thriving garden in full summer glory'`

## Step 2 — Get the date

```bash
sips -g creation "/path/to/source.HEIC"
```

Format as `YYYY-MM-DD` for the PHOTOS entry.

## Step 3 — Convert, resize, strip GPS

```bash
# HEIC → JPEG (use --setProperty formatOptions 85 for quality)
sips -s format jpeg --setProperty formatOptions 85 "/path/to/source.HEIC" --out "/Users/hannahglaser/dev/gardener/photos/FILENAME.jpg"

# Strip GPS (always — never leave location metadata in)
exiftool -gps:all= -overwrite_original "/Users/hannahglaser/dev/gardener/photos/FILENAME.jpg"
```

Choose a descriptive kebab-case filename (e.g. `tomato-in-bloom.jpg`, `left-bed-june.jpg`).

## Step 4 — Add to PHOTOS array in `index.html`

Photos are **reverse chronological** — newest first. Within each season, newest date at top.

Seasons are separate groups using the `month` field as a divider label. The `month` field goes only on the **first photo of each season group**:
- `month: 'Summer 2026'` — June, July, August
- `month: 'Spring 2026'` — March, April, May
- etc.

Insert the new photo at the correct date position within the right season group. If the season doesn't exist yet, create a new group above the previous one with a `month` label.

Entry format:
```javascript
{ file: 'FILENAME.jpg', date: 'YYYY-MM-DD', caption: 'Caption here' },
```

## Step 5 — Column balance

Each season section has its own 3-column layout (season dividers use `column-span: all`). Aim for roughly equal thirds within each season group using `colStart: true`:

```javascript
{ file: '...', date: '...', colStart: true, caption: '...' },  // starts col 2
// ~same count later...
{ file: '...', date: '...', colStart: true, caption: '...' },  // starts col 3
```

After adding, count photos in each column per season. Adjust `colStart` positions if lopsided.

$ARGUMENTS

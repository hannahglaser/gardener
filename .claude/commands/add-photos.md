# Add Photos to Garden Journal

You are helping add one or more photos to the garden journal at `/Users/hannahglaser/dev/gardener/`.

## Workflow

### 1. Accept source paths

The user will provide one or more source file paths (HEIC or JPEG from Photos Library or elsewhere). They may also tell you:
- A caption for each photo
- Where in the gallery to insert it (by number or description)
- The date (use EXIF if not provided)

### 2. Process each photo

For each source file, run:

```bash
# If HEIC: convert to JPEG first
sips -s format jpeg "/path/to/source.HEIC" --out "/Users/hannahglaser/dev/gardener/photos/FILENAME.jpg"

# If already JPEG: copy directly
cp "/path/to/source.jpg" "/Users/hannahglaser/dev/gardener/photos/FILENAME.jpg"

# Resize to max 1200px on longest side
sips -Z 1200 "/Users/hannahglaser/dev/gardener/photos/FILENAME.jpg"

# Strip GPS metadata, keep DateTimeOriginal
exiftool -gps:all= -overwrite_original "/Users/hannahglaser/dev/gardener/photos/FILENAME.jpg"

# Read the date for the PHOTOS array entry
exiftool -DateTimeOriginal "/Users/hannahglaser/dev/gardener/photos/FILENAME.jpg"
```

Choose a descriptive kebab-case filename (e.g. `rhubarb-harvest.jpg`, `front-bed-may.jpg`).

### 3. Add to PHOTOS array

Open `index.html` and find `const PHOTOS = [`. Add a new entry at the correct position:

```javascript
{ file: 'FILENAME.jpg', date: 'YYYY-MM-DD', caption: 'Caption here' },
```

- Use the EXIF date (format: `YYYY-MM-DD`)
- If inserting in the middle, adjust `colStart: true` on surrounding entries if needed to keep columns balanced (~5-6 photos per column)
- The `month` field (e.g. `month: 'Spring 2026'`) only goes on the FIRST photo in a new month section to show a divider

### 4. Column balance check

After adding, count photos before each `colStart: true`. Aim for roughly equal thirds:
- Col 1: ~5-6 photos before the first `colStart`
- Col 2: ~5-6 photos before the second `colStart`
- Col 3: remaining photos

Adjust `colStart` positions if the distribution is lopsided.

### 5. Confirm

Tell the user:
- The filename chosen
- The date read from EXIF
- The position in the array (photo #N)
- Ask them to confirm or correct the caption

$ARGUMENTS

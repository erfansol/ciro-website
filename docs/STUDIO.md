# Story Studio

The production system for CIRO story cards. Everything a story needs —
card copy, price, publishing, and the *experience* itself — is created and
managed from `/admin`, by writers, without an engineer.

## One story, four experience kinds

A story is one Firestore document in `stories/{id}`. How it plays is
derived from what the document carries, in this order:

| Kind | What the document has | Authored where |
|---|---|---|
| **Walk** | `walk` with ≥1 stop | Studio (`/admin/stories/{id}/studio`) |
| **Flutter scene** | id in the app's native allowlist | code (engineer) |
| **Unity AR** | `bundle.iosUrl` / `androidUrl` | story editor → *AR Bundle* → upload |
| **Film scene** | `filmScene` | JSON import (legacy) |

Anything else shows as **Coming soon** in the app and is listed as "No
experience" in the admin. Price (`priceCents`, 0 = free), publish state and
schedule are the same for every kind and live on the story editor page.

## The Walk pipeline

```
brief ──AI draft──▶ edit ──▶ render voice ──▶ images ──▶ field walk ──▶ publish
 (5 min)            (3–5 h)    (1 min)         (1 h)      (half day)
```

Stages are tracked per story (`production.stage`: draft → edited → voiced →
field-verified → live) with a checklist: script edited, narration rendered,
images uploaded, field walk done, rights cleared.

### 1. Create the card
`/admin/stories/new` → title, city, category. Then **Studio**.

### 2. Draft with AI
Open **Draft with AI**, give it the title, the concept (what happens, the
dramatic question, who tells it), the number of stops and, importantly, the
**research notes**: facts, dates, coordinates, sources. The model stays
inside those notes. It returns a complete walk in CIRO's structure — for
every stop a *find this*, a 120–250-word *beat*, an *interaction* and a
*transition* — plus card copy and sources. Review the outline, then **Use
this draft**. The story records which model wrote it.

### 3. Edit
This is where the quality comes from. Each stop: fix the place description,
click the map to put the stop exactly where the traveller should stand,
set the arrival radius (20–40 m in Rome's streets), cut and sharpen the
beat, make the interaction land, write the hook into the next stop. The
word counter turns amber outside 80–320 words. **Validate** lists every
problem; **Save walk** writes it (and derives the route, map centre and
geofence anchor from the stops).

### 4. Voice
Pick a voice under *Narrator*. `gemini:` voices are *directed*: the
persona you wrote becomes the acting note, so the narrator sounds like a
guide talking, not a text reader. **Render voice** voices every segment
that has no audio yet; **Re-render all** replaces them after a text or
voice change. Files land in `stories/{id}/` as public MP3s; the app streams
them on the next launch — no release needed. Without audio the app falls
back to the phone's own voice, so a walk is playable the minute its script
exists.

### 5. Images
Upload stop photos under **Media** and type the filename into the stop's
*Image file* field with a credit. Public-domain paintings are fine;
location photos must be our own.

### 6. Field walk
Walk it. Check that each stop triggers (the app also has an "I'm here"
button for GPS drift), that opening hours match the script, and shoot the
*find this* photos. Tick the checklist, set the stage to **Field-verified**.

### 7. Publish
Story editor → *Published* (or schedule). Set the price there too.

## Unity stories
Build the AssetBundle in `ciro_unity`, then story editor → *AR Bundle* →
**Upload a new bundle** (iOS or Android). The server computes the sha256,
bumps the version and writes the `gs://` URL; installed copies re-download
on the new version. The AR anchor (where the scene spawns) is on the same
page.

## Configuration (server-only env)

| Variable | Used for | Default |
|---|---|---|
| `GEMINI_API_KEY` | AI drafting and Gemini TTS | required |
| `GOOGLE_TTS_API_KEY` | Cloud Text-to-Speech voices | optional |
| `STUDIO_TEXT_MODEL` | drafting model | `gemini-3.1-pro-preview` |
| `STUDIO_TTS_MODEL` | Gemini TTS model | `gemini-3.8-flash-tts` |

On Hostinger, add these in the environment panel (plain strings, no
base64). Locally they are in `.env.local`.

## Roles
Admins and editors can create, draft, voice, upload bundles and publish.
Moderators handle reports only. Nobody can change their own role.

## Command-line equivalents
The same format is scriptable from the app repo: `tools/walks/*.json` →
`node tools/seed_walks.js` (validate + upsert) → `node tools/render_walk_audio.js <id>`
(voice, AAC via ffmpeg). `test/walks/` in the app and `test/walkSchema.test.ts`
here both check every shipped walk against the format.

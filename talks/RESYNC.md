# Resyncing the RC talk page — agent runbook

Operational steps for picking this up cold. Architecture and rationale live in
[README.md](README.md); this is just what to do.

**What exists:** an unlisted post at `/2026/08/20/dynamic-documents-as-personal-software.html`,
generated from the Figma Slides deck `a3TxBTfJ5yVihJxdnYzUKR`. Circulated to
reviewers by URL only.

| | |
|---|---|
| Article | `source/articles/2026-08-20-dynamic-documents-as-personal-software.html.haml` |
| Extract snippet | `talks/rc-dynamic/extract.js` (read-only) |
| Notes (source of truth on disk) | `talks/rc-dynamic/slides.yml` |
| Generated data | `data/rc_talk.yml` — **never hand-edit** |
| Images | `source/images/talks/rc-dynamic/` |
| Script | `bin/sync-talk` |

## Resync

```sh
# 1. Notes — the only step needing MCP. Run extract.js via the Figma `use_figma`
#    tool ONE SLIDE-ROW AT A TIME (grid[0], grid[1], …); the response truncates
#    mid-slide near 20kb WITHOUT erroring. Concatenate into raw.json.
bundle exec ruby bin/sync-talk rc-dynamic import

# 2. Images + data file
bundle exec ruby bin/sync-talk rc-dynamic

# 3. Look at it
bundle exec middleman server   # localhost:4567, livereload on
```

`… rc-dynamic data` regenerates only the data file — no network, instant. Use it
when iterating on rendering, not content.

Always check the slide count the script prints against the deck before trusting a
sync. If it warns that slides would not render, the deck is probably open in
Figma — pause editing and re-run.

## Four things that will bite you

1. **Speaker notes are not in the REST API.** No `SLIDE` node type, no
   `speakerNotes` field. Only the plugin API (`slide.speakerNotes`) has them.
2. **Videos cannot be extracted at all.** `Video` exposes only a hash (no
   `getBytesAsync`, unlike `Image`), REST has no video endpoint, and
   `export_video` rejects Slides files. Video slides render as stills. Don't
   re-investigate this.
3. **Never gate the render on a change-check.** `/v1/files/:key` rejects Slides
   decks, and `/meta`'s `last_touched_at` does not reliably advance after edits.
   Deleting a slide shifts every later position, so a wrongly-skipped render
   republishes the wrong image for the rest of the deck.
4. **Slide numbers shift constantly.** Node IDs are stable; names and positions
   are not. Key off IDs.

## Before pushing

```sh
bundle exec middleman build
# hidden post must NOT appear in any of these:
grep -c 'dynamic-documents-as-personal-software' build/index.html build/blog.html build/feed.xml
grep -c noindex build/2026/08/20/dynamic-documents-as-personal-software.html   # must be 1
```

Push to `master` → Netlify builds automatically (~1–2 min). Live at
<https://www.geoffreylitt.com/2026/08/20/dynamic-documents-as-personal-software.html>.

## Open as of 2026-08-24 (77 slides)

- The `notion` section's speaker notes (31 slides) are still from the earlier
  "Understanding is the new bottleneck" talk — code review, `explain-diff`,
  quizzes. Not yet rewritten for this talk.
- Slides 26 and 27 still carry `**Caption:**` bullets; the quote-trim skipped
  them because they had no quote bullet to keep.

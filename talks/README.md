# Talk-slides posts, synced from Figma Slides

A talk post is slides down the left, speaker notes down the right (`layout: talk`).
This directory holds the sync pipeline that builds one from a Figma Slides deck.

## Why it's split in two

Speaker notes and slide images come from different places, because Figma only
offers one of them over HTTP:

| | Source | Why |
|---|---|---|
| Speaker notes | Figma **Plugin** API, via MCP `use_figma` | Not in the REST API at all. Verified against [`figma/rest-api-spec`](https://github.com/figma/rest-api-spec): no `SLIDE` node type, no `speakerNotes` field. `slide.speakerNotes` exists only in the plugin API. |
| Slide images | Figma **REST** API `/v1/images` | One request renders every slide and returns URLs. No MCP, no LLM, no per-slide round trips. |

So the MCP step runs **once per content change** and dumps notes to a file.
Everything after that is plain Ruby you can re-run as often as you like.

> **Big decks need a chunked extract.** The MCP response is capped around 20 kb,
> and it truncates *mid-slide* without erroring — you silently lose the tail. Past
> roughly 50 slides with substantial notes, run `extract.js` one slide-row at a
> time (`grid[0]`, `grid[1]`, …) and concatenate the results into `raw.json`.
> Sanity-check the slide count against the deck before importing.

## One-time setup

Create a Figma personal access token with **file read** scope
(<https://www.figma.com/developers/api#access-tokens>) and save it:

```sh
echo 'figd_YOUR_TOKEN' > ~/.figmatoken   # or export FIGMA_TOKEN=...
```

Tokens expire; a `Figma API 403: Token expired` from `bin/sync-talk` means make a new one.

## The loop

```sh
# 1. Pull notes  (only when slide text/notes/order changed in Figma)
#    Run talks/<slug>/extract.js through the Figma MCP `use_figma` tool,
#    save the returned JSON to talks/<slug>/raw.json, then:
bundle exec ruby bin/sync-talk <slug> import

# 2. Build the post  (images + data file, incremental)
bundle exec ruby bin/sync-talk <slug>

# 3. See it
bundle exec middleman server      # livereload picks up the regenerated data file
```

Sub-commands, when you only want one half:

```sh
bundle exec ruby bin/sync-talk <slug> data      # notes -> data file, no network
bundle exec ruby bin/sync-talk <slug> images    # re-render slides only
bundle exec ruby bin/sync-talk <slug> --force   # ignore the image cache
```

### What makes re-runs fast

* Slide PNGs are cached in `talks/<slug>/cache/` and hashed. A slide is only
  re-encoded to webp when its pixels actually changed, so a resync after editing
  three slides re-encodes three slides, not eighty.
* Downloads run through a single parallel `curl`, not one request per slide.
* `data` needs no network at all — tweaking the markdown-to-HTML rendering is instant.

The render itself is **never** skipped, and deliberately so. There is no trustworthy
cheap way to ask Figma "did this deck change?": `/v1/files/:key` rejects Slides
files outright, and `/meta`'s `last_touched_at` was observed not to advance even
after slides were deleted. Since deleting a slide shifts every later slide's
position, a wrongly-skipped render republishes the wrong image for the whole tail
of the deck. Re-rendering costs ~85s for 80 slides; the hash check still avoids
the expensive re-encode, and it is sound because it compares real rendered bytes.

Two related safeguards, both of which have already caught real breakage:

* If Figma returns a null URL for a slide (it declines to render while the deck is
  being edited), that slide's images are **deleted** rather than left stale, and the
  run warns loudly. A leftover file would otherwise show a different slide.
* When the deck shrinks, now-orphaned `slide-NN.webp` files are swept. They are
  invisible on the page but would still be committed.

### Editing rules

* **Speaker notes live in Figma.** `data/<talk>.yml` is generated; don't hand-edit it.
  Edit the notes in the deck and resync.
* **`alt` text lives in `slides.yml`** and is preserved across re-imports, so
  hand-written alt text survives a resync.
* Figma's notes editor supports a markdown subset (lists, bold, italic,
  strikethrough); `bin/sync-talk` renders that with Redcarpet. Backticks escaped
  as `` \` `` in the deck are unescaped into real code spans.

## Per-talk config

`talks/<slug>/config.yml` sets the deck's file key, the output paths, the
responsive widths, and which slides to leave out:

```yaml
exclude_sections: [archive]   # Figma slide-row names to drop entirely
include_skipped: false        # drop slides flagged "skip" in the deck
```

`extract.js` always dumps the whole deck, so these filters are what decide what
reaches the post. Both are applied at build time, so flipping one and re-running
`data` is instant.

## Files

```
talks/<slug>/config.yml    hand-written  deck key, paths, widths, exclusions
talks/<slug>/extract.js    hand-written  read-only Figma plugin snippet (the MCP step)
talks/<slug>/raw.json      pasted        raw MCP output
talks/<slug>/slides.yml    generated     notes + hand-written alt text
talks/<slug>/cache/        generated     slide PNGs + hash manifest (gitignored)
data/<talk>.yml            generated     what the article template reads
source/images/talks/<slug>/  generated   responsive webp
```

// Figma Plugin API snippet — the ONE step that needs the Figma MCP.
//
// Speaker notes are not exposed by the Figma REST API (confirmed against
// figma/rest-api-spec: no SLIDE node type, no speakerNotes field). They are only
// readable through the Plugin API, so this snippet runs via the MCP `use_figma`
// tool. Everything downstream of it is plain code in bin/sync-talk.
//
// Usage:
//   1. Run this file's contents with the Figma MCP `use_figma` tool against the
//      deck's fileKey (see config.yml).
//   2. Save the returned JSON array to talks/rc-dynamic/raw.json
//   3. bin/sync-talk rc-dynamic import   # raw.json -> slides.yml
//      bin/sync-talk rc-dynamic          # slides.yml + Figma REST -> post
//
// The snippet is read-only: it never mutates the deck.

const grid = figma.getSlideGrid();
const gridNode = figma.currentPage.children.find((n) => n.type === "SLIDE_GRID");
const sectionNames = gridNode ? gridNode.children.map((c) => c.name) : [];

const slides = [];
grid.forEach((row, r) => {
  row.forEach((slide) => {
    slides.push({
      id: slide.id,
      name: slide.name,
      section: sectionNames[r] || `row-${r}`,
      skipped: slide.isSkippedSlide,
      notes: slide.speakerNotes || "",
    });
  });
});
return slides;

# QOM product search prototype

A clickable, wireframe-level prototype of the Product Selection step in QOM (Waterworks' internal quoting web app). It exists to test layout and search behavior with sales consultants (SCs) before design handoff. It is not production code and is not Angular.

## Source of truth
- Requirements: the PRD "Improved Product Search & Results within a Quote" (Google Doc, QOM-2806; design epic QOM-2802, build epic QOM-2499). Requirement IDs (FR-1 to FR-21, NFR-1 to NFR-4) are tagged on screen; tick "Show FR tags" in the blue bar.
- When the PRD and the prototype disagree, the PRD wins. Say so and propose a PRD change rather than silently diverging.

## File and stack
- `qom-product-search-prototype.html`: one file, vanilla JS and CSS, no build step, no dependencies except Google Fonts (Libre Caslon Text, Figtree).
- Mock data only. Never add real client, quote or pricing data. Do not call QOM or M3.
- `images/`: eight sample product photos saved from the public waterworks.com wall-mounted accessories page, used as dummy thumbnails (not matched to the mock products). Products with no photo show a grey placeholder; a missing file falls back to the failed-image state.
- Open it directly in a browser, or serve the folder (`python3 -m http.server`).

## Before you say it works
Extract the `<script>` contents and run `node --check` on them. One stray character in a template string breaks the entire script and the page goes inert.

## What is built
- Three switchable layouts for the Product Selection step: A side by side, B search and quote as tabs with a quote strip, C resizable split.
- Search: words in any order and case, exact item numbers and old 12-digit JDE codes first, light typo tolerance, matches underlined, service parts hidden by default.
- Filters (category, finish, collection, series) work before typing, stay set, show as removable chips, and counts use the same filters as the results. They open as a tray from a Filters button (with an active count) over the results, so they never push the products down.
- States: default prompt with recent items, "keep typing" under three characters, loading, no results with next steps, error with retry. Choose one in the Scenario dropdown.
- Can't-add reasons: discontinued (status 80) and in development (status 10) show in results with the reason. Warehouse status and "waiting on a price" only appear when the item is added.
- Room picker: the quote's own rooms first, one "Add or rename room" action, room type visible.
- Quote panel: rooms, lines, quantities, per-line shipping, "unsaved changes" marker.

## Engineering constraints (from Scott and Imogen, Oct 27 to 30, 2026)
- Search runs on QOM's product table, not live M3. Cached fields: SKU, name, secondary description (FUDS), collection code, series, color, metal finish, UOM, category, item group, status, region, CHCD, SALE. Old JDE codes are in the table.
- Price needs an M3 call, so it is off in results by default (toggle in the blue bar).
- ATP and quantity are read in the context of the quote, not per search result. Stock shows on the quote line, not on result rows.
- Product status is known at search time. Item and warehouse status are known only when the item is added.
- Styles (CHCD = 2) and non-sales items (SALE = 0) are already excluded. Service parts are item groups starting "SVP".
- Minimum search length stays, with an info state instead of silence. Type-ahead is likely cut.
- Thumbnails come from a separate imagery system and often fail; the prototype shows a failed-image state.

## Design principles
- Trust and clarity over speed: the SC always knows what saved, what didn't and why.
- Model what M3 stores; keep QOM-only data to a minimum.
- State requirements as outcomes. Mechanisms (chips, drawers, buttons) are design choices to test, not decisions.

## Open design questions
- One screen, tabs, or resizable split (test all three).
- Whether "stock after adding" satisfies SCs who want to browse by stock.
- Default for discontinued and in-development items (show or hide).
- Whether warehouse problems can be surfaced before the click.
- Whether filters combine as AND or OR (unknown; test with SCs).

## Style
Follows the QOM staging screens: black left rail with a spaced serif wordmark, serif quote header, uppercase black buttons, yellow Draft pill, grey table headers. Light theme only; dark mode was removed on request (colours are CSS variables on :root).

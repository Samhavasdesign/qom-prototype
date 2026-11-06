# QOM product search prototype

A clickable, wireframe-level prototype of the Product Selection step in QOM (Waterworks' internal quoting web app). It exists to test layout and search behavior with sales consultants (SCs) before design handoff. It is not production code and is not Angular.

## Source of truth
- Requirements: the PRD "Improved Product Search & Results within a Quote" (Google Doc, QOM-2806; design epic QOM-2802, build epic QOM-2499). Requirement IDs (FR-1 to FR-21, NFR-1 to NFR-4) are marked in the code with `<span class="fr">` tags, which are always hidden on screen. `prd-trace.md` maps each requirement to the code.
- When the PRD and the prototype disagree, the PRD wins. Say so and propose a PRD change rather than silently diverging.

## File and stack
- `qom-product-search-prototype-v2.html`: the current prototype. One file, vanilla JS and CSS, no build step, no dependencies except Google Fonts (Libre Caslon Text, Figtree). `qom-product-search-prototype.html` is v1, kept for reference.
- Mock data only. Never add real client, quote or pricing data. Do not call QOM or M3.
- `images/`: eight sample product photos saved from the public waterworks.com wall-mounted accessories page, used as dummy thumbnails (not matched to the mock products). Products with no photo show a grey placeholder; a missing file falls back to the failed-image state.
- Open it directly in a browser, or serve the folder (`python3 -m http.server`).

## Before you say it works
Extract the `<script>` contents and run `node --check` on them. One stray character in a template string breaks the entire script and the page goes inert.

## What is built (v2)
- Layout: search and quote side by side with a drag handle to resize them, plus an expand button for a full-screen quote view. The tabs layout (B) is hidden.
- Search: runs on Enter. Words match in any order and case. Exact item numbers and old 12-digit JDE codes come first, with light typo tolerance, and matches are underlined. Service parts are ranked below sellable products (and tagged "Service part"), not hidden.
- Filters: pills for Finish, Collection, Category (with product types beneath) and More filters (line type, plus "Hide discontinued and in-development items"), each opening a popover over the results. They work before typing, stay set for the quote until cleared, and show as black removable pills with "Clear all". Counts use the same rules as the results. Values that differ only by case or spacing ("Brass", "BRASS") are one option.
- States: an empty-search prompt, "keep typing" under three characters, loading, no results with next steps, and an error with retry.
- Can't-add reasons: discontinued (status 80 or 90) and in development (status 10) show in results with the reason. Warehouse status and "waiting on a price" only appear when the item is added. They show by default. The SC hides them with "Hide discontinued and in-development items" at the bottom of More filters (unticked by default, like every filter; it counts on the More filters badge and Clear all resets it), or with Hide on the results count ("1 discontinued or in-development · Hide", then "… hidden · Show"). Both stay in step with the demo bar toggle.
- Every result row shows the item's status: in the Status column when the search side is 500px or wider, otherwise in the line under the name ("Style ARTF · Status 20"). Kelli asked for it on Nov 5 because today's results show it.
- Country of Origin shows on quote lines only in the Commercial view (it's commercial-only in QOM).
- Results show no stock or availability. Availability appears on the quote line, worded as QOM-2926 will build it: "Available to Promise (ATP): 4" (or "9 from Feb 15, 2027" when only available later), "Estimated delivery date: Nov 12, 2026 · meets RDD" (or "· after RDD"), and "Sourcing warehouse: <code>" only when it differs from the line's warehouse (mock: Henry Single Robe Hook, HNHK-N, ships from USR). ATP and the date each have a two-layer tooltip: a plain sentence, then an "M3:" line (AVTP, CODZ, OIS340MI/LstSupplSummary, mock customer and quantity). No "as of" time.
- Room picker: the quote's own rooms come first, then "+ Add room", then the standard room types. One form adds or renames a room: "Rename room" in a room's "…" menu opens the Add room form filled in. Type is required and name is optional. The room bar shows the type in grey after the name ("sams kitchen · Kitchen") unless they're the same.
- Quote panel: rooms, lines, quantities, per-line shipping, "Find in this quote", plus Quote information and PDF preview tabs.
- Find in this quote: words match at the start of a word, in the product name with its finish ("… in Nickel"), and item numbers match from their start. It goes to the best match (exact item number first, rooms last), underlines every match, and shows "14 matches" in the box and "· 2 matches" on each room bar and in the full-view Rooms list. Nothing is hidden unless the SC picks "Show only matches" on the count line, which then reads "Showing 14 of 100 lines · Show all lines". No arrow buttons: Enter goes to the next best match, Shift+Enter back.
- Quantities follow QOM-2491 (order multiples): items sold in multiples start at one multiple, + and − step by it, and the helper reads "Sold in increments of 10 square feet". A typed amount that isn't a whole multiple rounds up to the next one, with QOM-2961's note ("Rounded up to 30 square feet: this item is sold in increments of 10 square feet."), on result rows and quote lines. A saved quantity that's already wrong is flagged, not changed.
- Footer bar: save status with an "unsaved changes" marker, Save, Calculate freight, Send to client, and the "Before you send" panel.

## Demo bar (black bar at the top, not part of the design)
- Layout, and View: Residential or Commercial (commercial-only items and margin pricing appear only in Commercial).
- Scenario:
  - Normal: a "faucet" search with Finish: Brass and Category: Fittings.
  - QOM-2926 · ATP, delivery date and sourcing warehouse: adds two lines to Bar, so it shows ATP in stock, "2 from <date>" · after RDD (HNKIT-DB) and "Sourcing warehouse: USR" (HNHK-N). The lines go when you pick another scenario.
  - Fresh quote, no lines: the default on load.
  - QOM-2514 · U-04 Find in this quote (100-line quote): 100 mock lines in 10 rooms, opening with "bar" already found (22 matches in 9 rooms). The usual lines come back when you pick another scenario.
  - Search · Loading: mock searches take about 1.5 seconds, so "Searching…" shows.
  - Search · Error: shows the error state with Try again.
  - Footer 1 · Unsaved edits, Footer 2 · Saved, no freight, Footer 3 · Calculating freight, Footer 4 · Ready to send, Footer 5 · Blocked.
- Simulate a save that returns an Autospec or Pricing problem.
- Toggles:
  - Stock warning examples: on by default.
  - Show discontinued and in-development: on by default. It's the reverse of "Hide discontinued and in-development items" in More filters, and they stay in step.
  - Price in results (needs an M3 call per item): off by default.
  - Concept: Required parts on add (QOM-2561): off by default; `#concept-required-parts` in the URL also turns it on. It offers rough-in valves and often-added parts under a newly added line, using a mock `requiredParts` map.

## Engineering constraints (from Scott and Imogen, Oct 27 to 30, 2026)
- Search runs on QOM's product table, not live M3. Cached fields: SKU, name, secondary description (FUDS), collection code, series, color, metal finish, UOM, category, item group, status, region, CHCD, SALE. Old JDE codes are in the table.
- Price needs an M3 call, so it is off in results by default (toggle in the demo bar).
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

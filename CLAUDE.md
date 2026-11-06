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
- Search: runs as you type, about a quarter second after typing stops, and Enter searches at once. This is the ideal case (Nick, Nov 5); the PRD's provisional decision is Enter only, so "Search as you type" in the demo bar switches to that fallback. Words match in any order and case. Exact item numbers and old 12-digit JDE codes come first, with light typo tolerance, and matches are underlined. Service parts are ranked below sellable products (and tagged "Service part"), not hidden.
- Filters: pills for Finish, Collection, Category (with product types beneath) and More filters (line type, plus "Hide discontinued and in-development items"), each opening a popover over the results. They work before typing, stay set for the quote until cleared, and show as black removable pills with "Clear all". Counts use the same rules as the results. Values that differ only by case or spacing ("Brass", "BRASS") are one option.
- States: an empty-search prompt, "keep typing" under three characters, loading, no results with next steps, and an error with retry.
- Can't-add reasons: discontinued (status 80 or 90) and in development (status 10) show in results with the reason. Warehouse status and "waiting on a price" only appear when the item is added. They show by default. The SC hides them with "Hide discontinued and in-development items" at the bottom of More filters (unticked by default, like every filter; it counts on the More filters badge and Clear all resets it), and the results count no longer has a Hide or Show note (removed Nov 5); "Show them" stays in the no-results state. Both stay in step with the demo bar toggle.
- Every result row shows the item's status: in the Status column when the search side is 500px or wider, otherwise in the line under the name ("Style ARTF · Status 20"). Kelli asked for it on Nov 5 because today's results show it.
- Every result row has a "Details" button with a chevron, at every width, that opens a tray with the unit, weight, collection and finish (Nick, Nov 5; it used to open only from the unit column, which hides under 640px). Units read "each" and "sq ft", and the column is headed "Unit", not UOM, EA or SF.
- Country of Origin shows on quote lines only in the Commercial view (it's commercial-only in QOM).
- Result rows for sellable items (status 20) show a stock tag labelled with its warehouse: "In stock: 4 in USC", or "Out of stock in USC · lead time about 12 weeks". Sam asked for it back on Nov 5; it's a PRD change from the Oct 30 "no stock in results" decision, so it needs engineering's agreement on cost. Fuller availability appears on the quote line, worded as QOM-2926 will build it: "Available to Promise (ATP): 4" (or "9 from Feb 15, 2027" when only available later), "Estimated delivery date: Nov 12, 2026 · meets RDD" (or "· after RDD"), and "Sourcing warehouse: <code>" only when it differs from the line's warehouse (mock: Henry Single Robe Hook, HNHK-N, ships from USR). ATP and the date each have a two-layer tooltip: a plain sentence, then an "M3:" line (AVTP, CODZ, OIS340MI/LstSupplSummary, mock customer and quantity). No "as of" time.
- Room picker: the quote's own rooms come first, then "+ Add room", then the standard room types. One form adds or renames a room: "Rename room" in a room's "…" menu opens the Add room form filled in. Type is required and name is optional. The room bar shows the type in grey after the name ("sams kitchen · Kitchen") unless they're the same.
- Quote panel: rooms, lines, quantities, per-line shipping, "Find in this quote", plus Quote information and PDF preview tabs.
- Removing a line: every line has a delete button under its "…" menu (Nick and Vicki, Nov 5). Every way of removing a line (that button, "Remove Product" in the "…" menu, and the stepper's trash at the minimum) opens a confirmation showing the product, quantity and room, with Cancel and "Yes, delete". Undo appears after the line goes.
- Reordering: drag a line or room by its handle, use the arrow keys on the handle, or pick Move up or Move down at the top of a line's "…" menu (Nick, Nov 5). They're greyed out at the top and bottom of the room, and a move flashes the line and is announced to screen readers.
- Find in this quote: the usual find-in-page pattern, for items only (rooms are never matched). Every word must match the start of a word in the product name with its finish ("… in Nickel") or the start of the item number. After a pause or Enter it underlines every match and goes to the best one (exact item number first); the up and down arrows in the box, or Enter and Shift+Enter, then step through the matches one by one in quote order, wrapping at the ends, and the panel scrolls to each. The current line has a black outline. Small black text under the box says "3 of 21 matches" (or "No matching lines"), and each room bar shows "· 2 matches". Nothing is hidden.
- Quantities follow QOM-2491 (order multiples): items sold in multiples start at one multiple, + and − step by it, and the helper reads "Sold in increments of 10 square feet". A typed amount that isn't a whole multiple rounds up to the next one, with QOM-2961's note ("Rounded up to 30 square feet: this item is sold in increments of 10 square feet."), on result rows and quote lines. A saved quantity that's already wrong is flagged, not changed.
- Footer bar: save status with an "unsaved changes" marker, Save, Calculate freight, Send to client, and the "Before you send" panel.

## Demo bar (black bar at the top, not part of the design)
- Layout, and View: Residential or Commercial (commercial-only items and margin pricing appear only in Commercial).
- Scenario:
  - Normal: a "faucet" search with Finish: Brass and Category: Fittings.
  - QOM-2926 · ATP, delivery date and sourcing warehouse: adds two lines to Bar, so it shows ATP in stock, "2 from <date>" · after RDD (HNKIT-DB) and "Sourcing warehouse: USR" (HNHK-N). The lines go when you pick another scenario.
  - Fresh quote, no lines: the default on load.
  - QOM-2514 · U-04 Find in this quote (100-line quote): 100 mock lines in 10 rooms, opening with "bar" already found (21 matching lines in 9 rooms, "1 of 21 matches"). The usual lines come back when you pick another scenario.
  - Search · Loading: mock searches take about 1.5 seconds, so "Searching…" shows.
  - Search · Error: shows the error state with Try again.
  - Footer 1 · Unsaved edits, Footer 2 · Saved, no freight, Footer 3 · Calculating freight, Footer 4 · Ready to send, Footer 5 · Blocked.
- Simulate a save that returns an Autospec or Pricing problem.
- Toggles:
  - Search as you type: on by default. Off, search runs only on Enter (the PRD's provisional decision).
  - Stock warning examples: on by default.
  - Stock in results: on by default.
  - Show discontinued and in-development: on by default. It's the reverse of "Hide discontinued and in-development items" in More filters, and they stay in step.
  - Price in results (needs an M3 call per item): off by default.
  - Concept: Required parts on add (QOM-2561): off by default; `#concept-required-parts` in the URL also turns it on. It offers rough-in valves and often-added parts under a newly added line, using a mock `requiredParts` map.

## Engineering constraints (from Scott and Imogen, Oct 27 to 30, 2026)
- Search runs on QOM's product table, not live M3. Cached fields: SKU, name, secondary description (FUDS), collection code, series, color, metal finish, UOM, category, item group, status, region, CHCD, SALE. Old JDE codes are in the table.
- Price needs an M3 call, so it is off in results by default (toggle in the demo bar).
- ATP and quantity are read in the context of the quote, not per search result. Full availability (ATP, delivery date) stays on the quote line; the stock tag on result rows (added back Nov 5) still has to be costed with Scott and Nick, from QOM's product table or one batched read, not an M3 call per row.
- Product status is known at search time. Item and warehouse status are known only when the item is added.
- Styles (CHCD = 2) and non-sales items (SALE = 0) are already excluded. Service parts are item groups starting "SVP".
- Minimum search length stays, with an info state instead of silence. Type-ahead is likely cut (the prototype shows it anyway as the ideal case, with a demo-bar toggle for Enter only).
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

# Tickets in the PRD, with design notes

Source: "PRD: Improved Product Search & Results within a Quote" (Google Doc, last updated Nov 5, 2026). Every QOM ticket the PRD links is listed here, 50 in all. Descriptions come from the PRD. Statuses, owners and dates were rechecked in Jira on Nov 5, and the PRD was updated to match. Design notes point to the v2 prototype where it already covers the ticket.

## 1. This PRD's own tickets

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-2806](https://ww-software.atlassian.net/browse/QOM-2806) | Write the PRD (Sam; Needs review, with Kelli) | The PRD is the source of truth. `prd-trace.md` maps each FR to the prototype; keep both updated together. |
| [QOM-2802](https://ww-software.atlassian.net/browse/QOM-2802) | Design epic: Improved Product Search & Results within a quote (Sam, Oct 27 – Nov 5). Blocks 2499, 2570 and 2800 | Ends today (still Triage). The PRD's mock table now points every screen to the v2 prototype; share a v2 link or export frames before handoff. |
| [QOM-2499](https://ww-software.atlassian.net/browse/QOM-2499) | Build epic (Kyle Wittwer, High, Nov 6, 2026 – Feb 1, 2027; was Nick, to Dec 3) | Hand off P0 (FR-1 to FR-5, FR-20, FR-21) and the small fixes (FR-16 to FR-19) first. Mark which prototype behaviours are test ideas, not decisions (layout, filter AND/OR, discontinued default). |

## 2. Search data and filters

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-2763](https://ww-software.atlassian.net/browse/QOM-2763) | Facet cache (150-day TTL) serves stale filter values; "Brass" shows beside "BRASS" | Show one option per value, using the spelling most products use, and merge their counts (built in v2). The PRD asks to move this ticket into the search epic. |
| [QOM-2252](https://ww-software.atlassian.net/browse/QOM-2252) | Filter result counts | Counts must use the same rules as the results, so a count never promises rows that don't appear (FR-15, NFR-2). v2 does this. |
| [QOM-1693](https://ww-software.atlassian.net/browse/QOM-1693) | Slow product filter endpoint exhausting the connection pool | Design can't fix speed, but can make it honest: a visible "Searching…" state and search on Enter rather than every keystroke (FR-5, NFR-1). |
| [QOM-2436](https://ww-software.atlassian.net/browse/QOM-2436) | Lean item-master BOD rebuild | May change which fields are cached. Recheck the result-row fields (collection, series, FUDS) against it before handoff. |
| [QOM-888](https://ww-software.atlassian.net/browse/QOM-888) | Product status (MITMAS.STAT) is in the cache | This is why discontinued (80) and in-development (10) reasons can show in results, before the add. |
| [QOM-886](https://ww-software.atlassian.net/browse/QOM-886) | Add status to product and product_warehouses (Done) | FR-4 says warehouse status is only known at the add (Scott, Oct 30), but this ticket added it to the cache. Now an open question for Scott in the PRD: if it's cached, warehouse reasons could move into results. |
| [QOM-952](https://ww-software.atlassian.net/browse/QOM-952) | Commercial-only items (CMM item group) hidden from non-commercial quotes | Keep hidden for now (v2 hides them on Residential). Open question: show them with "Commercial quotes only", like discontinued items. |
| [QOM-953](https://ww-software.atlassian.net/browse/QOM-953) | UK-only items (CFI4) excluded from US quotes | Keep the rule. Not modelled in the prototype; add a mock UK-only item if the UK stays in scope. |

## 3. Items that can't be added

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-2821](https://ww-software.atlassian.net/browse/QOM-2821), [QOM-2340](https://ww-software.atlassian.net/browse/QOM-2340) | Products that can't be added (status 50 with inventory; "incomplete information") | FR-4: say why in a plain sentence with a next step, in results where known and at the add otherwise, and never drop the line at save. The PRD says to review these two first. |
| [QOM-2918](https://ww-software.atlassian.net/browse/QOM-2918) | Status 50 stock availability calculated from the quote's RDD (Kelli, Triage) | Affects the warehouse-status message at the add. The wording should reflect that the answer depends on the delivery date. |
| [QOM-2557](https://ww-software.atlassian.net/browse/QOM-2557) | Suggested replacements for discontinued items (Jan 25 – Feb 25, 2027) | Out of scope, but design the discontinued reason so a "See replacements" action can slot in later. |
| [QOM-2561](https://ww-software.atlassian.net/browse/QOM-2561) | Required Plumbing Surfacing per Item (Imogen, Nov 10 – 20); owns the item-to-part mapping | FR-14. v2 has it as a concept behind a toggle: "Needed to install" and "Often added" under a new line, one click, same room, same quantity, and skipped parts go under "To check" as the PRD now says. One gap: "Often added" checks only the same room, while the PRD says not to offer a part already anywhere on the quote. |

## 4. Availability and the M3 call budget

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-2833](https://ww-software.atlassian.net/browse/QOM-2833) | Spike: M3 API calls per BOD (Nick, High) | Sizes any per-item call. Until it lands, price is off in results (toggle in v2) and any price check is on demand. Kill criterion: if availability can't fit the budget, drop FR-8. |
| [QOM-2425](https://ww-software.atlassian.net/browse/QOM-2425) | Reduce M3 API usage, part 1 (Done) | No design work; it sets the call budget. |
| [QOM-2844](https://ww-software.atlassian.net/browse/QOM-2844) | Reduce M3 API usage, part 2 (Nov 10 – 23) | Sets the budget for availability on the quote and price checks (NFR-3). |
| [QOM-2845](https://ww-software.atlassian.net/browse/QOM-2845) | Reduce M3 API usage, part 3 | Out of scope for this contract. |
| [QOM-2494](https://ww-software.atlassian.net/browse/QOM-2494) | Item and Quantity Availability (High, In Progress, Oct 13 – Nov 16) | FR-8: stock shows on the quote line once added, labelled with its source and time ("4 available in USC · as of 11:58 AM"), never on result rows. Test whether that satisfies SCs who want to browse by stock. |
| [QOM-2926](https://ww-software.atlassian.net/browse/QOM-2926) | Show ATP, estimated delivery date and M3 tooltips in the grid and add dialog (Allan Mercado, In Progress) | Overlaps FR-8. Align its labels with the prototype's stock line so the quote says the same thing in both places. |

## 5. Rooms and the add flow

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-1973](https://ww-software.atlassian.net/browse/QOM-1973), [QOM-2600](https://ww-software.atlassian.net/browse/QOM-2600) | Adding a product crashes when the room modal was dismissed; products added after opening a room's "…" menu save with a blank room | FR-19: the SC knows a room is needed before clicking Add. v2 disables Add ("Choose a room first"), adds a hint and shows the target room on the room bar, so there's no post-click alert to dismiss. |
| [QOM-970](https://ww-software.atlassian.net/browse/QOM-970), [QOM-2065](https://ww-software.atlassian.net/browse/QOM-2065) | Ideas for the custom room flow; renaming a room doesn't save | FR-21: one form adds or renames a room, type required and name optional, and the room bar shows the type after the name. The quote's own rooms come first in the picker. |
| [QOM-2768](https://ww-software.atlassian.net/browse/QOM-2768) | Explain why NEXT, SAVE and CREATE are disabled in the New Project wizard | Different screen, same principle as FR-4 and FR-19: a disabled control always says why. Use one pattern for both. |

## 6. Attribute filters (P2)

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-2570](https://ww-software.atlassian.net/browse/QOM-2570) | Expanded Item Search by Attribute (Nov 6 – Dec 1) | FR-12. The "More filters" pill reserves the place; only line type is in it today. |
| [QOM-2568](https://ww-software.atlassian.net/browse/QOM-2568) | Filtering search by GPM data on region (Jan 13 – Feb 15, 2027) | Flow rate goes under More filters. Compliance needs data first (the cached field is empty). |
| [QOM-2690](https://ww-software.atlassian.net/browse/QOM-2690) | Nick's PRD for GPM filtering | Agree which document owns attribute filters; this PRD only reserves the pattern. |

## 7. Standalone and record search

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-2800](https://ww-software.atlassian.net/browse/QOM-2800), [QOM-2556](https://ww-software.atlassian.net/browse/QOM-2556) | Item Search Outside of Quotes: design (Dec 7 – 14) and build (Dec 19 – Jan 8) | FR-9. Reuse the same search bar, filters and states, minus the room and add controls. |
| [QOM-2801](https://ww-software.atlassian.net/browse/QOM-2801) | Improved Search Surface for quotes, clients and projects (Sam, Nov 27 – Dec 10) | Agree the shared search patterns (Appendix) with Nick and Imogen before this starts, so the two searches don't diverge. |
| [QOM-2620](https://ww-software.atlassian.net/browse/QOM-2620) | Search & Filtering for Sales Consultants (High, Dec 11 – 24) | Record search. Same shared patterns; Nick to confirm scope. |
| [QOM-2867](https://ww-software.atlassian.net/browse/QOM-2867) | Contact search modal has no loading state | Fix with the shared loading pattern from FR-5. |
| [QOM-2721](https://ww-software.atlassian.net/browse/QOM-2721), [QOM-2769](https://ww-software.atlassian.net/browse/QOM-2769) | Description carry-through to orders and search; project search covers only the first ~15 characters | Record search, not this PRD. |

## 8. Related work this PRD leaves alone

| Ticket | What it is | Design write-up |
| --- | --- | --- |
| [QOM-2468](https://ww-software.atlassian.net/browse/QOM-2468) | Saving Quotes with small, synchronous requests (Dec 14 – Jan 31) | Home for save trust: "unsaved changes" marker, drafts until saved, PDF progress. The v2 footer save bar belongs here, not to search. |
| [QOM-2502](https://ww-software.atlassian.net/browse/QOM-2502) | Multi-product select and delete (Nov 17 – Dec 31) | If SCs ask to add several results at once, use this ticket's selection pattern. |
| [QOM-2566](https://ww-software.atlassian.net/browse/QOM-2566), [QOM-2688](https://ww-software.atlassian.net/browse/QOM-2688) | Bulk margin adjustment for repeated items; design task (Sam) | Margin edits stay in the commercial preview, with an "apply to other instances" toggle (Imogen). v2's commercial view has this. |
| [QOM-2381](https://ww-software.atlassian.net/browse/QOM-2381), [QOM-2277](https://ww-software.atlassian.net/browse/QOM-2277) | RDD Selection Window (Nov 9 – 26); header date change doesn't reach lines | FR-20 only keeps per-line shipping controls reachable; no redesign. |
| [QOM-2613](https://ww-software.atlassian.net/browse/QOM-2613) | Change Finish Bulk Action (Kelli, Nov 2 – 25) | Finish swap is out of scope. Keep the quote-wide finish filter clearly a filter, so it isn't mistaken for changing finishes on existing lines. |
| [QOM-2546](https://ww-software.atlassian.net/browse/QOM-2546) | UI Reskin & implementation (Nov 13 – 26) | May own the layout (FR-20) and room picker (FR-21); open question for Nick and Kelli. |
| [QOM-2451](https://ww-software.atlassian.net/browse/QOM-2451) | Projects design (Nov 6 – 12) | Next in the design sequence; no overlap. |
| [QOM-2939](https://ww-software.atlassian.net/browse/QOM-2939) | Adopt a newer, themeable component library, starting with search and filters | Pick the library before handoff so search ships on the new components. |
| [QOM-2490](https://ww-software.atlassian.net/browse/QOM-2490) | Typed Frontend Client & Simplification (Imogen) | Purely technical; doesn't constrain design. |
| [QOM-2583](https://ww-software.atlassian.net/browse/QOM-2583) | Product and behavioural analytics (Imogen, In Progress since Sep 28, due Nov 20) | Needed for the PRD's search events and baselines. Ask when search events can be logged. |
| [QOM-2712](https://ww-software.atlassian.net/browse/QOM-2712) | Product ownership moves to Waterworks (Jan 18 – 31) | Handoff deadline: open design questions need owners on the Waterworks side by then. |

# Prompt: restyle the QOM quote footer as a step track

Paste everything below the line into Claude, with this folder's PNGs attached (or point Claude at this folder).

---

You're editing a clickable HTML prototype for QOM, Waterworks' internal quoting tool: `qom-product-search-prototype-v2.html`. Leave v2 untouched and save your work as `qom-product-search-prototype-v3.html` in the same folder.

## What to change

Three changes:

1. The quote footer (`#pbar`, "one bar across the page, fixed to the bottom") gets a new visual design called the **step track**.
2. The "Before you send" panel (`#sendPanel`) must stop covering the bar.
3. Four more quote tabs get mocked up so the bar can be seen on every tab: Essential Quote Info, Header Information, Shipping Information and Associations (section 6).

The footer changes are visual and layout only. Keep:

- every id, button, handler and `aria-*` hook (`#saveBtn`, `#pbFreightBtn`, `#pbSend`, `#discardBtn`, `#bdBtn`, `#pbFix`, `#pbChk`, `#pbTog`)
- the logic in `footState()`, `renderSend()`, `sendItems()`, `openSend()`, `closeSend()` and `setMini()`, the auto-open variants, the scenario menu (Footer 1–5) and the panel's content

Save covers the whole quote, which is how v2 already works. Don't add per-tab wording.

## Reference images (in this folder)

| File | Shows |
|---|---|
| `00-before-current-bar-saved.png` | v2's bar today, for comparison |
| `01`–`06-step-track-*.png` | The new bar in each footer state: empty, unsaved, saved (freight next), calculating, ready, blocked |
| `07-collapsed-saved.png`, `08-collapsed-blocked.png` | The collapsed (mini) bar |
| `09-page-essential-quote-info.png` | The bar on a full page |
| `10-page-panel-open-things-to-fix.png` | "2 to fix" clicked: the panel opens and the bar ends at the panel's left edge |
| `11-page-panel-open-full-breakdown.png` | "Full breakdown" clicked, ready state, same layout |
| `12-staging-essential-quote-info.png` | Screenshot of the real QOM tab (staging), to mock in section 6 |
| `13-staging-header-information.png` | Same, Header Information |
| `14-staging-shipping-information.png` | Same, Shipping Information |
| `15-staging-associations.png` | Same, Associations |

Images 00–11 are 2× mockups of the bar. Where they and this text disagree, follow this text. The page content around the bar in 09–11 is rough context. Use 12–15 for what the tabs look like.

## 1. Full bar layout

- Height 96px. Padding `0 28px`, white background, keep the top border and shadow. Two zones in a flex row with a 40px gap:
  - **Left: total block** (flex 1, min-width 0), three stacked lines:
    - The label "Estimated total", or "Total" once freight is done: 12px, uppercase, letter-spacing .12em, `--muted`.
    - The amount: serif, 28px / 32px line-height.
    - A 13px muted line with the existing note ("Freight and tax not calculated yet", "Includes freight … and tax …", "No products yet"), then `·` and the **Full breakdown** link.
    - While freight runs, that line shows the existing progress message ("Calculating freight in M3. You can keep working.") with no breakdown link, as v2 does now.
    - The note truncates with an ellipsis before the link does. **Full breakdown** always stays visible.
  - **Right: three steps**, joined by connectors. Each step is a 200px column with an 8px gap:
    - A **label row** (18px tall, 12px): indicator icon, then "1 SAVE", "2 FREIGHT" or "3 SEND" (600 weight, uppercase, .12em; ink when it's the current step, muted otherwise), then `·`, then a short status.
    - The step's **button** underneath: full step width, 40px tall.
  - **Connectors**: 36px × 1px lines aligned to the button centres. Ink when the step before is done, `--line` otherwise.
- The old helper line (`#pbHelp`) is no longer shown. The step statuses replace it. Keep `#pbHelp` in the DOM as a visually hidden `aria-live="polite"` region with the same text, so screen-reader announcements don't change.
- Buttons stay uppercase 12px, letter-spacing .12em:
  - Next step (`.primary`): filled ink.
  - Available but not next: white with an ink border.
  - Disabled or `aria-disabled`: `#f3f3f3` background, `#f3f3f3` border, `#666` text.
  - Calculate freight and Send keep their click-to-explain behaviour when grey.

## 2. Step states (derived from `footState()`)

**Save**
- Unsaved: an amber dot (`--amber`) and "**N unsaved changes**" in amber 600, then **Discard** (`#discardBtn`) as a 12px link. The Save button is primary.
  - When `F.bad` (bad quantities): status "Fix the quantities marked", Save disabled.
- Saved: a done check (`--done`) and "Saved {time}" in `--done`. Save disabled.

**Freight**
| Condition | Indicator | Status | Button |
|---|---|---|---|
| No lines | grey ring | Needs products | Calculate freight, disabled |
| Unsaved | grey ring | Save first | Calculate freight, disabled |
| No address or other blockers | ink ring | Not calculated | Calculate freight, as v2 (available or aria-disabled) |
| Can run, not done | ink ring | Not calculated | Calculate freight, primary |
| Running | spinner (`--ink`) | Running in M3 | "Calculating…" with the spinner, plus a 3px ink progress line along the button's bottom edge (reuse the `pbslide` animation; static at 45% under reduced motion) |
| Done | done check | Freight amount, e.g. "$466.85" | "Recalculate freight", outlined |

**Send**
| Condition | Indicator | Status | Button |
|---|---|---|---|
| Can send | filled ink circle | **Ready** | Send to client, primary |
| Blockers (`F.others.length`) | warning triangle (`--block`) | "**N to fix**" link in `--block` 600, underlined. This is the existing `#pbFix` (opens the panel at Things to fix, keeps `aria-expanded`) | Send to client, disabled |
| Otherwise | grey ring | Needs freight | Send to client, disabled |

- If there are warnings ("to check"), add `· N to check` (the existing `#pbChk`) after the Send status.

Indicators are 14–15px:
- Ring: a 2px border circle.
- Done check: the circle-check already used in the panel (`SI.done`).
- Warning: the existing triangle.

## 3. Collapsed bar (`.pbar.mini`)

Keep the handle tab, `setMini()`, opening full size on load, and auto-expanding when a new blocker appears.

The collapsed bar is one 36px line:

- The total: 12px label plus 18px serif amount.
- Then, right-aligned, the three step labels in a row: indicator, name (12px uppercase .1em, 600 weight) and status. They're joined by 16px connectors.
- Then **only the next-step button**: 28px tall, 11px text, 0 12px padding. When nothing is next (blocked), there's no button.
- Discard and the note line are hidden. "N to fix" stays as a link in the Send label.

## 4. The panel pushes the bar aside (fix)

Today `.spanel` is `position: fixed; top: 0; bottom: 0; z-index: 160`, and the bar (z-index 150) still spans the full window. So the open panel covers Save, Freight and Send.

The change:

- When `SEND.open`, the bar's right edge sits at the panel's left edge, at every width, full and collapsed. The panel stays full height (top 0 to bottom 0), next to the bar. See images 10 and 11.
- Do this in `placeBar()`: subtract the panel's width from `--fb-w` when the panel is open, and recompute when it opens or closes.
- At 1280px and wider the page already gets `margin-right: var(--sp-w)`. Below 1280 the panel overlays the page, but the bar should still shorten.
- If the panel is as wide as the viewport (narrow screens), let it cover the bar. The panel has its own close button.

## 5. When the bar doesn't fit

Replace `fitBar()`'s tight/stack logic with these steps, measured the same way. Each step applies only if the one before still doesn't fit.

1. **Full**, as above.
2. **Tight**: the note truncates. The breakdown link stays.
3. **Compact**: hide the step statuses. Keep the indicator, number and name. Give each button `aria-describedby` pointing at its hidden status so the reason is still announced. "N to fix" stays visible.
4. **Stack**: the total block goes on row 1, and the steps go on row 2 at full width, each step `flex: 1`. The bar grows, and `--bar-h` must follow so the page's bottom padding stays right.

Collapsed: hide the statuses first, then the step names (indicators only), then the connectors.

Check the bar with the panel open at 1440px. The bar is about 1120px wide then and should land on "Tight".

## 6. Mock the other quote tabs, with the bar across each

The page tabs in the header (`a.ptab`, `data-ptab` 0–3) aren't built yet. Make Essential Quote Info, Header Information, Shipping Information and Associations switch the main area to a mocked form for that tab.

- **Where it happens:** on the same page, with no reload. The tab's underline moves, and the URL hash is optional.
- **Product Selection:** it stays exactly as it is.
- **Admin: Calculations and Communications:** they stay unbuilt.

**Layout, from images 12–15:**
- The form sits on the left, in two columns of labelled fields. Required labels end in " *".
- The fields are:
  - 56px inputs and selects with a light border
  - lookups with a black square search button attached on the right
  - dates with a clear (×) icon on the left and a calendar icon on the right
- The Preview pane sits on the right, as in QOM (staging): the drawer tabs PDF Preview / Quote Information / Selected Products, then "→ Preview", Quote ID, Expires on, and the Draft pill.
  - Reuse the prototype's existing preview or quote-pane styles where they exist, rather than adding new ones.

**No per-tab Discard / Save buttons.** The step-track bar is the only Save, and it covers the whole quote. It sits across the bottom of every tab identically, full and collapsed. The page's bottom padding (`--bar-h`) has to clear it on every tab.

**Fields per tab** (copy the labels from the screenshots):
- **Essential Quote Info:** Customer * (info icon; lookup), Primary Specifier Contact * ("Search by client, then contact"; lookup), Order Type * (select), Order Subtype * (select), Requested Delivery Date * (date), Est. Conv. Date * (date).
- **Header Information:**
  - Sales Consultant * (lookup with clear), plus a black "+ Add sales consultant" button with the hint "You can add up to three (3) consultants"
  - Project (Optional) (lookup)
  - Payer * ("Bill To") (lookup), with a "Same as Customer" checkbox, checked
  - Status * (select)
  - Responsible * (lookup)
  - Expiration Date * (date)
  - Quote Description * (full-width text input with a 0/30 counter)
- **Shipping Information:** Delivery Address * ("Choose a Delivery Address"; lookup), Customer PO Number (text), Service Level * (select, "Standard Shipping (S01)"), Cost Center * (select), Accessorial Terms (select). Staging misspells the last placeholder as "Assessorial"; use "Select accessorial terms".
- **Associations:** Delivery Contact * ("Ship To"), Payer Contact * ("Bill To"), Primary Specifier Contact *, and Associated Party 2 to 6. All are "Search by name or email" lookups.

**Data:**
- Fill the forms with the prototype's own quote: its quote number, its customer (QUALITY FINISHES), and mock values that make sense for it.
- **Don't copy the names, customer or quote number from the screenshots.** They're from staging.
- Leave a few required fields empty where that matches the prototype's state. For example, Delivery Address stays empty while the "Delivery address missing" blocker is showing.

**Wiring:** keep it light, enough to show the bar working across tabs.
- Editing any field on these tabs marks the quote unsaved (`S.dirty`, counted in the unsaved-changes number). **Discard** in the bar reverts those fields too.
- Choosing a delivery address on Shipping Information sets `SEND.addr = true` and re-renders the bar. This is the same as the panel's "Add address" action.
- The panel's **Add address** action switches to the Shipping Information tab and focuses Delivery Address, instead of showing a toast.
- If the bar is collapsed or the panel is open, it stays that way when switching tabs.
- Don't add any new blockers or checklist items.

## 7. Don't change

- Panel content and order: Things to fix, To check, Checklist, Full breakdown.
- Copy elsewhere, toasts, focus return on close, keyboard order (total → steps left to right), and the 44px hit targets on small links.
- Colours: use the existing tokens (`--ink`, `--muted`, `--line`, `--done`, `--block`, `--prog`, `--amber`). The only new values are the disabled-button greys above.

## 8. Check before you finish

Do each of these and fix anything that's off:

- Switch through all five built tabs. The bar must be identical on each and never cover a field. Compare each mocked tab against its screenshot (12–15).
- Edit a field on Header Information, then check that the bar shows unsaved and that Discard reverts the field.
- Click "Add address" in the panel and check that it lands on Shipping Information. Pick an address and check that the blocker clears.

- Open v3 and go through Footer 1–5 and the empty quote in the Scenario menu at 1440px. Compare each against images 01–06.
- Collapse and expand the bar in Saved and Blocked. Compare with 07 and 08.
- Open the panel from **Full breakdown** and from **N to fix** at 1440, 1280, 1100 and 800px. Save, Freight and Send must never be hidden by the panel.
- Run freight from Saved and watch the progress line, then Ready and Recalculate.
- Tab through the bar with the keyboard.
- Turn on reduced motion.

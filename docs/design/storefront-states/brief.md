# Storefront states and catalogue interaction design

## Status

Approved — the product owner selected Variant A — Context shield on 2026-07-26.
See `approval.md` and the immutable artifacts under `approved/`.

## Inputs and fixed boundary

This record extends, but does not replace:

- `docs/design/storefront-layout/approval.md`
- `docs/design/storefront-layout/approved/desktop.png`
- `docs/design/storefront-layout/approved/mobile.png`
- `docs/tasks/DESIGN-003-storefront-states-and-interactions.md`
- `docs/tasks/SHOP-003-approved-storefront-and-product-groups.md`

Both variants preserve the approved `НОРВИ` shell, cool-neutral/cobalt language,
ordinary `Каталог` trigger, temporary desktop panel, bounded mobile sheet,
breadcrumbs, active result heading, result count, and product grid. Search and
cart remain non-functional placeholders.

## Goals

- Make groups and products independently loading, failed, empty, or recovered
  without suggesting the wrong resource failed.
- Keep the current canonical group obvious after navigation closes and while
  products refetch.
- Prevent old products from appearing to belong to a newly selected group.
- Define pointer, keyboard, screen-reader, focus, scrolling, and reduced-motion
  behaviour tightly enough that implementation does not invent interaction.

## Shared content and visual rules

- Store name: `НОРВИ`.
- Group examples remain realistic Russian names and include the deliberately
  long `Телевизоры, аудио и домашние кинотеатры`.
- Error copy is shopper-safe. Raw status codes and validation details are never
  shown.
- Product result states reserve the result-area height, preventing header and
  retry controls from jumping.
- Primary action is cobalt `#5147e5`; body text is ink `#172036`; secondary text
  is `#69738c`; page/skeleton surfaces are cool neutral. Error surfaces use a
  restrained warm border/background and dark red text.
- Focus uses a 3 px indigo outline with 3 px offset. Selected options also use a
  leading checkmark and medium-weight label, so colour is not the only cue.
- Body text is intended at 4.5:1 or better and meaningful UI boundaries at 3:1
  or better against adjacent surfaces. Exact token contrast remains a
  verification item during implementation.
- Minimum interactive target: 44 × 44 CSS px on mobile; 36 px minimum on
  desktop, with 44 px used for primary and retry controls.

## Variant A — Context shield (recommended)

### Core idea

The active heading changes immediately when the shopper chooses a group.
During a refetch the old product grid is replaced by same-size skeleton cards
inside a labelled, bounded result surface. This is the strongest protection
against stale products being attributed to the new group.

### State decisions

- **Initial load:** heading and count use stable skeleton lines; four desktop or
  two mobile product skeleton cards fill the normal grid footprint. An
  unobtrusive `Загружаем товары` status appears above the skeletons.
- **Refetch:** new group heading and `Обновляем товары` appear immediately. Old
  cards are replaced with skeletons; the catalogue remains operable.
- **Product failure:** result grid is replaced by a compact error card under the
  current group heading. `Повторить загрузку` retries the current canonical
  selection.
- **Group failure:** the loaded all-products result remains fully usable. The
  open panel/sheet contains `Категории временно недоступны` and `Повторить`.
  Only `Все товары` is available.
- **Both failed:** the group error stays within navigation and the product error
  stays in results; each has its own adjacent retry.
- **Empty all products:** `В магазине пока нет товаров` with no misleading group
  escape action.
- **Empty selected group:** `В этой категории пока нет товаров` plus
  `Показать все товары`, which canonicalizes the URL and requests all products.
- **Recovery:** the error surface is removed. The successful heading, count,
  grid, and navigation state replace it in place.
- **Unknown slug:** quietly canonicalizes to all products. A polite live
  announcement says `Категория недоступна. Показаны все товары`; no error card.
- **Rapid switching:** every activation updates selection and heading
  immediately. One loading status names the latest group; superseded requests
  never receive a visible completion announcement.

### Navigation and focus

- Desktop panel is **non-modal** and anchored below the navigation row. Trigger
  has `aria-expanded`; opening moves focus to the selected option, otherwise
  `Все товары`. Tab moves through options, retry, and close control, then
  continues to page content. Arrow Up/Down moves option focus; Home/End moves to
  first/last. Focus is not trapped.
- Mobile sheet is **modal**, labelled `Каталог товаров`, with a scrim and
  `aria-modal="true"`. Opening focuses the selected option, otherwise
  `Все товары`. Focus is trapped between the close button and the last
  actionable option/retry. The page behind it is inert.
- Repeated trigger activation toggles navigation. Selection closes it and
  returns focus to `Каталог`. Escape closes and returns focus. Desktop outside
  click and mobile backdrop tap close and return focus. Explicit `Закрыть`
  always does the same.
- If the focused backend group disappears after refresh, focus moves to
  `Все товары`. If the group request fails, focus moves to its error heading;
  the next Tab reaches `Повторить`.
- Mobile sheet is at most `min(82dvh, 660px)`. Header and close control are
  sticky; only the option list scrolls. Long labels wrap to two or more lines;
  no horizontal scrolling.

### Announcements

- Trigger accessible name is `Каталог товаров`; expanded state comes from
  `aria-expanded`.
- Options use a single-select listbox pattern (`role="option"`,
  `aria-selected`) with ordinary tab entry and arrow navigation. The selected
  group is repeated in the page `h1`.
- A polite atomic status region announces:
  `Загружаем товары`, `Обновляем товары: <group>`,
  `<n> товаров, <group>`, successful retry, and canonical recovery.
- Errors use `role="alert"` once per failed request. Retry buttons are associated
  with the relevant error heading via `aria-describedby`.
- Skeletons are decorative; the result region uses `aria-busy="true"`.

### Motion

- Panel fades/translates 8 px over 160 ms; sheet translates 24 px and scrim
  fades over 180 ms. Skeleton shimmer uses 1.4 s.
- Under `prefers-reduced-motion: reduce`, transforms and shimmer are removed;
  navigation appears/disappears immediately and skeletons use a static fill.
  Text, busy state, and announcements carry the same meaning.

### Strengths and risks

- Strongest stale-content protection and clearest implementation contract.
- Stable, familiar retail hierarchy and relatively low cognitive load.
- Skeleton replacement removes visual continuity during refetch and may feel
  slower on a fast response. It also requires careful fixed dimensions to avoid
  layout shift.

## Variant B — Confirmed transition

### Core idea

Previously loaded products remain visible during refetch, but inside a visibly
disabled `previous result` layer. A strong status banner above the grid names
the requested group and states that shown products belong to the preceding
selection. The new heading is shown as the requested context.

### State decisions

- **Initial load:** one bounded neutral loading card with a compact spinner and
  clear text replaces the grid.
- **Refetch:** previous cards remain at 45% opacity, are non-interactive, and are
  covered by a subtle diagonal wash. The banner reads
  `Загружаем «Техника для кухни» · ниже предыдущая подборка`.
- **Product failure:** previous products may remain as explicitly labelled
  `Предыдущая подборка` beneath the error card; they remain non-interactive.
  With no prior success, only the error card is shown.
- Group failure, empty states, canonical recovery, and scoped retries follow the
  same business outcomes as Variant A but use outlined notice bars rather than
  filled cards.
- Rapid switching updates the requested group in the banner immediately and
  keeps at most the latest successful previous grid as non-current context.

### Navigation and focus

- Desktop panel is **non-modal**. It keeps DOM focus on the trigger when opened;
  Arrow Down enters the selected option, while Tab follows document order into
  the first option. Outside click, repeated trigger, Escape, explicit close, and
  selection close it and restore focus to the trigger.
- Mobile sheet is **modal** and uses the same focus trap, inert background,
  bounded internal scrolling, Escape, backdrop, selection, and explicit-close
  rules as Variant A. Opening focuses the close button first; Tab reaches the
  selected option next.
- Options use native button semantics in a labelled group rather than a
  listbox. Selected buttons expose `aria-pressed="true"`. Arrow Up/Down is a
  convenience and does not replace Tab.
- A disappearing focused group moves focus to the catalogue heading and
  announces that categories changed.

### Announcements and motion

- Status/error announcements and scoped retry associations match Variant A.
- The result heading is followed by visually hidden context text clarifying
  whether the grid is current or previous.
- Motion duration and reduced-motion handling match Variant A. The disabled
  previous-grid wash is static under reduced motion.

### Strengths and risks

- Preserves spatial continuity and lets shoppers remember items while waiting.
- More informative during slow networks.
- Higher cognitive and accessibility risk: despite explicit labelling, visible
  old products can still be mistaken for the newly selected group. The mobile
  result surface is also visually busier.

## Responsive rules shared by both variants

- At 1440 × 1000 content uses the approved 1320 px maximum and four-column
  product grid. Panel is anchored to the shell and never covers the trigger.
- At 375 × 812 the compact approved shell remains. Result cards use two columns
  when loaded; state cards span both. Long headings wrap naturally.
- The mobile sheet is inset 12 px from viewport edges and bottom, never extends
  behind the top browser-safe area, and never owns page horizontal overflow.
- Backdrop scroll is locked while the sheet is open. Scrolling the internal list
  at either boundary does not scroll the page behind it.

## Artifact index

Each board is a deterministic HTML/CSS composition captured at the stated CSS
viewport. The runnable source is
`docs/design/storefront-states/exploration/prototype.html`.

### Variant A — Context shield

- `exploration/variant-a/desktop-overview.png` — loaded selected result and
  open non-modal panel, 1440 × 1000.
- `exploration/variant-a/mobile-overview.png` — loaded result and open modal
  sheet with long scrolling list, 375 × 812.
- `exploration/variant-a/desktop-matrix.png` — initial load, refetch,
  all/selected empty, group/product/both failure and recovery summaries.
- `exploration/variant-a/mobile-matrix.png` — same state contract at the
  mobile viewport.
- `exploration/variant-a/desktop-interactions.png` — trigger/option
  rest-hover-focus-selected states, close rules, focus lifecycle.
- `exploration/variant-a/mobile-interactions.png` — modal boundary, focus trap,
  sticky close, long names and scroll.

### Variant B — Confirmed transition

- `exploration/variant-b/desktop-overview.png`
- `exploration/variant-b/mobile-overview.png`
- `exploration/variant-b/desktop-matrix.png`
- `exploration/variant-b/mobile-matrix.png`
- `exploration/variant-b/desktop-interactions.png`
- `exploration/variant-b/mobile-interactions.png`

## Comparison checklist

| Decision | Variant A — Context shield | Variant B — Confirmed transition |
| --- | --- | --- |
| Initial products | Grid-shaped static/shimmer skeletons | One bounded loading surface |
| Refetch | Replace old grid with skeletons | Preserve disabled, explicitly previous grid |
| Stale-group risk | Low | Medium despite labelling |
| Product failure | Current-context replacement card | Error plus optional disabled previous result |
| Group failure | Filled error block in open navigation | Outlined notice in open navigation |
| Empty selected | Group-specific card + `Показать все товары` | Notice bar + same action |
| Desktop open focus | Selected option | Trigger; Arrow Down enters |
| Desktop semantics | Non-modal listbox | Non-modal button group |
| Mobile open focus | Selected option | Close button |
| Mobile semantics | Modal listbox sheet | Modal pressed-button sheet |
| Reduced motion | Static skeletons, instant panel/sheet | Static wash, instant panel/sheet |
| Implementation risk | Low–medium | Medium |

## Recommendation

Recommend **Variant A — Context shield**. It makes the newest canonical
selection authoritative at every visible layer and provides the most robust
answer to the task's central race-condition risk. Its state model is easier to
test and announce, while preserving the approved visual hierarchy.

## Designer self-review

- Primary actions are adjacent to the resource that failed or is empty.
- All required async and combined states are represented in both viewport
  matrices.
- Mobile interactions do not rely on hover and retain a reachable sticky close.
- Focus, loading, error, disabled/previous, selected, and retry treatments are
  explicit.
- Selection is communicated by heading, checkmark/pressed state, weight, and
  colour.
- Layout, copy, responsive behaviour, and motion are feasible with Angular 21
  and native HTML/CSS.
- No production presentation code or business rule was changed.

## Open implementation verification risks

- Actual text and UI-boundary contrast must be measured against the final
  reusable tokens.
- Mobile focus trapping, inert background, and scroll-boundary behaviour need
  browser tests on WebKit and Chromium.
- Live-region de-duplication during rapid switching must be tested so obsolete
  request completions are silent.
- The approved happy-path product imagery remains placeholder-like; SHOP-003
  should use deterministic local assets without changing card hierarchy.

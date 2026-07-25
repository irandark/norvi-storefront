# DESIGN-003: Design storefront states and catalogue interactions

## Status

Done — the product owner approved Variant A — Context shield and its complete
desktop/mobile state and interaction contract on 2026-07-26; see
`docs/design/storefront-states/approval.md`.

## User value and final outcome

A shopper always understands what the storefront is doing while product groups
or products load, fail, return no results, or refresh. The shopper can identify
the selected group, recover from failures, and operate the catalogue panel or
sheet with pointer, keyboard, and assistive technology.

The approved result must extend the existing Northstar Market visual language
without changing the approved shell hierarchy, working store name, palette, or
progressive-disclosure direction.

## Design

Design: Required.

This task defines material user-visible states, responsive interaction, and
accessibility presentation that were explicitly excluded from `SHOP-002`.
Production presentation work for `SHOP-003` remains blocked until a human
explicitly approves one named DESIGN-003 variant.

## Existing design boundary

The designer must preserve:

- `docs/design/storefront-layout/approval.md`
- `docs/design/storefront-layout/approved/desktop.png`
- `docs/design/storefront-layout/approved/mobile.png`

The existing screenshots remain the source of truth for the loaded shell,
header, breadcrumbs, catalogue entry point, desktop panel, mobile sheet, active
group heading, result count, and product grid.

Material changes to those approved decisions require a clearly identified
proposal and renewed human approval; they must not be introduced silently while
designing states.

## Behavioural context

DESIGN-003 supplies the state and interaction design required by:

- `docs/tasks/SHOP-003-approved-storefront-and-product-groups.md`

Relevant fixed behaviour:

- `Все товары` is available independently of backend-provided groups.
- Backend groups retain backend order.
- Selecting a group updates `?group=<slug>` and starts a backend-filtered product
  request.
- A later selection supersedes an unfinished earlier request.
- Unknown or removed slugs canonicalize to `Все товары` with the query removed.
- Result count is the number of products in the latest successful response.
- Retry repeats the relevant request for the current canonical selection.

The designer may choose presentation and interaction patterns, but must not
change these business rules.

## Required design surfaces

Every review-ready variant must cover the following surfaces at both
`1440 × 1000` desktop and `375 × 812` mobile where the state can occur.

### Storefront and results

- Initial shell before product groups and products have resolved.
- Loaded all-products result.
- Loaded selected-group result.
- Product results while a new group is being fetched.
- Successful empty result for all products.
- Successful empty result for a selected group.
- Initial product-request failure.
- Selected-group/refetch product-request failure.
- Successful recovery after product retry.
- Product count, active heading, and selected-group context in loaded, loading,
  empty, and failure states.

### Product-group navigation

- Catalogue trigger at rest, hover where relevant, keyboard focus, open, and
  expanded states.
- Desktop temporary progressive-disclosure panel.
- Mobile bounded catalogue sheet and its backdrop/boundary treatment.
- `Все товары`, unselected backend group, selected backend group, hover where
  relevant, focus, and activation states.
- Initial group loading.
- Successful group response.
- Successful empty group response, leaving `Все товары`.
- Group-request failure with an explicit recovery action.
- Successful recovery after group retry.
- Long realistic group names and a list long enough to require bounded
  scrolling on mobile.

### Combined and degraded states

- Groups loading while all-products loading succeeds or remains unresolved.
- Group request fails while the all-products request succeeds.
- Product request fails while group navigation is available.
- Both requests fail.
- A refetch starts while previously loaded products are visible.
- Rapid group switching while a product request is unresolved.
- A URL-selected group restored on reload.
- An unknown or removed URL slug recovering to `Все товары`.

## Decisions each variant must make explicit

The designer must document, visualize, and compare:

1. Whether initial product loading uses skeletons, a bounded loading surface, or
   another concrete treatment.
2. Whether refetch preserves existing products, replaces them with skeletons,
   or uses another treatment; the design must prevent stale products from
   appearing to belong to the newly selected group.
3. Whether a group-request failure leaves successfully loaded all-products
   content usable as a degraded mode, and how unavailable group navigation is
   explained and retried.
4. Whether product errors replace the result surface or preserve prior content,
   and how retry remains associated with the current group.
5. How empty all-products copy differs from empty selected-group copy and how
   the shopper can return to `Все товары`.
6. How the selected group remains perceivable after the panel or sheet closes.
7. Exact open/close behaviour for repeated trigger activation, group selection,
   Escape, outside click/backdrop, and any explicit close control.
8. Whether the desktop panel is modal or non-modal and whether the mobile sheet
   is modal; define focus containment accordingly.
9. Initial focus on open, keyboard movement between groups, tab order, focus
   return on close, and behaviour when the focused group disappears after data
   refresh.
10. Screen-reader naming and state announcements for the trigger, selected
    group, loading, result changes, errors, retry, and canonical recovery.
11. How motion communicates opening, closing, loading, and refresh, including
    the equivalent under `prefers-reduced-motion`.
12. How mobile scrolling behaves when the group list exceeds the bounded sheet,
    without creating page-level horizontal overflow or trapping the shopper.

These are approval decisions, not details to leave for the developer.

## Functional requirements

- Every asynchronous state has an unambiguous visible presentation.
- Loading, empty, and failure surfaces are mutually understandable and cannot
  be mistaken for a loaded catalog.
- Failures use shopper-safe copy and never expose HTTP status, DTO validation
  details, or raw exceptions.
- Every recoverable failure provides a clearly associated retry action.
- Product retry preserves the current canonical group context.
- Group retry does not invent or retain backend groups that are no longer
  valid.
- Rapid switching visibly communicates the current selection and never presents
  an older result as current.
- Selected state is not conveyed by colour alone.
- The catalogue can be opened, traversed, selected, and closed without hover.
- The mobile design remains bounded and usable with long group lists.
- Unknown-slug recovery must not be presented as an unrecoverable error.

## Non-functional requirements

- Continue the approved cool-neutral and cobalt/indigo visual language.
- Preserve approved information hierarchy and responsive direction.
- Intended text and meaningful UI-state contrast must meet WCAG 2.2 AA.
- Focus indicators must be visible against every surface they appear on.
- State changes must not cause avoidable layout shifts that obscure the current
  task or move controls unexpectedly.
- Loading indicators and panel/sheet transitions must respect reduced-motion
  preferences.
- Controls must have practical pointer/touch targets at both viewports.
- Designs must be feasible with Angular 21, native HTML/CSS, existing tokens,
  and no new UI or state-management library.
- Mockups use realistic Russian content and product/group names rather than
  meaningless placeholders.

## Acceptance criteria

1. Two or three meaningfully different variants are produced; differences
   include hierarchy or interaction strategy, not only colour.
2. Every variant includes desktop and mobile artifacts for loaded, initial
   loading, refetch, empty, group failure, product failure, and combined failure
   scenarios.
3. Every variant shows selected, hover where relevant, and keyboard-focus
   treatments for the catalogue trigger and group options.
4. Every variant defines desktop-panel and mobile-sheet open/close behaviour for
   trigger activation, selection, Escape, outside/backdrop action, and explicit
   close controls.
5. Every variant defines modal/non-modal semantics, initial focus, focus
   containment where applicable, tab order, group keyboard navigation, and
   focus return.
6. Every variant documents screen-reader roles, accessible names, expanded and
   selected state, live announcements, and retry/error association.
7. Every variant explicitly resolves stale-content versus skeleton/loading
   behaviour for initial load and refetch.
8. Empty all-products and selected-group states are distinct, actionable, and
   consistent with fixed product behaviour.
9. Group failure, product failure, and both-failed states identify what failed
   and expose only relevant recovery actions.
10. Selected group and result context remain clear while the navigation is
    closed and while products refetch.
11. Long group names and overflow are demonstrated without horizontal scrolling
    at 375 CSS pixels.
12. Reduced-motion behaviour and intended WCAG AA contrast are documented.
13. Each variant records strengths, risks, trade-offs, responsive rules, and
    implementation feasibility.
14. The designer recommends one variant but does not mark it approved.
15. A human explicitly selects a named variant; the immutable approval record
    lists all approved artifacts and any intentionally open implementation
    details.

## Edge-case matrix

| Scenario | Design must communicate or enable |
| --- | --- |
| Groups and products initially loading | Storefront purpose, progress, and stable layout without false empty content. |
| Groups slow, all products loaded | Products remain understandable; group navigation status is distinct. |
| Groups fail, all products load | Clear degraded navigation state and group retry without implying products failed. |
| Groups empty | `Все товары` remains usable; no false failure message. |
| Products fail, groups load | Current group remains clear; product retry is available. |
| Both requests fail | Distinguishable failures and correctly scoped recovery actions. |
| Selected group returns no products | Group-specific empty message and route back to `Все товары`. |
| All products empty | Store-wide empty message without suggesting a narrower group. |
| Group A → B while A loads | B is visibly selected/current; A content cannot appear current. |
| Refetch with prior products | Treatment explicitly prevents stale-group misattribution. |
| Retry succeeds | Error clears and current result context is restored. |
| Unknown/removed slug | Quiet recovery to `Все товары`; no dead-end state. |
| Panel/sheet opens by keyboard | Focus enters an intentional destination and state is announced. |
| Escape closes navigation | Focus returns to the ordinary `Каталог` trigger. |
| Outside/backdrop action | Behaviour is explicit and consistent with modal choice. |
| Focused group disappears | Focus moves to a predictable surviving control. |
| Long names/list | Wrapping, scrolling, touch targets, and close access remain usable. |
| Reduced motion | Equivalent state communication without required animation. |

## Required design artifacts

Create:

```text
docs/design/storefront-states/
├── brief.md
├── approval.md
├── exploration/
└── approved/
```

The review set may use static mockups, a non-production prototype, or both, but
must include:

- desktop and mobile overview boards for each variant;
- state matrices covering all required surfaces;
- focused interaction frames for panel and sheet;
- annotated keyboard, focus, screen-reader, responsive, retry, refetch, and
  reduced-motion behaviour;
- variant trade-off notes and a recommendation.

Artifacts must be specific enough that SHOP-003 implementation does not invent
layout, hierarchy, copy, spacing, typography, colour, motion, or interaction
semantics for the covered states.

## Approval boundary

Human approval must explicitly name:

- the chosen variant;
- the approved desktop and mobile state artifacts;
- initial-loading and refetch strategy;
- group, product, and combined failure treatment;
- all-products and selected-group empty treatment;
- selected and focus treatment;
- desktop-panel and mobile-sheet semantics;
- open/close events and focus lifecycle;
- retry placement and copy;
- screen-reader announcement approach;
- reduced-motion treatment;
- any details intentionally delegated to implementation.

Approval of one screenshot or silence is insufficient. Only the product owner
may change `approval.md` to `Approved`.

## Scope

- Presentation of initial loading, refetch, empty, product failure, group
  failure, and combined failure.
- Selected, hover, focus, expanded, and recovery states.
- Desktop catalogue-panel and mobile catalogue-sheet interaction semantics.
- Keyboard, screen-reader, motion, contrast, and responsive annotations.
- Human review iterations and immutable approval record.

## Explicit exclusions

- Production Angular, HTML, SCSS, domain, data-access, fixture, or test changes
- Changing SHOP-003 business rules or mock API contract
- Real backend implementation
- Search behaviour and results
- Cart behaviour
- Nested groups
- Sorting, facets, pagination, and product details
- Authentication and checkout
- New branding, store name, base palette, or shell hierarchy
- Third-party design-system or implementation dependencies

## Assumptions

- The SHOP-002 approved loaded layout remains authoritative.
- State designs can refine the content inside approved surfaces without
  replacing the global hierarchy.
- `Все товары` and product cards can remain meaningful independently of group
  response success.
- The designer can use the deterministic SHOP-003 mock contract to model
  realistic state data without defining backend implementation.
- Russian storefront copy remains the design language.

## Dependencies

- `SHOP-002` — approved layout and product-group navigation
- `SHOP-003` analyst specification — fixed behaviour and state inventory
- Existing Northstar Market tokens and current catalog behaviour as feasibility
  context

`DESIGN-003` blocks `SHOP-003` from moving to `Ready` or beginning presentation
implementation until explicit human approval.

## Risks

- Too many disconnected state frames may hide transitions; interaction notes or
  a prototype must make sequences explicit.
- Preserving stale products during refetch can misrepresent group ownership if
  selection context is weak.
- Replacing content during refetch can create disruptive layout shifts.
- Group and product failures can be conflated, causing the wrong retry action.
- Modal semantics chosen inconsistently across viewports can break focus
  expectations.
- Static mockups alone may not communicate scroll, focus, and announcement
  behaviour; annotated flows are mandatory.
- A state design that materially changes SHOP-002 requires renewed approval of
  the affected shell decisions.

## Accepted deferrals

- Search and cart interaction states
- Nested-group disclosure
- Sorting, facet, pagination, and product-detail states
- Real-backend latency, authorization, rate-limit, and offline policies
- Additional viewports beyond the required desktop and mobile sources of truth

## Verification

Before human review, the designer self-reviews every variant against
`docs/agents/designer.md` and records:

- complete required-state coverage;
- desktop/mobile correspondence;
- keyboard and focus walkthrough;
- screen-reader semantics and announcements;
- contrast intent and visible-focus checks;
- long-content and overflow review;
- reduced-motion equivalent;
- feasibility with existing tokens and stack;
- strengths, risks, and trade-offs.

The human review compares each proposal with the immutable SHOP-002 references
and confirms that fixed SHOP-003 behaviour is preserved.

## Definition of done

- The required design folder and records exist.
- Two or three materially distinct, self-reviewed variants are ready for review.
- All acceptance criteria and state-matrix rows are covered by artifacts and
  annotations.
- The designer records a recommendation without self-approval.
- The product owner explicitly approves one named variant and all required
  surfaces.
- `approval.md` records `Approved`, approving human, date, artifact paths,
  requested changes, approval boundary, and implementation-delegated details.
- Approved artifacts are immutable and superseded exploration is handled
  according to the product owner's direction.
- DESIGN-003 backlog and detailed-task statuses are synchronized.
- The approved record is linked from SHOP-003 before SHOP-003 moves to `Ready`.

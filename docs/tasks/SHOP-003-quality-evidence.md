# Quality evidence: SHOP-003

## Intake

- Analysis verdict: Complete; the local mock contract, unknown-slug
  canonicalization, and dependency on `DESIGN-003` are resolved in the task
  specification.
- Design verdict: Approved Variant A — Context shield.
- Human approvals: Variant A in full for desktop and mobile, recorded on
  2026-07-26 in `docs/design/storefront-states/approval.md`.
- Role activation plan: orchestrator, architect, developer, tester, reviewer,
  and documentation steward.
- Exemptions and rationale: none.

## Delivery loop — iteration 1

- Iteration: 1.
- Reason for this iteration: pre-implementation architecture boundary review.
- Active roles: architect; remaining roles pending orchestrator activation.
- Architect verdict: Blocked on final recheck — the layer boundaries are
  preserved, but the URL activation race and missing boundary evidence in
  A-002/A-003 must be corrected before the architecture gate passes.
- Developer evidence: vertical slice implemented on
  `feat/shop-003-storefront-groups`: deterministic local API, validated group
  and product transports, domain port/repository mapping, URL-driven canonical
  selection, cancellable latest-only requests, scoped retry/state handling,
  approved responsive panel/sheet and storefront presentation, focused tests,
  and synchronized module context.
- Tester verdict: **Blocked** — three P1 findings are open; see the independent
  tester matrix, commands, and `T-*` findings below.
- Coverage (lines / statements / functions / branches):
  100% / 100% / 100% / 99.45% (`npm run test`, 68 tests).
- Coverage exclusions reviewed: no new exclusions.
- Reviewer verdict: pending.
- Documentation verdict: pending.
- Module context files checked: `src/app/CONTEXT.md` and
  `src/app/features/catalog/CONTEXT.md`; both require synchronization after the
  implementation changes their recorded surface and flow.

### Pre-implementation architecture constraints

#### Domain models and ports

- Add a distinct immutable `ProductGroup` domain model containing `id`, `slug`,
  and `name`; `Все товары` is a domain selection option, not a fabricated
  backend group or DTO.
- Keep the domain port expressed only in domain language. It must support
  loading ordered groups and loading products with an optional stable group
  identifier. No slug-to-id lookup, client-side filtering, endpoint, query
  parameter, DTO, or HTTP type belongs in the port.
- `CatalogService` remains the presentation-facing use-case boundary and owns
  group/product workflow state, canonical selection, independent retry context,
  and latest-request authority. Components observe domain models/state and
  invoke use cases; they do not orchestrate repositories or transports.

#### Mock HTTP contract, validation, and mapping

- Serve the deterministic repository-owned fixture through observable
  `/api/product-groups` and `/api/products[?groupId=...]` HTTP behaviour.
  Fixture data or development-server interception may live outside the Angular
  feature, but endpoint construction and query serialization belong only to
  `catalog/data-access/transport`.
- `CatalogHttpService` must request `unknown`, then validate it into DTOs.
  Group validation rejects a non-array, invalid fields, non-canonical slugs,
  duplicate IDs, and duplicate slugs before any domain value is emitted.
  Existing product validation remains at the same boundary.
- Repository adapters map validated `ProductGroupDto` and `ProductDto` values
  explicitly into domain models. Presentation and domain must not import DTOs,
  fixture modules, parsers, transports, repositories, or `HttpClient`.

#### URL ownership and async semantics

- The Angular Router adapter owns reading/writing `group` while preserving
  unrelated query parameters. Domain workflow owns resolving a requested slug
  against loaded groups, deciding the canonical selection, and requesting
  products by the resolved backend ID.
- Selecting a backend group pushes `?group=<slug>`; selecting `Все товары`
  removes only `group`. Unknown, malformed, empty, removed, or duplicate query
  values resolve to all products and emit a canonicalization instruction that
  the router adapter applies with history replacement, never a second history
  entry.
- Initial navigation, reload, back, and forward enter the same domain selection
  path as pointer/keyboard selection. Do not mirror URL state in an unrelated
  component signal that can drift from the canonical domain state.
- Product requests must use cancellable latest-only composition (for example
  `switchMap`) or an equivalently tested request-generation guard. A superseded
  request may neither replace products nor publish loading, success, empty,
  error, or live-announcement state for the current selection. Retry reads the
  current canonical selection at activation time.

#### State and component boundaries

- Group and product resource failures remain independently representable:
  group failure keeps all-products results usable and exposes only the
  frontend-owned option; product failure replaces only the current result
  surface. Each retry targets only its failed resource.
- Initial load, refetch, empty, error, and recovery are explicit domain/view
  states; refetch clears the visible old products for approved Variant A while
  retaining the new canonical heading. Raw validation/HTTP errors never cross
  into shopper copy.
- Route/page components may adapt Router events and own ephemeral panel/sheet
  state, focus, inertness, and keyboard behaviour. Product/group business state
  stays in `CatalogService`. Extract presentational children where useful, but
  pass domain models/state and emit user intent only.
- Preserve import direction:
  `presentation → domain`, `data-access → domain`, and `domain → domain`.
  Feature providers may wire implementations at the application boundary;
  component source must inject business dependencies through domain services
  only. Add no state-management, validation, or UI dependency.
- Behavioural tests must prove URL canonicalization, latest-wins and scoped
  retry in the domain workflow without Angular HTTP testing; transport tests
  prove exact encoded URLs; component tests replace the domain service; an
  integration test proves port-to-adapter DI.

## Delivery loop — iteration 2

- Iteration: 2.
- Reason for this iteration: recheck A-002/A-003 and the corrected observable
  mock HTTP boundary after iteration-1 findings.
- Active roles: developer, architect, tester, and reviewer; documentation
  steward pending.
- Architect verdict: Pass — A-002 and A-003 are closed; no layering or contract
  drift found.
- Developer evidence: see `Developer correction evidence — iteration 2`.
- Tester verdict: pending independent recheck.
- Coverage (lines / statements / functions / branches): developer reports
  100% / 100% / 100% / 100% across 69 unit tests; independent confirmation
  pending.
- Coverage exclusions reviewed: no new exclusions in the inspected diff.
- Reviewer verdict: pending.
- Documentation verdict: pending.
- Module context files checked: `src/app/CONTEXT.md` and
  `src/app/features/catalog/CONTEXT.md`; both describe the dev-server HTTP
  boundary and current URL/domain flow.

## Findings

| ID | Severity | Owner | Status | Evidence or accepted-risk decision |
| --- | --- | --- | --- | --- |
| A-001 | P3 | Architect | Closed | Iteration-2 diff inspected. `scripts/dev-server.mjs` now serves deterministic `/api/product-groups` and `/api/products[?groupId=...]` responses through real browser-observable HTTP outside the Angular bundle, strips fixture-only ownership before response, filters by the exact stable ID, and delegates non-API traffic to Angular. Transport continues to own endpoint/query construction and `unknown` validation; repositories map DTOs; application DI is the only implementation wiring point; domain/presentation imports obey the allowed direction; product unsubscription suppresses late success/error state and announcements; retries remain resource-scoped. |
| A-002 | P2 | Developer | Closed | `requestedSlug` now has a distinct initial `undefined` state. Group success or failure may settle first, but neither resolves selection nor requests products until `activateUrlSelection()` supplies `string` or `null`. Focused tests cover both groups-before-URL success and failure, and known selection still resolves to the backend ID before product loading. |
| A-003 | P2 | Developer / Tester | Closed | Focused tests now assert canonicalization navigation uses `replaceUrl: true`, removes only `group`, preserves `campaign`, and produces replacement history; domain tests cover stale success and stale error suppression; `app.config.spec.ts` resolves the domain port to `HttpProductCatalogRepository`; transport tests retain exact encoded URL checks; Playwright covers back/forward, current-selection retry, and reordered requests. Since announcements derive only from authoritative product state, unsubscribed stale callbacks cannot publish them. |
| T-001 | P1 | Developer | Closed in iteration 2 | The installed `mockCatalogApiInterceptor` returned `HttpResponse` objects inside the Angular process, so no browser-observable `/api/product-groups` or `/api/products` requests were made. Replaced by the independently verified local HTTP boundary; see iteration-2 disposition. |
| T-002 | P1 | Developer / Designer | Closed in iteration 4 | Exact and scenario-matched 1440×1000 and 375×812 captures independently confirm approved hierarchy, copy, palette, typography, density and panel/sheet geometry. See the iteration-4 disposition. |
| T-003 | P1 | Developer | Closed in iteration 2 | Opening originally failed to move focus because focus ran before `.catalog-navigation` rendered. Post-render focus, restoration, mobile trap/inert/scroll lock and close paths now pass independent Chromium checks; see iteration-2 disposition. |

## Independent tester evidence — iteration 1

### Risk matrix

| Risk | Level | Independent check | Result |
| --- | --- | --- | --- |
| Domain selection, retry, empty and latest-only transitions | High | Inspected service and unit suite; exercised full unit suite | Partial: unit tests pass; initial Router activation race remains `A-002` |
| DTO boundary and malformed/duplicate groups/products | High | Inspected parsers and parser/transport tests | Pass at unit boundary; browser boundary blocked by `T-001` |
| Exact endpoints, encoded group ID and backend-owned ordering | High | Playwright routes and request URL capture | Blocked by `T-001` |
| Group/product failure, scoped retry and private-error suppression | High | Independent Playwright failure/recovery journeys | Blocked by `T-001` |
| Empty selected group and result count | High | Independent Playwright empty response journey | Blocked by `T-001` |
| URL preservation, canonical replacement, reload/back/forward | High | Independent Playwright navigation journeys | Only unknown-slug replacement passed; backend-owned known groups blocked by `T-001`; initial race is `A-002` |
| Rapid group switch, stale success/error | High | Delayed/reordered Playwright responses plus unit inspection | Browser evidence blocked by `T-001`; stale-error coverage missing under `A-003` |
| Desktop/mobile open-close, keyboard and focus lifecycle | High | Chromium at desktop and 375×812 | Failed opening focus (`T-003`); downstream focus assertions not claimed |
| Accessibility state/announcements | High | DOM role/name/state inspection and browser focus journey | Partial: roles, `aria-busy`, live region, inert/modal attributes exist; failure and focus recovery remain unverified |
| Responsive fit and approved visual design | High | Exact-viewport screenshots, overflow assertion, visual inspection | Material mismatch (`T-002`); mobile screenshot itself has no horizontal overflow |
| Architecture/import boundary | High | Full diff and import inspection | Layer imports are valid; HTTP observability is not (`T-001`) |
| Production coverage and exclusions | High | Independent full unit run and config review | Pass: all four metrics ≥99%; no exclusions added |

### Commands and exact results

- `git diff --check` — pass.
- `npm run lint` — pass: Angular lint, 7 style-token guard tests, and consumer
  token scan passed.
- `npm run test` — pass: 11 files, 68 tests. Coverage: statements
  **100% (241/241)**, branches **99.45% (181/182)**, functions
  **100% (71/71)**, lines **100% (203/203)**. The only reported uncovered
  branch is `catalog-page.ts:135`.
- `npm run build` — pass with a warning: `catalog-page.scss` is **7.38 kB**,
  exceeding the configured **4.00 kB** budget by **3.38 kB**.
- `npm run e2e` in the default filesystem sandbox — infrastructure failure:
  `listen EPERM 127.0.0.1:4200`; not counted as a product result.
- `npm run e2e` with approved localhost binding — **failed: 1 passed, 7
  failed**, 32.5 s. Failures reproduce `T-001` across observable API ordering,
  back/forward with backend groups, race, group failure/retry, product
  failure/retry and empty response; the focus journey independently reproduces
  `T-003`.
- Headless Chromium screenshots at 1440×1000 and 375×812 — captured to
  `work/tester-visuals/desktop.png` and `work/tester-visuals/mobile.png` and
  visually compared against the approved SHOP-002 and DESIGN-003 PNGs;
  `T-002` is open.

### Coverage exclusions reviewed

No new `coveragePathIgnorePatterns`, V8/Istanbul ignore directives, generated
production modules, fixture exclusions, declaration exclusions, or threshold
reductions were introduced. Existing test/configuration files are outside the
production-code metric. The measured coverage clears the required 99% floor in
all four dimensions but does not mitigate the behavioural findings.

### Explicitly untested risks

- Successful browser-level invalid/duplicate DTO recovery, failure/retry,
  selected empty response, exact query serialization and reordered response
  authority cannot be verified until `T-001` is fixed.
- Focus after a failed/disappearing group, the full mobile trap cycle, backdrop
  close, and every approved state screenshot were not claimed after the first
  open-focus assertion failed.
- Reduced-motion animation suppression was inspected in CSS but not measured in
  a browser.
- Console warning/error freedom and full visual state matrix remain pending a
  corrected implementation and passing acceptance suite.

## Final gate

- Focused checks: iteration-2 architecture diff, import scan, HTTP mock
  contract, URL ownership, cancellation, scoped retry, and focused boundary
  tests inspected; architect recheck passes. `git diff --check` passes.
- `npm run verify`: pending.
- 99% coverage gate: pending.
- Visual comparison when applicable: pending.
- Open accepted risks: none.
- Orchestrator final status: pending.

## Developer correction evidence — iteration 2

- Replaced the Angular short-circuit interceptor with
  `scripts/dev-server.mjs`, a browser-observable deterministic `/api/*` HTTP
  boundary and Angular development proxy outside the production bundle.
- Added an explicit pre-Router pending selection; groups may settle first, but
  products are not requested until initial URL activation.
- Added focused coverage for groups-before-URL success/failure ordering,
  stale-error suppression, `replaceUrl`, preservation of unrelated query
  parameters, and application DI port-to-adapter wiring.
- Moved catalogue focus to post-render handling; added group-failure heading
  focus, fallback to `Все товары`, mobile header/result inertness, actual body
  scroll locking, and post-render trigger focus restoration.
- Aligned presentation to the approved cool-neutral/indigo compact shell,
  1320 px desktop geometry, three-column panel, compact four-column cards, and
  bounded mobile sheet.
- Moved storefront CSS to the global storefront surface, eliminating the
  component-style budget warning without raising a configured budget.
- Developer checks: lint pass; 69 unit tests pass with 100% statements,
  branches, functions, and lines; production build passes without warnings;
  tester-owned Playwright suite passes 8/8 Chromium journeys.
- Independent tester, reviewer, and architect rechecks remain required; the
  developer intentionally did not self-close their findings.

## Developer correction evidence — iteration 3

- Rechecked implementation directly against the immutable SHOP-002 and
  DESIGN-003 Variant A desktop/mobile PNGs.
- Restored the approved shell content and hierarchy: utility strip
  `Москва · Доставка сегодня`, full `Найти товар или категорию` search copy,
  plain `Корзина`, `Поддержка`, compact НОРВИ mark, and the complete mobile nav.
- Corrected result hierarchy so `Подборка Норви` sits directly above the left
  `h1`, while the result count is an independent right-aligned element.
- Corrected desktop panel structure and geometry: compact 1040 px overlay
  aligned to the 1320 px content edge, `Каталог товаров` eyebrow,
  `Выберите категорию` heading, Esc/close treatment, three-column options,
  keyboard hint, and all-products footer action.
- Corrected mobile sheet typography, sticky heading/close treatment, option
  heights, dividers, and spacing to match the approved bounded sheet.
- Removed collision-prone global storefront selectors. The budget-safe
  stylesheet is now fully nested beneath `app-catalog-page`; the ineffective
  global `:host` rule is gone. Component style budgets were not raised.
- Focused lint/unit/build checks pass; unit coverage remains 100% for
  statements, branches, functions, and lines; build is warning-free.
- Independent visual recapture and verdict remain assigned to the tester; the
  developer did not self-close `T-002`.

## Developer correction evidence — iteration 4

- Applied only measured scale/density corrections from the iteration-3 tester
  report while preserving the accepted desktop panel and mobile sheet bounds.
- Desktop shell top row is now 76 px; wordmark is 18 px with a 36 px mark and a
  reduced brand/search gap, placing the search start near the approved x=194.
- Desktop result `h1` is fixed at 40 px with a measured approximately 43 px
  line box; the former viewport-driven 72 px rendering is removed.
- Desktop options use 11.2 px type, 14 px line-height, a 38 px row and
  no wrapping. With the approved 11 backend groups plus `Все товары`, four rows
  yield the approximately 300–304 px compact panel target.
- Mobile brand/nav/options use compact 12–12.8 px / 10 px type and 44 px option
  rows so approved labels remain single-line inside the unchanged 351×660
  bounded sheet.
- Product heading/body/price/stock spacing remains compact and the four-column
  desktop / two-column mobile grid density is preserved.
- Developer Chromium measurements before the final row adjustment confirmed:
  desktop panel x=60, width=1040; h1 40 px with a 43.2 px line box; wordmark
  18 px; mobile sheet width=351 and option type=10 px. Independent tester
  recapture remains authoritative.
- `T-002` and task status were intentionally not self-closed or advanced.

## Developer correction evidence — iteration 5

- Removed blanket `white-space: nowrap` from desktop and mobile group options.
  Buttons retain their measured 38/44 px minimum target heights, while
  `minmax(0, 1fr)`, `min-width: 0`, automatic row height, and
  `overflow-wrap: anywhere` safely accommodate backend-owned labels of
  arbitrary length.
- Approved short labels remain naturally single-line at the iteration-4
  measured geometry.
- Added a 375×812 Playwright acceptance case with the deliberately long backend
  label `Профессиональное оборудование для приготовления напитков и домашней
  выпечки`. The test verifies multiple rendered text fragments, minimum target
  height, no option clipping, and no page horizontal overflow.
- Reviewer finding and task status were intentionally not self-closed or
  advanced.

## Independent tester recheck — iteration 2

### Verdict

**Blocked.** `T-001` and `T-003` are closed by independent browser evidence,
but `T-002` remains open at P1: the implementation is closer in colour and
overall direction, yet still does not visually match the explicitly approved
desktop/mobile artifacts at their recorded viewports.

### Finding disposition

| ID | Disposition | Independent recheck evidence |
| --- | --- | --- |
| T-001 | Closed | Playwright observes and fulfills real `/api/product-groups` and `/api/products` requests. Backend response order is rendered, `groupId=kitchen%20%26%20home` is captured exactly, controlled invalid/failure/empty responses work, scoped retries issue new requests, and reordered responses keep the latest group authoritative. |
| T-002 | Open — P1 | Exact 1440×1000 and 375×812 screenshots were recaptured after data load and after open animation. The corrected indigo/cool-neutral direction is visible, but desktop still has a materially different shell and panel geometry: the approved narrow search-dominant header/top strip and approximately 1040 px overlay are replaced by a large brand, short search placeholder and nearly full 1320 px panel; heading/grid alignment, typography, card content density and vertical rhythm also differ. Mobile brand/type/control scale, loaded content hierarchy and sheet header/options remain visibly larger and less compact than approved. No new human approval replaces the immutable PNGs, so acceptance criterion 1 is not met. |
| T-003 | Closed | Opening focuses the selected option after render on desktop and mobile; Arrow/Home/End and Escape work; repeated trigger, desktop backdrop/outside close, mobile backdrop and explicit close restore trigger focus. Group failure focuses its error heading. Mobile exposes `aria-modal=true`, makes header/main inert, traps focus, locks body scroll while open, unlocks on close, and has no horizontal overflow. |

### Iteration-2 risk matrix

| Risk | Independent evidence | Result |
| --- | --- | --- |
| Domain selection, initial Router ordering, retry, empty and latest-only transitions | Full service/unit suite plus observable Playwright journeys | Pass |
| Invalid group/product DTOs and controlled copy | Parser/transport units plus duplicate group ID and invalid product price through browser HTTP routes | Pass |
| Exact HTTP endpoints, encoded ID and backend ordering | Playwright route fulfillment and captured request URLs | Pass |
| Group/product failure and scoped retry | Independent 503/500 then-success browser journeys | Pass |
| URL preservation, canonical replacement and back/forward | Browser history journeys with unrelated `campaign` query | Pass |
| Cancellation and response races | Delayed A/B responses resolved newest then stale | Pass |
| Empty selected group and current count/action | Browser empty response and return-to-all action | Pass |
| Desktop pointer/keyboard/focus lifecycle | Selected focus, arrows, Escape, repeated trigger and backdrop | Pass |
| Mobile modal/inert/focus/scroll lifecycle | `aria-modal`, header/main inert, focus trap, body overflow lock, backdrop and restore | Pass |
| Responsive overflow and browser health | 375×812 measurement; console/page-error capture at both viewports | Pass: no horizontal overflow; zero console warnings/errors and page errors |
| Approved visual fidelity | Four exact-viewport screenshots compared to SHOP-002 and DESIGN-003 approved PNGs | Fail: `T-002` |
| Production coverage and exclusions | Independent `npm run test` and configuration/source review | Pass: all metrics 100%; no concealment exclusions |

### Commands and exact results

- `git diff --check` — pass.
- `npm run lint` — pass: Angular lint, 7 style-token guard tests and token scan.
- `npm run test` — pass: **11 files, 69 tests**. Statements
  **100% (240/240)**, branches **100% (184/184)**, functions
  **100% (68/68)**, lines **100% (201/201)**.
- `npm run build` — pass with no budget warning.
- First unchanged tester-owned `npm run e2e` recheck — **8/8 passed** in 3.2 s.
- Expanded tester-owned suite adds invalid DTO and backdrop/scroll-lock
  challenges. An intermediate locator-only failure attempted to click page
  content physically covered by the open panel and was corrected to click the
  actual backdrop; it did not identify or mask product behaviour.
- Final `npm run e2e` — **10/10 passed** in 3.5 s.
- Headless Chromium visual/health capture — exact viewport screenshots:
  `work/tester-visuals/iteration-2-desktop-loaded.png`,
  `work/tester-visuals/iteration-2-desktop-open.png`,
  `work/tester-visuals/iteration-2-mobile-loaded.png`, and
  `work/tester-visuals/iteration-2-mobile-open.png`. Both viewports reported
  zero console/page errors and no horizontal overflow; mobile open reported
  computed body `overflow: hidden`.

### Coverage exclusions reviewed

No V8/Istanbul ignore directive, production-path exclusion, generated
production module, declaration concealment, fixture concealment or threshold
reduction was added. Moving presentation styles to the global storefront
surface changes bundle ownership only and does not remove TypeScript production
behaviour from coverage. All four required metrics are independently measured
at 100%.

### Explicitly untested or pending risks

- Pixel-diff tooling is not installed; comparison was exact-viewport manual
  visual inspection of actual and approved PNGs. The differences in `T-002`
  are structural and do not depend on a pixel threshold.
- Reduced-motion CSS is present and inspected, but animation suppression was
  not timed in an emulated browser preference.
- Long backend group-list scrolling with enough items to reach the mobile
  sheet maximum was not independently replayed in iteration 2; the bounded
  scrolling CSS and approved-size sheet were inspected.
- Full screenshot capture of every loading/error/empty matrix cell remains
  pending visual alignment; their functional states are covered by unit and
  browser tests.

## Independent tester recheck — iteration 3

### Verdict

**Blocked.** The scoped CSS did not regress behaviour, accessibility, coverage
or responsive containment, and the iteration-3 hierarchy/copy/palette/panel
alignment is materially closer. `T-002` nevertheless remains P1 because
typography and resulting density/geometry still visibly diverge from the
immutable approved desktop and mobile artifacts.

### T-002 disposition

**Retained — P1.** Fresh screenshots confirm the corrected utility strip,
search/cart/nav copy, left-aligned 1040 px desktop overlay, panel eyebrow and
heading, Esc/close treatment, three-column ordering, keyboard footer, bounded
mobile sheet, selected treatment, dividers and indigo/cool-neutral palette.

The remaining differences are material rather than pixel noise:

- At 1440×1000, the approved compact brand/header typography is substantially
  smaller and leaves the search field beginning near x=194; the implementation
  brand occupies through approximately x=236 and the search begins near x=260.
- The implementation result heading is approximately 72 px/high (`h1` box
  measured 78 px) while the approved desktop heading is visually around half
  that scale. This changes the heading/count relationship and pushes the grid
  down.
- In a scenario matched to the approved group names/order, the desktop panel
  correctly measures x=60, y=168, width=1040, but grows to 362 px high; the
  approved panel is visibly more compact (approximately y=180 to y=484).
  Larger option text, wrapping and row spacing account for the difference.
- At 375×812, scenario-matched sheet bounds are correct at x=12, y=140,
  width=351, height=660, but brand, navigation, sheet heading and option text
  remain significantly larger than the approved mobile typography. The
  implementation wraps several labels to two lines where the approved artifact
  keeps them on one line, materially changing list density.
- Loaded desktop/mobile product typography and card content density remain
  larger and fuller than the approved compact card treatment.

No new human approval supersedes these artifacts. Acceptance criterion 1
therefore remains unmet.

### Regression matrix

| Surface | Independent iteration-3 result |
| --- | --- |
| Complete lint/unit/build/e2e gate | Pass |
| Observable API, invalid data, scoped failures/retries and race authority | Pass via unchanged tester browser journeys |
| URL canonicalization, unrelated-query preservation and back/forward | Pass |
| Desktop/mobile focus, Escape, backdrop, repeated trigger and restore | Pass |
| Mobile modal, inert background, focus trap and body scroll lock | Pass |
| Scoped CSS isolation | Pass by diff inspection, lint/build and browser rendering |
| 375 px horizontal containment | Pass |
| Browser console/page health | Pass: zero warnings, errors and page errors during capture |
| Approved hierarchy and copy | Pass |
| Approved palette and main panel/sheet alignment | Pass |
| Approved typography, density and resultant geometry | Fail — `T-002` |

### Commands and exact evidence

- `npm run verify` — pass end-to-end:
  - lint passed, including all 7 style-token guard tests;
  - unit: **11 files, 69 tests passed**;
  - coverage: statements **100% (240/240)**, branches **100% (184/184)**,
    functions **100% (68/68)**, lines **100% (201/201)**;
  - production build passed without warnings;
  - Playwright: **10/10 passed** in 3.3 s.
- Exact viewport captures:
  - `work/tester-visuals/iteration-3-desktop-loaded.png`
  - `work/tester-visuals/iteration-3-desktop-open.png`
  - `work/tester-visuals/iteration-3-mobile-loaded.png`
  - `work/tester-visuals/iteration-3-mobile-open.png`
- Scenario-matched captures use approved-style names/order and a selected
  group, separating dynamic fixture length from layout fidelity:
  - `work/tester-visuals/iteration-3-desktop-approved-scenario.png`
  - `work/tester-visuals/iteration-3-mobile-approved-scenario.png`
- Runtime measurements:
  - desktop open panel x=60, y=168, 1040×362; selected option focused,
    non-modal, no horizontal overflow;
  - mobile default-fixture sheet x=12, y=470, 351×330; matched-group sheet
    x=12, y=140, 351×660; `aria-modal=true`, main inert, selected option
    focused, body `overflow:hidden`, no horizontal overflow;
  - console/page issues: **0** at both viewports.

### Coverage exclusions and remaining limits

Coverage exclusions remain unchanged and legitimate; no ignore directive,
production-path concealment or threshold reduction was introduced. Pixel-diff
software remains unavailable, but the retained finding is supported by
scenario-matched exact-size screenshots and measured element boxes, and the
typography/density differences are large enough not to depend on a pixel
threshold. Reduced-motion timing and screenshots of every state-matrix cell
were not repeated; their CSS/behavioural coverage remains unchanged.

## Independent tester recheck — iteration 4

### Verdict

**Pass.** `T-002` is closed. The approved visual hierarchy, copy, palette,
typography, density and responsive panel/sheet geometry are now represented
closely enough at the exact approval viewports; remaining differences are
dynamic fixture content and normal browser text rasterization, not material
design departures.

### T-002 disposition

**Closed.** Fresh default-fixture and approved-scenario captures were compared
to the immutable SHOP-002 and DESIGN-003 desktop/mobile PNGs.

- Desktop shell alignment now matches: brand x=60 and 117×36 at 18 px; search
  begins x=193 (approved approximately x=194), spans 1099×44, and retains the
  approved search copy and utility/nav hierarchy.
- Desktop result heading is 40 px with a 43 px box, replacing the former
  72 px/78 px departure and restoring the approved heading/count/grid density.
- Scenario-matched desktop overlay is x=60, y=168, **1040×300**. Its 11.2 px
  option text, 14 px line height and 38 px rows reproduce the approved compact
  three-column matrix without unintended wrapping.
- Scenario-matched mobile sheet is x=12, y=140, **351×660**, matching the
  approved bounded sheet. Option typography is 10 px/12.5 px with 44 px
  targets; the approved group labels remain on one line. Brand typography is
  12 px and the shell/sheet density now follows the artifact.
- Selected fill/check, divider rhythm, eyebrow/heading/close treatment,
  keyboard/footer cues, overlay colours and card/result hierarchy visually
  align with the approved direction at both viewports.

### Exact evidence

- `npm run verify` — pass:
  - lint and all 7 style-token guards pass;
  - **69/69** unit tests pass;
  - coverage: statements **100% (240/240)**, branches **100% (184/184)**,
    functions **100% (68/68)**, lines **100% (201/201)**;
  - production build passes without warnings;
  - Playwright **10/10 passed** in 3.4 s.
- Fresh default captures:
  - `work/tester-visuals/iteration-4-desktop-loaded.png`
  - `work/tester-visuals/iteration-4-desktop-open.png`
  - `work/tester-visuals/iteration-4-mobile-loaded.png`
  - `work/tester-visuals/iteration-4-mobile-open.png`
- Fresh approved-scenario captures:
  - `work/tester-visuals/iteration-4-desktop-scenario.png`
  - `work/tester-visuals/iteration-4-desktop-scenario-open.png`
  - `work/tester-visuals/iteration-4-mobile-scenario.png`
  - `work/tester-visuals/iteration-4-mobile-scenario-open.png`
- Runtime health at both viewports: zero console warnings/errors and page
  errors, no horizontal overflow, selected option focused. Mobile open retains
  modal/inert state and `overflow:hidden`; desktop remains non-modal.

### Final tester risk statement

All high-risk behavioural rows from iteration 2 remain green under the complete
regression gate. The scoped typography/density correction does not regress API
observability, invalid-data handling, failure/retry, URL history, cancellation,
focus restoration, mobile focus trap, inert background, scroll lock or 375 px
containment. Coverage exclusions remain unchanged and legitimate. No open
tester finding or unaccepted tester-owned risk remains for SHOP-003.

## Delivery loop — iteration 5

- Iteration: 5.
- Reason for this iteration: final long-label correction and independent
  reviewer/documentation gates before pull-request delivery.
- Active roles: developer, architect, tester, reviewer, and documentation
  steward.
- Architect verdict: **Pass** — final layering, domain-port, DTO-validation,
  HTTP-boundary, URL-selection, and latest-request authority remain compliant.
- Tester verdict: **Pass** — all prior `T-*` findings are closed; the complete
  regression gate and approved-viewport comparisons pass.
- Reviewer verdict: **Approve** — no open blocking or non-blocking review
  finding remains after the long backend-label correction.
- Documentation verdict: **Current** (`Pass`) — backlog, task status, design
  links, quality evidence, and application/catalog module contexts match the
  final implementation.
- Module context files checked:
  `src/app/CONTEXT.md` and `src/app/features/catalog/CONTEXT.md`.
- Task status: **In review**. It cannot move to `Done` until its dedicated pull
  request passes mandatory CI and is merged.

### Documentation-steward evidence

Inspected the complete task diff and the authoritative product, architecture,
task, design-approval, quality-evidence, application-context, and
catalog-context records. Verified the documented ownership and flow against the
implementation:

```text
Router query adapter in CatalogPage
→ CatalogService
→ ProductCatalogRepository
← HttpProductCatalogRepository
→ CatalogHttpService
→ /api/product-groups and /api/products[?groupId=...]
```

The contexts correctly record frontend ownership of `Все товары`,
backend-owned group order and identifiers, slug-to-ID resolution inside the
domain workflow, DTO validation and mapping in data access, cancellable
latest-only product loading, approved Variant A refetch skeletons, root
provider wiring, and the browser-observable deterministic development server.
Key-file links and verification commands resolve to current repository paths.

`DESIGN-003` remains `Done` with its immutable human approval record. No
behavioural, architectural, or design conflict was found, and no intentional
documentation gap remains.

## Delivery closure

- Dedicated pull request:
  [#5](https://github.com/irandark/norvi-storefront/pull/5)
- Head commit after synchronization with `main`:
  `e3cf775f73a793513b8b352b585f0a98404a5a48`
- Mandatory CI: `quality-gate` completed successfully in workflow run
  `30178207203`.
- Merge method: squash.
- Merged into `main`: `2026-07-25T22:48:40Z`.
- Merge commit:
  `14a835a86fa674ce6fe3532452a2f2a858c63565`.
- Final status: **Complete / Done**. All exit-gate evidence is present and no
  required work remains.

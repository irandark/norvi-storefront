# SHOP-003: Implement the approved storefront layout and backend-owned product groups

## Status

Done — implementation and all independent specialist gates passed. Dedicated
[pull request #5](https://github.com/irandark/norvi-storefront/pull/5) passed
the mandatory `quality-gate` and was squash-merged into `main` as
`14a835a86fa674ce6fe3532452a2f2a858c63565`.

## User value and final outcome

A shopper can use the approved Northstar Market storefront on desktop and
mobile, open the catalogue navigation, browse groups in backend-defined order,
select a group, and see products loaded for that group by the backend boundary.
The selected group is represented in the URL and survives reload, back, and
forward navigation.

## Design

Design: Required.

The approved happy-path layout and catalogue hierarchy are defined by:

- `docs/design/storefront-layout/approval.md`
- `docs/design/storefront-layout/approved/desktop.png`
- `docs/design/storefront-layout/approved/mobile.png`
- `docs/design/storefront-states/approval.md`
- `docs/design/storefront-states/approved/desktop-overview.png`
- `docs/design/storefront-states/approved/mobile-overview.png`
- `docs/design/storefront-states/approved/desktop-matrix.png`
- `docs/design/storefront-states/approved/mobile-matrix.png`
- `docs/design/storefront-states/approved/desktop-interactions.png`
- `docs/design/storefront-states/approved/mobile-interactions.png`

`DESIGN-003` approved Variant A additionally defines loading, error, empty,
selected, refetch, and focus presentation, plus the open/close and focus
semantics of the desktop catalogue panel and mobile sheet.

## Functional requirements

### Storefront shell

- Implement the approved working store identity `НОРВИ`, header hierarchy,
  ordinary `Каталог` navigation entry, future-search placeholder, future-cart
  placeholder, breadcrumbs, catalogue surface, active-group heading, result
  count, and product grid.
- The search and cart affordances are visual placeholders only and must not
  imply working behaviour.
- Desktop uses the approved temporary progressive-disclosure catalogue panel.
- Mobile uses the approved bounded catalogue sheet rather than a horizontal
  group chip row.
- Opening, closing, keyboard, backdrop, and focus behaviour must follow the
  subsequently approved `DESIGN-003` record.

### Product groups

- `Все товары` is a frontend-owned option and is available even when the backend
  returns no groups.
- All other group names, stable identifiers, slugs, and ordering come from the
  group response. The frontend must not hardcode business groups or reorder
  them.
- Selecting a backend group sets `?group=<group-slug>`.
- Selecting `Все товары` removes the `group` query parameter.
- A known group slug resolves to that group's backend identifier before products
  are requested.
- An unknown, malformed, or removed group slug is canonicalized to
  `Все товары`: the `group` query parameter is removed with history replacement,
  and products are requested without a group identifier. Canonicalization must
  not add a redundant browser-history entry.
- Reload, browser back, and browser forward restore the group represented by the
  current URL and request matching products.

### Product loading

- `Все товары` requests the complete product collection from the backend
  boundary.
- A backend group requests products with that group's stable identifier. The
  browser must not fetch all products and hide non-matching items locally.
- Selecting a new group while an earlier product request is unresolved makes
  the newest selection authoritative. A late response for an older selection
  must not replace the newest result or state.
- The active heading reflects the canonical URL-selected group.
- The displayed result count is the number of products in the successful
  product response; the task does not introduce a separate count endpoint.
- Loading, refetch, empty, and failure behaviour must follow the approved
  `DESIGN-003` record. Retry must repeat the request for the current canonical
  selection.

## Local deterministic mock API contract

This task uses a repository-owned deterministic mock API until a real backend
is introduced. Although local, it represents a backend boundary: endpoint
details and DTOs remain in data access, responses are treated as `unknown`, and
the presentation must not depend on fixture paths or DTO types.

### Product groups

```http
GET /api/product-groups
```

Successful response: `200 application/json` containing an array in
backend-owned display order.

```text
ProductGroupDto {
  id: string   // non-empty, stable, unique
  slug: string // non-empty, unique, URL-safe: lowercase ASCII letters,
               // digits, and single hyphens between segments
  name: string // non-empty display name
}
```

The minimal contract deliberately excludes nested groups, images, and backend
count hints. An empty array is valid. A non-array response, invalid field,
duplicate `id`, or duplicate `slug` fails the group request as controlled
external-data failure.

### Products

```http
GET /api/products
GET /api/products?groupId=<percent-encoded-product-group-id>
```

Successful response: `200 application/json` containing an array of the existing
product DTO shape:

```text
ProductDto {
  id: string
  name: string
  description: string
  priceInCents: positive integer
  imageUrl: string
  stock: non-negative integer
}
```

Validation and mapping continue to honour the existing product specification
and domain model. The unfiltered endpoint returns all products. The filtered
endpoint returns only products assigned to the exact `groupId`; no matches is a
successful empty array. The mock data, product-to-group ownership, images, and
ordering must be deterministic and repository-owned.

The mock implementation must be replaceable by a real HTTP backend without
changing presentation or domain APIs. How the local development server serves
or intercepts these endpoints is an implementation detail for the architect
and developer; it must remain observable and testable as HTTP behaviour.

## Architecture constraints

- Preserve the required dependency flow:
  `presentation → domain service → domain port ← repository → transport`.
- Introduce an explicit domain `ProductGroup` model distinct from its DTO.
- Components inject domain services only and use domain models and use cases.
- Components must not coordinate group and product transports.
- URL-driven selection, request supersession, retry context, and workflow state
  belong behind the catalog domain use-case boundary; router adaptation may
  remain in presentation/application integration without exposing data access.
- DTO validation, URLs, query serialization, and response mapping remain in
  catalog data access.
- Do not introduce client-side product filtering, a state-management library,
  a runtime-validation dependency, or floating-point money.
- Update catalog and application-shell `CONTEXT.md` files when implementation
  changes their public surface or data flow.

## Non-functional requirements

- Match the approved desktop reference at `1440 × 1000` and mobile reference at
  `375 × 812`, with state-specific differences governed by `DESIGN-003`.
- No horizontal page overflow at 375 CSS pixels.
- Catalogue controls, groups, retry actions, and focus transitions are keyboard
  operable and expose appropriate names, roles, state, and visible focus.
- Loading and dynamic result changes are communicated accessibly according to
  the approved state design.
- All behaviour is deterministic in local development, unit tests, and browser
  tests; production behaviour must not depend on external image or API hosts.
- Maintain at least 99% line, statement, function, and branch coverage for
  production code.

## Acceptance criteria

1. The desktop and mobile loaded storefronts visually match their approved
   references at the recorded viewports.
2. `Каталог` opens the correct desktop panel or mobile sheet, and approved close
   and focus behaviour works by pointer and keyboard.
3. `Все товары` is rendered without relying on the group response.
4. Valid backend groups are rendered once, in response order, without hardcoded
   business-group names.
5. Selecting a group updates the URL slug and sends a product request with the
   corresponding backend `groupId`.
6. Selecting `Все товары` removes `group` and sends an unfiltered request.
7. Product cards always reflect the latest canonical URL selection.
8. Reload, back, and forward restore selection and matching products.
9. An unknown or invalid URL slug is replaced by the no-query canonical URL and
   recovers to all products without adding browser history.
10. A late superseded response cannot overwrite the latest selection's state.
11. Group and product DTOs are validated before domain mapping; invalid external
    data produces the approved controlled failure state.
12. Loading, group failure, product failure, retry, refetch, and empty results
    conform to the approved `DESIGN-003` record.
13. The result count equals the number of products in the successful response.
14. Existing price, stock, image-alt, empty, error, and retry guarantees remain
    intact unless explicitly refined by the approved state design.
15. Architecture lint checks continue to reject presentation-to-data-access and
    domain-to-data-access/HTTP imports.

## Edge-case matrix

| Scenario | Required result |
| --- | --- |
| No `group` query | Select `Все товары`; request `/api/products`. |
| Known slug | Select matching group; request products with its `id`. |
| Unknown, empty, or malformed slug | Replace URL with no `group`; load all products. |
| Group response is empty | Keep `Все товары` available and load all products. |
| Group response is invalid or fails | Show the approved group-failure state; do not invent groups. |
| Product response is empty | Show the approved empty state for the current selection and count `0`. |
| Product request fails | Show the approved failure state; retry current selection. |
| Rapid A → B selection | B stays authoritative even if A resolves last. |
| Back/forward during a request | Current URL becomes authoritative; stale response is ignored. |
| Duplicate group ID or slug | Treat the group response as invalid external data. |
| Group disappears after reload | Canonicalize its old slug to all products. |
| Group name contains display punctuation or non-Latin text | Render the backend name; URL still uses validated ASCII slug. |
| Extra unrelated query parameters | Preserve them when changing or removing only `group`. |
| Product count changes on retry/refetch | Render the latest successful response length. |

## Scope

- Approved storefront shell and responsive product-group navigation.
- Local mock group and filtered-product HTTP contracts.
- Domain/data-access additions for groups and group-aware product loading.
- URL synchronization and request supersession.
- Approved loading, failure, empty, selected, refetch, and focus states from
  `DESIGN-003`.
- Focused unit, integration, architecture, and browser coverage.

## Explicit exclusions

- Real backend or database deployment
- Search behaviour
- Cart interactions, quantities, persistence, and checkout
- Nested categories
- Sorting, facets, pagination, and product detail navigation
- Authentication and user accounts
- Server-side rendering
- Backend-provided group imagery or product-count metadata
- Third-party state-management, UI, or runtime-validation libraries

## Assumptions

- The existing product domain fields and invariants remain valid.
- Product and group response order is meaningful and preserved.
- The repository-owned mock is the temporary backend authority for development
  and tests, not a license to hardcode group ownership in presentation.
- `DESIGN-003` will not materially alter the already approved shell hierarchy,
  palette, working store name, or progressive-disclosure direction. If it does,
  this specification must be reviewed before implementation.

## Dependencies

- `SHOP-002` — approved storefront happy-path design (`Done`)
- `TD-001` — catalog domain boundary (`Done`)
- `TD-003` — reusable design tokens (`Done`)
- `DESIGN-003` — approved state and interaction design (required before this
  task may move to `Ready` or implementation)

## Risks

- A local mock could leak fixture details into domain or presentation; boundary
  tests must prevent this.
- Router and async request races can display products for the wrong group;
  deterministic supersession tests are mandatory.
- The approved screenshots do not cover every viewport or state; implementation
  must use responsive intent plus `DESIGN-003`, not invent a second design.
- Replacing the mock with a real backend may expose contract differences; the
  mock contract must be versioned here and changed explicitly.

## Accepted deferrals

- Real backend integration
- Optional group images and backend count hints
- Search, cart, nested groups, sorting, facets, pagination, and product details
- Any additional catalogue state not approved in `SHOP-002` or `DESIGN-003`

## Required verification

### Domain and data access

- Parse valid groups and reject every invalid or duplicate contract case.
- Map group DTOs into distinct domain models.
- Verify exact group and product request URLs and query encoding.
- Verify unfiltered and group-filtered repository results use domain models.
- Cover URL selection, canonicalization, navigation restoration, retry context,
  and latest-request-wins transitions without Angular HTTP utilities.

### Presentation

- Component tests provide fake domain services, not HTTP tools.
- Cover group ordering, `Все товары`, selected heading/count, approved states,
  catalogue open/close behaviour, keyboard operation, and focus restoration.

### Browser

- Intercept both mock endpoints and cover all-products and selected-group
  journeys.
- Cover reload, back, forward, unknown-slug canonicalization, rapid switching,
  group failure/recovery, product failure/retry, and empty filtered results.
- Compare loaded desktop and mobile layouts with the approved SHOP-002 PNGs.
- Compare state and interaction presentation with approved DESIGN-003 artifacts.
- Confirm no horizontal overflow at 375 CSS pixels and no browser console errors
  or warnings.

## Definition of done

- `DESIGN-003` has explicit human approval before implementation begins.
- Tests were observed failing for the intended missing behaviour before
  production implementation.
- Every acceptance criterion has executable coverage at the appropriate layer.
- Required visual comparisons are recorded.
- Production coverage remains at least 99% for all configured metrics.
- `npm run verify` passes without weakened or skipped checks.
- Relevant `CONTEXT.md`, backlog, and quality-evidence records are synchronized.
- Independent tester, reviewer, architect, and documentation-steward verdicts
  satisfy the harness exit gate.
- The dedicated `SHOP-003` pull request passes mandatory CI and is merged.

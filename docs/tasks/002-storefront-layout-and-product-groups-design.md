# Task 002: Design storefront layout and product-group navigation

## Status

Design approved

## User-visible outcome

A shopper can understand the store's global structure, see backend-provided
product groups, select a group, and understand that the displayed products
belong to that selection.

## Design record

- Brief: `docs/design/storefront-layout/brief.md`
- Approval: `docs/design/storefront-layout/approval.md`
- Approved desktop mockup:
  `docs/design/storefront-layout/approved/desktop.png`
- Approved mobile mockup:
  `docs/design/storefront-layout/approved/mobile.png`

The approval record has status `Approved`; implementation may reference the two
approved screenshots.

## Product behaviour to design

1. The application requests product groups from the backend.
2. `Все товары` is available independently of returned groups.
3. Selecting a group updates `?group=<group-slug>`.
4. The application requests products for the selected group from the backend.
5. A later selection supersedes an unfinished earlier product request.
6. Reload, browser back, and browser forward restore the URL-selected group.
7. An unknown group returns the shopper to a defined recoverable state.

## Accepted design scope

- Layout B with the P3 category panel is selected.
- Desktop and mobile sources of truth are the two approved screenshots.
- Header, category navigation, and product results form one coherent hierarchy.
- Mobile navigation does not depend on hover or a horizontal chip row.
- The layout leaves space for future search and cart functionality.
- Superseded variants, prototypes, and additional state mockups were deleted at
  the approving human's request.
- Loading, error, empty, focus, selected, and refetch presentation are deferred
  to separate design work and are not implied by these screenshots.

## Backend assumptions for design

```text
GET /api/product-groups
GET /api/products
GET /api/products?groupId=<group-id>
```

Example group DTO for mockups:

```text
id          stable backend identifier
slug        URL-safe stable string
name        display name
imageUrl    optional group image
productCount optional result hint
```

The implementation contract will be specified separately after design approval.

## Explicit exclusions

- Angular production implementation
- Final backend API implementation
- Search behaviour
- Cart behaviour
- Nested categories
- Sorting and facet filters
- Authentication
- Copying DNS visual branding

## Required verification

- The two approved screenshots exist.
- Implementation visual checks use those screenshots as the source of truth.
- Behaviour not visible in those screenshots is specified and reviewed
  separately before implementation.

## Definition of done

- Approval record has status `Approved`.
- The two approved artifacts and decision notes are immutable.
- Superseded catalogue-only design debt remains closed as superseded.

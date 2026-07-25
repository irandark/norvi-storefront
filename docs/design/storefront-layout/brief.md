# Storefront layout and product groups design brief

## Status

Approved — see `approval.md`

## Goal

Design the first reusable storefront layout and the primary navigation through
backend-owned product groups.

The result should support catalog browsing now and provide a coherent shell for
search, cart, and checkout later.

## Reference direction

Use large retail catalogues such as DNS as structural research, not as a visual
template to copy.

Relevant reference patterns:

- persistent retail header;
- prominent catalogue entry point and search;
- clear top-level product groups;
- optional nested or popular categories;
- product area that remains understandable while filters reload from the backend;
- dense information on desktop with a deliberate mobile transformation.

The storefront must establish its own typography, colour, spacing, imagery, and
component language.

## Information architecture

The initial storefront contains:

1. Global header
   - store identity;
   - catalogue or group navigation entry;
   - search placeholder for a future task;
   - cart placeholder for a future task.
2. Product-group navigation
   - `Все товары`;
   - backend-provided groups;
   - visible active group;
   - group names and order controlled by backend data.
3. Product result area
   - active group title;
   - result count when provided;
   - loading, success, empty, and error states;
   - product cards.
4. Responsive navigation
   - desktop exposes groups without obscuring products;
   - mobile avoids an unbounded horizontal chip row;
   - selection remains obvious after the navigation collapses.

Search, cart interactions, nested group browsing, sorting, and facet filters are
not part of this design task, but the layout must not block their later addition.

## Backend-driven interaction

The design assumes two independent backend requests:

```text
GET /api/product-groups

GET /api/products
GET /api/products?groupId=<group-id>
```

`Все товары` omits `groupId`. Selecting a group starts a new backend product
request; the browser does not filter a previously loaded full collection.

The selected group is represented in the URL:

```text
/?group=<group-slug>
```

The design must cover:

- initial loading of groups and products;
- successful group selection;
- product loading after a selection;
- an empty selected group;
- product-request failure with retry;
- group-request failure;
- rapid switching between groups;
- an unknown or removed group in the URL;
- keyboard navigation and visible focus.

The designer must explicitly decide whether existing products remain visible
during group reload, become skeletons, or are replaced by a loading surface.

## Suggested initial data

Use realistic groups during design exploration:

- Все товары
- Компьютеры и ноутбуки
- Смартфоны и гаджеты
- ТВ и аудио
- Бытовая техника
- Дом и кухня
- Инструменты
- Игры и развлечения

These names are mock content. The implementation will render backend data rather
than hardcode this list.

## Exploration history

The design phase compared three meaningfully different layout approaches:

### Variant A: Catalogue rail

Desktop group navigation uses a persistent side rail next to the product area.
The mobile transformation must be explicitly designed.

### Variant B: Retail mega-navigation

Header contains a prominent catalogue entry point inspired structurally by large
retailers such as DNS. The selected group remains visible in page context.

### Variant C: Group dashboard

Top-level groups receive stronger visual cards or tiles before or alongside the
product results. The design must avoid pushing products excessively far below the
fold.

Layout B was selected and refined into the approved P3 category-navigation
direction. Superseded exploration artifacts were deleted after approval; the
only implementation references are the two PNG files recorded in
`approval.md`.

## Approved artifacts

- Desktop layout at 1440 × 1000:
  `docs/design/storefront-layout/approved/desktop.png`
- Mobile layout at 375 × 812:
  `docs/design/storefront-layout/approved/mobile.png`

States not represented by these artifacts require a separate design pass before
their presentation is implemented.

## Approval decisions

- Layout B is the approved global direction.
- P3 progressive disclosure is the approved category-navigation direction.
- Desktop uses an inline catalogue panel opened from the ordinary `Каталог`
  navigation item.
- Mobile uses a bounded catalogue sheet opened from the same navigation item.
- Search and cart are visible placeholders only.
- Refetch, loading, error, empty, focus, and selected-state presentation remain
  outside this approval and require separate design work.

## Constraints

- Do not edit production Angular presentation code during design exploration.
- Do not visually copy DNS branding or reproduce its pages.
- Do not hardcode group ownership into the frontend design.
- Do not introduce client-only filtering as a substitute for backend filtering.
- Do not add implementation libraries during design.
- The designer recommends but cannot approve a variant.

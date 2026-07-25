# Storefront layout design approval

## Status

Approved

## Approved artifacts

- Desktop: `docs/design/storefront-layout/approved/desktop.png`
- Mobile: `docs/design/storefront-layout/approved/mobile.png`

These two screenshots are the current source of truth for Task 002. Superseded
mockups, alternative states, and interactive prototypes were removed after
human approval.

## Approval

- Approving human: product owner
- Approval date: 2026-07-25
- Approved layout: Layout B
- Approved palette: cool neutral with cobalt/indigo accents
- Approved category navigation: P3 progressive disclosure

## Decisions represented by the screenshots

- The catalogue opens through the ordinary `Каталог` navigation item.
- There is no separate `Каталог · открыт` button or icon.
- There is no prototype-only state selector in the user interface.
- Desktop categories are shown in a temporary progressive-disclosure panel.
- Mobile categories are shown in a bounded sheet.
- `Все товары` is available independently of backend-provided groups.
- `НОРВИ` remains the working store name represented by these mockups.

## Approved-artifact corrections

- 2026-07-25: increased the mobile logo icon-to-wordmark gap to 10 px at the
  approving human's explicit request; no other layout decision changed.

## Approval boundary

Approval covers the visible desktop and mobile states in the two screenshots.
Loading, error, empty, focus, selected, search, cart, and nested-category
details require separate design work when they enter implementation scope.

Material changes to the approved hierarchy, palette, catalogue interaction, or
working store name require a new design review.

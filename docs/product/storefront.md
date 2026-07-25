# Storefront product scope

## Goal

Build a small but realistic storefront for practising harness-driven Angular
development.

## Planned journeys

1. Browse product groups returned by the backend.
2. Select a group and load matching products from the backend.
3. Preserve the selected group in the URL across reload, back, and forward navigation.
4. Browse a product catalog.
5. Add products to a cart.
6. Change quantities and remove cart lines.
7. Restore the cart after a page reload.
8. Submit a checkout exactly once.
9. Understand loading, empty, success, and failure states.

## Delivery tracking

- Repository task board: `docs/BACKLOG.md`
- Detailed task specifications: `docs/tasks/`
- Approved visual references: `docs/design/`

The repository board is authoritative until an external issue tracker is
connected. External issues must link back to the versioned specification rather
than replacing product and architecture decisions stored in the repository.

## Out of scope for the first version

- User accounts and authentication
- Real payments
- An administration area
- Microservices
- Server-side rendering
- A third-party state-management library

## Product invariants

- A cart line quantity is always a positive integer.
- A product cannot be ordered beyond available stock.
- Monetary calculations use integer minor units.
- An empty cart cannot be submitted.
- Repeated checkout actions must not create duplicate orders.
- Product groups and their ordering are backend-owned.
- Selecting a group filters products on the backend rather than only hiding
  already-loaded products in the browser.

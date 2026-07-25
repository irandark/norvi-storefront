# Catalog design brief

## Status

Superseded by `docs/design/storefront-layout/brief.md`.

## Goal

Define and approve the visual direction for the existing product catalog instead
of treating its current implementation as an implicit design decision.

## User need

A shopper should quickly understand what the store offers, compare products, see
price and availability, and feel confident about the store's visual character.

## Required states

- Loading
- Catalog with available and unavailable products
- Empty catalog
- Failure with retry

## Required viewports

- Desktop: 1440 × 1000
- Mobile: 375 × 812

## Constraints

- Preserve current product behaviour.
- No cart controls yet.
- Use realistic Russian product content.
- Meet the project accessibility requirements.
- Do not implement a visual redesign until a variant is approved.

## Questions for design exploration

- Should the store feel editorial, utilitarian, or warm and craft-oriented?
- How prominent should availability be relative to price?
- Should product imagery dominate or support textual comparison?
- What visual system should later extend naturally to cart and checkout?

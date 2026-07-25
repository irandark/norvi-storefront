# TD-003: Introduce reusable design tokens

## Status

Backlog — analysis required before implementation.

## Priority

P1 — complete before or together with `SHOP-003` so the approved storefront is
not implemented using another set of duplicated literals.

## Problem

Shared visual values are currently repeated directly in global and component
SCSS. Examples include:

- `#15251d`, `#315d46`, `#397552`, `#dce5dd`, and `#fff`;
- `72rem` content width;
- repeated `1rem`, `1.25rem`, and `1.5rem` spacing;
- `1.25rem` card radius and `999px` pill radius;
- font sizes, weights, outlines, and state colours.

Continuing this pattern while implementing the approved storefront would make
visual changes inconsistent and force agents to rediscover the same values in
multiple files.

## Desired outcome

The application has one documented style-token system. Components consume named
tokens instead of repeating shared colours, spacing, padding, gaps, typography,
sizes, radii, borders, shadows, focus styles, motion values, content widths, and
breakpoints.

## Proposed direction

- Use global CSS custom properties for semantic values consumed by component
  styles and future themes.
- Use Sass variables, functions, or mixins only where compile-time behaviour is
  required, such as media-query breakpoints.
- Separate primitive scales from semantic aliases:

```text
primitive: --space-4, --color-indigo-600
semantic:  --surface-page, --text-primary, --gap-card, --focus-ring
```

- Components prefer semantic tokens so changing the palette or density does not
  require editing every selector.
- Keep token definitions centralized and include a short token catalogue in the
  relevant `CONTEXT.md`.

## Values in scope

- colours and state colours;
- spacing scale, gaps, margins, and paddings;
- widths, heights, content constraints, and control sizes;
- border widths, radii, and dividers;
- typography families, sizes, weights, line heights, and letter spacing;
- shadows and elevation;
- focus rings and outline offsets;
- motion durations and easing;
- responsive breakpoints;
- z-index layers when introduced.

Not every numeric literal must become a token. Intrinsic values such as `0`,
percentages, aspect ratios, a one-off mathematical expression, or values
required by a specific asset may remain local when they are not reusable.

## Acceptance criteria

- A centralized token entry point exists and is available to global and
  component styles.
- Every repeated or semantically shared colour, gap, padding, margin, size,
  radius, border, typography, focus, motion, and layout constraint is replaced
  with a named token.
- Components do not declare raw colour literals.
- Components do not repeat reusable spacing or sizing literals.
- Semantic tokens describe purpose rather than the current visual value.
- Token names and scales are documented in the applicable `CONTEXT.md`.
- The approved desktop and mobile appearance does not materially change.
- Reduced-motion and visible-focus behaviour remain intact.
- An automated check prevents newly introduced raw colour literals and other
  agreed forbidden style literals outside token-definition files.
- No component imports another component's private style file.

## Edge cases to resolve during analysis

- Whether breakpoints use Sass variables or custom media tooling.
- Which values are truly shared versus intentionally component-specific.
- How legacy styles map to the approved cobalt/indigo palette.
- Whether token enforcement uses Stylelint, a repository script, or existing
  lint infrastructure.
- How third-party component styles may consume or map to project tokens later.
- Whether runtime theme switching is explicitly out of scope for this task.

## Design applicability

No new design is required if this remains a behaviour-preserving refactor.
Record `Design: Not applicable` and verify against the two approved storefront
screenshots. Any material colour, spacing, typography, or layout change returns
to human design review.

## Architecture constraints

- Tokens are a shared presentation concern and must not enter domain or
  data-access layers.
- Feature styles may consume shared tokens but cannot redefine global semantics
  privately.
- Avoid a component library or theming framework unless separately approved.
- Do not create aliases with identical meaning merely to eliminate every local
  literal.

## Required verification

- Analyst completes the unresolved decisions and edge-case matrix.
- Architect reviews token ownership and dependency direction.
- Tester verifies the forbidden-literal guard and responsive visual behaviour.
- Reviewer checks naming quality and that the refactor did not hide visual
  changes.
- Documentation steward verifies the token catalogue and affected
  `CONTEXT.md` files.
- Unit coverage remains at least 99% for all four metrics.
- `npm run verify` passes.
- Browser screenshots at 1440×1000 and 375×812 are compared with the approved
  artifacts.

## Explicit exclusions

- Dark mode.
- Multiple brands or runtime theme switching.
- A third-party design-system package.
- Redesigning the approved storefront.
- Changing domain behaviour.

## Definition of done

- All acceptance criteria pass.
- Required independent verdicts are non-blocking.
- Visual comparison records no unapproved material difference.
- Token documentation and module context are current.
- Backlog and this specification are synchronized.

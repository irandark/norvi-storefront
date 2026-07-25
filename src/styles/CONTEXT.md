# Module context: shared style tokens

## Responsibility

Owns the application's primitive visual scales and global semantic style
tokens. Presentation styles consume these tokens; domain and data-access code
must not depend on them.

## Public surface

`_tokens.scss` emits global CSS custom properties through `:root`. It is loaded
once by `src/styles.scss`; component styles use the properties with `var(...)`
and do not import this private Sass file. Feature-owned Sass token files provide
compile-time semantic names for values that are not globally shared.

## Data and control flow

```text
src/styles.scss
→ src/styles/_tokens.scss
→ global primitive and application-semantic CSS custom properties
→ feature-owned semantic Sass token files
→ component style consumers
```

The catalog owns `_catalog-tokens.scss`; it references shared primitives and
compiles its private semantic values into the catalog component stylesheet.

## Token catalogue

| Group             | Primitive examples                     | Semantic examples                                                     |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------- |
| Colour            | `--color-green-950`, `--color-red-700` | `--surface-page`, `--text-primary`, `--border-danger`                 |
| Spacing           | `--space-2xs` through `--space-4xl`    | `--page-inline-padding`, feature-owned spacing                        |
| Shape and borders | `--border-width-*`, `--radius-*`       | `--status-radius`, `--focus-ring-width`                               |
| Typography        | `--font-size-*`, `--font-weight-*`     | `--brand-font-size`, feature-owned type semantics                     |
| Layout            | shared primitives where reusable       | `--content-max-width`, `--viewport-block-full`, `--header-block-size` |

Primitive tokens describe a value scale. Semantic tokens describe why a value
is used. Components should prefer semantic tokens and use a primitive directly
only when a broader semantic alias would be misleading.

## Invariants

- Raw colours live only in the global `_tokens.scss`; unit-bearing dimensions
  live only in owned token-definition files.
- Feature-owned `_*tokens.scss` files may define Sass dimensions but must
  consume shared palette aliases instead of declaring raw colours.
- Component styles never redefine global semantic tokens.
- Intrinsic zeroes, percentages, grid fractions, aspect ratios, and unitless
  calculations may remain local.
- A token refactor must not materially alter an approved layout.
- Viewport breakpoints become Sass variables only when an actual size-based
  media query is introduced.
- Angular inline `styles`, template `style` attributes, and unscanned style
  extensions are prohibited to prevent enforcement bypass.

## Dependencies

- Native CSS custom properties and Sass compilation provided by Angular.
- No runtime styling or third-party design-system dependency.
- The dependency-free Node guard in `scripts/style-token-guard.mjs`.

## Verification

- `npm run lint:styles` checks every CSS, Sass, and SCSS consumer plus Angular
  inline/template style surfaces.
- `npm run lint` includes the style-token guard.
- `npm run verify` runs the complete repository gate.

## Key files

- `_tokens.scss` — shared tokens and the only allowed raw-colour location.
- `../styles.scss` — global entry point.
- `../../scripts/check-style-tokens.mjs` — forbidden-literal guard.

## Decisions and traps

- Do not add unrelated feature semantics to the global token file.
- Prefer semantic aliases in consumers. Direct primitive use is allowed only
  when another semantic alias would misrepresent the value's purpose.
- Comments are ignored by the guard; negative dimensions are not.
- `currentColor`, `transparent`, intrinsic zeroes, percentages, fractions,
  aspect ratios, and unitless values are intentional exemptions.

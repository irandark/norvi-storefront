# Design workflow

## Purpose

Automated tests can prove that an interface behaves consistently, but they
cannot decide whether the visual direction is appropriate. New UI and material
changes to layout, interaction, visual hierarchy, responsive behaviour,
accessibility presentation, or user-visible states therefore pass through a
human-approved design gate before implementation. The analyst records
`Design: Not applicable` for non-visual work and non-material UI corrections.

## Workflow

```text
Product task
    ↓
Design brief
    ↓
Designer agent: exploration and 2–3 distinct mockup variants
    ↓
Designer self-review: usability, responsive layout, accessibility, states
    ↓
Human review
    ├── Changes requested → designer iteration
    └── Approved → immutable approval record
                         ↓
                    UI implementation
                         ↓
              Browser screenshots and comparison
```

## Design record states

- `Draft` — brief or exploration is incomplete.
- `Ready for review` — variants are complete and await human feedback.
- `Changes requested` — a human requested a new iteration.
- `Approved` — a human explicitly approved one named variant.
- `Superseded` — a later approved design replaces this record.
- `Not applicable` — the task has no user-visible effect.

Only a human may set `Approved`. Silence, implementation progress, passing tests,
or designer self-review do not imply approval.

## Required artifacts

Every user-visible feature keeps its artifacts under:

```text
docs/design/<feature>/
├── brief.md
├── approval.md
├── exploration/  # optional and removable after approval
└── approved/
```

Each review-ready proposal contains:

- desktop mockup at 1440 CSS pixels;
- mobile mockup at 375 CSS pixels;
- success, loading, empty, and failure states when applicable;
- interaction and responsive notes;
- accessibility considerations;
- deliberate trade-offs and unresolved questions.

Mockups may be image compositions or runnable static prototypes. They must be
specific enough that implementation is not forced to invent layout, hierarchy,
spacing, typography, colour, or responsive behaviour.

## Approval record

`approval.md` records:

- current status;
- approved variant name;
- approving human;
- approval date;
- artifact paths;
- explicit requested changes;
- aspects intentionally left to implementation.

An approval applies only to the recorded artifacts. A material visual departure
requires a new review. Small implementation details may vary when the approval
record explicitly leaves them open.

## Implementation gate

Before editing presentation code, the developer must verify:

1. The product task links to a design record.
2. The design record says `Approved`.
3. The approved artifacts cover relevant viewports and states.
4. Acceptance criteria do not conflict with the design.

If any item is missing, the developer stops UI implementation and requests design
work or human approval. It may continue independent domain, data-access, or test
work that does not prejudge the UI.

## Visual verification

After implementation:

1. Capture the same desktop and mobile viewports as the approved mockups.
2. Exercise all specified states.
3. Compare hierarchy, layout, spacing, typography, colour, content, and controls.
4. Record intentional differences in the task.
5. Treat unapproved material differences as defects.

Pixel identity is not the goal unless explicitly requested. Faithfulness to the
approved information hierarchy, interaction, responsive behaviour, and visual
direction is required.

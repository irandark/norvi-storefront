# HARNESS-004: Architect-led discovery and human decision-making

## Status

Done on protected merge of PR #11.

## Priority

P1 — product, feature, and technical-debt decisions need an explicit human
decision partner before implementation begins.

## Outcome

For every proposed feature, technical-debt item, architectural change, or
other materially scoped work, the architect gives the human actionable
feedback and asks the questions needed to reach a shared decision. The
architect does not silently choose product or architectural direction when a
meaningful trade-off or missing decision exists.

## Requirements

- Before implementation planning, the architect reviews the proposal and
  identifies assumptions, constraints, risks, dependencies, and alternatives.
- The architect asks the human targeted questions whenever the answer could
  materially change scope, domain language, ownership, data contracts,
  migration strategy, user experience, quality risk, or delivery order.
- Questions explain the decision being made and the practical trade-off of the
  available options; they are not generic status requests.
- The architect records the human's decisions, rejected options, and remaining
  assumptions in the task specification before implementation begins.
- If the proposal is already fully determined, the architect explicitly says
  why no further decision is needed and asks for confirmation of that reading.
- The architect may recommend an option, but human approval remains required
  for product and material architecture choices.
- The delivery workflow makes this discovery conversation an explicit gate,
  not an optional review after implementation.

## Acceptance criteria

1. The architect role contract requires a discovery-and-decision handoff for
   every material feature, technical-debt item, and architecture change.
2. The handoff template includes: feedback, decision questions, options and
   trade-offs, recommendation where useful, recorded human decision, and
   unresolved assumptions.
3. A task cannot enter implementation while a material architect question or
   human decision is unresolved; it is marked `Blocked` with the question
   recorded.
4. Task specifications preserve the architect feedback and human decision so
   later specialists do not reopen settled choices or infer missing intent.
5. The orchestrator verifies this evidence before activating implementation
   roles and before reporting readiness.
6. Existing work that has no material decision point is not delayed beyond a
   concise confirmation that the architect found no unresolved choice.

## Edge cases

- Urgent defect mitigation may proceed with the smallest reversible containment
  action when waiting would cause material harm; the architect records the
  deferred questions and requests a retrospective decision immediately after.
- A question about a visual change also follows the separate design approval
  process; architect feedback does not replace human design approval.
- The architect must not invent requirements to manufacture a decision gate.

## Exclusions

- Implementing a product feature or technical-debt refactor.
- Replacing the human's authority over product or material architecture
  decisions.
- Requiring questions for mechanical, fully specified documentation-only edits.

## Design

Not applicable — this changes delivery governance, not the storefront UI.

## Verification

- Review `docs/agents/architect.md`, `docs/agents/orchestrator.md`, and the
  task-specification template or guidance for the required decision evidence.
- Add focused documentation/process checks if the repository has a suitable
  mechanism; otherwise record a manual walkthrough in quality evidence.
- Confirm the backlog row and this specification have matching status.

Quality evidence: `docs/tasks/HARNESS-004-quality-evidence.md`.

## Dependencies

- HARNESS-001 — multi-agent quality roles.

## Architect discovery decision

The analyst found one material workflow decision that must be resolved before
implementation:

- Should every material feature, technical-debt item, and architecture change
  require only an architect-led discovery-and-human-decision gate, while the
  later implementation and final architecture review remain conditional on
  affected boundaries and contracts?
- Or should the complete architect role, including implementation constraints
  and final diff review, become mandatory for every such task?

The first option preserves a universal early decision conversation without
forcing a full architecture review onto work that has no architectural impact.
The second option is stricter but adds the complete architecture cycle to every
material task.

Human decision: Option A approved on 2026-07-27. Every material feature,
technical-debt item, and architecture proposal receives a mandatory architect
discovery-and-human-decision gate after analyst completion and before
orchestrator implementation readiness. The later implementation-constraint and
final-diff architecture reviews remain conditional under the existing
architecture applicability rules.

Confirmed stage order:

1. The analyst completes the clarified proposal.
2. The architect conducts discovery and records decisions or blockers.
3. The orchestrator activates implementation only after all material human
   decisions are recorded.

## Recorded discovery evidence

- Analyst verdict: `Complete`. The governance outcome, acceptance criteria,
  exclusions, edge cases, design applicability, dependency, and the single
  material workflow choice were recorded.
- Architect feedback: universal early discovery makes the human an explicit
  decision partner; making the entire architecture cycle universal would add
  avoidable review work where no boundary, contract, dependency, ownership,
  security, or cross-layer behaviour is affected.
- Decision question: choose universal discovery with conditional delivery
  reviews (Option A), or a universal complete architecture cycle (Option B).
- Recommendation: Option A, because it preserves the decision gate while
  keeping later architecture work proportional to architectural impact.
- Human decision: Option A approved on 2026-07-27.
- Rejected option: Option B, the mandatory complete architecture cycle for
  every material task.
- Unresolved assumptions: none.
- Architect discovery verdict: `Complete`; implementation may proceed under the
  approved constraints.

## Implementation constraints

- Keep discovery mandatory for every material feature, technical-debt item,
  architecture proposal, and other materially scoped task.
- Keep implementation constraints and final diff review conditional on
  boundaries, contracts, dependencies, ownership, security, or cross-layer
  behaviour.
- A material unresolved decision blocks implementation and is recorded with the
  task status `Blocked`.
- A fully determined proposal receives a concise rationale and human
  confirmation, not manufactured questions.
- Urgent defect mitigation is limited to the smallest reversible containment
  needed to avoid material harm; deferred decisions receive immediate
  retrospective review.
- Architect discovery never replaces explicit design approval for new or
  materially changed UI.

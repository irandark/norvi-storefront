# HARNESS-004: Architect-led discovery and human decision-making

## Status

Backlog.

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

## Dependencies

- HARNESS-001 — multi-agent quality roles.

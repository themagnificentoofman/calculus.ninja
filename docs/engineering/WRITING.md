# Writing for Calculus Ninja

Engineering Baseline 1.0.0 applies to every contribution. This guide explains how to use it when a word, label, formula or example carries meaning in Calculus Ninja.

## Requirements

**Use the words that describe the state.** A learner can visit a lesson and mark it complete. An attempt can be graded, ungraded or awaiting confirmation. A visit supplies no evidence of mastery. When a submission times out, say what the player can check or retry. Only show a saved grade once the server confirms it for that submission. Keep stable codes in records and translate them at the display boundary.

**Teach in the order the learner needs.** Identify what the learner can already do at the starting point. Read each lesson from its first sentence, including headings, diagrams, readiness checks, examples, hints and feedback. At the first use of a term, symbol or technique, point to the earlier instruction or introduce it there. Check the lesson on each path that reaches it and from a direct link. A readiness question can diagnose a gap only if the learner can reach instruction that fills it. A difficulty label describes the task and supplies no prerequisite knowledge. Use the existing prerequisite and return links when a detour is needed. Preserve the learner's saved place.

**Ask a precise mathematical question.** State the object, variable, domain, assumptions and requested result wherever they affect the answer. Apply the [notation and solution standards](../bank/NOTATION-AND-SOLUTIONS.md). A solution should connect the decision to the displayed problem, show the step that makes it work and check the requested result. Give a hint the learner can act on before revealing the answer. Feedback should explain why the particular step or choice works or fails. For multiple choice, read the final menu together. Wording, units or a single unusually detailed option can give away the answer. Review the easiest route with the choices visible.

**Respect the original evidence.** Preserve attributed quotations, license notices, public identifiers, machine-readable fields and immutable snapshots. An edit that changes assumptions, grading, difficulty, solution reasoning or teaching exposure needs a new revision and applicable admission. For a meaning-preserving display repair, use the exact-source presentation procedure. Assess a worked example against equivalent assessed constructions as well as literal matches. Keep assessment keys, private derivations and inventories in the private evidence location.

**Name the action, owner and limit.** Public notices should tell the player what happened and what they can do. Keep upstream exceptions and diagnostic payloads behind the server boundary. In operator logs use the established operation and receipt identifiers where permitted. Omit credentials and sensitive payloads. In code, name the object and its role or unit when confusion could change behavior. A useful comment explains the reason to preserve a guard. A regression name states the condition and the observable result.

**Leave a change understandable to a newcomer.** A reader of the diff, its tests and its linked records should be able to find where the behavior starts, what it assumes, what happens on failure, where to change it and which check would catch a mistake. Commit subjects name the change. In a PR, describe the user-visible or operational consequence, the checks actually run and any remaining dependency. Setup and recovery instructions identify the command, expected result and safe point to resume.

## Editorial preferences

Use familiar verbs and the same name for the same object. Give an interface control a short action label. Give a lesson enough connected sentences to explain why a step follows. Choose headings that help someone locate a task or a mathematical idea. Keep a sentence that already works. Use punctuation to clarify meaning and vary sentence structure when a repeated pattern makes the explanation harder to follow. A search for punctuation or repeated phrases is a way to find passages worth reading.

## Examples from this project

| Surface | What the reader needs |
| --- | --- |
| Settings | “Save Changes” names the shared action. Its disabled state shows that nothing needs saving. Individual preferences should explain their effect. |
| Submission | “The request took too long. Please retry.” gives a next action without assigning a grade. The comment in `lib/api-request.mjs` explains why one deadline covers both authentication and transport. |
| Worked solution | The [notation guide](../bank/NOTATION-AND-SOLUTIONS.md#worked-solutions) gives worked-solution requirements. For a definite integral, show how the bounds enter the calculation. For a limiting argument, explain the hypothesis that permits the limit operation before using it. |
| Review evidence | “Two requests returned the same saved receipt in the local emulator” identifies the observation and its scope. Link the tested revision and the assertion that compares the receipts. |

## Reviewing a batch

Freeze the exact inputs and rendering dependencies. In the existing private evidence record, identify each item, field, disposition and reviewer method. Keep a prior review only for the dimensions it tested and only while its inputs still match. Review the rendered result when layout or mathematical presentation changes. Track retained, corrected, historical and pending items separately. A generator check or a sample cannot close the remaining rows. Resume at the first missing or invalidated binding. Follow the [Study authoring](../milestone4/STUDY-AUTHORING.md), [Study admission](../milestone4/STUDY-ADMISSION.md) and [bank authoring](../bank/PROBLEM-AUTHORING-STANDARDS.md) contracts for their respective decisions.

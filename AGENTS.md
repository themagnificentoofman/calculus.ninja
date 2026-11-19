# Development instructions

## UI hotfix policy — November 9, 2026

- UI elements appear immediately. Do not add slide-in, fade-in, staggered entrance, scale-in or animated exit effects unless the user explicitly requests an exception. Preserve functional loading indicators and direct interaction feedback.
- A settings save operation has one canonical, icon-bearing Save Changes button. Child sections must not add competing save controls. The button is disabled and visibly dimmed while saving or when current values match persisted values, including after reverting an edit.
- Check the complete composed settings page, including child sections, when adding preferences. Confirm profile fields and all preference switches use the same save operation, and check clean, edited, reverted, saving, success and failure states.
- Carry hotfixes into unfinished milestone work without overwriting its changes. Preserve checkpoint evidence and document the new release baseline in the continuation prompt.

## Global public-copy policy — November 11, 2026

- Everything displayed on the website must be clean and suitable for players. This applies globally: pages, lessons, hints, solutions, settings, gameplay, replay analysis, Help, Contact Us, dialogs, empty states, notices and error messages.
- Keep development and drafting artifacts out of displayed copy: milestone labels, internal review/admission states, generator or template implementation details, source-code or schema notes, fixture/test text, TODOs, placeholders and author/reviewer instructions. Keep these in private documentation and evidence.
- Explain real user-facing limits plainly and accurately. Do not hide an unavailable feature or unsupported answer form, claim draft content is approved, or remove required source credits, problem/revision identifiers or a useful Legacy label merely to make the text look finished.
- Review the complete rendered experience and its composed child components. Scan new copy, inspect representative desktop/narrow states, and check public API/error projections; a clean source file alone does not establish clean displayed copy.
- Apply this policy to future additions and changed content. Preserve historical snapshots and recorded outcomes; any clarification of historic material needs the existing explicit, source-bound treatment.
- Do not display raw browser, authentication-provider, network or upstream exceptions. Map them at the public boundary to useful authored messages, retaining specific safe validation guidance. Apply one bounded request deadline to authentication, transport and response reading; an expired attempt must not send a late request after its token arrives.
- Give saved outcomes and activity types explicit player-facing labels, with a neutral fallback for unknown values. Keep internal event codes, schema names and diagnostic identifiers in the underlying records. Friendly recording/session aliases must remain stable across pagination. Distinguish an ungraded saved answer from an unconfirmed submission; a previous answer's outcome cannot describe a later failed request.

## Continuation and usage policy

- When pausing for a handoff or limited usage, finish the current bounded correction and its necessary checks when feasible. Do not publish an incomplete milestone to create a stopping point.
- A continuation prompt contains only remaining work, its dependencies, essential workspace/release constraints and exact pointers to reusable evidence. Keep completed-work history in the status/evidence files; do not copy it into the to-do list.
- Before repeating a check, compare the current source with its evidence binding. Reuse completed research, reviews and passing checks when their relevant inputs are unchanged. Repeat only affected checks after a change, a failure, missing evidence or a newly identified concern; expand scope only when that evidence justifies it.
- Preserve failed attempts and later corrections separately. State whether a result is a local fixture, an actual service/runtime check or a hosted end-to-end check. Never promote one into another during a handoff.

## Continuing work

- Before continuing a milestone, record newly agreed, reusable practices in the applicable project guidelines. Keep changing counts, dates, open tasks and release receipts in the milestone handoff. Preserve stronger instructions already present in a working checkout when reconciling branches.
- Resume from the latest source-bound checkpoint. Reuse unchanged implementation, mathematical reviews and passing checks within their recorded scope. Rerun affected checks after changes and complete missing end-to-end qualification.
- Finish the core learner flows and their content before a dedicated visual polish pass. Plan stable destinations and return paths as part of the core. Keep public copy focused on what learners need to read or do.

## Study Guide

- Extend the existing module, prerequisite and progression data. A shared lesson has one stable destination, even when several paths recommend it. Keep a learner's place when following a prerequisite, opening practice or returning to a filtered list.
- From any Study page, make the current location, next useful action and route back to the syllabus easy to find. Offer a searchable index and visible navigation on both wide and narrow screens. Verify these journeys from the hub and from a direct link.
- Use consistent, text-labeled markings for module progress, problem progress and reading progress. Distinguish learner-set marks from verified grades, difficulty and editorial recommendations. Give each mark an accessible name and a visual cue that works without color or hover. Changing a study mark never grants credit, XP, rating or mastery.
- Base editorial marks on an explicit curriculum judgment or documented evidence. Use external guides as design references. Check applicable reuse terms and record attribution and modifications for any material incorporated.

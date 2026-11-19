# Contact and contextual reporting — November 11 user amendment

Append this enhancement after the current Milestone 4 work. It does not replace or interrupt the ongoing implementation, review, qualification and release tasks.

- [x] Expand Contact Us categories, preserving useful existing categories, to include **Problem Issue**, **Study Guide Issue** and **Other**. Explain Other in public copy as the choice when the request does not fit another category.
- [x] When a solution is visible in gameplay or replay analysis, provide a small corner text link labeled **Report Issue**. Open the contact/report request with **Problem Issue** selected and the actual saved problem ID already filled in. Carry the saved revision when available so a historical replay report identifies the version the player actually saw. Do not expose solutions early or infer the current bank revision for an old replay.
- [x] Ask Study Guide reporters to identify the exact lesson and section themselves. Make that request clear in the form; do not silently infer a section and present it as the user's report.
- [x] Preserve contextual report fields through the sign-in return flow and ordinary retries. Do not submit a message just by opening the link.
- [x] Reconcile the existing problem-reference/report control with this contact entry point so the composed solution panel has one clear reporting action, including MC and FR answer review and replay seeking.
- [x] Verify category validation, correct problem identity/revision, signed-out return, keyboard access, narrow layouts and solution visibility. Use mocked message delivery for automated tests; no real test message is authorized by this development request.

Implementation entry points observed: `lib/contact.ts`, `app/contact/page.tsx`, `lib/server/contact-api.ts`, `components/ProblemReference.tsx`, gameplay/replay solution consumers, and the bounded contact return handling in `app/auth/page.tsx`. Preserve the standing public-copy, no-entrance-animation and historical-integrity policies.

## Local qualification — November 19, 2026

The recovered source passes project typechecking and 40 Contact, sign-in return and replay regressions. The Chromium component run at 390 and 1,280 pixels exercised the actual contact and sign-in forms, MC and FR solution gates, replay seeking and analysis, keyboard navigation, an ambiguous failed send and an unchanged retry. Opening or returning to the form issued zero submissions. Identity and delivery were mocked. The exact source, checked viewports, regression output and screenshots are bound in the private continuation at `r9-is/contact-qualification.json`. Hosted and physical-device verification belong to release qualification.

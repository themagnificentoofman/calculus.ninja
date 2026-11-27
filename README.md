# Calculus Ninja

Competitive calculus practice and multiplayer games, hosted independently of Google AI Studio. The existing React App Router interface runs with Vinext on Cloudflare Workers through Sites. Firebase continues to hold the existing accounts, profiles, games and chat; this migration does not copy or erase that data.

## Start here

For a local preview, use Node 24 and the committed lockfile.

```sh
npm ci
npm run dev
```

The checked-in Firebase browser configuration identifies the existing project. Use the demo emulators for account and gameplay tests. Keep production credentials out of local development. A public checkout can run the app and its tests. A qualified release also needs the private assessment and Study evidence for the target version.

The [contributor guide](CONTRIBUTING.md) maps changes to their owners in the code, local checks and release gates. Use the [writing guide](docs/engineering/WRITING.md) when editing text for players, learners or maintainers. The [problem-bank guide](docs/bank/README.md) covers offline authoring and verification. The [deployment guide](DEPLOYMENT.md) covers the registered Site, the database and rollback. Ordinary gameplay makes zero model calls.

## Contact form

`/contact` sends bug reports, balance feedback, and questions to the owner's fixed inbox through Resend. Set the encrypted server secret `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` to a sending address authorized by that Resend account. No browser credential or public email relay is used. See the [Resend email API](https://resend.com/docs/api-reference/emails/send-email) for sender setup.

The authenticated `/api/contact` endpoint verifies Firebase tokens and takes the reply-to address from the account claims. Existing D1 quota storage enforces a rolling 60-second account cooldown, 10 submissions per account per UTC day, and 100 total per UTC day, including failed delivery attempts. Conditional SQL updates enforce limits across concurrent requests and Worker instances. GET returns the remaining server cooldown after reload. Provider idempotency keys protect an unchanged message retried after an ambiguous delivery failure. The form retains failed messages and never reports delivery success on provider errors.

Local tests use an in-memory SQLite database and fake email delivery; they do not send email. Live delivery requires the two production environment settings above.

Primary domain: https://calculus.ninja

Problem authors must follow the [notation and worked-solution standards](docs/bank/NOTATION-AND-SOLUTIONS.md). The publication path rejects unreviewed solutions; [Help → Mathematical notation](https://calculus.ninja/help#notation) documents the player-facing conventions.

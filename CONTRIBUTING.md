# Contributing to Calculus Ninja

Start from the current branch and read [AGENTS.md](AGENTS.md) and any instructions in the directory you are changing. Before resuming a release, match the public tree, the private release overlay and the last saved Site version to their receipts. An existing version number or an old status heading alone cannot identify the current bank.

## Find the code and its checks

| Change | Start here | What to verify |
| --- | --- | --- |
| Page, message or lesson navigation | `app/`, `components/`, `lib/study/` | Follow the full page and its child components, including errors and return paths. Check wide and narrow viewports. Use the [writing guide](docs/engineering/WRITING.md). |
| Lesson, pathway or tier | `content/study/` and [Study admission](docs/milestone4/STUDY-ADMISSION.md) | The release needs the exact author, reviewer, bank-exposure and reader bindings. A public-only build uses public placeholders. |
| Statement, choices or grading | [Bank standards](docs/bank/PROBLEM-AUTHORING-STANDARDS.md), `scripts/bank/AGENTS.md`, `lib/math-answer/` | Independently solve each affected revision, check the displayed menu and preserve issued checker behavior. Keep solved assessment dossiers private. |
| Game start, selection or submission | `lib/server/`, [issuance protocol](docs/milestone4/ISSUANCE-PROTOCOL.md) | Trace the real entry point through identity, selection, the durable receipt and recovery. Use isolated test data. |
| Public profiles or player data | `lib/server/`, `firestore.rules`, `tests/` | Check owner and membership constraints, privileged writers and public projection on every writer. Preserve private history. |
| Hosting, migrations or budgets | [Deployment](DEPLOYMENT.md), [operator ledger](docs/bank/operator-budget.md), `lib/server/content-release-budget.mjs` | Match the target and applicable named allowance to the latest receipt. Review rollback and operator shutdown before making a hosted change. |

## Local verification

Use Node 24, Python 3.12 and Java 21 to match [CI](.github/workflows/ci.yml). From the repository root, install dependencies with `npm ci`. Benchmarks and private release checks can require additional bound data. The public CI commands are:

```sh
python -m venv .bank-venv
.bank-venv/bin/python -m pip install -r scripts/bank/requirements.txt
export PATH="$PWD/.bank-venv/bin:$PATH"
npm run typecheck
python scripts/bank/test_math.py
python scripts/bank/test_content_contract.py
npm run bank:solutions
npm test
node scripts/bank/worker-smoke.mjs
npx --yes firebase-tools@15.34.2 emulators:exec --only auth,firestore --project demo-calculus-rendering --config firebase.test.json "npm run test:integration"
npm run build
```

The demo command uses local Firebase emulators. Some application tests skip service checks outside those emulators. Keep email delivery mocked during QA. For a first change, run the affected test directly, then the gates required for the proposed release.

## Submit a change

Branch from the appropriate source. Send public changes through a GitHub pull request with public ancestry. Stage only reviewed public files. Private assessments, inventories, recovery bundles and signed URLs belong in the private release workflow. Include the requirement, the change a reader can observe, the tested state and any unresolved dependency. Record current work in the existing milestone handoff and dated evidence. A PR, an admitted revision, an active bank and a published Site each have a distinct receipt. Check the current task for merge, release and spending authority.

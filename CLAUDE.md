# Forge Playwright Academy — Claude session entry point

Before working, read [AGENTS.md](AGENTS.md) in full and use it as the shared
project instructions. Read [README.md](README.md) for the product purpose,
current curriculum, architecture and commands. These files carry the context;
you do not need the original ChatGPT or Codex conversation.

Forge is a practical Playwright + TypeScript academy with a polished study
portal, original teaching, local UI/API labs, unfinished exercises, worked
solutions and deliberate defect proofs. Its focus includes interview readiness
and difficult workplace situations: state ownership, races, failed writes,
diagnosis, recovery and trustworthy CI evidence.

For complete beginners, the additive Start from zero route is documented in
[BEGINNER-START.md](docs/BEGINNER-START.md); keep the original curriculum intact.

Start with the user's current task, inspect the checkout and existing changes,
then read the relevant workbook and implementation. Continue the existing
project. Preserve learner attempts and stable lesson IDs. Keep reference
solutions separate from unfinished starters, and verify what a test detects.

The full local workshop runs with Node.js 22.13+:

```sh
npm ci
npx playwright install chromium
npm run local
```

Local learner data lives outside the repository in
`~/.forge-playwright-academy/progress.sqlite` by default. Never use that database
for tests or erase it to fix a failure. Existing test configurations use
browser-only progress or temporary directories. Hosted/static portals use
browser storage; transfers require export/import.

Read [the account handoff guide](docs/ACCOUNT-HANDOFF.md) before changing
publishing accounts, and [the local data guide](docs/LOCAL-DATA.md) before changing
storage. Preserve `.openai/hosting.json` for the selected deployment. Check which
tools and accounts are actually available; a repo does not transfer credentials,
site ownership, chat history or access to another assistant's tools.

Use [the verification record](docs/VERIFICATION.md) for executed evidence and
[the review](docs/REVIEW.md) for delivered improvements and remaining proposals.
Read [the closeout record](docs/PROJECT-CLOSEOUT.md) for build history,
postmortem and the original handover checkpoint.
Follow AGENTS.md for source ownership, exercise quality, relevant checks and
delivery. Update shared rules there; keep this file a concise entry point.

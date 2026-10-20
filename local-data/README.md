# Local learning data

The local workshop uses Node's built-in SQLite driver (Node 22.13 or newer).
It stores one learner record on this computer, independently of OpenAI and
GitHub accounts. The training shop still uses temporary session data.

The default file is `~/.forge-playwright-academy/progress.sqlite`.
`FORGE_DATA_DIR=/absolute/private/folder` selects another directory.
The folder is created on the first valid local progress request, not merely
because the server starts. Newly created directories use mode `0700` and the
database uses `0600`; operating-system ACLs still apply.

## Backup and restore

Run these from the project directory. Replace the example absolute paths with
your own private backup location.

```sh
npm run data:status
npm run data:export -- /absolute/private/forge-progress-2026-10-20.json
```

An export reads one committed SQLite snapshot and is safe while the local
server is running. It includes completion, acceptance checkboxes, field notes,
quiz selections, and the last lesson. Existing backup files are never
overwritten. The JSON also imports through the portal's progress screen.

To restore into a local database, first export its current state and inspect
its revision with `data:status`. Then explicitly supply that revision:

```sh
npm run data:import -- /absolute/private/forge-progress-2026-10-20.json --expected-revision 0
```

Use `0` only for an empty record. Import replaces the complete learning record
and increments its revision. It does not merge records, replace the database
identity, or import an OpenAI/GitHub identity. A concurrent save produces a
conflict and prevents replacement.

For another machine, transfer the private JSON export and import it into a
fresh local installation. Keep personal exports outside this Git repository.
For a raw database backup, stop every server/CLI using that data directory
first. SQLite may have `progress.sqlite-wal` and `progress.sqlite-shm`
sidecars; do not copy or delete only part of a live database. Prefer the JSON
export for routine moves and backup.

If a file is corrupt or belongs to a future schema version, the application
does not erase or automatically rebuild it. Stop the server, preserve the
whole data directory, choose a new empty `FORGE_DATA_DIR`, and import a known
good JSON export there. Verify the recovered notes before changing the
default directory. If no export exists, retain the original files for SQLite
recovery work; do not repeatedly reset them.

## HTTP contract

`GET /api/learning/progress` requires `X-Forge-Local: 1`. Its successful result:

```json
{
  "mode": "sqlite",
  "databasePath": "/private/data/progress.sqlite",
  "databaseId": "persistent-random-uuid",
  "revision": 0,
  "updatedAt": null,
  "progress": {
    "completed": [],
    "checks": {},
    "notes": {},
    "quizzes": {},
    "lastLesson": null
  }
}
```

`PUT` to the same endpoint requires the custom header, JSON content type, and
exactly `{ "databaseId": "the ID returned by GET", "baseRevision": 0, "progress": { ... } }`. A successful transaction
returns the same envelope with an incremented revision and ISO timestamp.

The stored progress accepts exactly the five displayed fields. Lesson IDs,
acceptance keys, and quiz indices are validated against the current
curriculum. Completion IDs cannot repeat. Check values must be Boolean.
Each note has a maximum of 50,000 characters and requests have a 2 MiB byte
limit. Unsupported fields or values are rejected without altering the
stored record. Imports are deliberately strict; they do not silently discard
unknown lesson data.

If another tab or process saved first, or a different database is now
attached at the same address, the response is `409` with
`error.code: "PROGRESS_CONFLICT"` and the current envelope. Clients must
preserve their unsaved draft and let the learner review/reload before a new
save; a client must not blindly retry with the latest revision. Database
identity distinguishes separate installations which happen to have the same
revision and is checked before any write. It remains stable across restarts.

The endpoint accepts only loopback hosts with this server's actual port and
a matching `Origin` when present. It sends no CORS permission. Static serving
does not expose the data directory or database files. This is a local
single-user facility, not an authenticated multi-user network service.

## Test isolation

`FORGE_PROGRESS_MODE=browser` returns `{ "mode": "browser" }` for reads and
disables writes without opening a SQLite database. Existing browser-only
training suites use this mode. Persistence tests must supply a temporary
`FORGE_DATA_DIR`; they must never use a learner's real home database.

```sh
node --test local-data/*.test.mjs
```

These tests cover connection and process restarts, simultaneous writers,
stale revisions, rejected inputs, import/export, unsupported/corrupt
databases, browser mode, and the local HTTP boundary.

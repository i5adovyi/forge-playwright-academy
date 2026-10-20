# Your learning data: save, back up, recover

Use `npm run local` for the complete desktop development project. The browser is
its interface; Node runs the workshop and a SQLite database stores your learning
record. Use Node.js **22.13 or newer**; Node 24 is recommended.

## Where things are saved

| What | Full local workshop | OpenAI site or static preview |
| --- | --- | --- |
| Completed lessons, exercise checks, quiz selections, notes, last lesson | SQLite on this computer | This browser origin's local storage |
| Unconfirmed edits | Browser recovery draft, when browser storage is available | Browser storage |
| Lessons, code, starters and solutions | Project files and private GitHub | Deployed source/build |
| Practice shop carts and orders | Temporary training sessions | Live practice needs the local workshop |

The default database is `~/.forge-playwright-academy/progress.sqlite`. It is
outside the repository. Reopening the browser, restarting the server, updating
code, or signing into a different OpenAI account does not remove it. The `~`
means your operating-system user's home directory.

All local clones using this default directory share one learner record. To
separate learners or projects, choose a private directory outside the checkout:

```sh
FORGE_DATA_DIR=/absolute/path/to/academy-data npm run local
```

In PowerShell, set `$env:FORGE_DATA_DIR = "C:\Users\YourName\AcademyData"` before
running `npm run local`. Use that same environment setting for backup commands.
Changing the directory chooses a different database; it does not move the old
record. The storage panel in **My progress** shows the active database path.

The database is local, single-user storage. It has no learner login and no
cloud synchronization. Its contents are not encrypted by this application;
your operating-system account, disk protection and private backups protect it.
The server listens only on loopback. Do not expose this training server as a
multi-user public service.

## Finish a session safely

The status bar shows whether your record is loading, saving, saved, or needs
attention. Wait for the saved status before closing the browser or stopping
the server. Editing is unavailable until the initial database read succeeds,
so an outage cannot silently start you with an empty replacement record.

Notes and other changes save automatically. A successful save acknowledges a
database revision. This is different from merely displaying your latest typing.
If a save fails, the current draft stays visible and is retained in browser
storage when possible. **Retry save** checks the saved record before trying
again. A lost response may have followed a successful commit; retry reconciles
that situation without blindly writing again.

If browser backup is unavailable or full, the portal says so. Export the draft
before closing. Clearing browser data can erase unconfirmed drafts; it does
not erase committed SQLite data.

## Two tabs, two browsers, or a changed database

Tabs load a snapshot; they do not continuously synchronize while you read.
The database identity and revision guard every write. If another tab saves
first, the stale tab keeps its draft and reports a conflict instead of
overwriting the newer record.

Open **My progress → Your progress storage**. You can:

1. Export your draft and the saved database record to preserve both.
2. Choose **Reload saved record** to discard this tab's draft after confirmation.
3. Or review the differences and explicitly **Replace saved record with my
   draft**. The replacement still checks for a concurrent change.

There is no automatic note merge. A browser recovery draft can be reviewed
without committing it immediately. A draft from a different database is
identified separately. Switching `FORGE_DATA_DIR` never authorizes an old tab
to overwrite the new database just because both happen to use revision 1.

## Move from the old hosted site

On the original site, open **My progress → Export progress**. Save that JSON
privately. Start the local workshop, open **My progress → Import progress**,
review the replacement confirmation, and wait for a confirmed save. Reopen a
lesson and check its note before deleting any old backup.

The local portal cannot read the hosted domain's browser storage. Different
sites, hostnames and ports have separate browser storage. A new-account site
also needs this export/import step. GitHub contains code, not these records.
For the same local server origin, a previous browser-only record is migrated
automatically only into an empty database. If the database already has data,
the portal keeps it and offers the previous browser record for review/export.

## Back up the committed database

Run these in the project folder, using your chosen `FORGE_DATA_DIR` if applicable:

```sh
npm run data:status
npm run data:export -- /absolute/private/forge-progress-2026-10-20.json
```

Choose an existing private parent directory and a new filename. Export refuses
to overwrite an existing file. It reads a consistent committed snapshot and
works while the server is running. A browser draft that has not saved is not
part of this database export; export that draft from the portal separately.

Restore through the portal, or use the CLI after exporting the current record:

```sh
npm run data:status
npm run data:import -- /absolute/private/forge-progress-2026-10-20.json --expected-revision 0
```

Replace `0` with the actual revision reported by `data:status`; zero means an
empty record. Import replaces the complete learning record. If someone saves
between status and import, the revision mismatch rejects the import. The
record is validated against the installed curriculum, including lesson/check
IDs and quiz options. Import an older export with the matching or newer
curriculum; do not strip rejected fields just to force it through.

Keep JSON backups outside Git and source folders. The build and account-copy
tools omit recognized learner data, database files and configured data paths,
but arbitrary personal files do not belong among publishable course assets.

## Recover after a problem

If the server stops, restart it with the same data directory and use **Retry
save** or **Retry loading**. If a recovery draft appears, review it before
replacing the saved database record.

If the database is corrupt or from an unsupported future schema, the application
does not reset it. Stop every process using that directory, preserve the entire
directory, select a new empty `FORGE_DATA_DIR`, and restore a known good export.
Verify notes there before changing your normal configuration. Without an
export, retain the original files for recovery; do not delete the database.

For a raw filesystem backup, stop every server and CLI using the directory
first, then copy the whole directory. SQLite may have `-wal` and `-shm` sidecars.
Copying only the live `.sqlite` file can miss committed data; prefer JSON
export for routine backups and transfers.

## Tests leave your learning record alone

Main Playwright tests own a browser-only server on 4175; visual tests use 4176.
They do not reuse the personal workshop on 4173. The persistence suite uses
disposable directories and verifies real SQLite saves, restarts, conflicts,
failed requests and recovery. Never point your own destructive test at the
learner's data directory.

```sh
npm run test:data
npm run test:persistence
npm run test:portability
```

For a different OpenAI account, continue with [Account handoff](ACCOUNT-HANDOFF.md).
The HTTP/storage implementation is documented in `local-data/README.md`.

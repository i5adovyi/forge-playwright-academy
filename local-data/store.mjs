import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { lessons } from '../portal/content/curriculum.js';

export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const PROGRESS_FIELDS = ['completed', 'checks', 'notes', 'quizzes', 'lastLesson'];
const lessonById = new Map(lessons.map(lesson => [lesson.id, lesson]));
const checkKeys = new Set(lessons.flatMap(lesson => lesson.exercises.flatMap(exercise =>
  exercise.acceptance.map((_, index) => `${lesson.id}/${exercise.id}/${index}`))));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => object(value) && Object.keys(value).length === keys.length &&
  keys.every(key => Object.hasOwn(value, key));

export const emptyProgress = () => ({ completed: [], checks: {}, notes: {}, quizzes: {}, lastLesson: null });
export const resolveDataDirectory = (env = process.env) => path.resolve(env.FORGE_DATA_DIR || path.join(os.homedir(), '.forge-playwright-academy'));

export class ProgressValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProgressValidationError';
    this.code = 'INVALID_PROGRESS';
    this.status = 400;
  }
}

export function validateProgress(value) {
  const reject = message => { throw new ProgressValidationError(message); };
  if (!exactKeys(value, PROGRESS_FIELDS)) reject('Progress must contain exactly completed, checks, notes, quizzes, and lastLesson.');
  if (!Array.isArray(value.completed) || value.completed.length > lessons.length ||
      value.completed.some(id => typeof id !== 'string' || !lessonById.has(id)) ||
      new Set(value.completed).size !== value.completed.length) reject('Completed lessons must be unique known lesson IDs.');
  for (const field of ['checks', 'notes', 'quizzes']) {
    if (!object(value[field])) reject(`${field} must be an object.`);
  }
  if (Object.keys(value.checks).length > checkKeys.size ||
      Object.entries(value.checks).some(([key, item]) => !checkKeys.has(key) || typeof item !== 'boolean')) reject('Checks must use known acceptance keys and Boolean values.');
  if (Object.keys(value.notes).length > lessons.length ||
      Object.entries(value.notes).some(([key, item]) => !lessonById.has(key) || typeof item !== 'string' || item.length > 50000)) reject('Notes must use known lesson IDs and at most 50000 characters per lesson.');
  if (Object.keys(value.quizzes).length > lessons.length ||
      Object.entries(value.quizzes).some(([key, item]) => !lessonById.has(key) || !Number.isInteger(item) ||
        item < 0 || item >= lessonById.get(key).quiz.options.length)) reject('Quiz answers must be valid option indices for known lessons.');
  if (value.lastLesson !== null && !lessonById.has(value.lastLesson)) reject('Last lesson must be null or a known lesson ID.');
  const encoded = JSON.stringify(value);
  if (Buffer.byteLength(encoded) > MAX_BODY_BYTES - 128) reject('Progress is too large for the local save limit.');
  return JSON.parse(encoded);
}

export function validateWrite(value) {
  if (!exactKeys(value, ['databaseId', 'baseRevision', 'progress']) ||
      typeof value.databaseId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.databaseId) ||
      !Number.isSafeInteger(value.baseRevision) || value.baseRevision < 0) {
    throw new ProgressValidationError('Send exactly databaseId from the loaded record, baseRevision (a nonnegative safe integer), and progress.');
  }
  return { databaseId: value.databaseId, baseRevision: value.baseRevision, progress: validateProgress(value.progress) };
}

export function decodeExport(value) {
  if (!object(value)) throw new ProgressValidationError('Import a Forge progress JSON object.');
  const allowed = new Set([...PROGRESS_FIELDS, 'format', 'exportedAt']);
  if (Object.keys(value).some(key => !allowed.has(key))) throw new ProgressValidationError('The backup contains unknown fields.');
  if (Object.hasOwn(value, 'format') && value.format !== 'forge-academy-v1') throw new ProgressValidationError('Unsupported progress export format.');
  if (Object.hasOwn(value, 'exportedAt') && (typeof value.exportedAt !== 'string' || !Number.isFinite(Date.parse(value.exportedAt)))) {
    throw new ProgressValidationError('Invalid export date.');
  }
  const progress = Object.fromEntries(PROGRESS_FIELDS.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
  return validateProgress(progress);
}

// One local learner, intentionally independent of OpenAI/GitHub login and shop sessions.
// No automatic repair or reset: a damaged/unsupported database must remain recoverable.
export function openProgressStore({ dataDirectory = resolveDataDirectory() } = {}) {
  dataDirectory = path.resolve(dataDirectory);
  mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
  const databasePath = path.join(dataDirectory, 'progress.sqlite');
  const db = new DatabaseSync(databasePath);
  let closed = false;
  try {
    db.exec('PRAGMA busy_timeout = 5000;');
    const version = db.prepare('PRAGMA user_version').get().user_version;
    if (version !== 0 && version !== 1) throw new Error(`Unsupported progress database version ${version}. Preserve this file and use a matching application version.`);
    chmodSync(databasePath, 0o600);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;');
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(`CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY, value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS learner_progress (
        singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
        revision INTEGER NOT NULL CHECK (revision >= 1),
        updated_at TEXT NOT NULL,
        progress_json TEXT NOT NULL
      );`);
      db.prepare('INSERT OR IGNORE INTO metadata(key, value) VALUES (?, ?)').run('databaseId', randomUUID());
      db.exec('PRAGMA user_version = 1; COMMIT;');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
    const databaseId = db.prepare("SELECT value FROM metadata WHERE key = 'databaseId'").get().value;
    if (typeof databaseId !== 'string' || !databaseId) throw new Error('Invalid database identity. Preserve the database and restore a verified export.');
    const read = () => {
      if (closed) throw new Error('Progress database is closed.');
      const row = db.prepare('SELECT revision, updated_at, progress_json FROM learner_progress WHERE singleton = 1').get();
      return {
        mode: 'sqlite', databasePath, databaseId,
        revision: row?.revision ?? 0,
        updatedAt: row?.updated_at ?? null,
        progress: row ? validateProgress(JSON.parse(row.progress_json)) : emptyProgress(),
      };
    };
    return {
      databasePath, databaseId,
      read,
      write(input) {
        const { databaseId: expectedDatabaseId, baseRevision, progress } = validateWrite(input);
        if (closed) throw new Error('Progress database is closed.');
        db.exec('BEGIN IMMEDIATE');
        let inTransaction = true;
        try {
          const current = read();
          if (current.databaseId !== expectedDatabaseId || current.revision !== baseRevision) {
            db.exec('ROLLBACK');
            inTransaction = false;
            return { conflict: true, ...current };
          }
          if (baseRevision >= Number.MAX_SAFE_INTEGER) throw new Error('Progress revision limit reached.');
          const updatedAt = new Date().toISOString();
          db.prepare(`INSERT INTO learner_progress(singleton, revision, updated_at, progress_json)
            VALUES (1, ?, ?, ?) ON CONFLICT(singleton) DO UPDATE SET
            revision = excluded.revision, updated_at = excluded.updated_at, progress_json = excluded.progress_json`)
            .run(baseRevision + 1, updatedAt, JSON.stringify(progress));
          db.exec('COMMIT');
          inTransaction = false;
          return { mode: 'sqlite', databasePath, databaseId, revision: baseRevision + 1, updatedAt, progress };
        } catch (error) {
          if (inTransaction) db.exec('ROLLBACK');
          throw error;
        }
      },
      close() {
        if (!closed) {
          db.close();
          closed = true;
        }
      },
    };
  } catch (error) {
    db.close();
    throw error;
  }
}

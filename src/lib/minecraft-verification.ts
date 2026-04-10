import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type VerificationRow = {
  web_user_id: string;
  requested_username: string | null;
  code: string;
  status: "pending" | "verified" | "failed" | "expired";
  minecraft_username: string | null;
  created_at: number;
  expires_at: number;
  verified_at: number | null;
  attempts: number;
  last_attempt_at: number | null;
};

const DEFAULT_TTL_MS = 10 * 60 * 1000;

let dbInstance: Database.Database | null = null;

const getDbPath = () => {
  const custom = process.env.MC_VERIFY_DB_PATH?.trim();
  if (custom) return path.resolve(custom);
  if (process.env.VERCEL) return "/tmp/minecraft-verification.db";
  return path.join(process.cwd(), "data", "minecraft-verification.db");
};

const initDb = (db: Database.Database) => {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS minecraft_verifications (
      web_user_id TEXT PRIMARY KEY,
      requested_username TEXT,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      minecraft_username TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      verified_at INTEGER,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_attempt_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_minecraft_verifications_code
      ON minecraft_verifications(code);
    CREATE INDEX IF NOT EXISTS idx_minecraft_verifications_status_expires
      ON minecraft_verifications(status, expires_at);
  `);
};

const getDb = () => {
  if (dbInstance) return dbInstance;
  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  dbInstance = new Database(dbPath);
  initDb(dbInstance);
  return dbInstance;
};

const makeSixDigitCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const getUniquePendingCode = (db: Database.Database) => {
  const stmt = db.prepare(
    "SELECT 1 FROM minecraft_verifications WHERE code = ? AND status = 'pending' AND expires_at > ? LIMIT 1"
  );
  let code = makeSixDigitCode();
  let guard = 0;
  while (guard < 20) {
    const exists = stmt.get(code, Date.now());
    if (!exists) return code;
    code = makeSixDigitCode();
    guard++;
  }
  return code;
};

export const createVerificationCode = (webUserId: string, requestedUsername: string | null) => {
  const db = getDb();
  const now = Date.now();
  const code = getUniquePendingCode(db);
  const expiresAt = now + DEFAULT_TTL_MS;

  db.prepare(
    `
      INSERT INTO minecraft_verifications (
        web_user_id, requested_username, code, status, minecraft_username, created_at, expires_at, verified_at, attempts, last_attempt_at
      )
      VALUES (?, ?, ?, 'pending', NULL, ?, ?, NULL, 0, NULL)
      ON CONFLICT(web_user_id) DO UPDATE SET
        requested_username = excluded.requested_username,
        code = excluded.code,
        status = 'pending',
        minecraft_username = NULL,
        created_at = excluded.created_at,
        expires_at = excluded.expires_at,
        verified_at = NULL,
        attempts = 0,
        last_attempt_at = NULL
    `
  ).run(webUserId, requestedUsername, code, now, expiresAt);

  return { code, expiresAt };
};

export const getVerificationStatus = (webUserId: string) => {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM minecraft_verifications WHERE web_user_id = ?")
    .get(webUserId) as VerificationRow | undefined;

  if (!row) return null;
  if (row.status === "pending" && row.expires_at <= Date.now()) {
    db.prepare("UPDATE minecraft_verifications SET status = 'expired' WHERE web_user_id = ?").run(webUserId);
    return { ...row, status: "expired" as const };
  }
  return row;
};

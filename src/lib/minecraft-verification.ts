import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";

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
const TABLE = "minecraft_verifications";

let dbInstance: Database.Database | null = null;
let supabaseClient: ReturnType<typeof createClient> | null | undefined;

const getSupabase = () => {
  if (supabaseClient !== undefined) return supabaseClient;
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !serviceRole) {
    supabaseClient = null;
    return supabaseClient;
  }
  supabaseClient = createClient(url, serviceRole, { auth: { persistSession: false } });
  return supabaseClient;
};

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

const createVerificationCodeSqlite = (webUserId: string, requestedUsername: string | null) => {
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

const getVerificationStatusSqlite = (webUserId: string) => {
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

const getUniquePendingCodeSupabase = async (supabase: any) => {
  let code = makeSixDigitCode();
  let guard = 0;
  while (guard < 20) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("code")
      .eq("code", code)
      .eq("status", "pending")
      .gt("expires_at", Date.now())
      .limit(1);
    if (error) throw error;
    if (!data?.length) return code;
    code = makeSixDigitCode();
    guard += 1;
  }
  return code;
};

export const createVerificationCode = async (webUserId: string, requestedUsername: string | null) => {
  const supabase = getSupabase();
  if (!supabase) return createVerificationCodeSqlite(webUserId, requestedUsername);
  const admin = supabase as any;

  const now = Date.now();
  const code = await getUniquePendingCodeSupabase(admin);
  const expiresAt = now + DEFAULT_TTL_MS;

  const payload = {
    web_user_id: webUserId,
    requested_username: requestedUsername,
    code,
    status: "pending",
    minecraft_username: null,
    created_at: now,
    expires_at: expiresAt,
    verified_at: null,
    attempts: 0,
    last_attempt_at: null,
  };

  const { error } = await admin.from(TABLE).upsert(payload, { onConflict: "web_user_id" });
  if (error) throw error;

  return { code, expiresAt };
};

export const getVerificationStatus = async (webUserId: string): Promise<VerificationRow | null> => {
  const supabase = getSupabase();
  if (!supabase) return getVerificationStatusSqlite(webUserId);
  const admin = supabase as any;

  const { data, error } = await admin
    .from(TABLE)
    .select("*")
    .eq("web_user_id", webUserId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (data.status === "pending" && data.expires_at <= Date.now()) {
    const { error: expireError } = await admin
      .from(TABLE)
      .update({ status: "expired" })
      .eq("web_user_id", webUserId);
    if (expireError) throw expireError;
    return { ...(data as VerificationRow), status: "expired" };
  }

  return data as VerificationRow;
};

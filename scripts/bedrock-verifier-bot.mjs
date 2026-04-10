import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bedrock from "bedrock-protocol";
import Database from "better-sqlite3";

const HOST = process.env.MC_SERVER_HOST || "DonutSMP.net";
const PORT = Number(process.env.MC_SERVER_PORT || 19132);
const PROFILE_NAME = process.env.MC_BOT_PROFILE || "DonutVerifyBot";
const BOT_REPLY_NAME = (process.env.MC_VERIFY_BOT_NAME || PROFILE_NAME).trim();
const PROFILES_FOLDER = process.env.MC_PROFILES_FOLDER || path.join(process.cwd(), ".minecraft-bot");
const DB_PATH =
  process.env.MC_VERIFY_DB_PATH || path.join(process.cwd(), "data", "minecraft-verification.db");
const MAX_RECONNECT_DELAY_MS = 30_000;

let client = null;
let reconnectDelay = 2_000;
let reconnectTimer = null;
let antiAfkTimer = null;
let connectionWatchdogTimer = null;
let isStopping = false;
let tickCounter = 0;
let currentPosition = { x: 0, y: 0, z: 0 };
let runtimeEntityId = null;
let lastPacketAt = Date.now();

const senderRateLimit = new Map();

const now = () => Date.now();

const db = (() => {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const instance = new Database(DB_PATH);
  instance.pragma("journal_mode = WAL");
  instance.exec(`
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
  `);
  return instance;
})();

const consumeCodeStmt = db.prepare(`
  SELECT web_user_id, code, status, expires_at
  FROM minecraft_verifications
  WHERE code = ?
  LIMIT 1
`);

const verifyStmt = db.prepare(`
  UPDATE minecraft_verifications
  SET status = 'verified',
      minecraft_username = ?,
      verified_at = ?,
      attempts = attempts + 1,
      last_attempt_at = ?
  WHERE web_user_id = ?
`);

const attemptStmt = db.prepare(`
  UPDATE minecraft_verifications
  SET attempts = attempts + 1,
      last_attempt_at = ?
  WHERE code = ?
`);

const expireOldStmt = db.prepare(`
  UPDATE minecraft_verifications
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at <= ?
`);

function normalizeType(type) {
  if (typeof type === "string") return type.toLowerCase();
  if (type === 7) return "whisper";
  if (type === 9) return "json_whisper";
  return String(type || "").toLowerCase();
}

function isWhisperPacket(packet) {
  const type = normalizeType(packet.type);
  return type === "whisper" || type === "json_whisper";
}

function extractCode(message) {
  const match = String(message || "").match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

function isRateLimited(sender) {
  const key = sender.toLowerCase();
  const bucket = senderRateLimit.get(key) || { count: 0, windowStart: now(), last: 0 };
  const current = now();

  if (current - bucket.windowStart > 10_000) {
    bucket.count = 0;
    bucket.windowStart = current;
  }
  if (current - bucket.last < 1_000) {
    senderRateLimit.set(key, bucket);
    return true;
  }
  bucket.last = current;
  bucket.count += 1;
  senderRateLimit.set(key, bucket);
  return bucket.count > 6;
}

function sendCommand(text) {
  if (!client) return;
  try {
    client.queue("text", {
      needs_translation: false,
      type: "chat",
      source_name: BOT_REPLY_NAME,
      message: text,
      xuid: "",
      platform_chat_id: "",
      has_filtered_message: false,
    });
  } catch (error) {
    console.error("[bot] failed sending command:", error);
  }
}

function sendWhisper(target, text) {
  const safeTarget = String(target || "").replace(/[^A-Za-z0-9_]/g, "");
  if (!safeTarget) return;
  sendCommand(`/msg ${safeTarget} ${text}`);
}

function consumeVerificationCode(sender, code) {
  expireOldStmt.run(now());
  const row = consumeCodeStmt.get(code);
  if (!row) return { ok: false, reason: "invalid" };

  if (row.status === "verified") return { ok: false, reason: "already_verified" };
  if (row.status !== "pending" || row.expires_at <= now()) {
    attemptStmt.run(now(), code);
    return { ok: false, reason: "expired" };
  }

  verifyStmt.run(sender, now(), now(), row.web_user_id);
  return { ok: true, webUserId: row.web_user_id };
}

function startAntiAfk() {
  stopAntiAfk();
  antiAfkTimer = setInterval(() => {
    if (!client) return;
    tickCounter += 1;
    const moveRight = tickCounter % 2 === 0;
    const wiggle = moveRight ? 0.16 : -0.16;
    const yaw = moveRight ? 8 : -8;
    try {
      client.queue("player_auth_input", {
        pitch: 0,
        yaw,
        position: currentPosition,
        move_vector: { x: wiggle, z: 0 },
        head_yaw: yaw,
        input_data: { right: moveRight, left: !moveRight },
        input_mode: "mouse",
        play_mode: "normal",
        interaction_model: "crosshair",
        interact_rotation: { x: 0, y: 0 },
        tick: tickCounter,
        delta: { x: wiggle * 0.01, y: 0, z: 0 },
        analogue_move_vector: { x: wiggle, z: 0 },
        camera_orientation: { x: 0, y: 0, z: 1 },
        raw_move_vector: { x: wiggle, z: 0 },
      });
      if (runtimeEntityId !== null) {
        client.queue("move_player", {
          runtime_id: runtimeEntityId,
          position: {
            x: currentPosition.x + wiggle * 0.02,
            y: currentPosition.y,
            z: currentPosition.z,
          },
          pitch: 0,
          yaw,
          head_yaw: yaw,
          mode: "normal",
          on_ground: true,
          ridden_runtime_id: 0,
          tick: tickCounter,
        });
      }
    } catch (error) {
      console.error("[bot] anti-afk send error:", error);
    }
  }, 2_500);
}

function stopAntiAfk() {
  if (!antiAfkTimer) return;
  clearInterval(antiAfkTimer);
  antiAfkTimer = null;
}

function startConnectionWatchdog() {
  stopConnectionWatchdog();
  connectionWatchdogTimer = setInterval(() => {
    if (!client) return;
    const idleMs = Date.now() - lastPacketAt;
    if (idleMs > 25_000) {
      console.warn(`[bot] packet watchdog triggered (${idleMs}ms idle), reconnecting`);
      try {
        client.close();
      } catch {
        // no-op
      }
    }
  }, 5_000);
}

function stopConnectionWatchdog() {
  if (!connectionWatchdogTimer) return;
  clearInterval(connectionWatchdogTimer);
  connectionWatchdogTimer = null;
}

function scheduleReconnect(reason) {
  if (isStopping || reconnectTimer) return;
  const wait = reconnectDelay;
  reconnectDelay = Math.min(Math.floor(reconnectDelay * 1.6), MAX_RECONNECT_DELAY_MS);
  console.warn(`[bot] reconnecting in ${wait}ms (${reason})`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, wait);
}

function attachHandlers(bot) {
  bot.on("packet", () => {
    lastPacketAt = Date.now();
  });

  bot.on("join", () => {
    reconnectDelay = 2_000;
    lastPacketAt = Date.now();
    runtimeEntityId = null;
    console.log("[bot] joined server");
  });

  bot.on("spawn", () => {
    console.log("[bot] spawned, anti-afk loop active");
    startAntiAfk();
    startConnectionWatchdog();
  });

  bot.on("start_game", (packet) => {
    if (packet?.runtime_entity_id !== undefined && packet?.runtime_entity_id !== null) {
      runtimeEntityId = packet.runtime_entity_id;
    }
    if (packet?.player_position) {
      currentPosition = {
        x: Number(packet.player_position.x || 0),
        y: Number(packet.player_position.y || 0),
        z: Number(packet.player_position.z || 0),
      };
    }
  });

  bot.on("move_player", (packet) => {
    if (!packet?.position) return;
    currentPosition = {
      x: Number(packet.position.x || 0),
      y: Number(packet.position.y || 0),
      z: Number(packet.position.z || 0),
    };
  });

  bot.on("text", (packet) => {
    const sender = String(packet?.source_name || "").trim();
    const message = String(packet?.message || "").trim();
    if (!sender || !message) return;
    if (!isWhisperPacket(packet)) return;
    if (sender.toLowerCase() === BOT_REPLY_NAME.toLowerCase()) return;
    if (isRateLimited(sender)) return;

    const code = extractCode(message);
    if (!code) {
      sendWhisper(sender, `Send a 6-digit code only. Example: /msg ${BOT_REPLY_NAME} 123456`);
      return;
    }

    const result = consumeVerificationCode(sender, code);
    if (result.ok) {
      sendWhisper(sender, "Verification successful. Your web account is now linked.");
      console.log(`[bot] linked ${sender} to ${result.webUserId}`);
      return;
    }

    if (result.reason === "already_verified") {
      sendWhisper(sender, "That code was already used.");
    } else if (result.reason === "expired") {
      sendWhisper(sender, "That code expired. Request a new code on the website.");
    } else {
      sendWhisper(sender, "Invalid code. Check the website and try again.");
    }
  });

  bot.on("kick", (reason) => {
    stopAntiAfk();
    stopConnectionWatchdog();
    console.warn("[bot] kicked:", reason);
    scheduleReconnect("kick");
  });

  bot.on("close", () => {
    stopAntiAfk();
    stopConnectionWatchdog();
    console.warn("[bot] connection closed");
    scheduleReconnect("close");
  });

  bot.on("error", (error) => {
    stopAntiAfk();
    stopConnectionWatchdog();
    console.error("[bot] error:", error);
    scheduleReconnect("error");
  });
}

function connect() {
  if (isStopping) return;
  console.log(`[bot] connecting to ${HOST}:${PORT} as ${PROFILE_NAME}`);
  client = bedrock.createClient({
    host: HOST,
    port: PORT,
    username: PROFILE_NAME,
    profilesFolder: PROFILES_FOLDER,
    onMsaCode: (codeInfo) => {
      console.log("[bot] microsoft sign-in required");
      console.log(`[bot] open: ${codeInfo.verification_uri}`);
      console.log(`[bot] code: ${codeInfo.user_code}`);
    },
  });
  attachHandlers(client);
}

process.on("SIGINT", () => {
  isStopping = true;
  stopAntiAfk();
  stopConnectionWatchdog();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (client) {
    try {
      client.close();
    } catch {
      // no-op
    }
  }
  console.log("[bot] stopped");
  process.exit(0);
});

connect();

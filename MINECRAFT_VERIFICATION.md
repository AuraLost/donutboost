# Minecraft Bedrock Verification

This project now includes a Bedrock verification flow that links website users to Minecraft accounts on `DonutSMP.net`.

## Website Flow

1. User opens the Minecraft verification modal on the landing page.
2. Website requests a unique 6-digit code from `POST /api/minecraft/request-code`.
3. The code is stored in SQLite (`data/minecraft-verification.db`) with a short expiry.
4. User joins DonutSMP and whispers the bot:
   - `/msg <BotName> <Code>`
5. Bot validates code in SQLite and marks the record as verified with the sender's Minecraft username.
6. Website polls `GET /api/minecraft/status` and completes login when status is `verified`.

## API Endpoints

- `POST /api/minecraft/request-code`
  - body: `{ webUserId, requestedUsername }`
  - response: `{ code, expiresAt }`

- `GET /api/minecraft/status?webUserId=<id>`
  - response includes `status`, `minecraftUsername`, `expiresAt`, and attempts.

## Bot Script

Run:

```bash
npm run bot:minecraft-verify
```

Script path:

- `scripts/bedrock-verifier-bot.mjs`

### Required Environment Variables

```bash
MC_SERVER_HOST=DonutSMP.net
MC_SERVER_PORT=19132
MC_BOT_PROFILE=YourMicrosoftBotProfileName
MC_VERIFY_BOT_NAME=.LilHazMC
# Optional:
MC_VERIFY_DB_PATH=./data/minecraft-verification.db
MC_PROFILES_FOLDER=./.minecraft-bot
NEXT_PUBLIC_MC_VERIFY_BOT_NAME=.LilHazMC
```

`NEXT_PUBLIC_MC_VERIFY_BOT_NAME` is used by the website UI for instruction text.

## Anti-AFK + Reconnect

The bot includes:

- a repeating `player_auth_input` loop to keep activity flowing
- automatic reconnect with exponential backoff on `kick`, `close`, or `error`

## Security Best Practices Implemented

- Only processes whisper packets (`whisper` / `json_whisper`)
- Accepts strict 6-digit codes only
- Applies per-sender rate limiting to reduce spam abuse
- Expires stale pending codes before validation
- Stores verification status transitions (`pending` -> `verified` / `expired`)

## Additional Hardening Recommendations

- Run the bot behind process supervision (`pm2`, Docker restart policies, or systemd).
- Restrict filesystem access to DB + profile cache only in production.
- Rotate and back up the SQLite DB.
- Add an admin endpoint to manually invalidate stuck pending records if needed.

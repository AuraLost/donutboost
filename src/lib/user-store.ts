import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AppUser = {
  id: string;
  username: string;
  password_hash: string;
  balance: number;
  total_wins: number;
  total_losses: number;
  total_wagered: number;
  total_payout: number;
  discord_username: string | null;
  discord_bonus_claimed: boolean;
};

export type PublicUser = {
  id: string;
  username: string;
  balance: number;
  totalWins: number;
  totalLosses: number;
  totalWagered: number;
  totalPayout: number;
  discordUsername: string | null;
  discordLinked: boolean;
};

const TABLE = "app_users";

const normalize = (row: AppUser): PublicUser => ({
  id: row.id,
  username: row.username,
  balance: Number(row.balance || 0),
  totalWins: Number(row.total_wins || 0),
  totalLosses: Number(row.total_losses || 0),
  totalWagered: Number(row.total_wagered || 0),
  totalPayout: Number(row.total_payout || 0),
  discordUsername: row.discord_username,
  discordLinked: Boolean(row.discord_username),
});

const db = () => getSupabaseAdmin() as any;

export const getUserByUsername = async (username: string) => {
  const { data, error } = await db().from(TABLE).select("*").eq("username", username).maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AppUser | null) ?? null;
};

export const getUserById = async (id: string) => {
  const { data, error } = await db().from(TABLE).select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AppUser | null) ?? null;
};

export const createUser = async (params: { username: string; passwordHash: string }) => {
  const { data, error } = await db()
    .from(TABLE)
    .insert({
      username: params.username,
      password_hash: params.passwordHash,
      balance: 1_000_000,
      total_wins: 0,
      total_losses: 0,
      total_wagered: 0,
      total_payout: 0,
      discord_bonus_claimed: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as AppUser;
};

export const syncEconomy = async (
  id: string,
  patch: {
    balance: number;
    totalWins: number;
    totalLosses: number;
    totalWagered: number;
    totalPayout: number;
  }
) => {
  const { data, error } = await db()
    .from(TABLE)
    .update({
      balance: Math.max(0, Math.floor(patch.balance)),
      total_wins: Math.max(0, Math.floor(patch.totalWins)),
      total_losses: Math.max(0, Math.floor(patch.totalLosses)),
      total_wagered: Math.max(0, Math.floor(patch.totalWagered)),
      total_payout: Math.max(0, Math.floor(patch.totalPayout)),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as AppUser;
};

export const linkDiscordAndAward = async (id: string, discordUsername: string) => {
  const existing = await getUserById(id);
  if (!existing) return null;

  const alreadyClaimed = existing.discord_bonus_claimed;
  const bonus = alreadyClaimed ? 0 : 500_000;

  const { data, error } = await db()
    .from(TABLE)
    .update({
      discord_username: discordUsername,
      discord_bonus_claimed: true,
      balance: Number(existing.balance || 0) + bonus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as AppUser;
};

export const toPublicUser = (user: AppUser) => normalize(user);

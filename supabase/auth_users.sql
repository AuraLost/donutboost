create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  balance bigint not null default 1000000,
  total_wins integer not null default 0,
  total_losses integer not null default 0,
  total_wagered bigint not null default 0,
  total_payout bigint not null default 0,
  discord_username text,
  discord_bonus_claimed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_users_username on public.app_users(username);

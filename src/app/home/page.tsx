"use client";

import React, { useEffect, useState } from "react";
import { Card, Button } from "@heroui/react";
import { Wallet, Trophy, Skull, Gamepad2, Link2 } from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";
import Link from "next/link";

const formatMoney = (v: number) => {
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
  return "$" + v.toLocaleString();
};

export default function HomeDashboardPage() {
  const { balance, totalWins, totalLosses, totalWagered, totalPayout, hydrateFromUser } = useEconomy();
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordTag, setDiscordTag] = useState("");

  useEffect(() => {
    void hydrateFromUser();
    const load = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setDiscordLinked(Boolean(data?.user?.discordLinked));
      setDiscordTag(data?.user?.discordUsername || "");
    };
    void load();
  }, [hydrateFromUser]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Dashboard</h1>
          <p className="text-white/40 font-medium text-sm md:text-base">Your account, performance, and current wallet status.</p>
        </div>
        <Link href="/">
          <Button className="bg-primary text-black font-black">Open Landing Page</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Wallet Value</p>
          <p className="text-3xl font-black mt-2 flex items-center gap-2"><Wallet className="text-primary" size={20} /> {formatMoney(balance)}</p>
        </Card>
        <Card className="bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Wins</p>
          <p className="text-3xl font-black mt-2 text-success flex items-center gap-2"><Trophy size={20} /> {totalWins}</p>
        </Card>
        <Card className="bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Losses</p>
          <p className="text-3xl font-black mt-2 text-danger flex items-center gap-2"><Skull size={20} /> {totalLosses}</p>
        </Card>
        <Card className="bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Discord</p>
          <p className="text-xl font-black mt-2 flex items-center gap-2">
            <Link2 size={18} className={discordLinked ? "text-success" : "text-white/40"} />
            {discordLinked ? (discordTag || "Linked") : "Not Linked"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Total Wagered</p>
          <p className="text-2xl font-black mt-2">{formatMoney(totalWagered)}</p>
        </Card>
        <Card className="bg-white/5 border border-white/10 p-5">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Total Payout</p>
          <p className="text-2xl font-black mt-2 text-success">{formatMoney(totalPayout)}</p>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/games/crash"><Button className="bg-primary text-black font-black"><Gamepad2 size={16} /> Crash</Button></Link>
        <Link href="/games/plinko"><Button className="bg-white/10 text-white font-black">Plinko</Button></Link>
        <Link href="/games/coinflip"><Button className="bg-white/10 text-white font-black">Coin Flip</Button></Link>
        <Link href="/games/chicken"><Button className="bg-white/10 text-white font-black">Chicken</Button></Link>
      </div>
    </div>
  );
}

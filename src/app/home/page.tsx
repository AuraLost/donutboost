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
  const [userId, setUserId] = useState("");
  const [mcUsername, setMcUsername] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"none" | "pending" | "verified" | "expired">("none");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    void hydrateFromUser();
    const load = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setDiscordLinked(Boolean(data?.user?.discordLinked));
      setDiscordTag(data?.user?.discordUsername || "");
      setUserId(data?.user?.id || "");
      setMcUsername(data?.user?.username || "");
    };
    void load();
  }, [hydrateFromUser]);

  useEffect(() => {
    if (!userId) return;

    const poll = async () => {
      const res = await fetch(`/api/minecraft/status?webUserId=${encodeURIComponent(userId)}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const status = (data?.status || "none") as "none" | "pending" | "verified" | "expired";
      setVerifyStatus(status);
      setExpiresAt(typeof data?.expiresAt === "number" ? data.expiresAt : null);
      if (status === "verified") {
        setVerifyMessage(`Verified as ${data?.minecraftUsername || mcUsername}.`);
      } else if (status === "pending") {
        setVerifyMessage("Waiting for in-game payment confirmation...");
      } else if (status === "expired") {
        setVerifyMessage("Verification code expired. Generate a new one.");
      } else {
        setVerifyMessage("");
      }
    };

    void poll();
    const iv = window.setInterval(poll, 3500);
    return () => window.clearInterval(iv);
  }, [userId, mcUsername]);

  useEffect(() => {
    if (verifyStatus !== "pending" || !expiresAt) return;
    const iv = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(iv);
  }, [verifyStatus, expiresAt]);

  const handleGenerateCode = async () => {
    if (!userId || isGeneratingCode) return;
    setIsGeneratingCode(true);
    try {
      const res = await fetch("/api/minecraft/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webUserId: userId,
          requestedUsername: mcUsername,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create verification code.");
      setExpiresAt(data.expiresAt || null);
      setVerifyStatus("pending");
      setVerifyMessage("Verification started. In Minecraft run /pay .LilHazMC 1.00");
    } catch (error) {
      setVerifyMessage(error instanceof Error ? error.message : "Failed to create verification code.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const expiresIn = (() => {
    if (!expiresAt) return "";
    const diff = Math.max(0, Math.floor((expiresAt - nowMs) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  })();

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

      <Card className="bg-white/5 border border-white/10 p-5 mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest">Minecraft Verification</p>
            <p className="text-sm text-white/70 font-bold mt-1">Linked Login: {mcUsername || "Unknown"}</p>
          </div>
          <div className={`text-xs font-black px-3 py-1 rounded-full border ${verifyStatus === "verified" ? "text-success border-success/30 bg-success/10" : "text-warning border-warning/30 bg-warning/10"}`}>
            {verifyStatus === "verified" ? "Verified" : "Not Verified"}
          </div>
        </div>

        {verifyStatus !== "verified" && (
          <div className="mt-4 space-y-3">
            <Button onClick={handleGenerateCode} isDisabled={isGeneratingCode || !userId} className="bg-primary text-black font-black">
              {isGeneratingCode ? "Generating..." : "Generate Verification Code"}
            </Button>
            {(verifyStatus === "pending" || verifyStatus === "expired") && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <p className="text-xs font-black uppercase tracking-wider text-primary/80">In-game Command</p>
                <p className="text-xl font-black text-primary tracking-wide">/pay .LilHazMC 1.00</p>
                {verifyStatus === "pending" && <p className="text-[11px] text-white/50 mt-1">Expires in {expiresIn}</p>}
              </div>
            )}
          </div>
        )}

        {verifyMessage && (
          <p className={`text-xs font-bold mt-3 ${verifyStatus === "verified" ? "text-success" : "text-white/70"}`}>
            {verifyMessage}
          </p>
        )}
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/games/crash"><Button className="bg-primary text-black font-black"><Gamepad2 size={16} /> Crash</Button></Link>
        <Link href="/games/plinko"><Button className="bg-white/10 text-white font-black">Plinko</Button></Link>
        <Link href="/games/coinflip"><Button className="bg-white/10 text-white font-black">Coin Flip</Button></Link>
        <Link href="/games/chicken"><Button className="bg-white/10 text-white font-black">Chicken</Button></Link>
      </div>
    </div>
  );
}

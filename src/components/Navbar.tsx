"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import {
  Menu,
  Wallet,
  X,
  Link2,
  CheckCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wrench,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";

const DISCORD_OAUTH_URL =
  "https://discord.com/oauth2/authorize?client_id=1491214914075889664&response_type=code&redirect_uri=https%3A%2F%2Fwww.donutboost.lol%2F&scope=identify+email";

export function Navbar() {
  const { balance, hydrateFromUser } = useEconomy();
  const pathname = usePathname();
  const router = useRouter();
  const [walletOpen, setWalletOpen] = useState(false);
  const [view, setView] = useState<"main" | "linkDiscord" | "maintenance">("main");
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordTag, setDiscordTag] = useState("");
  const [maintenanceType, setMaintenanceType] = useState<"deposit" | "withdraw">("deposit");
  const [username, setUsername] = useState("");

  useEffect(() => {
    void hydrateFromUser();
    const handler = () => setWalletOpen(true);
    window.addEventListener("open-wallet", handler);
    return () => window.removeEventListener("open-wallet", handler);
  }, [hydrateFromUser]);

  useEffect(() => {
    const loadMe = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.user) return;
      setDiscordLinked(Boolean(data.user.discordLinked));
      setDiscordTag(data.user.discordUsername || "");
      setUsername(data.user.username || "");
    };

    void loadMe();
  }, []);

  const formatBalance = (val: number) => {
    if (val >= 1_000_000_000_000) return "$" + (val / 1_000_000_000_000).toFixed(2) + "T";
    if (val >= 1_000_000_000) return "$" + (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000) return "$" + (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1_000) return "$" + (val / 1_000).toFixed(1) + "K";
    return "$" + val.toLocaleString();
  };

  const handleLinkDiscord = () => {
    if (discordLinked) return;
    window.location.href = DISCORD_OAUTH_URL;
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  const closeWallet = () => {
    setWalletOpen(false);
    setTimeout(() => setView("main"), 300);
  };

  if (pathname === "/" || pathname === "/landing") {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-2xl border-b border-white/5 z-50 px-4 md:px-6">
        <div className="flex items-center justify-between w-full h-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
              <img src="/logo.png" alt="DonutBoost Logo" className="w-8 h-8 object-contain group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all" />
              <span className="text-xl font-black tracking-tight text-white leading-none">
                DONUT<span className="text-primary">BOOST</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/home" className={`px-3 py-1.5 rounded-lg text-xs font-black border ${pathname === "/home" ? "bg-primary/15 text-primary border-primary/30" : "text-white/50 border-white/10 hover:text-white"}`}>
                Dashboard
              </Link>
              <Link href="/games/crash" className="px-3 py-1.5 rounded-lg text-xs font-black border text-white/50 border-white/10 hover:text-white">
                Games
              </Link>
              <Link href="/livebets" className="px-3 py-1.5 rounded-lg text-xs font-black border text-white/50 border-white/10 hover:text-white">
                Live
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl h-10 px-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-white leading-none" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {formatBalance(balance)}
                </span>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{username || "Account"}</span>
              </div>
              <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-primary text-black font-black h-7 rounded-lg px-3 gap-1.5 text-xs">
                <Wallet size={12} /> Wallet
              </Button>
              <Button onClick={handleLogout} size="sm" className="bg-white/10 text-white font-black h-7 rounded-lg px-3 gap-1.5 text-xs">
                <LogOut size={12} /> Logout
              </Button>
            </div>
            <div className="flex lg:hidden">
              <Button isIconOnly variant="ghost" className="border-none text-white/50">
                <Menu size={22} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {walletOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeWallet} />
          <div className="relative bg-[#0c0c0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <button onClick={closeWallet} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>

            {view === "main" && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary/15 rounded-2xl">
                    <Wallet size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Your Wallet</h2>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">DonutBoost Economy</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 mb-5 border border-white/5 text-center">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Available Balance</span>
                  <p className="text-5xl font-black text-white mt-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {formatBalance(balance)}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setMaintenanceType("deposit");
                      setView("maintenance");
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl transition-all group cursor-pointer"
                  >
                    <div className="p-2.5 bg-green-500/15 rounded-xl">
                      <ArrowDownToLine size={18} className="text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-black text-white">Deposit</p>
                      <p className="text-xs text-white/30 font-medium">Add funds to your wallet</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setMaintenanceType("withdraw");
                      setView("maintenance");
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl transition-all group cursor-pointer"
                  >
                    <div className="p-2.5 bg-red-500/15 rounded-xl">
                      <ArrowUpFromLine size={18} className="text-red-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-black text-white">Withdraw</p>
                      <p className="text-xs text-white/30 font-medium">Transfer funds out</p>
                    </div>
                  </button>

                  <div onClick={() => !discordLinked && setView("linkDiscord")} className={`w-full flex items-center gap-4 p-4 border rounded-2xl transition-all ${discordLinked ? "bg-green-500/5 border-green-500/20 cursor-default" : "bg-white/5 border-white/10 hover:bg-white/8 cursor-pointer group"}`}>
                    <div className={`p-2.5 rounded-xl ${discordLinked ? "bg-green-500/20" : "bg-[#5865F2]/15"}`}>
                      {discordLinked ? <CheckCircle size={18} className="text-green-400" /> : <Link2 size={18} className="text-[#5865F2]" />}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-black text-white">{discordLinked ? "Discord Connected" : "Link Discord"}</p>
                      <p className="text-xs text-white/30 font-medium">{discordLinked ? discordTag : "Claim +$500,000 bonus"}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {view === "maintenance" && (
              <div className="flex flex-col items-center text-center gap-6 py-4">
                <button onClick={() => setView("main")} className="self-start text-white/30 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold mb-2">
                  Back
                </button>
                <div className="p-5 bg-warning/15 rounded-3xl">
                  <Wrench size={48} className="text-warning animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight capitalize">{maintenanceType}</h3>
                  <p className="text-xs text-white/30 font-black uppercase tracking-widest mt-1">Temporarily Unavailable</p>
                </div>
              </div>
            )}

            {view === "linkDiscord" && (
              <>
                <button onClick={() => setView("main")} className="text-white/30 hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm font-bold">
                  Back
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#5865F2]/20 rounded-2xl">
                    <Link2 size={24} className="text-[#5865F2]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Link Discord</h2>
                    <p className="text-xs text-white/30 font-black uppercase tracking-widest mt-0.5">Claim $500,000 bonus</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 flex items-center text-white/60 font-bold text-sm">
                    {discordLinked ? `Connected: ${discordTag || "Discord"}` : "Authorize with Discord to claim +$500,000"}
                  </div>
                  <Button onClick={handleLinkDiscord} isDisabled={discordLinked} className="w-full h-12 bg-[#5865F2] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#5865F2]/20 hover:scale-[1.02] transition-transform">
                    {discordLinked ? "Already Linked" : "Connect Discord & Claim $500K"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { 
  Menu, 
  Wallet,
  X,
  Link2,
  LogIn,
  CheckCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";

const DISCORD_KEY = "donutboost_discord_linked";
const DISCORD_TAG_KEY = "donutboost_discord_tag";

export function Navbar() {
  const { balance, claimInitialBonus } = useEconomy();
  const pathname = usePathname();
  const [walletOpen, setWalletOpen] = useState(false);
  const [view, setView] = useState<"main" | "linkDiscord" | "maintenance">("main");
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordTag, setDiscordTag] = useState("");
  const [maintenanceType, setMaintenanceType] = useState<"deposit" | "withdraw">("deposit");

  // Persist
  useEffect(() => {
    const linked = localStorage.getItem(DISCORD_KEY) === "true";
    const tag = localStorage.getItem(DISCORD_TAG_KEY) || "";
    setDiscordLinked(linked);
    setDiscordTag(tag);
    // Listen for sidebar wallet trigger
    const handler = () => setWalletOpen(true);
    window.addEventListener("open-wallet", handler);
    return () => window.removeEventListener("open-wallet", handler);
  }, []);

  const formatBalance = (val: number) => {
    if (val >= 1_000_000_000_000) return "$" + (val / 1_000_000_000_000).toFixed(2) + "T";
    if (val >= 1_000_000_000) return "$" + (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000)     return "$" + (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1_000)         return "$" + (val / 1_000).toFixed(1) + "K";
    return "$" + val.toLocaleString();
  };

  const handleLinkDiscord = () => {
    if (!discordTag.trim()) return;
    localStorage.setItem(DISCORD_KEY, "true");
    localStorage.setItem(DISCORD_TAG_KEY, discordTag.trim());
    setDiscordLinked(true);
    claimInitialBonus();
    setView("main");
  };

  const closeWallet = () => {
    setWalletOpen(false);
    setTimeout(() => setView("main"), 300);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-2xl border-b border-white/5 z-50 px-6">
        <div className="flex items-center justify-between w-full h-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
               <img 
                 src="/logo.png" 
                 alt="DonutBoost Logo" 
                 className="w-8 h-8 object-contain group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all"
               />
               <span className="text-xl font-black tracking-tight text-white leading-none">DONUT<span className="text-primary">BOOST</span></span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl h-10 px-4">
               <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white leading-none" style={{ fontFamily: "'Space Mono', monospace" }}>{formatBalance(balance)}</span>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Balance</span>
               </div>
               <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-primary text-black font-black h-7 rounded-lg px-3 gap-1.5 text-xs">
                  <Wallet size={12} /> Wallet
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

      {/* Wallet Modal */}
      {walletOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeWallet} />
          <div className="relative bg-[#0c0c0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <button onClick={closeWallet} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>

            {/* === MAIN WALLET VIEW === */}
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

                {/* Balance */}
                <div className="bg-white/5 rounded-2xl p-5 mb-5 border border-white/5 text-center">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Available Balance</span>
                  <p className="text-5xl font-black text-white mt-1" style={{ fontFamily: "'Space Mono', monospace" }}>{formatBalance(balance)}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => { setMaintenanceType("deposit"); setView("maintenance"); }}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl transition-all group cursor-pointer"
                  >
                    <div className="p-2.5 bg-green-500/15 rounded-xl">
                      <ArrowDownToLine size={18} className="text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-black text-white">Deposit</p>
                      <p className="text-xs text-white/30 font-medium">Add funds to your wallet</p>
                    </div>
                    <span className="text-white/20 text-xs font-bold group-hover:text-white/40 transition-colors">→</span>
                  </button>

                  <button 
                    onClick={() => { setMaintenanceType("withdraw"); setView("maintenance"); }}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl transition-all group cursor-pointer"
                  >
                    <div className="p-2.5 bg-red-500/15 rounded-xl">
                      <ArrowUpFromLine size={18} className="text-red-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-black text-white">Withdraw</p>
                      <p className="text-xs text-white/30 font-medium">Transfer funds out</p>
                    </div>
                    <span className="text-white/20 text-xs font-bold group-hover:text-white/40 transition-colors">→</span>
                  </button>

                  {/* Discord status row */}
                  <div 
                    onClick={() => !discordLinked && setView("linkDiscord")}
                    className={`w-full flex items-center gap-4 p-4 border rounded-2xl transition-all ${discordLinked ? "bg-green-500/5 border-green-500/20 cursor-default" : "bg-white/5 border-white/10 hover:bg-white/8 cursor-pointer group"}`}
                  >
                    <div className={`p-2.5 rounded-xl ${discordLinked ? "bg-green-500/20" : "bg-[#5865F2]/15"}`}>
                      {discordLinked 
                        ? <CheckCircle size={18} className="text-green-400" />
                        : <Link2 size={18} className="text-[#5865F2]" />
                      }
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-black text-white">
                        {discordLinked ? "Discord Connected" : "Link Discord"}
                      </p>
                      <p className="text-xs text-white/30 font-medium">
                        {discordLinked ? discordTag : "Claim 1M sign-up bonus"}
                      </p>
                    </div>
                    {!discordLinked && <span className="text-white/20 text-xs font-bold group-hover:text-white/40 transition-colors">→</span>}
                    {discordLinked && <CheckCircle size={16} className="text-green-400" />}
                  </div>
                </div>
              </>
            )}

            {/* === MAINTENANCE VIEW === */}
            {view === "maintenance" && (
              <div className="flex flex-col items-center text-center gap-6 py-4">
                <button onClick={() => setView("main")} className="self-start text-white/30 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold mb-2">
                  ← Back
                </button>
                <div className="p-5 bg-warning/15 rounded-3xl">
                  <Wrench size={48} className="text-warning animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight capitalize">{maintenanceType}</h3>
                  <p className="text-xs text-white/30 font-black uppercase tracking-widest mt-1">Temporarily Unavailable</p>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5 w-full">
                  <p className="text-warning/80 font-bold text-sm leading-relaxed">
                    🔧 {maintenanceType === "deposit" ? "Deposits" : "Withdrawals"} are currently under maintenance. We're connecting the platform to Donut SMP's economy. Check back soon!
                  </p>
                </div>
                <Button onClick={() => setView("main")} className="bg-white/5 border border-white/10 text-white font-bold h-11 px-8 rounded-2xl hover:bg-white/10 transition-colors">
                  Got it
                </Button>
              </div>
            )}

            {/* === LINK DISCORD VIEW === */}
            {view === "linkDiscord" && (
              <>
                <button onClick={() => setView("main")} className="text-white/30 hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm font-bold">
                  ← Back
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#5865F2]/20 rounded-2xl">
                    <Link2 size={24} className="text-[#5865F2]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Link Discord</h2>
                    <p className="text-xs text-white/30 font-black uppercase tracking-widest mt-0.5">Claim $1,000,000 Bonus</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-white/30 uppercase tracking-widest">Your Discord Username</label>
                  <input 
                    type="text"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    placeholder="e.g. @darren or Darren#0001"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5865F2]/50 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleLinkDiscord()}
                  />
                  <div className="bg-[#5865F2]/5 border border-[#5865F2]/20 rounded-2xl p-4">
                    <p className="text-[#7c84f5] text-xs leading-relaxed font-medium">
                      ⚡ Full Discord OAuth integration coming soon — a proper redirect URL will be set up once the domain is purchased. For now, enter your username manually.
                    </p>
                  </div>
                  <Button 
                    onClick={handleLinkDiscord}
                    isDisabled={!discordTag.trim()}
                    className="w-full h-12 bg-[#5865F2] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#5865F2]/20 hover:scale-[1.02] transition-transform"
                  >
                    Confirm & Claim $1M Bonus
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

"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { 
  Menu, 
  Wallet,
  X,
  Link2,
  LogIn
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";

export function Navbar() {
  const { balance, claimInitialBonus } = useEconomy();
  const pathname = usePathname();
  const [walletOpen, setWalletOpen] = useState(false);
  const [linking, setLinking] = useState(false);
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordTag, setDiscordTag] = useState("");

  const isHome = pathname === "/";

  const formatBalance = (val: number) => {
    if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
    return val.toLocaleString();
  };

  const handleLinkDiscord = () => {
    if (!discordTag.trim()) return;
    setDiscordLinked(true);
    setLinking(false);
    claimInitialBonus();
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
                 className="w-9 h-9 object-contain group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all"
               />
               <span className="text-xl font-black tracking-tight text-white leading-none">DONUT<span className="text-primary">BOOST</span></span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Only show balance + wallet when not on home */}
            {!isHome && (
              <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl h-10 px-4">
                 <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-white leading-none">{formatBalance(balance)}</span>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Balance</span>
                 </div>
                 <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-primary text-black font-black h-7 rounded-lg px-3 gap-1.5 text-xs">
                    <Wallet size={12} /> Wallet
                 </Button>
              </div>
            )}

            {isHome && (
              <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-white/5 border border-white/10 text-white font-bold h-9 rounded-xl px-4 text-xs hover:bg-white/10 transition-colors">
                <Wallet size={14} className="mr-1.5" /> Wallet
              </Button>
            )}
            
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setWalletOpen(false); setLinking(false); }} />
          <div className="relative bg-[#0c0c0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <button onClick={() => { setWalletOpen(false); setLinking(false); }} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>

            {!linking ? (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary/15 rounded-2xl">
                    <Wallet size={26} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Your Wallet</h2>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-0.5">DonutBoost Economy</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/5 text-center">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Available Balance</span>
                  <p className="text-5xl font-black text-white mt-2" style={{ fontFamily: "'Space Mono', monospace" }}>{balance.toLocaleString()}</p>
                  <p className="text-xs text-white/30 font-bold mt-1 tracking-widest uppercase">Donuts</p>
                </div>

                {discordLinked ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                    <p className="text-green-400 font-black text-sm tracking-wide">✓ Discord Linked — 1M bonus claimed!</p>
                    <p className="text-white/30 text-xs mt-1 font-bold">{discordTag}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-sm text-white/50 leading-relaxed">Link your Discord account to claim your <strong className="text-white">1,000,000 🍩</strong> sign-up bonus. Min deposit: 1,000,000.</p>
                    </div>
                    <Button onClick={() => setLinking(true)} className="w-full h-12 bg-[#5865F2] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#5865F2]/20 hover:scale-[1.02] transition-transform flex items-center gap-2 justify-center">
                      <Link2 size={16} /> Link Discord Account
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button onClick={() => setLinking(false)} className="text-white/30 hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm font-bold">
                  ← Back
                </button>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#5865F2]/20 rounded-2xl">
                    <Link2 size={26} className="text-[#5865F2]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Link Discord</h2>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-0.5">Claim 1M Bonus</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-white/30 uppercase tracking-widest">Your Discord Tag</label>
                  <input 
                    type="text"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    placeholder="e.g. Darren#0001 or @darren"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold text-sm placeholder:text-white/20 focus:outline-none focus:border-[#5865F2]/50 transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  />
                  <p className="text-xs text-white/30 leading-relaxed">We'll verify your Discord membership in Donut SMP. Full bot verification coming soon.</p>
                  <Button 
                    onClick={handleLinkDiscord}
                    isDisabled={!discordTag.trim()}
                    className="w-full h-12 bg-[#5865F2] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#5865F2]/20 hover:scale-[1.02] transition-transform"
                  >
                    Confirm & Claim 1M Bonus
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

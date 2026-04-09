"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { 
  Menu, 
  Wallet,
  Play,
  CircleDashed,
  Dice5,
  Gamepad2,
  Gift,
  Link2,
  X
} from "lucide-react";
import Link from "next/link";
import { useEconomy } from "@/hooks/use-economy";

export function Navbar() {
  const { balance, claimInitialBonus } = useEconomy();
  const [walletOpen, setWalletOpen] = useState(false);
  const [linking, setLinking] = useState(false);
  const [username, setUsername] = useState("");
  const [linked, setLinked] = useState(false);

  const formatBalance = (val: number) => {
    if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
    return val.toLocaleString();
  };

  const handleLinkAccount = () => {
    if (!username.trim()) return;
    setLinked(true);
    setLinking(false);
    claimInitialBonus();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-2xl border-b border-white/5 z-50 px-6">
        <div className="flex items-center justify-between w-full h-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105 active:scale-95">
               <span className="text-3xl group-hover:rotate-12 transition-transform duration-200 select-none">🍩</span>
               <span className="text-xl font-black tracking-tighter text-white leading-none">DONUT<span className="text-primary">BOOST</span></span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-5">
               <Link href="/games/crash" className="text-xs font-black text-white/50 hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest"><Play size={14}/> Crash</Link>
               <Link href="/games/mines" className="text-xs font-black text-white/50 hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest"><CircleDashed size={14}/> Mines</Link>
               <Link href="/games/dice" className="text-xs font-black text-white/50 hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest"><Dice5 size={14}/> Dice</Link>
               <Link href="/games/plinko" className="text-xs font-black text-white/50 hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest"><Gamepad2 size={14}/> Plinko</Link>
               <div className="w-px h-4 bg-white/10" />
               <Link href="/daily" className="text-xs font-black text-warning hover:text-warning/70 transition-colors flex items-center gap-1.5 uppercase tracking-widest"><Gift size={14}/> Daily</Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Balance + Wallet button */}
            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl h-11 px-4">
               <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-white leading-none">{formatBalance(balance)}</span>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Balance</span>
               </div>
               <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-primary text-black font-black h-8 rounded-xl px-3 gap-1.5 text-xs">
                  <Wallet size={13} /> Wallet
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setWalletOpen(false); setLinking(false); }} />
          <div className="relative bg-[#0d0d0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            {/* Close */}
            <button onClick={() => { setWalletOpen(false); setLinking(false); }} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>

            {!linking ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary/20 rounded-2xl">
                    <Wallet size={28} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Your Wallet</h2>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-0.5">DonutBoost Economy</p>
                  </div>
                </div>

                {/* Balance display */}
                <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/5 text-center">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Available Balance</span>
                  <p className="text-5xl font-black text-white italic mt-2">{balance.toLocaleString()}</p>
                  <p className="text-xs text-white/30 font-bold mt-1">Donuts</p>
                </div>

                {/* Link account or claimed */}
                {linked ? (
                  <div className="bg-success/10 border border-success/20 rounded-2xl p-4 text-center">
                    <p className="text-success font-black text-sm">✓ Account Linked — 1M bonus claimed!</p>
                    <p className="text-white/40 text-xs mt-1">Username: {username}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-sm text-white/60 leading-relaxed">Link your Donut SMP account to claim a <strong className="text-white">1,000,000</strong> Donut sign-up bonus and enable deposits. Min deposit: 1,000,000.</p>
                    </div>
                    <Button onClick={() => setLinking(true)} className="w-full h-13 bg-primary text-black font-black text-sm rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 justify-center py-3.5">
                      <Link2 size={16} /> Link Donut SMP Account
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Link Account Form */
              <>
                <button onClick={() => setLinking(false)} className="text-white/30 hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm font-bold">
                  ← Back
                </button>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <Link2 size={28} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Link Account</h2>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-0.5">Claim 1M Bonus</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-white/30 uppercase tracking-widest">Your Donut SMP Username</label>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Steve123"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <p className="text-xs text-white/30 leading-relaxed">By linking, you confirm you have a Donut SMP account under this username and agree to the platform rules.</p>
                  <Button 
                    onClick={handleLinkAccount} 
                    isDisabled={!username.trim()}
                    className="w-full h-14 bg-primary text-black font-black text-base rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
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

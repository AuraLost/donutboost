"use client";

import React, { useState } from "react";
import { 
  Button, 
  Modal,
  Input
} from "@heroui/react";
import { 
  Menu, 
  Wallet,
  Play,
  CircleDashed,
  Dice5,
  Gamepad2,
  Gift
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEconomy } from "@/hooks/use-economy";

export function Navbar() {
  const { balance, claimInitialBonus } = useEconomy();
  const [walletOpen, setWalletOpen] = useState(false);

  const formatBalance = (val: number) => {
    if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
    return val.toLocaleString();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-secondary/80 backdrop-blur-2xl border-b border-white/5 z-50 px-8">
        <div className="flex items-center justify-between w-full h-full max-w-7xl mx-auto">
          {/* Logo Section */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
               <div className="relative w-12 h-12">
                  <img 
                    src="/image.png" 
                    alt="Donut Logo"
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all"
                  />
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tighter text-white leading-none">DONUT<span className="text-primary tracking-widest">BOOST</span></span>
               </div>
            </Link>

            {/* Main Navigation (replacing sidebar) */}
            <nav className="hidden lg:flex items-center gap-6">
               <Link href="/games/crash" className="text-sm font-bold text-muted hover:text-primary transition-colors flex items-center gap-2"><Play size={16}/> CRASH</Link>
               <Link href="/games/mines" className="text-sm font-bold text-muted hover:text-primary transition-colors flex items-center gap-2"><CircleDashed size={16}/> MINES</Link>
               <Link href="/games/dice" className="text-sm font-bold text-muted hover:text-primary transition-colors flex items-center gap-2"><Dice5 size={16}/> DICE</Link>
               <Link href="/games/plinko" className="text-sm font-bold text-muted hover:text-primary transition-colors flex items-center gap-2"><Gamepad2 size={16}/> PLINKO</Link>
               <div className="w-[1px] h-4 bg-white/10 mx-2" />
               <Link href="/daily" className="text-sm font-bold text-warning hover:text-warning/80 transition-colors flex items-center gap-2"><Gift size={16}/> DAILY DROPS</Link>
            </nav>
          </div>

          {/* User Stats / Action Section */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-black/40 border border-white/5 rounded-2xl h-12 px-4 gap-4 transition-colors">
               <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                     <span className="text-sm font-black text-white leading-none">{formatBalance(balance)}</span>
                     <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">Balance</span>
                  </div>
               </div>
               <Button onClick={() => setWalletOpen(true)} size="sm" className="bg-primary/10 text-primary hover:bg-primary hover:text-black font-black h-9 rounded-lg px-4 gap-2 transition-all">
                  <Wallet size={16} /> WALLET
               </Button>
            </div>
            
            <div className="flex items-center gap-2 lg:hidden">
              <Button isIconOnly variant="ghost" className="border-none text-muted">
                 <Menu size={24} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Viewer Modal */}
      {walletOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWalletOpen(false)} />
          <div className="relative bg-secondary/90 border border-white/10 rounded-[30px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                 <Wallet size={32} />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic">YOUR WALLET</h2>
                  <p className="text-muted font-bold text-xs uppercase tracking-widest">Manage your funds</p>
               </div>
             </div>

             <div className="bg-black/50 rounded-2xl p-6 mb-8 border border-white/5 text-center">
                <span className="text-sm font-bold text-muted uppercase tracking-widest">Available Balance</span>
                <p className="text-5xl font-black text-white italic mt-2">{balance.toLocaleString()}</p>
             </div>

             <div className="space-y-4">
                <p className="text-xs text-muted font-bold tracking-widest text-center uppercase">Deposit instructions</p>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-sm font-medium text-white/80">Connect your Donut SMP account on the discord to instantly transfer standard Donuts into your DonutBoost Web Wallet. Minimum deposit: <strong className="text-white">1,000,000</strong>.</p>
                </div>
                <Button onClick={claimInitialBonus} className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl shadow-lg mt-4 shadow-primary/20 hover:scale-[1.02] transition-transform">
                  CLAIM 1M BONUS 
                </Button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}

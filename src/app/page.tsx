"use client";

import React from "react";
import { 
  Card, 
  Button, 
  Chip,
  Tabs,
  Tab
} from "@heroui/react";
import { 
  Play, 
  TrendingUp, 
  Award, 
  Zap,
  Gamepad2,
  Info,
  ArrowUpRight,
  ShieldCheck,
  Gem
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const games = [
  { id: "crash", name: "Crash", category: "Instant", image: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=200&auto=format&fit=crop" },
  { id: "mines", name: "Mines", category: "Strategy", image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=200&auto=format&fit=crop" },
  { id: "plinko", name: "Plinko", category: "Luck", image: "https://images.unsplash.com/photo-1596838132731-dd307afbd979?q=80&w=200&auto=format&fit=crop" },
  { id: "dice", name: "Dice", category: "Classic", image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=200&auto=format&fit=crop" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      
      {/* Hero / Sign-up Incentive */}
      <section className="relative w-full h-[360px] rounded-[40px] overflow-hidden group shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <div className="relative z-20 flex flex-col justify-center h-full p-12 gap-6 max-w-2xl">
          <div className="flex items-center gap-3">
             <Chip variant="soft" className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-3">
               SIGN UP BONUS
             </Chip>
             <div className="flex items-center gap-1 text-primary text-xs font-black italic">
               <Gem size={14} className="animate-pulse" />
               <span>GET 1M DONUTS INSTANTLY</span>
             </div>
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">
            THE FUTURE OF <br />
            <span className="text-primary italic">DONUT SMP</span>
          </h1>
          <p className="text-muted text-lg font-medium max-w-sm leading-relaxed">
            Trade, bet, and grow your empire in the most advanced Minecraft economy ever built.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary text-black font-black px-10 h-16 rounded-[22px] flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              Join the Economy
              <ArrowUpRight size={20} />
            </Button>
          </div>
        </div>
        
        {/* Abstract Blue Background */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute inset-0 bg-gradient-to-l from-primary/30 to-transparent z-0" />
           <div className="grid grid-cols-6 gap-2 w-full h-full rotate-45 scale-150 transform translate-x-1/4">
             {Array.from({ length: 36 }).map((_, i) => (
               <div key={i} className={`aspect-square rounded-[32px] ${i % 5 === 0 ? "bg-primary/40 animate-pulse" : "bg-white/5"}`} />
             ))}
           </div>
        </div>
      </section>

      {/* Constraints Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="bg-primary/5 border-primary/20 p-5 rounded-3xl space-y-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">MIN DEPOSIT</p>
            <p className="text-2xl font-black italic">1,000,000</p>
         </Card>
         <Card className="bg-white/5 border-white/5 p-5 rounded-3xl space-y-1">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">MAX DEPOSIT</p>
            <p className="text-2xl font-black">1,000,000,000,000</p>
         </Card>
         <Card className="bg-primary/5 border-primary/20 p-5 rounded-3xl space-y-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">MIN PAYOUT</p>
            <p className="text-2xl font-black italic">10,000,000</p>
         </Card>
         <Card className="bg-white/5 border-white/5 p-5 rounded-3xl space-y-1">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">MAX PAYOUT</p>
            <p className="text-2xl font-black">1,000,000,000</p>
         </Card>
      </div>

      {/* Game Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
            <h2 className="text-3xl font-black tracking-tight italic">LIVE ECONOMY</h2>
          </div>
          <Tabs aria-label="Game Filter" variant="underlined" classNames={{ cursor: "bg-primary", tab: "font-black uppercase tracking-widest text-[10px] h-12" }}>
            <Tab key="all" title="EVERYTHING" />
            <Tab key="pvp" title="PVP BETS" />
            <Tab key="market" title="MARKET" />
          </Tabs>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <Card 
                className="bg-secondary/40 border-white/5 overflow-hidden group hover:bg-secondary/60 transition-all duration-500 rounded-[35px] cursor-pointer"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image 
                    src={game.image} 
                    alt={game.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 saturate-[0.8] group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-6 z-20">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{game.category}</p>
                     <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">{game.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <Button className="w-full bg-white/5 hover:bg-primary hover:text-black text-white font-black border-none transition-all py-7 rounded-2xl text-base tracking-widest">
                    ENTER GAME
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Market Ticker Footer */}
      <div className="mt-12 bg-black/40 border border-white/5 p-4 rounded-full flex items-center overflow-hidden">
         <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-6 border-r border-white/10 last:border-none">
                 <span className="text-[10px] font-black text-muted uppercase uppercase">PLAYER_{421 + i}</span>
                 <span className="text-xs font-black text-success">+$2.1M</span>
              </div>
            ))}
         </div>
      </div>

      <div className="h-20" />
    </div>
  );
}

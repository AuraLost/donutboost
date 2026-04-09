"use client";

import React from "react";
import { 
  Card, 
  Button, 
  Chip,
  ScrollShadow
} from "@heroui/react";
import { 
  Play, 
  TrendingUp, 
  Award, 
  Zap,
  Gamepad2,
  Info
} from "lucide-react";
import Image from "next/image";

const games = [
  { id: "blackjack", name: "Blackjack", category: "Table", color: "bg-blue-500", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=200&auto=format&fit=crop" },
  { id: "crash", name: "Crash", category: "Instant", color: "bg-orange-500", image: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=200&auto=format&fit=crop" },
  { id: "mines", name: "Mines", category: "Strategy", color: "bg-green-500", image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=200&auto=format&fit=crop" },
  { id: "plinko", name: "Plinko", category: "Luck", color: "bg-pink-500", image: "https://images.unsplash.com/photo-1596838132731-dd307afbd979?q=80&w=200&auto=format&fit=crop" },
  { id: "dice", name: "Dice", category: "Classic", color: "bg-purple-500", image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=200&auto=format&fit=crop" },
  { id: "hilo", name: "HiLo", category: "Card", color: "bg-red-500", image: "https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?q=80&w=200&auto=format&fit=crop" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[320px] rounded-[32px] overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <div className="relative z-20 flex flex-col justify-center h-full p-12 gap-6 max-w-xl">
          <div className="flex items-center gap-3">
             <Chip variant="soft" className="bg-primary/20 text-primary border-none text-[10px] font-bold uppercase tracking-widest px-3">
               Featured Game
             </Chip>
             <div className="flex items-center gap-1 text-muted text-xs">
               <TrendingUp size={14} />
               <span>Over 1,240 players live</span>
             </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-[1.1]">
            WIN BIG ON <br />
            <span className="text-primary">DONUT CRASH</span>
          </h1>
          <p className="text-muted text-lg font-medium max-w-sm">
            The most trusted Minecraft-themed gaming platform since 2024.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary text-black font-black px-8 h-14 rounded-2xl flex items-center gap-2 border-none shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <Play size={20} fill="currentColor" />
              PLAY NOW
            </Button>
            <Button size="lg" variant="ghost" className="border-white/10 text-white font-bold h-14 px-8 rounded-2xl flex items-center gap-2 border shadow-none hover:bg-white/5">
              <Info size={20} />
              LEARN MORE
            </Button>
          </div>
        </div>
        
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-2/3 h-full overflow-hidden opacity-30 group-hover:opacity-50 transition-all duration-700">
           <div className="grid grid-cols-12 gap-1 w-full h-full rotate-12 scale-150">
             {Array.from({ length: 144 }).map((_, i) => (
               <div key={i} className={`aspect-square rounded-sm ${i % 9 === 0 ? "bg-primary/40 animate-pulse" : "bg-white/5"}`} />
             ))}
           </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/40 border-white/5 p-6 rounded-[24px] shadow-none flex flex-row items-center gap-5">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Award className="text-primary" size={28} />
          </div>
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Total Distributed</p>
            <p className="text-2xl font-black">$42,851,200</p>
          </div>
        </Card>
        <Card className="bg-secondary/40 border-white/5 p-6 rounded-[24px] shadow-none flex flex-row items-center gap-5">
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <TrendingUp className="text-blue-500" size={28} />
          </div>
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Active Bets</p>
            <p className="text-2xl font-black">12,482</p>
          </div>
        </Card>
        <Card className="bg-secondary/40 border-white/5 p-6 rounded-[24px] shadow-none flex flex-row items-center gap-5">
          <div className="p-4 bg-orange-500/10 rounded-2xl">
            <Zap className="text-orange-500" size={28} />
          </div>
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Last Big Jackpot</p>
            <p className="text-2xl font-black text-orange-400">$5,240.24</p>
          </div>
        </Card>
      </section>

      {/* Game Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full" />
            <h2 className="text-2xl font-black tracking-tight">POPULAR GAMES</h2>
          </div>
          <Button variant="ghost" className="text-muted hover:text-white border-none shadow-none font-bold text-xs uppercase tracking-widest">
            Show All Games
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Card 
              key={game.id} 
              className="bg-secondary/40 border-white/5 overflow-hidden group hover:bg-secondary/60 transition-all duration-300 rounded-[28px] cursor-pointer"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image 
                  src={game.image} 
                  alt={game.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-75"
                />
                <div className="absolute top-4 right-4 z-20">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Live</span>
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{game.category}</p>
                  <h3 className="text-xl font-black text-white tracking-tight">{game.name}</h3>
                </div>
                <Button className="w-full bg-white/5 hover:bg-primary hover:text-black text-white font-black border-none transition-all py-6 rounded-2xl">
                  PLAY GAME
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}

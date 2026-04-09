import React from "react";
import { Button } from "@heroui/react";
import { Play, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-8 max-w-5xl mx-auto w-full text-center animate-in fade-in duration-700">
      
      {/* Landing Info */}
      <div className="space-y-8 max-w-3xl flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-widest shadow-lg shadow-primary/10">
           <ShieldCheck size={16} /> DONUT SMP ECONOMY
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
          Bet, Trade & Grow your <span className="text-primary italic">Empire</span>
        </h1>
        
        <p className="text-xl text-muted font-medium max-w-xl mx-auto leading-relaxed">
          Experience the most advanced platform for multiplying your wealth on the Donut SMP server with provably fair games.
        </p>

        <div className="pt-8">
          <Link href="/games/crash">
            <Button size="lg" className="bg-primary text-black font-black px-12 h-16 rounded-[22px] text-lg shadow-2xl shadow-primary/20 hover:scale-105 transition-all duration-300">
              <Play className="mr-2" size={24} fill="currentColor" />
              Play Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple Stats Footer */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl opacity-80">
        <div className="flex flex-col items-center gap-2">
           <span className="text-3xl font-black italic text-white">12.4T</span>
           <span className="text-xs font-bold text-muted uppercase tracking-widest">24H Volume</span>
        </div>
        <div className="flex flex-col items-center gap-2">
           <span className="text-3xl font-black italic text-white">99.9%</span>
           <span className="text-xs font-bold text-muted uppercase tracking-widest">Uptime</span>
        </div>
        <div className="flex flex-col items-center gap-2">
           <span className="text-3xl font-black italic text-success">+ $2.1M</span>
           <span className="text-xs font-bold text-muted uppercase tracking-widest">Recent Biggest Win</span>
        </div>
      </div>

    </div>
  );
}

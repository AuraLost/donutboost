import React from "react";
import { Button } from "@heroui/react";
import { Play, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-10 pb-16 px-8 max-w-5xl mx-auto w-full text-center animate-in fade-in zoom-in-95 duration-1000 relative">
      
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Landing Info */}
      <div className="space-y-8 max-w-4xl flex flex-col items-center">
        
        {/* Donut Logo - pure CSS, no image needed */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center text-8xl md:text-9xl hover:-translate-y-3 transition-all duration-500 ease-out drop-shadow-2xl select-none" style={{ filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.4))' }}>
            🍩
          </div>
        </div>

        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-black tracking-[0.2em] shadow-xl shadow-primary/10 hover:bg-primary/20 transition-colors uppercase">
           <ShieldCheck size={18} /> PROVABLY FAIR DONUT ECONOMY
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight drop-shadow-2xl">
          Multiply your <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-blue-300 italic px-2">Wealth</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 font-bold max-w-2xl mx-auto leading-relaxed">
          The most advanced, premium gambling platform tailored exclusively for Donut SMP. High limits, daily rewards, total dominance.
        </p>

        <div className="pt-4">
          <Link href="/games/crash">
            <Button size="lg" className="bg-primary text-black font-black px-16 h-16 rounded-[28px] text-xl shadow-[0_0_80px_rgba(59,130,246,0.4)] hover:scale-105 hover:shadow-[0_0_120px_rgba(59,130,246,0.6)] transition-all duration-500 ease-out">
              <Play className="mr-3" size={24} fill="currentColor" />
              PLAY NOW
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple Stats Footer */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl p-10 bg-black/40 rounded-[40px] border border-white/5 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-3">
           <span className="text-4xl font-black italic text-white drop-shadow-lg">12.4T</span>
           <span className="text-xs font-black text-muted uppercase tracking-[0.3em]">24H Volume</span>
        </div>
        <div className="flex flex-col items-center gap-3 border-l border-r border-white/5">
           <span className="text-4xl font-black italic text-white drop-shadow-lg">99.9%</span>
           <span className="text-xs font-black text-muted uppercase tracking-[0.3em]">Uptime</span>
        </div>
        <div className="flex flex-col items-center gap-3">
           <span className="text-4xl font-black italic text-success drop-shadow-lg">+ 2.1B</span>
           <span className="text-xs font-black text-muted uppercase tracking-[0.3em]">Record Win</span>
        </div>
      </div>

    </div>
  );
}

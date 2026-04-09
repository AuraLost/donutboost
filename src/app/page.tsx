import React from "react";
import { Button } from "@heroui/react";
import { Play, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-8 max-w-5xl mx-auto w-full text-center animate-in fade-in zoom-in-95 duration-1000 relative">
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Landing Info */}
      <div className="space-y-10 max-w-4xl flex flex-col items-center">
        
        {/* Donut Logo */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-75 group-hover:scale-110 transition-all duration-700" />
          <img 
            src="/image.png" 
            alt="Donut SMP Logo" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(59,130,246,0.5)] hover:-translate-y-4 transition-all duration-500 ease-out animate-bounce"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍩</text></svg>';
            }}
          />
        </div>

        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-black tracking-[0.2em] shadow-xl shadow-primary/10 hover:bg-primary/20 transition-colors uppercase">
           <ShieldCheck size={18} /> PROVABLY FAIR DONUT ECONOMY
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight drop-shadow-2xl">
          Multiply your <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-blue-300 italic px-2">Wealth</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/50 font-bold max-w-2xl mx-auto leading-relaxed">
          The most advanced, premium gambling platform tailored exclusively for Donut SMP. High limits, daily rewards, total dominance.
        </p>

        <div className="pt-6">
          <Link href="/games/crash">
            <Button size="lg" className="bg-primary text-black font-black px-16 h-20 rounded-[32px] text-2xl shadow-[0_0_80px_rgba(59,130,246,0.4)] hover:scale-105 hover:shadow-[0_0_120px_rgba(59,130,246,0.6)] transition-all duration-500 ease-out border border-white/20">
              <Play className="mr-3" size={32} fill="currentColor" />
              PLAY NOW
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple Stats Footer */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-16 w-full max-w-4xl p-10 bg-black/40 rounded-[40px] border border-white/5 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-3">
           <span className="text-4xl font-black italic text-white drop-shadow-lg">12.4T</span>
           <span className="text-xs font-black text-muted uppercase tracking-[0.3em]">24H Volume</span>
        </div>
        <div className="flex flex-col items-center gap-3 border-l border-r border-white/5">
           <span className="text-4xl font-black italic text-white drop-shadow-lg">99.9%</span>
           <span className="text-xs font-black text-muted uppercase tracking-[0.3em]">Uptime</span>
        </div>
        <div className="flex flex-col items-center gap-3">
           <span className="text-4xl font-black italic text-success drop-shadow-lg">+ $2.1M</span>
           <span className="text-xs font-black text-muted uppercase tracking-[0.3em]">Record Win</span>
        </div>
      </div>

    </div>
  );
}

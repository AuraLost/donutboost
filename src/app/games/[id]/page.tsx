"use client";

import React from "react";
import { 
  Card, 
  Button, 
  Input, 
  Tabs, 
  Separator,
  ScrollShadow
} from "@heroui/react";
import { 
  Play, 
  RotateCcw, 
  ChevronLeft, 
  History,
  TrendingUp,
  Settings2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GamePage() {
  const { id } = useParams();
  const gameName = typeof id === "string" ? id.charAt(0).toUpperCase() + id.slice(1) : "Game";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Game Header */}
      <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-secondary/10">
        <Link href="/">
           <Button isIconOnly variant="ghost" className="border-white/10 text-muted hover:text-white border-none shadow-none">
             <ChevronLeft size={20} />
           </Button>
        </Link>
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h1 className="text-2xl font-black uppercase tracking-tight">{gameName}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Betting Panel */}
        <aside className="w-80 border-r border-white/5 bg-secondary/5 p-6 flex flex-col gap-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Bet Amount</label>
              <div className="relative group">
                 <Input 
                   type="number" 
                   defaultValue="100.00" 
                   className="w-full bg-black/20"
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 border-white/5 text-[10px] font-black min-w-0">1/2</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 border-white/5 text-[10px] font-black min-w-0">2x</Button>
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Auto Bet</label>
              <div className="flex p-1 bg-black/20 rounded-xl">
                 <Button fullWidth variant="soft" className="bg-white/5 text-white font-bold h-10 rounded-lg">Manual</Button>
                 <Button fullWidth variant="ghost" className="text-muted font-bold h-10 border-none shadow-none">Auto</Button>
              </div>
           </div>

           <div className="flex-1" />

           <Button className="w-full h-16 bg-primary text-black font-black text-xl rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
             BET
           </Button>
        </aside>

        {/* Game Canvas / Area */}
        <main className="flex-1 relative bg-black/20 flex items-center justify-center p-12 overflow-hidden">
           {/* Placeholder for Game Logic/Canvas */}
           <div className="w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 group">
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                 <Play size={80} className="text-primary relative z-10 group-hover:scale-110 transition-transform duration-500" fill="currentColor" />
              </div>
              <div className="text-center space-y-2 relative z-10">
                 <h2 className="text-3xl font-black italic">READY TO PLAY?</h2>
                 <p className="text-muted font-medium">Click BET to start your {gameName} journey.</p>
              </div>
           </div>

           {/* Floating Buttons */}
           <div className="absolute top-6 right-6 flex gap-3">
              <Button isIconOnly variant="ghost" className="bg-black/40 backdrop-blur-md border-white/5 text-muted hover:text-white border-none shadow-none rounded-xl">
                 <RotateCcw size={18} />
              </Button>
              <Button isIconOnly variant="ghost" className="bg-black/40 backdrop-blur-md border-white/5 text-muted hover:text-white border-none shadow-none rounded-xl">
                 <Settings2 size={18} />
              </Button>
           </div>
        </main>

        {/* Game History Sidebar */}
        <aside className="w-64 border-l border-white/5 bg-secondary/5 hidden xl:flex flex-col">
           <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <History size={16} className="text-muted" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">History</span>
           </div>
           <ScrollShadow className="flex-1 p-4 space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-50">
                   <span className="text-xs font-bold">{842 - i}x</span>
                   <span className={`text-[10px] font-black ${i % 3 === 0 ? "text-primary" : "text-danger-soft"}`}>
                     {i % 3 === 0 ? "WIN" : "LOSS"}
                   </span>
                </div>
              ))}
           </ScrollShadow>
        </aside>
      </div>
    </div>
  );
}

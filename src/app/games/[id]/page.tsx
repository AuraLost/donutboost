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
  Settings2,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";

export default function GamePage() {
  const { id } = useParams();
  const gameName = typeof id === "string" ? id.charAt(0).toUpperCase() + id.slice(1) : "Game";
  const { balance, bet, win } = useEconomy();
  const [betAmount, setBetAmount] = React.useState(1000000); // Default to 1M
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleBet = () => {
    if (bet(betAmount)) {
      setIsPlaying(true);
      // Simulate a win/loss after 2 seconds
      setTimeout(() => {
        setIsPlaying(false);
        const won = Math.random() > 0.5;
        if (won) {
          const winAmt = betAmount * 2;
          win(winAmt);
          alert(`You WON ${winAmt.toLocaleString()} Donuts! 🍩`);
        } else {
          alert("Bust! Better luck next time.");
        }
      }, 2000);
    } else {
      alert("Insufficient Balance! Minimum 1M Donuts required.");
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Game Header */}
      <div className="flex items-center justify-between px-8 h-20 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-6">
          <Link href="/">
             <Button isIconOnly variant="ghost" className="border-white/10 text-muted hover:text-primary transition-colors border shadow-none rounded-xl">
               <ChevronLeft size={20} />
             </Button>
          </Link>
          <div className="flex flex-col">
             <h1 className="text-xl font-black uppercase tracking-tighter italic">{gameName}</h1>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Economy</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
           <Wallet size={16} className="text-primary" />
           <span className="text-sm font-black text-white">{(balance / 1000000).toFixed(2)}M</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Betting Panel */}
        <aside className="w-[340px] border-r border-white/5 bg-secondary/10 p-8 flex flex-col gap-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Bet Amount (Donuts)</label>
              <div className="relative">
                 <Input 
                   type="number" 
                   value={betAmount.toString()} 
                   onChange={(e) => setBetAmount(Number(e.target.value))}
                   className="w-full bg-black/40 h-14"
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setBetAmount(prev => Math.floor(prev / 2))}
                      className="h-9 min-w-[44px] bg-white/5 border-none text-[10px] font-black rounded-lg"
                    >1/2</Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setBetAmount(prev => prev * 2)}
                      className="h-9 min-w-[44px] bg-white/5 border-none text-[10px] font-black rounded-lg"
                    >2x</Button>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <Button onClick={() => setBetAmount(1000000)} size="sm" variant="ghost" className="bg-white/5 border-none text-[10px] font-black">MIN (1M)</Button>
                 <Button onClick={() => setBetAmount(1000000000)} size="sm" variant="ghost" className="bg-white/5 border-none text-[10px] font-black">MAX (1B)</Button>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Mode Preference</label>
              <Tabs variant="primary" className="w-full">
                 <Tabs.ListContainer>
                   <Tabs.List className="w-full flex">
                     <Tabs.Tab id="manual" className="flex-1">
                       MANUAL
                       <Tabs.Indicator />
                     </Tabs.Tab>
                     <Tabs.Tab id="auto" className="flex-1">
                       AUTOMATED
                       <Tabs.Indicator />
                     </Tabs.Tab>
                   </Tabs.List>
                 </Tabs.ListContainer>
              </Tabs>
           </div>

           <div className="flex-1" />

           <Button 
             onClick={handleBet}
             isDisabled={isPlaying}
             className={`w-full h-20 font-black text-2xl rounded-[28px] transition-all ${
               isPlaying 
                 ? "bg-white/10 text-muted italic" 
                 : "bg-primary text-black shadow-2xl shadow-primary/20 hover:scale-[1.03]"
             }`}
           >
             {isPlaying ? "WAITING..." : "START BET"}
           </Button>
        </aside>

        {/* Game Canvas */}
        <main className="flex-1 relative bg-black/30 flex items-center justify-center p-12">
           <div className="w-full max-w-3xl aspect-[16/10] rounded-[40px] border-2 border-dashed border-white/5 bg-black/10 flex flex-col items-center justify-center gap-8 group relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative">
                 <div className={`absolute inset-0 bg-primary/30 blur-[80px] rounded-full scale-150 transition-all duration-1000 ${isPlaying ? "opacity-100 scale-[2] animate-pulse" : "opacity-0"}`} />
                 <Play size={100} className={`relative z-10 transition-all duration-700 ${isPlaying ? "text-primary scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "text-muted opacity-20"}`} fill="currentColor" />
              </div>
              <div className="text-center space-y-3 relative z-10">
                 <h2 className={`text-4xl font-black tracking-tighter italic transition-all duration-700 ${isPlaying ? "text-white" : "text-muted"}`}>
                   {isPlaying ? "BETTING ACTIVE" : "PLACE YOUR BET"}
                 </h2>
                 <p className="text-muted font-bold tracking-widest uppercase text-[10px]">
                   Network Status: <span className="text-success">Optimal</span>
                 </p>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="absolute top-8 right-8 flex gap-3">
              <Button isIconOnly className="bg-black/60 backdrop-blur-xl border border-white/5 text-muted hover:text-white transition-colors rounded-2xl shadow-2xl h-12 w-12">
                 <RotateCcw size={20} />
              </Button>
              <Button isIconOnly className="bg-black/60 backdrop-blur-xl border border-white/5 text-muted hover:text-white transition-colors rounded-2xl shadow-2xl h-12 w-12">
                 <Settings2 size={20} />
              </Button>
           </div>
        </main>
      </div>
    </div>
  );
}

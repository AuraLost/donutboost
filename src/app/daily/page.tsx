"use client";

import React, { useState } from "react";
import { 
  Card, 
  Button, 
  Chip,
  Separator,
  AlertDialog
} from "@heroui/react";
import { 
  Gift, 
  Clock, 
  Flame, 
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  CircleDashed,
  Sparkles
} from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";

export default function DailyRewards() {
  const { balance, win } = useEconomy();
  const [canClaim, setCanClaim] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinTick, setSpinTick] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getReward = () => {
    const r = Math.random() * 100;
    if (r < 0.1) return 10000000; // 0.1% for 10M
    if (r < 5.1) return 1000000;  // 5% for 1M
    if (r < 15.1) return 500000;  // 10% for 500k
    if (r < 40.1) return 200000;  // 25% for 200k
    if (r < 90.1) return 100000;  // 50% for 100k
    return 50000;                 // remaining ~10% for 50k
  };

  const handleClaim = () => {
    if (canClaim) {
      setIsSpinning(true);
      setCanClaim(false);
      
      // Visual spinning animation
      let ticks = 0;
      const t = setInterval(() => {
         setSpinTick(Math.random() * 1000000);
         ticks++;
         if (ticks > 25) {
            clearInterval(t);
            const reward = getReward();
            win(reward);
            setWonAmount(reward);
            setIsSpinning(false);
            setDialogOpen(true);
            setTimeout(() => setCanClaim(true), 24 * 60 * 60 * 1000);
         }
      }, 100);
    }
  };

  return (
    <div className="flex flex-col gap-10 p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Reward Dialog */}
      <AlertDialog.Backdrop isOpen={dialogOpen} onOpenChange={setDialogOpen} variant="blur">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="success" />
              <AlertDialog.Heading>Daily Reward Claimed!</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                 <Sparkles size={48} className="text-warning animate-pulse" />
                 <p className="text-3xl font-black text-white italic">
                    +{wonAmount?.toLocaleString()} DONUTS
                 </p>
                 <p className="text-muted font-bold tracking-widest uppercase text-[10px]">
                    Come back tomorrow for another spin!
                 </p>
              </div>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="primary">Awesome!</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-black tracking-tight italic">DAILY SPINNER</h1>
        <p className="text-muted font-bold uppercase tracking-widest text-[11px]">Spin the wheel every 24 hours to win up to 10M Donuts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <Card className="lg:col-span-3 bg-secondary/40 border-white/5 p-12 rounded-[40px] shadow-none flex flex-col items-center justify-center text-center gap-10 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-12 -rotate-12 opacity-5 group-hover:opacity-10 transition-all duration-1000">
            <CircleDashed size={300} className="text-primary" />
          </div>
          
          <div className="relative">
             <div className={`absolute inset-0 bg-primary/20 blur-[60px] rounded-full ${isSpinning ? "animate-spin scale-150" : "animate-pulse"}`} />
             <div className={`relative z-10 p-10 bg-primary/10 rounded-full border border-primary/20 shadow-2xl shadow-primary/10 transition-all duration-75 ${isSpinning ? "scale-110" : ""}`}>
               <Gift className={`text-primary ${isSpinning ? "animate-bounce" : ""}`} size={60} />
             </div>
          </div>

          <div className="space-y-3 relative z-10 w-full">
            <h2 className="text-4xl font-black italic tracking-tighter">
              {isSpinning ? "SPINNING..." : "MYSTERY DROP"}
            </h2>
            <p className="text-primary font-black text-2xl italic tabular-nums tracking-widest h-8 flex items-center justify-center">
              {isSpinning ? Math.floor(spinTick).toLocaleString() : "???,???"}
            </p>
          </div>

          <div className="w-full relative z-10 max-w-sm">
            <Button 
              onClick={handleClaim}
              isDisabled={!canClaim || isSpinning} 
              className={`w-full h-20 rounded-[28px] font-black text-2xl transition-all ${
                canClaim && !isSpinning
                  ? "bg-primary text-black shadow-2xl shadow-primary/30 hover:scale-105" 
                  : "bg-white/5 text-muted italic"
              }`}
            >
              {isSpinning ? "ROLLING..." : canClaim ? "SPIN NOW" : "NEXT IN 23:59:59"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
           <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none space-y-6 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Flame className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-black italic">PROBABILITIES</h3>
              </div>

              <div className="space-y-3 font-bold text-sm tracking-widest uppercase">
                 <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-warning/20">
                    <span className="text-warning">10,000,000</span>
                    <span className="text-muted">0.1%</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-primary/20">
                    <span className="text-primary">1,000,000</span>
                    <span className="text-muted">5%</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-success/20">
                    <span className="text-success">500,000</span>
                    <span className="text-muted">10%</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/10">
                    <span className="text-white">200,000</span>
                    <span className="text-muted">25%</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-white/60">100,000</span>
                    <span className="text-muted">50%</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40">50,000</span>
                    <span className="text-muted">10%</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

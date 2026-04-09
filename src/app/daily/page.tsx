"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, 
  Button, 
  AlertDialog
} from "@heroui/react";
import { 
  Gift, 
  Flame, 
  Sparkles,
  CircleDashed
} from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";

export default function DailyRewards() {
  const { win } = useEconomy();
  const [canClaim, setCanClaim] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinTick, setSpinTick] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const STORAGE_KEY = "donutboost_last_claim";

  // On mount: check localStorage for last claim time
  useEffect(() => {
    const checkClaim = () => {
      const last = localStorage.getItem(STORAGE_KEY);
      if (!last) {
        setCanClaim(true);
        setTimeLeft("");
        return;
      }
      const diff = Date.now() - parseInt(last, 10);
      const cooldown = 24 * 60 * 60 * 1000;
      if (diff >= cooldown) {
        setCanClaim(true);
        setTimeLeft("");
      } else {
        setCanClaim(false);
        const remaining = cooldown - diff;
        const h = Math.floor(remaining / 3_600_000);
        const m = Math.floor((remaining % 3_600_000) / 60_000);
        const s = Math.floor((remaining % 60_000) / 1_000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };

    checkClaim();
    const interval = setInterval(checkClaim, 1000);
    return () => clearInterval(interval);
  }, []);

  const getReward = () => {
    const r = Math.random() * 100;
    if (r < 0.1)  return 10_000_000;
    if (r < 5.1)  return 1_000_000;
    if (r < 15.1) return 500_000;
    if (r < 40.1) return 200_000;
    if (r < 90.1) return 100_000;
    return 50_000;
  };

  const handleClaim = () => {
    if (!canClaim || isSpinning) return;
    setIsSpinning(true);
    setCanClaim(false);

    let ticks = 0;
    const t = setInterval(() => {
      setSpinTick(Math.random() * 1_000_000);
      ticks++;
      if (ticks > 25) {
        clearInterval(t);
        const reward = getReward();
        win(reward);
        setWonAmount(reward);
        setIsSpinning(false);
        setDialogOpen(true);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }
    }, 100);
  };

  const formatDollar = (n: number) => "$" + n.toLocaleString();

  return (
    <div className="flex flex-col gap-10 p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Reward Dialog */}
      <AlertDialog.Backdrop isOpen={dialogOpen} onOpenChange={setDialogOpen} variant="blur">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="success" />
              <AlertDialog.Heading>Daily Reward!</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                 <Sparkles size={48} className="text-warning animate-pulse" />
                 <p className="text-4xl font-black text-white italic">
                   +{wonAmount ? formatDollar(wonAmount) : ""}
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

      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black tracking-tighter italic">DAILY SPINNER</h1>
        <p className="text-white/30 font-bold uppercase tracking-widest text-[11px]">Spin once every 24 hours · Win up to $10,000,000</p>
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
              {isSpinning ? "SPINNING..." : canClaim ? "MYSTERY DROP" : "COME BACK LATER"}
            </h2>
            <p className="text-primary font-black text-2xl italic tabular-nums tracking-widest h-8 flex items-center justify-center" style={{ fontFamily: "'Space Mono', monospace" }}>
              {isSpinning ? "$" + Math.floor(spinTick).toLocaleString() : canClaim ? "???,???" : timeLeft}
            </p>
          </div>

          <div className="w-full relative z-10 max-w-sm">
            <Button 
              onClick={handleClaim}
              isDisabled={!canClaim || isSpinning} 
              className={`w-full h-20 rounded-[28px] font-black text-2xl transition-all ${
                canClaim && !isSpinning
                  ? "bg-primary text-black shadow-2xl shadow-primary/30 hover:scale-105" 
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {isSpinning ? "ROLLING..." : canClaim ? "SPIN NOW" : `NEXT IN ${timeLeft}`}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
           <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none space-y-6 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Flame className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-black italic">PRIZE TABLE</h3>
              </div>

              <div className="space-y-2.5 font-bold text-sm tracking-widest uppercase">
                 {[
                   { label: "$10,000,000", chance: "0.1%", color: "text-warning", border: "border-warning/20" },
                   { label: "$1,000,000",  chance: "5%",   color: "text-primary",  border: "border-primary/20" },
                   { label: "$500,000",    chance: "10%",  color: "text-success",  border: "border-success/20" },
                   { label: "$200,000",    chance: "25%",  color: "text-white",    border: "border-white/10" },
                   { label: "$100,000",    chance: "50%",  color: "text-white/60", border: "border-white/5" },
                   { label: "$50,000",     chance: "9.9%", color: "text-white/40", border: "border-white/5" },
                 ].map(({ label, chance, color, border }) => (
                   <div key={label} className={`flex justify-between items-center bg-black/20 px-4 py-3 rounded-xl border ${border}`}>
                     <span className={color}>{label}</span>
                     <span className="text-white/30">{chance}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

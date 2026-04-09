"use client";

import React from "react";
import { 
  Card, 
  Button, 
  Chip,
  Separator
} from "@heroui/react";
import { 
  Gift, 
  Clock, 
  Flame, 
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";

export default function DailyRewards() {
  const { balance, win } = useEconomy();
  const [canClaim, setCanClaim] = React.useState(true);

  const handleClaim = () => {
    if (canClaim) {
      win(1000000); // Daily 1M reward
      setCanClaim(false);
      alert("Successfully claimed 1,000,000 Daily Donuts! 🍩");
      setTimeout(() => setCanClaim(true), 24 * 60 * 60 * 1000); // Reset after 24h
    }
  };

  return (
    <div className="flex flex-col gap-10 p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-black tracking-tight italic">DAILY REWARDS</h1>
        <p className="text-muted font-bold uppercase tracking-widest text-[11px]">Return every 24 hours to fuel your empire.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <Card className="lg:col-span-3 bg-secondary/40 border-white/5 p-12 rounded-[40px] shadow-none flex flex-col items-center justify-center text-center gap-10 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-12 rotate-12 opacity-5 group-hover:opacity-10 transition-all duration-1000">
            <Gift size={300} className="text-primary" />
          </div>
          
          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
             <div className="relative z-10 p-10 bg-primary/10 rounded-full border border-primary/20 shadow-2xl shadow-primary/10">
               <Gift className="text-primary" size={60} />
             </div>
          </div>

          <div className="space-y-3 relative z-10">
            <h2 className="text-4xl font-black italic tracking-tighter">DAILY DROP</h2>
            <p className="text-primary font-black text-xl italic">+1,000,000 DONUTS</p>
          </div>

          <div className="w-full relative z-10 max-w-sm">
            <Button 
              onClick={handleClaim}
              isDisabled={!canClaim} 
              className={`w-full h-20 rounded-[28px] font-black text-2xl transition-all ${
                canClaim 
                  ? "bg-primary text-black shadow-2xl shadow-primary/30 hover:scale-105" 
                  : "bg-white/5 text-muted italic"
              }`}
            >
              {canClaim ? "CLAIM REWARD" : "NEXT IN 23:59:59"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
           <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none space-y-6 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <TrendingUp className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-black italic">REWARD LOGS</h3>
              </div>

              <div className="space-y-4">
                {[
                  { day: "Next Reward", amount: "1,000,000", status: "Upcoming", icon: Clock, color: "text-muted" },
                  { day: "Today", amount: "1,000,000", status: "Claimed", icon: CheckCircle2, color: "text-primary" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 group hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white/5 rounded-xl ${item.color}`}>
                        <item.icon size={22} />
                      </div>
                      <div>
                          <p className="font-black text-white italic leading-none">{item.day}</p>
                          <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">{item.amount} Donuts</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </Card>

           <Card className="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[32px] flex flex-col gap-6">
              <div className="space-y-2">
                 <h4 className="text-xl font-black text-white italic">DISCORD BOOST</h4>
                 <p className="text-sm text-blue-400 font-medium leading-relaxed">Connect your Discord to double all daily rewards and unlock weekly drops.</p>
              </div>
              <Button className="w-full bg-blue-600 text-white font-black px-8 h-14 rounded-2xl border-none shadow-xl shadow-blue-900/40">
                 LINK ACCOUNT
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}

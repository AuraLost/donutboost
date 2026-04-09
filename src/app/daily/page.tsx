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
  Lock
} from "lucide-react";

export default function DailyRewards() {
  const [canClaim, setCanClaim] = React.useState(false);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">DAILY REWARDS</h1>
        <p className="text-muted font-medium italic">Return every 24 hours to claim your free donuts!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 rotate-12 opacity-10 group-hover:opacity-20 transition-opacity">
            <Gift size={200} className="text-primary" />
          </div>
          
          <div className="p-6 bg-primary/10 rounded-full animate-bounce">
            <Gift className="text-primary" size={48} />
          </div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-3xl font-black italic">DAILY REWARD</h2>
            <p className="text-muted font-medium">Next available reward: <span className="text-white">12:42:01</span></p>
          </div>

          <div className="w-full relative z-10">
            <Button 
              isDisabled={!canClaim} 
              className={`w-full h-16 rounded-2xl font-black text-xl transition-all ${
                canClaim ? "bg-primary text-black shadow-lg shadow-primary/20" : "bg-white/5 text-muted italic"
              }`}
            >
              {canClaim ? "CLAIM NOW" : "LOCKED"}
            </Button>
          </div>
        </Card>

        <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-orange-500/10 rounded-2xl">
               <Flame className="text-orange-500" size={28} />
             </div>
             <h3 className="text-xl font-bold">Reward History</h3>
          </div>

          <div className="space-y-4">
            {[
              { day: "Today", amount: "5,000 donuts", status: "Waiting", icon: Clock, color: "text-muted" },
              { day: "Yesterday", amount: "5,000 donuts", status: "Claimed", icon: CheckCircle2, color: "text-primary" },
              { day: "Apr 07", amount: "5,000 donuts", status: "Claimed", icon: CheckCircle2, color: "text-primary" },
              { day: "Apr 06", amount: "5,000 donuts", status: "Claimed", icon: CheckCircle2, color: "text-primary" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                   <div className={`p-2 bg-white/5 rounded-lg ${item.color}`}>
                     <item.icon size={20} />
                   </div>
                   <div>
                      <p className="font-bold text-white leading-none">{item.day}</p>
                      <p className="text-xs text-muted mt-1">{item.amount}</p>
                   </div>
                </div>
                <Chip variant="soft" className={`${item.color === "text-primary" ? "bg-primary/10 text-primary" : "bg-white/5 text-muted"} border-none text-[10px] font-black uppercase tracking-widest`}>
                  {item.status}
                </Chip>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-6">
         <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-400">
            <Lock size={32} />
         </div>
         <div className="space-y-1">
            <h4 className="text-xl font-bold text-white">UPGRADE YOUR REWARDS</h4>
            <p className="text-sm text-blue-400/80">Connect your Discord account to double your daily donuts and unlock weekly rewards!</p>
         </div>
         <Button className="ml-auto bg-blue-600 text-white font-black px-8 h-12 rounded-xl border-none">
            LINK DISCORD
         </Button>
      </div>
    </div>
  );
}

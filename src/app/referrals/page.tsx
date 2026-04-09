"use client";

import React from "react";
import { 
  Card, 
  Button, 
  Input, 
  Separator,
  ScrollShadow
} from "@heroui/react";
import { 
  Users, 
  Copy, 
  TrendingUp, 
  DollarSign,
  Gift,
  ChevronRight
} from "lucide-react";

export default function Referrals() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">REFERRALS</h1>
        <p className="text-muted font-medium italic">Invite your friends and earn up to 5% of their wagers!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Gift className="text-primary" size={28} />
            </div>
            <h3 className="text-xl font-bold">Your Referral Link</h3>
          </div>
          
          <div className="space-y-4">
             <p className="text-sm text-muted">Share this link to start earning rewards instantly.</p>
             <div className="relative group">
               <Input 
                 readOnly 
                 value="donutboost.net/r/steve" 
                 className="w-full bg-black/20"
               />
               <Button 
                 isIconOnly 
                 variant="ghost" 
                 className="absolute right-2 top-1/2 -translate-y-1/2 border-none shadow-none text-primary"
               >
                 <Copy size={20} />
               </Button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">Active Referrals</p>
                <p className="text-2xl font-black">12</p>
             </div>
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">Commission</p>
                <p className="text-2xl font-black text-primary">$142.50</p>
             </div>
          </div>
        </Card>

        <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none space-y-6">
           <h3 className="text-xl font-bold flex items-center gap-3">
             <TrendingUp className="text-blue-500" />
             How it Works
           </h3>
           <div className="space-y-6">
              {[
                { step: "01", title: "Share Link", desc: "Send your unique link to friends." },
                { step: "02", title: "They Play", desc: "Your friends join and start playing." },
                { step: "03", title: "Earn Cash", desc: "Receive automated payouts in real-time." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                   <div className="text-2xl font-black text-white/20 select-none">{item.step}</div>
                   <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-sm text-muted">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black">LATEST PAYOUTS</h2>
        <Card className="bg-secondary/30 border-white/5 overflow-hidden rounded-[24px]">
           <ScrollShadow className="w-full h-80">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted">
                   <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {[...Array(6)].map((_, i) => (
                     <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-bold">User_{842 + i}</td>
                        <td className="px-6 py-4 text-primary font-black">$2.40</td>
                        <td className="px-6 py-4 text-muted text-sm">2 hours ago</td>
                        <td className="px-6 py-4 text-right italic text-xs text-muted">Completed</td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </ScrollShadow>
        </Card>
      </div>
    </div>
  );
}

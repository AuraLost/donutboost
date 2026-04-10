"use client";

import React from "react";
import { 
  Card, 
  Button, 
  Chip,
  ScrollShadow,
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@heroui/react";
import { 
  History, 
  TrendingUp, 
  Trophy,
  Activity,
  ArrowUpRight,
  Wallet
} from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";

const recentBets = [
  { id: 1, user: "Steve", game: "Crash", amount: "$420.00", multiplier: "1.42x", prize: "$596.40", time: "1s ago", avatar: "https://i.pravatar.cc/150?u=steve" },
  { id: 2, user: "Alex", game: "Mines", amount: "$100.00", multiplier: "5.20x", prize: "$520.00", time: "3s ago", avatar: "https://i.pravatar.cc/150?u=alex" },
  { id: 3, user: "Creeper", game: "Dice", amount: "$1,000.00", multiplier: "0.00x", prize: "$0.00", time: "5s ago", avatar: "https://i.pravatar.cc/150?u=creeper" },
  { id: 4, user: "Diamond", game: "Plinko", amount: "$50.00", multiplier: "12.00x", prize: "$600.00", time: "8s ago", avatar: "https://i.pravatar.cc/150?u=diamond" },
  { id: 5, user: "Pigman", game: "Crash", amount: "$25.00", multiplier: "2.10x", prize: "$52.50", time: "12s ago", avatar: "https://i.pravatar.cc/150?u=pigman" },
];

export default function LiveBets() {
  const { balance } = useEconomy();
  const formatMoney = (n: number) => {
    if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + n.toLocaleString();
  };

  const openWallet = () => window.dispatchEvent(new Event("open-wallet"));

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Activity className="text-primary" size={36} />
          LIVE BETS
        </h1>
        <p className="text-muted font-medium italic">Watch the latest action across the platform in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <Card className="bg-secondary/40 border-white/5 overflow-hidden rounded-[32px] shadow-2xl">
              <ScrollShadow className="w-full h-[600px]">
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted sticky top-0 z-20 backdrop-blur-md">
                       <tr>
                          <th className="px-8 py-6">Player</th>
                          <th className="px-8 py-6">Game</th>
                          <th className="px-8 py-6">Bet Amount</th>
                          <th className="px-8 py-6">Multiplier</th>
                          <th className="px-8 py-6 text-right">Payout</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {recentBets.map((bet) => (
                         <tr key={bet.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <Avatar size="sm" className="border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                                     <AvatarImage src={bet.avatar} />
                                     <AvatarFallback>{bet.user[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-bold text-white mb-0.5">{bet.user}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <Chip variant="soft" className="bg-white/5 text-muted border-none font-bold text-[10px] uppercase">
                                 {bet.game}
                               </Chip>
                            </td>
                            <td className="px-8 py-6 font-bold text-muted">{bet.amount}</td>
                            <td className="px-8 py-6">
                               <span className={`font-black ${parseFloat(bet.multiplier) > 1 ? "text-primary" : "text-danger-soft italic opacity-60"}`}>
                                 {bet.multiplier}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 text-primary font-black">
                                  {parseFloat(bet.prize) > 0 ? (
                                    <>
                                       <span>{bet.prize}</span>
                                       <Trophy size={14} />
                                    </>
                                  ) : (
                                    <span className="text-muted italic opacity-30 text-xs">Lost</span>
                                  )}
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </ScrollShadow>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-primary/10 border-primary/20 p-6 rounded-[28px] shadow-none space-y-4">
              <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                 <ArrowUpRight size={16} />
                 Biggest Mult
              </h4>
              <div className="space-y-1">
                 <p className="text-4xl font-black text-white italic">42.50x</p>
                 <p className="text-xs text-muted">Won by <span className="text-white font-bold">Steve</span> on <span className="text-white">Crash</span></p>
              </div>
           </Card>

           <Card className="bg-secondary/40 border-white/5 p-6 rounded-[28px] shadow-none space-y-4">
              <h4 className="text-sm font-black text-muted uppercase tracking-widest">Platform Stats</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-xs text-muted">Total Bets</span>
                    <span className="font-bold text-white">4.2M</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-xs text-muted">Active Players</span>
                    <span className="font-bold text-white">1,240</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">Wallet Value</span>
                    <button onClick={openWallet} className="font-bold text-primary inline-flex items-center gap-1.5 hover:text-blue-300 transition-colors">
                      <Wallet size={13} />
                      {formatMoney(balance)}
                    </button>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

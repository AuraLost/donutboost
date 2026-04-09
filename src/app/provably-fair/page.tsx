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
  ShieldCheck, 
  FileSearch, 
  Lock, 
  RefreshCcw,
  Info
} from "lucide-react";

export default function ProvablyFair() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-4 justify-center md:justify-start">
          <ShieldCheck className="text-primary" size={36} />
          PROVABLY FAIR
        </h1>
        <p className="text-muted font-medium italic">Verify any game outcome using cryptographic seeds.</p>
      </div>

      <Card className="bg-secondary/40 border-white/5 p-8 rounded-[32px] shadow-none space-y-8">
        <div className="flex flex-col gap-6">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Active Client Seed</label>
              <div className="flex gap-4">
                <Input value="H7x9A2m4L0p1T8v5" className="bg-black/20" />
                <Button variant="ghost" className="border-white/10 text-white font-bold h-12 flex items-center gap-2">
                  <RefreshCcw size={18} />
                  Change
                </Button>
              </div>
           </div>

           <div className="space-y-3 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Server Seed (Hashed)</label>
              <div className="relative">
                <Input readOnly value="7a2f4c1e9b8d5a3f2c...8e9d0c" className="bg-black/20" />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              <p className="text-[10px] italic text-muted">The unhashed server seed will be revealed once you change your seat.</p>
           </div>
        </div>

        <Separator className="opacity-5" />

        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileSearch className="text-blue-500" size={20} />
              </div>
              <h3 className="text-xl font-bold">Verification Calc</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted">Game Hash</label>
                 <Input placeholder="Enter game hash to verify" className="bg-black/20" />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted">Game Nonce</label>
                 <Input type="number" defaultValue={0} className="bg-black/20" />
              </div>
           </div>
           <Button className="w-full bg-blue-600 text-white font-black py-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-900/40">
              VERIFY OUTCOME
           </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted">
           <Info size={16} />
           <span className="text-sm font-bold uppercase tracking-widest">How it works</span>
        </div>
        <p className="text-sm text-muted leading-relaxed">
           Our platform uses a cryptographic system that allows you to verify that each game outcome is pre-determined and hasn't been modified. 
           The system uses a <strong>Server Seed</strong>, a <strong>Client Seed</strong>, and a <strong>Nonce</strong> to generate a unique hash for every bet.
        </p>
      </div>
    </div>
  );
}

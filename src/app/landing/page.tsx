"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Play, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center pt-16 md:pt-24 pb-16 px-6 max-w-5xl mx-auto w-full text-center relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="relative mb-8 md:mb-10 group">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 opacity-60" />
        <img src="/donutsmp.png" alt="Donut SMP" className="w-32 h-32 md:w-44 md:h-44 object-contain relative z-10 drop-shadow-2xl" />
      </div>

      <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black tracking-[0.2em] mb-6 uppercase">
        <ShieldCheck size={14} /> Provably Fair · Donut SMP Economy
      </div>

      <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-[0.95] mb-4">
        Multiply your <span className="text-primary italic">Wealth</span>
      </h1>
      <p className="text-sm md:text-lg text-white/40 font-medium max-w-xl mx-auto leading-relaxed mb-8">
        Casino games built for Donut SMP players with instant wallet-based gameplay.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/games/crash">
          <Button size="lg" className="bg-primary text-black font-black px-10 h-12 rounded-2xl">
            <Play className="mr-2" size={18} fill="currentColor" />
            Play Now
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="lg" className="h-12 px-8 rounded-2xl text-white/70 border border-white/10">
            Open Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

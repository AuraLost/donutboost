"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { Play, ShieldCheck, X, Sword } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!username.trim() || isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLoginOpen(false);
      router.push("/home");
    }, 1400);
  };

  return (
    <>
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
          <Button onClick={() => setLoginOpen(true)} size="lg" className="bg-primary text-black font-black px-10 h-12 rounded-2xl">
            <Play className="mr-2" size={18} fill="currentColor" />
            Play Now
          </Button>
        </div>
      </div>

      {loginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => !isVerifying && setLoginOpen(false)} />
          <div className="relative bg-[#0c0c0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <button onClick={() => !isVerifying && setLoginOpen(false)} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-green-500/15 rounded-2xl">
                <Sword size={26} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Minecraft Verification</h2>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-0.5">Donut SMP Members Only</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-white/30 uppercase tracking-widest">Your Minecraft Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Steve123"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                disabled={isVerifying}
              />
              <Button
                onClick={handleVerify}
                isDisabled={!username.trim() || isVerifying}
                className="w-full h-12 bg-primary text-black font-black text-sm rounded-2xl shadow-lg shadow-primary/20"
              >
                {isVerifying ? "Verifying..." : "Verify and Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

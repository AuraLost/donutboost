"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { Play, ShieldCheck, X, Sword } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleLogin = () => {
    if (!username.trim()) return;
    setSubmitted(true);
    // Later: verify via Mineflayer bot
  };

  return (
    <>
      <div className="flex flex-col items-center pt-28 pb-20 px-8 max-w-5xl mx-auto w-full text-center relative">
        
        {/* Background ambience */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* Donut SMP Logo */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-all duration-700 opacity-60" />
          <img
            src="/donutsmp.png"
            alt="Donut SMP"
            className="w-36 h-36 md:w-44 md:h-44 object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 ease-out"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-[0.25em] mb-8 uppercase">
          <ShieldCheck size={14} /> Provably Fair · Donut SMP Economy
        </div>
        
        {/* Headline */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
          Multiply your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-300 to-primary italic">
            Wealth
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-white/40 font-medium max-w-xl mx-auto leading-relaxed mb-10">
          The most advanced gambling platform built exclusively for Donut SMP players. High limits, daily rewards, no bullshit.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            onClick={() => setLoginOpen(true)}
            size="lg" 
            className="bg-primary text-black font-black px-12 h-14 rounded-2xl text-base shadow-[0_0_60px_rgba(59,130,246,0.35)] hover:scale-105 hover:shadow-[0_0_100px_rgba(59,130,246,0.5)] transition-all duration-400 ease-out"
          >
            <Play className="mr-2" size={20} fill="currentColor" />
            PLAY NOW
          </Button>
          <Link href="/daily">
            <Button variant="ghost" size="lg" className="h-14 px-10 rounded-2xl text-base font-bold text-white/60 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
              Daily Drops →
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-3 gap-px w-full max-w-2xl bg-white/5 rounded-3xl overflow-hidden border border-white/5">
          <div className="flex flex-col items-center gap-1.5 p-8 bg-black/50">
            <span className="text-3xl font-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>12.4T</span>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">24H Volume</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-8 bg-black/50">
            <span className="text-3xl font-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>99.9%</span>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Uptime</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-8 bg-black/50">
            <span className="text-3xl font-black text-success" style={{ fontFamily: "'Space Mono', monospace" }}>2.1B</span>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Record Win</span>
          </div>
        </div>
      </div>

      {/* Login / Sign Up Modal */}
      {loginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setLoginOpen(false); setSubmitted(false); }} />
          <div className="relative bg-[#0c0c0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <button onClick={() => { setLoginOpen(false); setSubmitted(false); }} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>

            {!submitted ? (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-green-500/15 rounded-2xl">
                    <Sword size={26} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Enter the Game</h2>
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
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-white/40 leading-relaxed">
                      ⚡ Soon your account will be verified automatically via our Mineflayer bot on the Donut SMP server.
                    </p>
                  </div>
                  <Button 
                    onClick={handleLogin}
                    isDisabled={!username.trim()}
                    className="w-full h-13 bg-primary text-black font-black text-base rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform py-3.5"
                  >
                    <Play size={16} fill="currentColor" className="mr-2" /> 
                    Login / Sign Up
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">🍩</div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Welcome, {username}!</h2>
                <p className="text-white/40 text-sm mb-6">Your session has been started. Bot verification coming soon.</p>
                <Link href="/games/crash" onClick={() => setLoginOpen(false)}>
                  <Button className="bg-primary text-black font-black px-10 h-12 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Start Playing →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

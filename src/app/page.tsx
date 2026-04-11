"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Play, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";

export default function LandingPage() {
  const router = useRouter();
  const { setFromServer } = useEconomy();
  const [authOpen, setAuthOpen] = useState(false);
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.user) return;
      setFromServer({
        balance: data.user.balance,
        totalWins: data.user.totalWins,
        totalLosses: data.user.totalLosses,
        totalWagered: data.user.totalWagered,
        totalPayout: data.user.totalPayout,
      });
      router.replace("/home");
    };

    void check();
  }, [router, setFromServer]);

  const submit = async () => {
    if (!minecraftUsername.trim() || loading) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minecraftUsername: minecraftUsername.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Authentication failed.");
      }

      setFromServer({
        balance: data.user.balance,
        totalWins: data.user.totalWins,
        totalLosses: data.user.totalLosses,
        totalWagered: data.user.totalWagered,
        totalPayout: data.user.totalPayout,
      });

      setMessage(data.firstLogin ? "First login detected. 1,000,000 bonus applied." : "Login successful.");
      window.setTimeout(() => router.push("/home"), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center pt-16 md:pt-24 pb-16 px-6 max-w-5xl mx-auto w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="relative mb-8 md:mb-10 group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 opacity-60" />
          <img src="/logo.png" alt="DonutBoost" className="w-32 h-32 md:w-44 md:h-44 object-contain relative z-10 drop-shadow-2xl" />
        </div>

        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black tracking-[0.2em] mb-6 uppercase">
          <ShieldCheck size={14} /> Members Only Access
        </div>

        <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-[0.95] mb-4">
          DonutBoost <span className="text-primary italic">Account Login</span>
        </h1>
        <p className="text-sm md:text-lg text-white/40 font-medium max-w-xl mx-auto leading-relaxed mb-8">
          Create an account to unlock all games. New users get a 1,000,000 bonus. Link Discord later for +500,000.
        </p>

        <Button onClick={() => setAuthOpen(true)} size="lg" className="bg-primary text-black font-black px-10 h-12 rounded-2xl">
          <Play className="mr-2" size={18} fill="currentColor" />
          Login
        </Button>
      </div>

      {authOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => !loading && setAuthOpen(false)} />
          <div className="relative bg-[#0c0c0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <button onClick={() => !loading && setAuthOpen(false)} className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-white tracking-tight">Minecraft Login</h2>
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Use your Minecraft username only</p>

            <div className="space-y-3">
              <input
                type="text"
                value={minecraftUsername}
                onChange={(e) => setMinecraftUsername(e.target.value)}
                placeholder="Minecraft Username"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />

              <Button onClick={submit} isDisabled={loading || !minecraftUsername.trim()} className="w-full h-12 bg-primary text-black font-black rounded-xl">
                {loading ? "Please wait..." : "Login"}
              </Button>

              {message && <p className="text-xs text-success font-bold">{message}</p>}
              {error && <p className="text-xs text-danger font-bold">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

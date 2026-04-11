"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { Play, ShieldCheck, X, Sword } from "lucide-react";
import { useRouter } from "next/navigation";

const WEB_USER_ID_KEY = "donutboost_web_user_id";
const BOT_NAME = ".LilHazMC";

const createWebUserId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `web-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
};

export default function LandingPage() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [webUserId, setWebUserId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "pending" | "verified" | "expired" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const existing = localStorage.getItem(WEB_USER_ID_KEY);
    if (existing) {
      setWebUserId(existing);
      return;
    }
    const created = createWebUserId();
    localStorage.setItem(WEB_USER_ID_KEY, created);
    setWebUserId(created);
  }, []);

  useEffect(() => {
    if (!loginOpen || verifyStatus !== "pending" || !webUserId) return;
    const iv = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/minecraft/status?webUserId=${encodeURIComponent(webUserId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "verified") {
          setVerifyStatus("verified");
          setStatusMessage(`Linked to Minecraft account ${data.minecraftUsername}. Redirecting...`);
          window.clearInterval(iv);
          window.setTimeout(() => {
            setLoginOpen(false);
            router.push("/home");
          }, 900);
        } else if (data.status === "expired") {
          setVerifyStatus("expired");
          setStatusMessage("Code expired. Request a new one.");
          window.clearInterval(iv);
        }
      } catch {
        // Keep polling quietly.
      }
    }, 3000);
    return () => window.clearInterval(iv);
  }, [loginOpen, verifyStatus, webUserId, router]);

  const expiresIn = useMemo(() => {
    if (!expiresAt) return "";
    const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }, [expiresAt]);

  const handleVerify = async () => {
    if (!username.trim() || isVerifying || !webUserId) return;
    setIsVerifying(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/minecraft/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webUserId,
          requestedUsername: username.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to request code.");
      setVerifyCode(data.code);
      setExpiresAt(data.expiresAt);
      setVerifyStatus("pending");
      setStatusMessage(`Code generated. Join DonutSMP.net and run /msg ${BOT_NAME} ${data.code}`);
    } catch (error) {
      setVerifyStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Could not generate verification code.");
    } finally {
      setIsVerifying(false);
    }
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
                {isVerifying ? "Generating Code..." : "Generate Verification Code"}
              </Button>
              {verifyCode && (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 mb-1">Your Code</p>
                  <p className="text-3xl font-black text-primary tracking-widest">{verifyCode}</p>
                  <p className="text-xs text-white/60 mt-2">
                    In Minecraft: <span className="font-black text-white">/msg {BOT_NAME} {verifyCode}</span>
                  </p>
                  {verifyStatus === "pending" && (
                    <p className="text-[11px] font-bold text-white/50 mt-1">Waiting for in-game whisper... expires in {expiresIn}</p>
                  )}
                </div>
              )}
              {statusMessage && (
                <p className={`text-xs font-bold ${verifyStatus === "verified" ? "text-success" : verifyStatus === "error" ? "text-danger" : "text-white/60"}`}>
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

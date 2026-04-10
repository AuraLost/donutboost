"use client";
import React, { useState, useRef } from "react";
import { Button } from "@heroui/react";
import { X } from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";
import { getRigIntensity, scaleDownByRig } from "@/lib/rigging";

type Difficulty = "noob" | "pro" | "expert";

type WheelSegment = {
  label: string;
  mult: number;
  color: string;
  deg: number;
};

const parseBet = (s: string): number => {
  const c = s.trim().toLowerCase().replace(/,/g, "");
  const n = parseFloat(c);
  if (isNaN(n)) return 0;
  if (c.endsWith("t")) return n * 1e12;
  if (c.endsWith("b")) return n * 1e9;
  if (c.endsWith("m")) return n * 1e6;
  if (c.endsWith("k")) return n * 1e3;
  return n;
};

const BASE_SEGMENTS: WheelSegment[] = [
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0.4x", mult: 0.4, color: "#2563eb", deg: 30 },
  { label: "0.8x", mult: 0.8, color: "#7c3aed", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0.6x", mult: 0.6, color: "#16a34a", deg: 30 },
  { label: "0.25x", mult: 0.25, color: "#9a3412", deg: 30 },
  { label: "1.2x", mult: 1.2, color: "#ca8a04", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0.3x", mult: 0.3, color: "#334155", deg: 30 },
  { label: "1.5x", mult: 1.5, color: "#b45309", deg: 30 },
  { label: "0.2x", mult: 0.2, color: "#9a3412", deg: 30 },
  { label: "0.7x", mult: 0.7, color: "#16a34a", deg: 30 },
];

const EXPERT_SEGMENTS: WheelSegment[] = [
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "1x", mult: 1, color: "#1d4ed8", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
  { label: "JACKPOT", mult: 12, color: "#f59e0b", deg: 30 },
  { label: "0x", mult: 0, color: "#ef4444", deg: 30 },
];

const getSegments = (difficulty: Difficulty): WheelSegment[] =>
  difficulty === "expert" ? EXPERT_SEGMENTS : BASE_SEGMENTS;

const pickSegment = (diff: Difficulty, rigIntensity: number): number => {
  const segments = getSegments(diff);
  const weights = segments.map((s) => {
    if (diff === "expert") {
      if (s.mult >= 10) return scaleDownByRig(0.5, rigIntensity, 0.7);
      if (s.mult === 1) return scaleDownByRig(1.2, rigIntensity, 0.45);
      return 2.8 + rigIntensity * 2.4;
    }
    if (diff === "noob") {
      if (s.mult >= 1) return scaleDownByRig(1.8, rigIntensity, 0.45);
      if (s.mult === 0) return 0.7 + rigIntensity * 1.5;
      return 1 + rigIntensity * 0.35;
    }
    if (s.mult >= 1) return scaleDownByRig(1.2, rigIntensity, 0.55);
    if (s.mult === 0) return 1 + rigIntensity * 1.8;
    return 1 + rigIntensity * 0.5;
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return i;
  }
  return 0;
};

export default function WheelPage() {
  const { balance, bet, win } = useEconomy();
  const [betInput, setBetInput] = useState("1000");
  const [difficulty, setDifficulty] = useState<Difficulty>("noob");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [outcome, setOutcome] = useState<{ won: boolean; mult: number; amount: number } | null>(null);
  const [popup, setPopup] = useState<{ won: boolean; amount: number; message: string } | null>(null);
  const baseRotRef = useRef(0);

  const betAmount = parseBet(betInput);
  const rigIntensity = getRigIntensity(balance);
  const segments = getSegments(difficulty);

  const CX = 150;
  const CY = 150;
  const R = 140;
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const paths = segments.map((seg, i) => {
    const startDeg = i * seg.deg;
    const endDeg = startDeg + seg.deg;
    const startRad = toRad(startDeg);
    const endRad = toRad(endDeg);
    const x1 = CX + R * Math.cos(startRad);
    const y1 = CY + R * Math.sin(startRad);
    const x2 = CX + R * Math.cos(endRad);
    const y2 = CY + R * Math.sin(endRad);
    const midRad = toRad(startDeg + seg.deg / 2);
    const tx = CX + R * 0.62 * Math.cos(midRad);
    const ty = CY + R * 0.62 * Math.sin(midRad);
    const textAngle = startDeg + seg.deg / 2;
    return {
      d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`,
      color: seg.color,
      tx,
      ty,
      textAngle,
      label: seg.label,
      i,
    };
  });

  const spin = () => {
    if (isSpinning || betAmount < 1000) return;
    if (!bet(betAmount)) return;

    setIsSpinning(true);
    setOutcome(null);

    const segIdx = pickSegment(difficulty, rigIntensity);
    const targetOffset = 360 - (segIdx * 30 + 15);
    const fullSpins = 4 + Math.floor(Math.random() * 3);
    const newRotation = baseRotRef.current + fullSpins * 360 + targetOffset;

    baseRotRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const mult = segments[segIdx].mult;
      const effectiveMult = scaleDownByRig(mult, rigIntensity, mult > 1 ? 0.3 : 0);
      const amount = Math.floor(betAmount * effectiveMult);
      const won = effectiveMult >= 1;

      if (won) {
        win(amount);
        useEconomy.getState().recordWin(betAmount, amount);
      } else {
        useEconomy.getState().recordLoss(betAmount);
      }

      setOutcome({ won, mult: Number(effectiveMult.toFixed(2)), amount });
      setPopup({ won, amount, message: `Landed ${effectiveMult.toFixed(2)}x` });
    }, 4500);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] animate-in fade-in duration-500 relative">
      {popup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className={`pointer-events-auto relative p-8 rounded-3xl border text-center animate-in zoom-in-90 duration-300 shadow-2xl max-w-sm mx-4 ${popup.won ? "bg-[#0c1f0f] border-success/30" : "bg-[#1f0c0c] border-danger/30"}`}>
            <button onClick={() => setPopup(null)} className="absolute top-3 right-3 text-white/30 hover:text-white"><X size={18} /></button>
            <p className={`text-5xl font-black italic mb-2 ${popup.won ? "text-success" : "text-danger"}`}>{popup.won ? "WIN!" : "LOSS"}</p>
            <p className="text-white/50 text-sm font-bold mb-3">{popup.message}</p>
            {popup.won && <p className="text-success font-black text-2xl">+${popup.amount.toLocaleString()}</p>}
            <Button onClick={() => setPopup(null)} className={`mt-4 h-10 px-8 rounded-2xl font-black text-sm ${popup.won ? "bg-success text-black" : "bg-danger text-white"}`}>{popup.won ? "Collect!" : "Try Again"}</Button>
          </div>
        </div>
      )}

      <aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Bet Amount</label>
          <input value={betInput} onChange={e => setBetInput(e.target.value)} disabled={isSpinning}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            placeholder="1K, 2.5M, 1B, 1T" />
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[["1K", 1000], ["10K", 10000], ["100K", 100000], ["1M", 1000000], ["1T", 1e12]].map(([l, v]) => (
              <button key={l as string} onClick={() => !isSpinning && setBetInput(String(v))} className="text-[10px] font-black py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-white/40 transition-colors border border-white/5">{l as string}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Difficulty</label>
          <div className="flex flex-col gap-1.5">
            {(["noob", "pro", "expert"] as Difficulty[]).map(d => (
              <button key={d} disabled={isSpinning} onClick={() => setDifficulty(d)} className={`h-10 rounded-xl border font-black text-sm transition-all disabled:opacity-50 ${difficulty === d ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/5 text-white/30 hover:text-white"}`}>
                {d === "noob" ? "Noob - biased high" : d === "pro" ? "Pro - balanced" : "Expert - 1 jackpot, 1x, rest 0x"}
              </button>
            ))}
          </div>
        </div>

        {outcome && (
          <div className={`rounded-2xl p-4 border text-center ${outcome.won ? "bg-success/10 border-success/20" : "bg-danger/10 border-danger/20"}`}>
            <p className={`text-2xl font-black ${outcome.won ? "text-success" : "text-danger"}`}>
              {outcome.won ? `${outcome.mult}x WIN!` : "BUST!"}
            </p>
            {outcome.won && <p className="text-success font-black text-lg mt-1">+${outcome.amount.toLocaleString()}</p>}
          </div>
        )}

        <Button onClick={spin} isDisabled={isSpinning || betAmount < 1000} className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mt-auto">
          {isSpinning ? "SPINNING..." : "SPIN THE WHEEL"}
        </Button>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center bg-black/20 gap-8 p-4 md:p-8">
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "28px solid #f59e0b" }} />
          </div>

          <div style={{ width: 300, height: 300, position: "relative" }}>
            <svg
              viewBox="0 0 300 300"
              style={{
                width: "100%",
                height: "100%",
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {paths.map(p => (
                <g key={p.i}>
                  <path d={p.d} fill={p.color} stroke="#050a0f" strokeWidth="2" />
                  <text
                    x={p.tx} y={p.ty}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="11" fontWeight="900"
                    transform={`rotate(${p.textAngle}, ${p.tx}, ${p.ty})`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif", pointerEvents: "none" }}
                  >
                    {p.label}
                  </text>
                </g>
              ))}
              <circle cx={CX} cy={CY} r={22} fill="#050a0f" stroke="#1e293b" strokeWidth="3" />
              <circle cx={CX} cy={CY} r={10} fill="#3b82f6" />
            </svg>

            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.08)", pointerEvents: "none", boxShadow: "0 0 60px rgba(59,130,246,0.2), inset 0 0 60px rgba(0,0,0,0.5)" }} />
          </div>
        </div>

        {isSpinning && <p className="text-primary font-black text-lg animate-pulse uppercase tracking-widest">Spinning...</p>}
        {!isSpinning && !outcome && <p className="text-white/20 font-bold text-sm uppercase tracking-widest">Press spin to play</p>}
      </main>
    </div>
  );
}

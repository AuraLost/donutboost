"use client";
import React, { useState, useRef, useCallback } from "react";
import { Button } from "@heroui/react";
import { useEconomy } from "@/hooks/use-economy";

type Difficulty = "noob" | "pro" | "expert";

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

// Wheel segments: [label, multiplier, color, degrees]
const SEGMENTS = [
  { label: "0x",   mult: 0,   color: "#ef4444", deg: 30 },
  { label: "1.5x", mult: 1.5, color: "#2563eb", deg: 30 },
  { label: "3x",   mult: 3,   color: "#7c3aed", deg: 30 },
  { label: "0x",   mult: 0,   color: "#ef4444", deg: 30 },
  { label: "2x",   mult: 2,   color: "#16a34a", deg: 30 },
  { label: "0.5x", mult: 0.5, color: "#9a3412", deg: 30 },
  { label: "5x",   mult: 5,   color: "#ca8a04", deg: 30 },
  { label: "0x",   mult: 0,   color: "#ef4444", deg: 30 },
  { label: "1x",   mult: 1,   color: "#334155", deg: 30 },
  { label: "10x",  mult: 10,  color: "#b45309", deg: 30 },
  { label: "0.5x", mult: 0.5, color: "#9a3412", deg: 30 },
  { label: "2x",   mult: 2,   color: "#16a34a", deg: 30 },
];

// Weighted selection: on Noob shift toward higher multipliers, Expert toward lower
const pickSegment = (diff: Difficulty): number => {
  const weights = SEGMENTS.map((s, i) => {
    if (diff === "noob")   return s.mult >= 2 ? 3 : s.mult === 0 ? 0.4 : 1;
    if (diff === "expert") return s.mult === 0 ? 2.5 : s.mult >= 5 ? 0.5 : 1;
    return 1;
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
  const { bet, win } = useEconomy();
  const [betInput, setBetInput] = useState("1000");
  const [difficulty, setDifficulty] = useState<Difficulty>("noob");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [landedSeg, setLandedSeg] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<{ won: boolean; mult: number; amount: number } | null>(null);
  const baseRotRef = useRef(0);

  const betAmount = parseBet(betInput);

  // Build SVG paths for each segment
  const CX = 150, CY = 150, R = 140;
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  let cumDeg = 0;
  const paths = SEGMENTS.map((seg, i) => {
    const startDeg = cumDeg;
    const endDeg   = cumDeg + seg.deg;
    cumDeg = endDeg;
    const startRad = toRad(startDeg);
    const endRad   = toRad(endDeg);
    const x1 = CX + R * Math.cos(startRad);
    const y1 = CY + R * Math.sin(startRad);
    const x2 = CX + R * Math.cos(endRad);
    const y2 = CY + R * Math.sin(endRad);
    const midRad = toRad(startDeg + seg.deg / 2);
    const tx = CX + (R * 0.62) * Math.cos(midRad);
    const ty = CY + (R * 0.62) * Math.sin(midRad);
    const textAngle = startDeg + seg.deg / 2;
    return { d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`, color: seg.color, tx, ty, textAngle, label: seg.label, i };
  });

  const spin = () => {
    if (isSpinning || betAmount < 1000) return;
    if (!bet(betAmount)) return;
    setIsSpinning(true);
    setLandedSeg(null);
    setOutcome(null);

    const segIdx = pickSegment(difficulty);
    // Center of segment N is at N*30 + 15 degrees from start
    // The pointer is at top (0 deg). We need segIdx*30+15 to face up after spin.
    // After spin, rotation % 360 should put the target segment center at 0 deg (top).
    // If segment starts at segIdx*30, its center is at segIdx*30+15.
    // We need total rotation such that (total) % 360 = 360 - (segIdx*30+15)
    const targetOffset = 360 - (segIdx * 30 + 15);
    const fullSpins = 4 + Math.floor(Math.random() * 3);
    const newRotation = baseRotRef.current + fullSpins * 360 + targetOffset;
    baseRotRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setLandedSeg(segIdx);
      setIsSpinning(false);
      const mult = SEGMENTS[segIdx].mult;
      const amount = Math.floor(betAmount * mult);
      if (mult > 0) win(amount);
      setOutcome({ won: mult > 0, mult, amount });
    }, 4500);
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500">
      {/* Bet Panel */}
      <aside className="w-72 flex-shrink-0 border-r border-white/5 bg-black/40 p-6 flex flex-col gap-5 overflow-y-auto">
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Bet Amount</label>
          <input value={betInput} onChange={e => setBetInput(e.target.value)} disabled={isSpinning}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            placeholder="1K, 2.5M, 1B, 1T" />
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[["1K",1000],["10K",10000],["100K",100000],["1M",1000000],["1T",1e12]].map(([l, v]) => (
              <button key={l as string} onClick={() => !isSpinning && setBetInput(String(v))} className="text-[10px] font-black py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-white/40 transition-colors border border-white/5">{l as string}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Difficulty</label>
          <div className="flex flex-col gap-1.5">
            {(["noob","pro","expert"] as Difficulty[]).map(d => (
              <button key={d} disabled={isSpinning} onClick={() => setDifficulty(d)} className={`h-10 rounded-xl border font-black text-sm transition-all disabled:opacity-50 ${difficulty === d ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/5 text-white/30 hover:text-white"}`}>
                {d === "noob" ? "Noob — biased high" : d === "pro" ? "Pro — balanced" : "Expert — risky"}
              </button>
            ))}
          </div>
        </div>

        {/* Prize table */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block">Prize Table</label>
          {[{l:"10x",c:"text-warning"},{l:"5x",c:"text-yellow-500"},{l:"3x",c:"text-purple-400"},{l:"2x",c:"text-success"},{l:"1.5x",c:"text-blue-400"},{l:"1x",c:"text-white/40"},{l:"0.5x",c:"text-orange-700"},{l:"0x",c:"text-danger"}].map(({l,c}) => (
            <div key={l} className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl">
              <span className={`font-black text-sm ${c}`}>{l}</span>
              <span className="text-white/20 text-xs font-bold">${Math.floor(betAmount * parseFloat(l)).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {outcome && (
          <div className={`rounded-2xl p-4 border text-center ${outcome.won ? "bg-success/10 border-success/20" : "bg-danger/10 border-danger/20"}`}>
            <p className={`text-2xl font-black ${outcome.won ? "text-success" : "text-danger"}`}>
              {outcome.won ? `🎉 ${outcome.mult}x WIN!` : "💀 BUST!"}
            </p>
            {outcome.won && <p className="text-success font-black text-lg mt-1">+${outcome.amount.toLocaleString()}</p>}
          </div>
        )}

        <Button onClick={spin} isDisabled={isSpinning || betAmount < 1000} className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mt-auto">
          {isSpinning ? "SPINNING..." : "SPIN THE WHEEL"}
        </Button>
      </aside>

      {/* Wheel Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center bg-black/20 gap-8">
        {/* Pointer */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "28px solid #f59e0b" }} />
          </div>

          {/* Wheel */}
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
              {/* Center cap */}
              <circle cx={CX} cy={CY} r={22} fill="#050a0f" stroke="#1e293b" strokeWidth="3" />
              <circle cx={CX} cy={CY} r={10} fill="#3b82f6" />
            </svg>

            {/* Outer ring */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.08)", pointerEvents: "none", boxShadow: "0 0 60px rgba(59,130,246,0.2), inset 0 0 60px rgba(0,0,0,0.5)" }} />
          </div>
        </div>

        {isSpinning && (
          <p className="text-primary font-black text-lg animate-pulse uppercase tracking-widest">Spinning...</p>
        )}
        {!isSpinning && !outcome && (
          <p className="text-white/20 font-bold text-sm uppercase tracking-widest">Press spin to play</p>
        )}
      </main>
    </div>
  );
}

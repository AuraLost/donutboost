"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { X } from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";

type Difficulty = "noob" | "pro" | "expert";
const HARD_BALANCE = 8_900_000;

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

const DIFF_CONFIG: Record<Difficulty, { label: string; baseHit: number; speedFactor: number; multFactor: number }> = {
  noob:   { label: "Noob",   baseHit: 0.10, speedFactor: 0.9, multFactor: 1.02 },
  pro:    { label: "Pro",    baseHit: 0.16, speedFactor: 1.05, multFactor: 1.045 },
  expert: { label: "Expert", baseHit: 0.22, speedFactor: 1.2, multFactor: 1.07 },
};

const VISIBLE_LANES = 7;

export default function ChickenPage() {
  const { balance, bet, win } = useEconomy();
  const [betInput, setBetInput] = useState("1000");
  const [difficulty, setDifficulty] = useState<Difficulty>("noob");
  const [isPlaying, setIsPlaying] = useState(false);
  const [distance, setDistance] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const [popup, setPopup] = useState<{ won: boolean; amount: number; message: string } | null>(null);
  const [chickenShake, setChickenShake] = useState(false);

  const cfg = DIFF_CONFIG[difficulty];
  const hardMode = balance >= HARD_BALANCE;
  const betAmount = parseBet(betInput);
  const multScale = hardMode ? 0.35 : 0.6;
  const currentMult = useMemo(() => (distance <= 0 ? 0.2 : Number((0.2 + (Math.pow(cfg.multFactor, distance) - 1) * multScale).toFixed(2))), [distance, cfg.multFactor, multScale]);
  const nextMult = Number((0.2 + (Math.pow(cfg.multFactor, distance + 1) - 1) * multScale).toFixed(2));
  const visibleLaneStart = distance;
  const visibleLanes = Array.from({ length: VISIBLE_LANES }, (_, i) => visibleLaneStart + i + 1);

  const startGame = () => {
    if (betAmount < 1000 || !bet(betAmount)) return;
    setDistance(0);
    setIsHit(false);
    setPopup(null);
    setIsPlaying(true);
  };

  const advance = () => {
    if (!isPlaying || isHit) return;
    const nextLane = distance + 1;
    const laneHitChance = Math.min(0.97, (cfg.baseHit + nextLane * 0.012) + (hardMode ? 0.22 : 0));
    if (Math.random() < laneHitChance) {
      setIsHit(true);
      setChickenShake(true);
      setIsPlaying(false);
      setPopup({ won: false, amount: 0, message: `Hit in lane ${nextLane}. You lost.` });
      useEconomy.getState().recordLoss(betAmount);
      setTimeout(() => setChickenShake(false), 600);
    } else {
      setDistance(nextLane);
    }
  };

  const cashOut = () => {
    if (!isPlaying || distance <= 0) return;
    const payout = Math.floor(betAmount * currentMult);
    win(payout);
    setIsPlaying(false);
    useEconomy.getState().recordWin(betAmount, payout);
    setPopup({ won: true, amount: payout, message: `Cashed out at lane ${distance} (${currentMult}x)` });
  };

  const LANE_W = 88;
  const BOARD_H = 380;

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
      {/* Bet Panel */}
      <aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Bet Amount</label>
          <input value={betInput} onChange={e => setBetInput(e.target.value)} disabled={isPlaying}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            placeholder="1K, 2.5M, 1B, 1T" />
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[["1K",1000],["10K",10000],["100K",100000],["1M",1000000],["1T",1e12]].map(([l, v]) => (
              <button key={l as string} onClick={() => !isPlaying && setBetInput(String(v))} className="text-[10px] font-black py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-white/40 transition-colors border border-white/5 disabled:opacity-40">{l as string}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Difficulty</label>
          <div className="flex flex-col gap-1.5">
            {(["noob","pro","expert"] as Difficulty[]).map(d => (
              <button key={d} disabled={isPlaying} onClick={() => setDifficulty(d)} className={`h-10 rounded-xl border font-black text-sm transition-all disabled:opacity-50 ${difficulty === d ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/5 text-white/30 hover:text-white"}`}>
                {DIFF_CONFIG[d].label} — speed {DIFF_CONFIG[d].speedFactor.toFixed(2)}x
              </button>
            ))}
          </div>
        </div>

        {isPlaying && distance > 0 && (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-4">
            <p className="text-xs text-success/70 font-bold uppercase tracking-widest">Current Cashout</p>
            <p className="text-2xl font-black text-success">${Math.floor(betAmount * currentMult).toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-1">{currentMult}x multiplier</p>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          {!isPlaying ? (
            <Button onClick={startGame} isDisabled={betAmount < 1000} className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl shadow-primary/20 shadow-lg">
              🐔 START CROSSING
            </Button>
          ) : (
            <>
              <Button onClick={advance} className="w-full h-12 bg-white/10 border border-white/20 text-white font-black rounded-2xl hover:bg-white/15 transition-all">
                ADVANCE → <span className="text-primary ml-1">{nextMult}x</span>
              </Button>
              <Button onClick={cashOut} isDisabled={distance <= 0} className="w-full h-12 bg-success text-black font-black rounded-2xl">
                CASH OUT ${distance > 0 ? Math.floor(betAmount * currentMult).toLocaleString() : "0"}
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Road Canvas */}
      <main className="flex-1 flex items-center justify-center bg-black/20 overflow-hidden p-3 md:p-6">
        <div className="relative flex" style={{ height: BOARD_H }}>
          {/* Safe zone */}
          <div className="relative flex items-center justify-center" style={{ width: 100, height: BOARD_H, background: "linear-gradient(180deg, #14532d 0%, #166534 100%)", borderRight: "2px solid #166534" }}>
            <img src={isHit ? "https://img.icons8.com/fluency/96/skeleton.png" : "https://img.icons8.com/fluency/96/chicken.png"} alt="chicken" className={`w-14 h-14 transition-all duration-300 ${chickenShake ? "shake" : "chicken-walk"}`} />
            <div className="absolute bottom-3 bg-black/60 rounded-lg px-2 py-1 text-[10px] font-black text-white/60 uppercase tracking-wide">{distance <= 0 ? "SAFE" : currentMult + "x"}</div>
          </div>

          {/* Lanes */}
          {visibleLanes.map((laneNo) => {
            const passed = laneNo <= distance;
            const laneSpeed = Math.max(0.45, (2.4 - laneNo * 0.045) / (cfg.speedFactor * (hardMode ? 1.35 : 1)));
            const carCount = laneNo % 3 === 0 ? 2 : 1;
            return (
              <div key={laneNo} className="relative overflow-hidden border-r border-white/5" style={{ width: LANE_W, height: BOARD_H, background: passed ? "rgba(34,197,94,0.05)" : "#1a1a1a" }}>
                {/* Dashed road lines */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 16px, transparent 16px, transparent 32px)" }} />

                {/* Cars */}
                {Array.from({ length: carCount }).map((_, idx) => (
                  <div key={`${laneNo}-${idx}`}
                    className={idx % 2 === 0 ? "car-down" : "car-up"}
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      animationDuration: `${laneSpeed}s`,
                      animationDelay: `-${(idx + laneNo) * 0.8}s`,
                      width: 36,
                      height: 60,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <img src="https://img.icons8.com/color/96/car--v1.png" alt="car" className="w-10 h-10" />
                  </div>
                ))}

                {/* Cashout label */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 rounded-full px-2 py-1 text-[9px] font-black text-white/60 z-10 whitespace-nowrap">
                  {Number((1 + Math.pow(cfg.multFactor, laneNo) - 1).toFixed(2))}x
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

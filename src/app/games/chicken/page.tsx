"use client";
import React, { useState, useRef, useEffect } from "react";
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

const DIFF_CONFIG: Record<Difficulty, { label: string; hitChance: number; lanes: number }> = {
  noob:   { label: "Noob",   hitChance: 0.12, lanes: 6 },
  pro:    { label: "Pro",    hitChance: 0.28, lanes: 8 },
  expert: { label: "Expert", hitChance: 0.48, lanes: 10 },
};

const LANE_MULTS = [1.2, 1.5, 2.0, 2.7, 3.6, 5.0, 7.0, 10.0, 15.0, 25.0];

// Each car: { laneIndex, startY, duration, direction, color }
type Car = { id: string; speed: string; dir: "down" | "up"; top: number; color: string };

function generateCars(totalLanes: number): Car[][] {
  return Array.from({ length: totalLanes }, (_, i) => {
    const count = 1 + Math.floor(Math.random() * 2);
    return Array.from({ length: count }, (_, j) => ({
      id: `${i}-${j}`,
      speed: `${1.5 + Math.random() * 2.5}s`,
      dir: (Math.random() > 0.5 ? "down" : "up") as "down" | "up",
      top: Math.random() * 100,
      color: Math.random() > 0.3 ? "#ef4444" : "#3b82f6",
    }));
  });
}

export default function ChickenPage() {
  const { balance, bet, win } = useEconomy();
  const [betInput, setBetInput] = useState("1000");
  const [difficulty, setDifficulty] = useState<Difficulty>("noob");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLane, setCurrentLane] = useState(-1); // -1 = safe zone
  const [isHit, setIsHit] = useState(false);
  const [cars, setCars] = useState<Car[][]>([]);
  const [hitLane, setHitLane] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<{ won: boolean; amount: number } | null>(null);
  const [chickenShake, setChickenShake] = useState(false);

  const cfg = DIFF_CONFIG[difficulty];
  const betAmount = parseBet(betInput);
  const currentMult = currentLane >= 0 ? LANE_MULTS[currentLane] : 1;
  const nextMult = LANE_MULTS[Math.min(currentLane + 1, cfg.lanes - 1)];

  const startGame = () => {
    if (betAmount < 1000 || !bet(betAmount)) return;
    setCars(generateCars(cfg.lanes));
    setCurrentLane(-1);
    setIsHit(false);
    setHitLane(null);
    setOutcome(null);
    setIsPlaying(true);
  };

  const advance = () => {
    if (!isPlaying || isHit) return;
    const nextLane = currentLane + 1;
    if (nextLane >= cfg.lanes) { cashOut(); return; }

    // Hit detection (probability based)
    if (Math.random() < cfg.hitChance) {
      setHitLane(nextLane);
      setIsHit(true);
      setChickenShake(true);
      setIsPlaying(false);
      setOutcome({ won: false, amount: 0 });
      setTimeout(() => setChickenShake(false), 600);
    } else {
      setCurrentLane(nextLane);
    }
  };

  const cashOut = () => {
    if (!isPlaying) return;
    const payout = Math.floor(betAmount * LANE_MULTS[currentLane]);
    win(payout);
    setIsPlaying(false);
    setOutcome({ won: true, amount: payout });
  };

  const LANE_W = 88;
  const BOARD_H = 380;

  return (
    <div className="flex h-full animate-in fade-in duration-500">
      {/* Bet Panel */}
      <aside className="w-72 flex-shrink-0 border-r border-white/5 bg-black/40 p-6 flex flex-col gap-5 overflow-y-auto">
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
                {DIFF_CONFIG[d].label} — {DIFF_CONFIG[d].lanes} lanes
              </button>
            ))}
          </div>
        </div>

        {isPlaying && currentLane >= 0 && (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-4">
            <p className="text-xs text-success/70 font-bold uppercase tracking-widest">Current Cashout</p>
            <p className="text-2xl font-black text-success">${Math.floor(betAmount * LANE_MULTS[currentLane]).toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-1">{LANE_MULTS[currentLane]}x multiplier</p>
          </div>
        )}

        {outcome && (
          <div className={`rounded-2xl p-4 border text-center ${outcome.won ? "bg-success/10 border-success/20" : "bg-danger/10 border-danger/20"}`}>
            <p className={`text-xl font-black ${outcome.won ? "text-success" : "text-danger"}`}>
              {outcome.won ? "🎉 CASHED OUT!" : "💀 SQUASHED!"}
            </p>
            {outcome.won && <p className="text-success font-black text-lg mt-1">+${outcome.amount.toLocaleString()}</p>}
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
              <Button onClick={cashOut} isDisabled={currentLane < 0} className="w-full h-12 bg-success text-black font-black rounded-2xl">
                CASH OUT ${currentLane >= 0 ? Math.floor(betAmount * LANE_MULTS[currentLane]).toLocaleString() : "0"}
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Road Canvas */}
      <main className="flex-1 flex items-center justify-center bg-black/20 overflow-hidden">
        <div className="relative flex" style={{ height: BOARD_H }}>
          {/* Safe zone */}
          <div className="relative flex items-center justify-center" style={{ width: 100, height: BOARD_H, background: "linear-gradient(180deg, #14532d 0%, #166534 100%)", borderRight: "2px solid #166534" }}>
            <div className={`text-5xl transition-all duration-300 ${chickenShake ? "shake" : isPlaying && currentLane === -1 ? "chicken-walk" : ""}`}>
              {isHit ? "💀" : "🐔"}
            </div>
            <div className="absolute bottom-3 bg-black/60 rounded-lg px-2 py-1 text-[10px] font-black text-white/60 uppercase tracking-wide">{currentLane < 0 ? "SAFE" : LANE_MULTS[currentLane] + "x"}</div>
          </div>

          {/* Lanes */}
          {cars.map((laneCars, laneIdx) => {
            const passed = laneIdx <= currentLane;
            const isCurrent = laneIdx === currentLane;
            const wasHit = laneIdx === hitLane;
            return (
              <div key={laneIdx} className="relative overflow-hidden border-r border-white/5" style={{ width: LANE_W, height: BOARD_H, background: wasHit ? "rgba(239,68,68,0.2)" : passed ? "rgba(34,197,94,0.05)" : "#1a1a1a" }}>
                {/* Dashed road lines */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 16px, transparent 16px, transparent 32px)" }} />

                {/* Cars */}
                {laneCars.map(car => (
                  <div key={car.id}
                    className={car.dir === "down" ? "car-down" : "car-up"}
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      animationDuration: car.speed,
                      animationDelay: `-${Math.random() * parseFloat(car.speed)}s`,
                      width: 36,
                      height: 60,
                      borderRadius: 6,
                      background: car.color,
                      boxShadow: `0 0 12px ${car.color}60`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}>
                    🚗
                  </div>
                ))}

                {/* Cashout label */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 rounded-full px-2 py-1 text-[9px] font-black text-white/60 z-10 whitespace-nowrap">
                  {LANE_MULTS[laneIdx]}x
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

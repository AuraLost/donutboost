"use client";
import React, { useMemo, useState } from "react";
import { Alert, Button } from "@heroui/react";
import { X } from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";
import { getRigIntensity, increaseByRig, scaleDownByRig } from "@/lib/rigging";

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
  const rigIntensity = getRigIntensity(balance);
  const betAmount = parseBet(betInput);
  const multScale = scaleDownByRig(0.6, rigIntensity, 0.42);
  const currentMult = useMemo(() => (distance <= 0 ? 1 : Number((1 + (Math.pow(cfg.multFactor, distance) - 1) * multScale).toFixed(2))), [distance, cfg.multFactor, multScale]);
  const nextMult = Number((1 + (Math.pow(cfg.multFactor, distance + 1) - 1) * multScale).toFixed(2));
  const visibleLaneStart = Math.max(0, distance - 2);
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
    const laneHitChance = Math.min(0.97, increaseByRig(cfg.baseHit + nextLane * 0.012, rigIntensity, 0.22));
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

  const SAFE_W = 100;
  const LANE_W = 88;
  const BOARD_H = 380;
  const chickenX = distance <= 0
    ? SAFE_W / 2
    : SAFE_W + ((distance - visibleLaneStart) - 0.5) * LANE_W;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] animate-in fade-in duration-500 relative">
      {popup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto animate-in zoom-in-90 duration-300 max-w-sm mx-4 w-full">
            <Alert status={popup.won ? "success" : "danger"} className="rounded-3xl">
              <Alert.Indicator />
              <Alert.Content className="gap-2 w-full">
                <div className="flex items-start justify-between gap-2">
                  <Alert.Title className="font-black italic text-lg">{popup.won ? "WIN!" : "LOSS"}</Alert.Title>
                  <button onClick={() => setPopup(null)} className="text-white/40 hover:text-white" aria-label="Close alert">
                    <X size={16} />
                  </button>
                </div>
                <Alert.Description className="text-sm font-bold text-white/70">{popup.message}</Alert.Description>
                {popup.won && <p className="text-success font-black text-2xl">+${popup.amount.toLocaleString()}</p>}
                <Button onClick={() => setPopup(null)} className={`mt-2 h-10 px-8 rounded-2xl font-black text-sm ${popup.won ? "bg-success text-black" : "bg-white/15 text-white"}`}>
                  {popup.won ? "Collect!" : "Close"}
                </Button>
              </Alert.Content>
            </Alert>
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
          <div className="relative flex items-center justify-center" style={{ width: SAFE_W, height: BOARD_H, background: "linear-gradient(180deg, #14532d 0%, #166534 100%)", borderRight: "2px solid #166534" }}>
            <div className="absolute bottom-3 bg-black/60 rounded-lg px-2 py-1 text-[10px] font-black text-white/60 uppercase tracking-wide">{distance <= 0 ? "1x" : currentMult + "x"}</div>
          </div>

          {/* Lanes */}
          {visibleLanes.map((laneNo) => {
            const passed = laneNo <= distance;
            const laneSpeed = Math.max(0.45, (2.4 - laneNo * 0.045) / (cfg.speedFactor * increaseByRig(1, rigIntensity, 0.35)));
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
                    <span className="text-3xl" aria-hidden="true">🚗</span>
                  </div>
                ))}

                {/* Cashout label */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 rounded-full px-2 py-1 text-[9px] font-black text-white/60 z-10 whitespace-nowrap">
                  {Number((1 + (Math.pow(cfg.multFactor, laneNo) - 1) * multScale).toFixed(2))}x
                </div>
              </div>
            );
          })}

          <div
            className={`absolute z-20 pointer-events-none select-none text-4xl ${chickenShake ? "shake" : ""}`}
            style={{
              left: `${chickenX}px`,
              bottom: "18px",
              transform: "translateX(-50%)",
              transition: "left 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <span role="img" aria-label="chicken">🐔</span>
            {isHit && <span className="ml-1 text-2xl" aria-hidden="true">💥</span>}
          </div>
        </div>
      </main>
    </div>
  );
}

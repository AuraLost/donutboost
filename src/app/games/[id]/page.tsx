"use client";

import React, { useState, useEffect, useRef } from "react";
import { Alert, Button, Slider } from "@heroui/react";
import { Play, Gem, Bomb, Zap, Dice5, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";
import { getRigIntensity, scaleDownByRig } from "@/lib/rigging";

type Difficulty = "noob" | "pro" | "expert";

// ===== Bet parsing =====
const parseBet = (s: string): number => {
  const c = s.trim().toLowerCase().replace(/,/g, "");
  const n = parseFloat(c);
  if (isNaN(n) || n <= 0) return 0;
  if (c.endsWith("t")) return n * 1e12;
  if (c.endsWith("b")) return n * 1e9;
  if (c.endsWith("m")) return n * 1e6;
  if (c.endsWith("k")) return n * 1e3;
  return n;
};

const formatMoney = (n: number) => {
  if (n >= 1e12) return "$" + (n/1e12).toFixed(2) + "T";
  if (n >= 1e9)  return "$" + (n/1e9).toFixed(2) + "B";
  if (n >= 1e6)  return "$" + (n/1e6).toFixed(2) + "M";
  if (n >= 1e3)  return "$" + (n/1e3).toFixed(1) + "K";
  return "$" + n.toLocaleString();
};

const DIFF: Record<Difficulty, { label: string }> = {
  noob:   { label: "Noob" },
  pro:    { label: "Pro" },
  expert: { label: "Expert" },
};

// ===== Plinko config =====
const PLINKO_ROWS = 10; // Full triangle: row 0 has 1 peg
const PEG_SPACING = 38; // px between pegs
const ROW_HEIGHT = 44;  // px per row

// Build plinko multiplier table based on difficulty
const getPlinkoMults = (diff: Difficulty, rigIntensity: number): number[] => {
  const noob = [1.6, 1.25, 1.05, 0.85, 0.65, 0.45, 0.65, 0.85, 1.05, 1.25, 1.6];
  const pro = [2.4, 1.9, 1.5, 1.1, 0.8, 0.35, 0.8, 1.1, 1.5, 1.9, 2.4];
  const expert = [4.5, 3.3, 2.4, 1.5, 0.9, 0, 0.9, 1.5, 2.4, 3.3, 4.5];
  const base = diff === "noob" ? noob : diff === "pro" ? pro : expert;
  const diffScale = diff === "noob" ? 1 : diff === "pro" ? 1.25 : 1.6;
  return base.map((mult) => Number(scaleDownByRig(mult * diffScale, rigIntensity, 0.55).toFixed(2)));
};

export default function GamePage() {
  const { id } = useParams();
  const gameType = typeof id === "string" ? id : "crash";
  const { balance, bet, win } = useEconomy();

  // ===== Shared state =====
  const [betInput, setBetInput] = useState("1000");
  const [difficulty, setDifficulty] = useState<Difficulty>("noob");
  const [isPlaying, setIsPlaying] = useState(false);
  const betAmount = parseBet(betInput);

  // ===== Result popup =====
  const [popup, setPopup] = useState<{ won: boolean; amount: number; message: string } | null>(null);
  const showPopup = (won: boolean, amount: number, message: string) => setPopup({ won, amount, message });

  // ===== CRASH =====
  const [crashMult, setCrashMult] = useState(1.00);
  const [hasCrashed, setHasCrashed] = useState(false);
  const crashIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ===== MINES =====
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [minesCashout, setMinesCashout] = useState(1.00);
  const rigIntensity = getRigIntensity(balance);
  const mineCount = Math.min(24, Math.floor((difficulty === "noob" ? 8 : difficulty === "pro" ? 11 : 14) + rigIntensity * 5));

  // ===== DICE =====
  const [winChance, setWinChance] = useState(50);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // ===== PLINKO =====
  const [plinkoBall, setPlinkoBall] = useState<{ row: number; x: number; path: number[]; tilt: number } | null>(null);
  const [plinkoBallActive, setPlinkoBallActive] = useState(false);
  const plinkoMults = getPlinkoMults(difficulty, rigIntensity);

  useEffect(() => () => { if (crashIntervalRef.current) clearInterval(crashIntervalRef.current); }, []);

  // ===== Crash logic =====
  const startCrash = () => {
    const h = Math.random() * 99;
    const target = Math.max(1.01, parseFloat((100 / (100 - h)).toFixed(2)));
    // Expert = lower average target
    const adjustedTargetBase = difficulty === "noob" ? target * 0.95 : difficulty === "expert" ? target * 0.45 : target * 0.7;
    const adjustedTarget = scaleDownByRig(adjustedTargetBase, rigIntensity, 0.55);
    setCrashMult(1.00); setHasCrashed(false); setIsPlaying(true);
    let current = 1.00;
    crashIntervalRef.current = setInterval(() => {
      current += 0.01 + current * 0.004;
      if (current >= Math.max(1.01, adjustedTarget)) {
        clearInterval(crashIntervalRef.current!);
        setCrashMult(current); setHasCrashed(true); setIsPlaying(false);
        showPopup(false, 0, `Crashed at ${current.toFixed(2)}x! You lost.`);
        useEconomy.getState().recordLoss(betAmount);
      } else { setCrashMult(current); }
    }, 60);
  };

  const cashoutCrash = () => {
    if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
    const payout = Math.floor(betAmount * crashMult);
    win(payout); setIsPlaying(false);
    useEconomy.getState().recordWin(betAmount, payout);
    showPopup(true, payout, `Cashed out at ${crashMult.toFixed(2)}x!`);
  };

  // ===== Mines logic =====
  const startMines = () => {
    const g = Array(25).fill(false);
    let placed = 0;
    while (placed < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!g[idx]) { g[idx] = true; placed++; }
    }
    setGrid(g); setRevealed(Array(25).fill(false)); setMinesCashout(1.00); setIsPlaying(true);
  };

  const clickMine = (idx: number) => {
    if (!isPlaying || revealed[idx]) return;
    const newRev = [...revealed]; newRev[idx] = true; setRevealed(newRev);
    if (grid[idx]) {
      setIsPlaying(false);
      showPopup(false, 0, "BOOM! You hit a mine.");
      useEconomy.getState().recordLoss(betAmount);
      setRevealed(Array(25).fill(true));
    } else {
      const safe = newRev.filter(Boolean).length;
      const baseStep = scaleDownByRig(0.07, rigIntensity, 0.35);
      const mult = parseFloat((1 + safe * baseStep).toFixed(2));
      setMinesCashout(mult);
    }
  };

  const cashoutMines = () => {
    const payout = Math.floor(betAmount * minesCashout);
    win(payout); setIsPlaying(false);
    useEconomy.getState().recordWin(betAmount, payout);
    showPopup(true, payout, `Cashed out at ${minesCashout.toFixed(2)}x!`);
  };

  // ===== Dice logic =====
  const startDice = () => {
    setIsPlaying(true); setIsRolling(true); setDiceRoll(null);
    // Noob: shifted win chance; Expert: harder
    const baseChance = difficulty === "noob" ? winChance * 0.95 : difficulty === "expert" ? winChance * 0.65 : winChance * 0.8;
    const effectiveChance = Math.max(1, Math.min(95, scaleDownByRig(baseChance, rigIntensity, 0.45)));
    let ticks = 0;
    const iv = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 100) + 1);
      if (++ticks > 15) {
        clearInterval(iv);
        const roll = Math.floor(Math.random() * 100) + 1;
        setDiceRoll(roll); setIsRolling(false); setIsPlaying(false);
        if (roll <= effectiveChance) {
          const raw = betAmount * (99 / winChance);
          const payout = Math.floor(raw * scaleDownByRig(0.25, rigIntensity, 0.52));
          win(payout); showPopup(true, payout, `Rolled ${roll}! Won!`); useEconomy.getState().recordWin(betAmount, payout);
        } else { showPopup(false, 0, `Rolled ${roll}. Over ${effectiveChance.toFixed(0)}. Lost.`); useEconomy.getState().recordLoss(betAmount); }
      }
    }, 50);
  };

  // ===== Plinko logic =====
  const startPlinko = () => {
    if (plinkoBallActive) return; // only 1 at a time
    if (!bet(betAmount)) return;
    setPlinkoBallActive(true);

    // Compute full path (from row 0 → PLINKO_ROWS)
    const path: number[] = [];
    let finalPos = 0;
    for (let r = 0; r < PLINKO_ROWS; r++) {
      const rowsLeft = PLINKO_ROWS - r;
      const center = PLINKO_ROWS / 2;
      const driftTowardCenter = (center - finalPos) / Math.max(1, rowsLeft);
      const rightChance = Math.max(0.1, Math.min(0.9, 0.5 + driftTowardCenter * rigIntensity * 0.28));
      const dir = Math.random() < rightChance ? 1 : 0;
      path.push(dir);
      finalPos += dir;
    }
    // Clamp to valid multiplier index
    const multIdx = Math.min(finalPos, plinkoMults.length - 1);
    const mult = plinkoMults[multIdx];

    // Animate step by step
    let currentRow = 0;
    let currentX = 0;
    setPlinkoBall({ row: 0, x: 0, path, tilt: 0 });

    const stepIv = setInterval(() => {
      currentRow++;
      if (currentRow <= PLINKO_ROWS) {
        const moveRight = path[currentRow - 1] === 1;
        currentX += moveRight ? PEG_SPACING / 2 : -PEG_SPACING / 2;
        setPlinkoBall({ row: currentRow, x: currentX, path, tilt: moveRight ? 10 : -10 });
      } else {
        clearInterval(stepIv);
        const payout = Math.floor(betAmount * mult);
        win(payout);
        if (mult >= 1) useEconomy.getState().recordWin(betAmount, payout);
        else useEconomy.getState().recordLoss(betAmount);
        setTimeout(() => {
          setPlinkoBall(null);
          setPlinkoBallActive(false);
          showPopup(mult >= 1, payout, `Landed on ${mult}x -> ${formatMoney(payout)}`);
        }, 400);
      }
    }, 120);
  };

  const handleAction = () => {
    if (betAmount < 1000) { showPopup(false, 0, "Minimum bet is $1,000!"); return; }
    if (isPlaying) {
      if (gameType === "crash") cashoutCrash();
      if (gameType === "mines") cashoutMines();
      return;
    }
    if (gameType === "plinko") { startPlinko(); return; }
    if (!bet(betAmount)) { showPopup(false, 0, "Insufficient balance!"); return; }
    if (gameType === "crash") startCrash();
    else if (gameType === "mines") startMines();
    else if (gameType === "dice") startDice();
  };

  // Canvas height computation
  const PLINKO_H = PLINKO_ROWS * ROW_HEIGHT + 80;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] animate-in fade-in duration-500 relative">

      {/* ===== Result Popup ===== */}
      {popup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto animate-in zoom-in-90 duration-300 max-w-sm mx-4 w-full">
            <Alert
              status={popup.message.toLowerCase().includes("insufficient") || popup.message.toLowerCase().includes("minimum") ? "warning" : popup.won ? "success" : "danger"}
              className="rounded-3xl"
            >
              <Alert.Indicator />
              <Alert.Content className="gap-2 w-full">
                <div className="flex items-start justify-between gap-2">
                  <Alert.Title className="font-black italic text-lg">
                    {popup.message.toLowerCase().includes("insufficient") || popup.message.toLowerCase().includes("minimum") ? "WARNING" : popup.won ? "WIN!" : "LOSS"}
                  </Alert.Title>
                  <button onClick={() => setPopup(null)} className="text-white/40 hover:text-white" aria-label="Close alert">
                    <X size={16} />
                  </button>
                </div>
                <Alert.Description className="text-sm font-bold text-white/70">{popup.message}</Alert.Description>
                {popup.won && <p className="text-success font-black text-2xl">+{formatMoney(popup.amount)}</p>}
                <Button onClick={() => setPopup(null)} className={`mt-2 h-10 px-8 rounded-2xl font-black text-sm ${popup.won ? "bg-success text-black" : "bg-white/15 text-white"}`}>
                  {popup.won ? "Collect!" : "Close"}
                </Button>
              </Alert.Content>
            </Alert>
          </div>
        </div>
      )}

      {/* ===== Betting Panel ===== */}
      <aside className="w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 p-4 md:p-5 flex flex-col gap-4 overflow-y-auto">
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 block">Bet Amount</label>
          <input
            value={betInput}
            onChange={e => setBetInput(e.target.value)}
            disabled={isPlaying || plinkoBallActive}
            placeholder="1K / 1M / 1B / 1T"
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-3 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <div className="grid grid-cols-5 gap-1 mt-1.5">
            {[["1K",1000],["10K",10000],["1M",1000000],["1B",1e9],["1T",1e12]].map(([l, v]) => (
              <button key={l as string} onClick={() => !(isPlaying||plinkoBallActive) && setBetInput(String(v))} className="text-[9px] font-black py-1.5 rounded-lg bg-white/5 text-white/30 hover:bg-primary/20 hover:text-primary transition-colors border border-white/5">{l as string}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <button onClick={() => !(isPlaying||plinkoBallActive) && setBetInput(String(Math.max(1000, Math.floor(parseBet(betInput)/2))))} className="text-[9px] font-black py-1.5 rounded-lg bg-white/5 text-white/30 hover:text-white transition-colors border border-white/5">½</button>
            <button onClick={() => !(isPlaying||plinkoBallActive) && setBetInput(String(parseBet(betInput)*2))} className="text-[9px] font-black py-1.5 rounded-lg bg-white/5 text-white/30 hover:text-white transition-colors border border-white/5">2x</button>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 block">Difficulty</label>
          <div className="flex gap-1.5">
            {(["noob","pro","expert"] as Difficulty[]).map(d => (
              <button key={d} disabled={isPlaying || plinkoBallActive} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-40 ${difficulty === d ? "bg-primary/15 text-primary border border-primary/25" : "bg-white/5 text-white/30 border border-white/5 hover:text-white"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Game-specific settings */}
        {gameType === "mines" && !isPlaying && (
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1 block">
              Mines: {mineCount} ({difficulty})
            </label>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-danger/60 rounded-full" style={{ width: `${(mineCount / 24) * 100}%` }} />
            </div>
          </div>
        )}

        {gameType === "dice" && !isPlaying && (
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 block">Win Chance: {winChance}%</label>
            <Slider value={winChance} onChange={v => setWinChance(v as number)} minValue={1} maxValue={95} step={1} className="w-full" />
            <p className="text-[10px] text-right text-white/30 font-bold mt-1">Payout: {(99/winChance).toFixed(2)}x</p>
          </div>
        )}

        {gameType === "mines" && isPlaying && (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-3">
            <p className="text-[10px] text-success/60 font-black uppercase tracking-widest">Current Cashout</p>
            <p className="text-xl font-black text-success">{formatMoney(Math.floor(betAmount * minesCashout))}</p>
            <p className="text-[10px] text-white/25 font-bold">{minesCashout.toFixed(2)}x</p>
          </div>
        )}

        {gameType === "crash" && isPlaying && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3">
            <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Flying at</p>
            <p className="text-xl font-black text-primary">{crashMult.toFixed(2)}x</p>
            <p className="text-[10px] text-white/25 font-bold">Cashout: {formatMoney(Math.floor(betAmount * crashMult))}</p>
          </div>
        )}

        <Button
          onClick={handleAction}
          isDisabled={isRolling || plinkoBallActive || betAmount < 1000}
          className={`w-full h-14 font-black text-lg rounded-2xl transition-all duration-300 shadow-2xl mt-auto ${
            isPlaying ? "bg-success text-black shadow-success/20 hover:scale-[1.02] animate-pulse" : "bg-primary text-black shadow-primary/20 hover:scale-[1.02]"
          }`}
        >
          {isRolling ? "ROLLING..." : plinkoBallActive ? "BALL IN AIR..." : isPlaying ? (gameType === "crash" ? `CASH OUT ${crashMult.toFixed(2)}x` : gameType === "mines" ? `CASH OUT ${minesCashout.toFixed(2)}x` : "IN PLAY") : "PLACE BET"}
        </Button>
      </aside>

      {/* ===== Game Canvas ===== */}
      <main className="flex-1 flex items-center justify-center p-3 md:p-8 bg-black/20 overflow-hidden">

        {/* CRASH */}
        {gameType === "crash" && (
          <div className={`w-full max-w-3xl aspect-[16/10] rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${isPlaying ? "border-primary/50 bg-primary/5" : hasCrashed ? "border-danger/30 bg-danger/5" : "border-white/5 bg-black/10"}`}>
            <div className={`absolute inset-0 bg-primary/15 blur-[100px] rounded-full scale-[2] transition-all duration-1000 ${isPlaying ? "opacity-100" : "opacity-0"}`} />
            <div className="text-center relative z-10">
              <h2 className={`text-9xl font-black tracking-tighter italic ${hasCrashed ? "text-danger" : "text-white"}`} style={{ fontFamily: "'Space Mono', monospace" }}>
                {crashMult.toFixed(2)}x
              </h2>
              {isPlaying && <span className="text-8xl rocket-fly inline-block mt-4">🚀</span>}
              <p className="text-muted font-bold tracking-widest uppercase text-sm mt-4">
                {hasCrashed ? "CRASHED!" : isPlaying ? "FLYING..." : "READY"}
              </p>
            </div>
          </div>
        )}

        {/* MINES */}
        {gameType === "mines" && (
          <div className="w-full max-w-xl aspect-square bg-black/40 rounded-[35px] border border-white/5 p-5 shadow-2xl grid grid-cols-5 gap-2.5">
            {grid.map((isBomb, idx) => {
              const isRev = revealed[idx];
              return (
                <Button
                  key={idx}
                  isDisabled={!isPlaying || isRev}
                  onClick={() => clickMine(idx)}
                  className={`w-full h-full min-h-[54px] rounded-2xl transition-all duration-200 shadow-inner border-none ${
                    isRev ? (isBomb ? "bg-danger scale-95 shadow-danger/40" : "bg-success scale-95 shadow-success/40") : "bg-white/5 hover:bg-white/10 hover:scale-[0.97]"
                  }`}
                >
                  {isRev && isBomb && <Bomb size={24} />}
                  {isRev && !isBomb && <Gem size={24} fill="currentColor" />}
                </Button>
              );
            })}
          </div>
        )}

        {/* DICE */}
        {gameType === "dice" && (
          <div className={`w-full max-w-3xl aspect-[16/10] rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${isRolling ? "border-primary/50 bg-primary/5" : "border-white/5 bg-black/10"}`}>
            <div className={`absolute inset-0 bg-primary/15 blur-[100px] scale-[2] transition-all duration-1000 ${isRolling ? "opacity-100" : "opacity-0"}`} />
            <div className="text-center relative z-10">
              {diceRoll === null ? (
                <Dice5 size={120} className="text-white/10" />
              ) : (
                <h2 className={`text-9xl font-black italic ${!isRolling && diceRoll <= winChance ? "text-success" : !isRolling ? "text-danger" : "text-white"}`} style={{ fontFamily: "'Space Mono', monospace" }}>
                  {diceRoll}
                </h2>
              )}
              <p className="text-white/30 font-bold tracking-widest uppercase text-sm mt-8">
                {isRolling ? "ROLLING..." : `WIN UNDER ${winChance}`}
              </p>
            </div>
          </div>
        )}

        {/* PLINKO */}
        {gameType === "plinko" && (
          <div className="flex flex-col items-center">
            <div
              className="relative bg-black/40 rounded-[30px] border border-white/5 shadow-2xl overflow-hidden"
              style={{ width: `${(PLINKO_ROWS + 2) * PEG_SPACING + 60}px`, height: `${PLINKO_H}px` }}
            >
              {/* Full triangle pegs: row r has (r+1) pegs */}
              {Array.from({ length: PLINKO_ROWS }).map((_, r) => {
                const numPegs = r + 1;
                const totalWidth = numPegs * PEG_SPACING;
                return (
                  <div key={r} className="absolute left-1/2 flex" style={{ top: r * ROW_HEIGHT + 26, transform: `translateX(-${totalWidth / 2 - PEG_SPACING / 2}px)`, gap: `${PEG_SPACING - 8}px` }}>
                    {Array.from({ length: numPegs }).map((_, c) => (
                      <div key={c} className="w-2.5 h-2.5 rounded-full bg-white/35 shadow-[0_0_6px_rgba(255,255,255,0.2)] shrink-0" />
                    ))}
                  </div>
                );
              })}

              {/* Ball */}
              {plinkoBall && (
                <div
                  style={{
                    position: "absolute",
                    top:  plinkoBall.row * ROW_HEIGHT + 12,
                    left: "50%",
                    transform: `translateX(calc(-50% + ${plinkoBall.x}px)) rotate(${plinkoBall.tilt}deg)`,
                    transition: "top 0.12s cubic-bezier(0.22,1,0.36,1), transform 0.12s cubic-bezier(0.22,1,0.36,1)",
                    width: 28, height: 28,
                    zIndex: 10,
                  }}
                >
                  <img src="/donutsmp.png" alt="ball" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                </div>
              )}

              {/* Multiplier buckets */}
              <div className="absolute bottom-0 left-0 right-0 flex h-11 border-t border-white/5">
                {plinkoMults.map((m, i) => (
                  <div key={i} className={`flex-1 flex items-center justify-center text-[9px] font-black border-r border-black/50 last:border-0 ${m >= 100 ? "bg-warning/25 text-warning" : m >= 10 ? "bg-success/20 text-success" : m >= 2 ? "bg-primary/15 text-primary" : m >= 1 ? "bg-white/5 text-white/50" : "bg-danger/15 text-danger"}`}>
                    {m}x
                  </div>
                ))}
              </div>
            </div>

            {plinkoBallActive && (
              <p className="text-primary font-black text-sm animate-pulse mt-4 uppercase tracking-widest">Ball in play — wait for it...</p>
            )}
          </div>
        )}

        {/* Unsupported game fallback */}
        {!["crash","mines","dice","plinko"].includes(gameType) && (
          <p className="text-white/30 font-bold uppercase tracking-widest">Game not found</p>
        )}
      </main>
    </div>
  );
}


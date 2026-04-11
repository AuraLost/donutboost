"use client";
import React, { useState } from "react";
import { Alert, Button, Tooltip } from "@heroui/react";
import { CircleHelp, X } from "lucide-react";
import { useEconomy } from "@/hooks/use-economy";
import { getRigIntensity, scaleDownByRig } from "@/lib/rigging";

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

const DIFFICULTIES: Record<Difficulty, { label: string; color: string; multiplier: number; winChance: number }> = {
  noob: { label: "Noob", color: "text-success", multiplier: 1.15, winChance: 0.58 },
  pro: { label: "Pro", color: "text-primary", multiplier: 1.7, winChance: 0.46 },
  expert: { label: "Expert", color: "text-danger", multiplier: 2.6, winChance: 0.3 },
};

export default function CoinFlipPage() {
  const { balance, bet, win } = useEconomy();
  const [betInput, setBetInput] = useState("1000");
  const [difficulty, setDifficulty] = useState<Difficulty>("noob");
  const [chosen, setChosen] = useState<"heads" | "tails" | null>(null);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [animClass, setAnimClass] = useState("");
  const [outcome, setOutcome] = useState<{ won: boolean; amount: number; message: string } | null>(null);
  const [popup, setPopup] = useState<{ won: boolean; amount: number; message: string } | null>(null);

  const betAmount = parseBet(betInput);
  const rigIntensity = getRigIntensity(balance);
  const payout = Math.floor(betAmount * scaleDownByRig(DIFFICULTIES[difficulty].multiplier, rigIntensity, 0.55));

  const flip = () => {
    if (!chosen || isFlipping || betAmount < 1000) return;
    if (!bet(betAmount)) {
      setOutcome({ won: false, amount: 0, message: "Insufficient balance!" });
      setPopup({ won: false, amount: 0, message: "Insufficient balance!" });
      return;
    }

    setIsFlipping(true);
    setResult(null);
    setOutcome(null);
    const effectiveWinChance = scaleDownByRig(DIFFICULTIES[difficulty].winChance, rigIntensity, 0.55);
    const landed: "heads" | "tails" = Math.random() < effectiveWinChance
      ? chosen
      : (chosen === "heads" ? "tails" : "heads");
    setAnimClass(landed === "heads" ? "coin-flip-heads" : "coin-flip-tails");

    setTimeout(() => {
      setResult(landed);
      setIsFlipping(false);
      setAnimClass("");
      if (landed === chosen) {
        win(payout);
        setOutcome({ won: true, amount: payout, message: `${landed.toUpperCase()}! You won!` });
        setPopup({ won: true, amount: payout, message: `${landed.toUpperCase()}! You won.` });
        useEconomy.getState().recordWin(betAmount, payout);
      } else {
        setOutcome({ won: false, amount: 0, message: `${landed.toUpperCase()}! Better luck next time.` });
        setPopup({ won: false, amount: 0, message: `${landed.toUpperCase()}! You lost.` });
        useEconomy.getState().recordLoss(betAmount);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] animate-in fade-in duration-500 relative">
      {popup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto animate-in zoom-in-90 duration-300 max-w-sm mx-4 w-full">
            <Alert
              status={popup.message.toLowerCase().includes("insufficient") ? "warning" : popup.won ? "success" : "danger"}
              className="rounded-3xl"
            >
              <Alert.Indicator />
              <Alert.Content className="gap-2 w-full">
                <div className="flex items-start justify-between gap-2">
                  <Alert.Title className="font-black italic text-lg">
                    {popup.message.toLowerCase().includes("insufficient") ? "WARNING" : popup.won ? "WIN!" : "LOSS"}
                  </Alert.Title>
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

      <aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Coin Flip Info</p>
          <Tooltip>
            <Tooltip.Trigger>
              <button className="text-white/50 hover:text-white" aria-label="Coin flip info">
                <CircleHelp size={16} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="left">Pick heads/tails. Hit = payout by difficulty multiplier.</Tooltip.Content>
          </Tooltip>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Bet Amount</label>
          <input
            value={betInput}
            onChange={e => setBetInput(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="e.g. 1K, 2.5M, 1B, 1T"
          />
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[["1K", 1000], ["10K", 10000], ["100K", 100000], ["1M", 1000000], ["1T", 1e12]].map(([l, v]) => (
              <button key={l} onClick={() => setBetInput(String(v))} className="text-[10px] font-black py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-white/40 transition-colors border border-white/5">{l as string}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <button onClick={() => setBetInput(String(Math.max(1000, Math.floor(parseBet(betInput) / 2))))} className="text-[10px] font-black py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors border border-white/5">1/2x</button>
            <button onClick={() => setBetInput(String(parseBet(betInput) * 2))} className="text-[10px] font-black py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors border border-white/5">2x</button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Difficulty</label>
          <div className="flex flex-col gap-1.5">
            {(["noob", "pro", "expert"] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`h-10 rounded-xl border font-black text-sm transition-all ${difficulty === d ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/5 text-white/30 hover:text-white hover:border-white/10"}`}>
                {DIFFICULTIES[d].label} - {Math.round(DIFFICULTIES[d].winChance * 100)}% hit
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">Your Pick</label>
          <div className="grid grid-cols-2 gap-2">
            {(["heads", "tails"] as const).map(side => (
              <button key={side} onClick={() => setChosen(side)} className={`h-14 rounded-xl border font-black text-sm capitalize transition-all ${chosen === side ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/5 text-white/40 hover:text-white"}`}>
                <span className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[11px] font-black flex items-center justify-center">
                    {side === "heads" ? "H" : "T"}
                  </span>
                  {side}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-1 bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-white/30">Payout on win</span>
            <span className="text-success font-black">${payout.toLocaleString()}</span>
          </div>
        </div>

        <Button
          onClick={flip}
          isDisabled={isFlipping || !chosen || betAmount < 1000}
          className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mt-auto"
        >
          {isFlipping ? "Flipping..." : "FLIP COIN"}
        </Button>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 bg-black/20 p-4 md:p-8">
        <div className="relative" style={{ perspective: "600px" }}>
          <div
            className={`w-48 h-48 rounded-full flex items-center justify-center text-8xl shadow-2xl ${animClass}`}
            style={{
              background: "radial-gradient(circle at 40% 35%, #3b82f6, #1e3a8a)",
              border: "4px solid rgba(59,130,246,0.3)",
              boxShadow: "0 0 60px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              transformStyle: "preserve-3d",
            }}
          >
            {result === null && !isFlipping ? (
              <span className="w-24 h-24 rounded-full bg-white/90 text-blue-700 text-6xl font-black flex items-center justify-center shadow-inner">H</span>
            ) : result === "heads" ? (
              <span className="w-28 h-28 rounded-full bg-white/90 text-blue-700 text-7xl font-black flex items-center justify-center shadow-inner">H</span>
            ) : (
              <span className="w-28 h-28 rounded-full bg-white/90 text-blue-700 text-7xl font-black flex items-center justify-center shadow-inner">T</span>
            )}
          </div>
        </div>

        {outcome && (
          <div className={`text-center animate-in zoom-in-90 duration-300 p-8 rounded-3xl border ${outcome.won ? "bg-success/10 border-success/20" : "bg-danger/10 border-danger/20"}`}>
            <p className={`text-4xl font-black italic ${outcome.won ? "text-success" : "text-danger"}`}>
              {outcome.won ? "WIN!" : "LOSS"}
            </p>
            <p className="text-white/60 font-bold mt-2 text-sm">{outcome.message}</p>
            {outcome.won && (
              <p className="text-success font-black text-2xl mt-2">+${outcome.amount.toLocaleString()}</p>
            )}
          </div>
        )}

        {!outcome && !isFlipping && (
          <div className="text-center">
            <p className="text-white/20 font-bold text-sm uppercase tracking-widest">
              {chosen ? `You picked ${chosen} - flip to play!` : "Pick heads or tails to begin"}
            </p>
          </div>
        )}

        {isFlipping && (
          <p className="text-primary font-black text-lg animate-pulse uppercase tracking-widest">Flipping...</p>
        )}
      </main>
    </div>
  );
}

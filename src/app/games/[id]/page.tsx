"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Button, 
  Input, 
  Tabs,
  AlertDialog,
  Slider
} from "@heroui/react";
import { 
  Play, 
  RotateCcw, 
  ChevronLeft,
  Settings2,
  Wallet,
  Gem,
  Bomb,
  Zap,
  Dice5
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";

export default function GamePage() {
  const { id } = useParams();
  const gameType = typeof id === "string" ? id : "crash";
  const gameName = gameType.charAt(0).toUpperCase() + gameType.slice(1);
  const { balance, bet, win } = useEconomy();
  
  const [betAmount, setBetAmount] = useState(1000000);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [dialogState, setDialogState] = useState<{ isOpen: boolean, won: boolean, amount?: number, message: string }>({
    isOpen: false, won: false, message: ""
  });

  // ========== CRASH STATE ==========
  const [crashMult, setCrashMult] = useState(1.00);
  const [hasCrashed, setHasCrashed] = useState(false);
  const crashIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const crashTargetRef = useRef(1.00);

  // ========== MINES STATE ==========
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false)); // true = bomb
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [minesCashout, setMinesCashout] = useState(1.00);
  const [minesCount, setMinesCount] = useState(3);

  // ========== DICE STATE ==========
  const [winChance, setWinChance] = useState(50); // 1-99%
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Cleanup
  useEffect(() => {
    return () => {
      if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
    };
  }, []);

  const openDialog = (won: boolean, amount: number, msg: string) => {
    setDialogState({ isOpen: true, won, amount, message: msg });
  };

  const startCrash = () => {
    setCrashMult(1.00);
    setHasCrashed(false);
    setIsPlaying(true);
    
    // Generate crash point (1.00 - ~X)
    // House edge implementation
    const e = 100;
    const h = Math.random() * 100;
    const crashPoint = h === 0 ? 1.00 : (100 / (100 - h));
    crashTargetRef.current = Math.max(1.00, Math.floor(crashPoint * 100) / 100);

    let current = 1.00;
    crashIntervalRef.current = setInterval(() => {
      current += 0.01 + (current * 0.005);
      if (current >= crashTargetRef.current) {
         current = crashTargetRef.current;
         setCrashMult(current);
         setHasCrashed(true);
         setIsPlaying(false);
         clearInterval(crashIntervalRef.current!);
         openDialog(false, 0, `Crashed at ${current.toFixed(2)}x! You lost the bet.`);
      } else {
         setCrashMult(current);
      }
    }, 50);
  };

  const cashoutCrash = () => {
    if (!isPlaying || hasCrashed) return;
    clearInterval(crashIntervalRef.current!);
    setIsPlaying(false);
    const wonAmt = Math.floor(betAmount * crashMult);
    win(wonAmt);
    openDialog(true, wonAmt, `Successfully cashed out at ${crashMult.toFixed(2)}x for ${wonAmt.toLocaleString()} Donuts!`);
  };

  const startMines = () => {
    setIsPlaying(true);
    setRevealed(Array(25).fill(false));
    setMinesCashout(1.00);
    // Plant bombs
    const newGrid = Array(25).fill(false);
    let planted = 0;
    while (planted < minesCount) {
       const idx = Math.floor(Math.random() * 25);
       if (!newGrid[idx]) {
          newGrid[idx] = true;
          planted++;
       }
    }
    setGrid(newGrid);
  };

  const clickMine = (index: number) => {
    if (!isPlaying) return;
    if (revealed[index]) return;

    const newRev = [...revealed];
    newRev[index] = true;
    setRevealed(newRev);

    if (grid[index]) {
       // Bomb
       setIsPlaying(false);
       // Reveal all
       setRevealed(Array(25).fill(true));
       openDialog(false, 0, `BOOM! You hit a mine and lost.`);
    } else {
       // Gem
       const safeRemaining = 25 - minesCount - newRev.filter((r, i) => r && !grid[i]).length;
       const newMult = minesCashout + (0.05 * minesCount);
       setMinesCashout(newMult);
       if (safeRemaining === 0) {
          // Cleared all
          setIsPlaying(false);
          setRevealed(Array(25).fill(true));
          const w = Math.floor(betAmount * newMult);
          win(w);
          openDialog(true, w, `You cleared the board and won ${w.toLocaleString()} Donuts!`);
       }
    }
  };

  const cashoutMines = () => {
    if (!isPlaying) return;
    setIsPlaying(false);
    setRevealed(Array(25).fill(true)); // Reveal remaining
    const w = Math.floor(betAmount * minesCashout);
    win(w);
    openDialog(true, w, `Safe Play. Cashed out at ${minesCashout.toFixed(2)}x for ${w.toLocaleString()} Donuts!`);
  };

  const startDice = () => {
    setIsPlaying(true);
    setIsRolling(true);
    setDiceRoll(null);

    // Roll animation
    let ticks = 0;
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 100) + 1);
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 100) + 1;
        setDiceRoll(finalRoll);
        setIsRolling(false);
        setIsPlaying(false);

        if (finalRoll <= winChance) {
          const mult = 99 / winChance;
          const w = Math.floor(betAmount * mult);
          win(w);
          openDialog(true, w, `Rolled a ${finalRoll}! You won ${w.toLocaleString()} Donuts!`);
        } else {
          openDialog(false, 0, `Rolled a ${finalRoll}. Over the target. You lost.`);
        }
      }
    }, 50);
  };

  const handleAction = () => {
    if (isPlaying) {
       // If game is playing, action depends on game
       if (gameType === "crash") cashoutCrash();
       if (gameType === "mines") cashoutMines();
       return;
    }

    if (!bet(betAmount)) {
       openDialog(false, 0, "Insufficient Balance! Minimum 1M Donuts required.");
       return;
    }

    if (gameType === "crash") startCrash();
    else if (gameType === "mines") startMines();
    else if (gameType === "dice") startDice();
    else {
      // Fallback
      startDice();
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* Result Dialog */}
      <AlertDialog.Backdrop isOpen={dialogState.isOpen} onOpenChange={(open) => setDialogState(prev => ({...prev, isOpen: open}))} variant="blur">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status={dialogState.won ? "success" : "danger"} />
              <AlertDialog.Heading>{dialogState.won ? "Winner!" : "Bust"}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-muted leading-relaxed font-bold">
                {dialogState.message}
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant={dialogState.won ? "primary" : "secondary"}>
                Continue
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      {/* Header */}
      <div className="flex items-center justify-between px-8 h-20 border-b border-white/5 bg-black/20 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/">
             <Button isIconOnly variant="ghost" className="border-white/10 text-muted hover:text-primary transition-colors border shadow-none rounded-xl">
               <ChevronLeft size={20} />
             </Button>
          </Link>
          <div className="flex flex-col">
             <h1 className="text-xl font-black uppercase tracking-tighter italic">{gameName}</h1>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Economy</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
           <Wallet size={16} className="text-primary" />
           <span className="text-sm font-black text-white">{(balance / 1000000).toFixed(2)}M</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Betting Panel */}
        <aside className="w-[340px] border-r border-white/5 bg-secondary/10 p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Bet Amount (Donuts)</label>
              <div className="relative">
                 <Input 
                   type="number" 
                   value={betAmount.toString()} 
                   onChange={(e) => setBetAmount(Number(e.target.value))}
                   className="w-full bg-black/40 h-14"
                   isDisabled={isPlaying}
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5 z-10">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setBetAmount(prev => Math.floor(prev / 2))}
                      isDisabled={isPlaying}
                      className="h-9 min-w-[44px] bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black rounded-lg text-white"
                    >1/2</Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setBetAmount(prev => prev * 2)}
                      isDisabled={isPlaying}
                      className="h-9 min-w-[44px] bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black rounded-lg text-white"
                    >2x</Button>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <Button isDisabled={isPlaying} onClick={() => setBetAmount(1000000)} size="sm" variant="ghost" className="bg-white/5 border border-white/5 text-[10px] font-black text-white transition-colors hover:bg-white/10">MIN (1M)</Button>
                 <Button isDisabled={isPlaying} onClick={() => setBetAmount(1000000000)} size="sm" variant="ghost" className="bg-white/5 border border-white/5 text-[10px] font-black text-white transition-colors hover:bg-white/10">MAX (1B)</Button>
              </div>
           </div>

           {gameType === "mines" && !isPlaying && (
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Mine Count</label>
                 <Input type="number" min={1} max={24} value={minesCount.toString()} onChange={(e) => setMinesCount(Number(e.target.value))} className="w-full bg-black/40 h-14" />
              </div>
           )}

           {gameType === "dice" && !isPlaying && (
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Win Chance: {winChance}%</label>
                 <Slider
                   value={winChance}
                   onChange={(val) => setWinChance(val as number)}
                   minValue={1}
                   maxValue={95}
                   step={1}
                   className="w-full"
                   color="primary"
                 />
                 <p className="text-xs text-muted text-right font-bold tracking-widest">Multiplier: {(99/winChance).toFixed(2)}x</p>
              </div>
           )}

           <div className="flex-1" />

           <Button 
             onClick={handleAction}
             isDisabled={isRolling}
             className={`w-full h-20 font-black text-2xl rounded-[28px] transition-all duration-300 shadow-2xl ${
               isPlaying 
                 ? "bg-success text-black shadow-success/20 hover:scale-[1.03] animate-pulse" 
                 : "bg-primary text-black shadow-primary/20 hover:scale-[1.03]"
             }`}
           >
             {isPlaying ? `CASH OUT (${gameType === 'crash' ? crashMult.toFixed(2) : gameType === 'mines' ? minesCashout.toFixed(2) : ''}x)` : "START BET"}
           </Button>
        </aside>

        {/* Game Canvas */}
        <main className="flex-1 relative bg-black/30 flex items-center justify-center p-12 overflow-hidden">
           
           {/* CRASH CANVAS */}
           {gameType === "crash" && (
             <div className={`w-full max-w-3xl aspect-[16/10] rounded-[40px] border-2 border-dashed ${isPlaying ? "border-primary/50 bg-primary/5 shadow-[0_0_60px_rgba(59,130,246,0.1)]" : hasCrashed ? "border-danger/30 bg-danger/5" : "border-white/5 bg-black/10"} flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700`}>
                <div className={`absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-[2] transition-all duration-1000 ${isPlaying ? "opacity-100 animate-spin" : "opacity-0"}`} />
                <div className="text-center relative z-10 transition-all duration-300">
                   <h2 className={`text-8xl font-black tracking-tighter italic ${hasCrashed ? "text-danger" : "text-white"}`}>
                     {crashMult.toFixed(2)}x
                   </h2>
                   <p className="text-muted font-bold tracking-widest uppercase text-sm mt-4">
                     {hasCrashed ? "CRASHED!" : isPlaying ? "FLYING..." : "WAITING"}
                   </p>
                </div>
                
                {isPlaying && (
                  <div className="absolute bottom-10 left-10 text-primary">
                    <Zap size={32} className="animate-bounce" fill="currentColor" />
                  </div>
                )}
             </div>
           )}

           {/* MINES CANVAS */}
           {gameType === "mines" && (
             <div className="w-full max-w-xl aspect-square bg-black/40 rounded-[35px] border border-white/5 p-6 shadow-2xl grid grid-cols-5 gap-3">
               {grid.map((isBomb, idx) => {
                 const isRev = revealed[idx];
                 return (
                   <Button 
                     key={idx}
                     isDisabled={!isPlaying || isRev}
                     onClick={() => clickMine(idx)}
                     className={`w-full h-full min-h-[60px] rounded-2xl transition-all duration-300 shadow-inner ${
                       isRev 
                         ? (isBomb ? "bg-danger text-black scale-95 border-none shadow-danger/50" : "bg-success text-black scale-95 border-none shadow-success/50")
                         : "bg-surface-secondary border border-white/10 hover:bg-white/10 hover:border-white/20"
                     }`}
                   >
                     {isRev && isBomb && <Bomb size={28} />}
                     {isRev && !isBomb && <Gem size={28} fill="currentColor" />}
                   </Button>
                 )
               })}
             </div>
           )}

           {/* DICE CANVAS */}
           {gameType === "dice" && (
             <div className={`w-full max-w-3xl aspect-[16/10] rounded-[40px] border-2 border-dashed ${isRolling ? "border-primary/50 bg-primary/5 shadow-[0_0_60px_rgba(59,130,246,0.1)]" : "border-white/5 bg-black/10"} flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700`}>
                <div className={`absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-[2] transition-all duration-1000 ${isRolling ? "opacity-100 animate-spin" : "opacity-0"}`} />
                <div className="text-center relative z-10">
                   {diceRoll === null ? (
                     <Dice5 size={120} className="text-muted opacity-20" />
                   ) : (
                     <h2 className={`text-9xl font-black tracking-tighter italic ${!isRolling && diceRoll <= winChance ? "text-success" : !isRolling ? "text-danger" : "text-white"}`}>
                       {diceRoll}
                     </h2>
                   )}
                   <p className="text-muted font-bold tracking-widest uppercase text-sm mt-8">
                     {isRolling ? "ROLLING..." : "ROLL THE DICE"}
                   </p>
                </div>
             </div>
           )}
        </main>
      </div>
    </div>
  );
}

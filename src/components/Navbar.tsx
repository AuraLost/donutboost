"use client";

import React from "react";
import { 
  Button, 
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@heroui/react";
import { 
  Bell, 
  Menu, 
  MessageSquare,
  Wallet,
  Settings,
  Plus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-secondary/30 backdrop-blur-2xl border-b border-white/5 z-50 px-6">
      <div className="flex items-center justify-between w-full h-full max-w-[1800px] mx-auto">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
             <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-1 group-hover:border-primary/50 transition-colors shadow-lg shadow-primary/10">
                <Image 
                  src="/logo.png" 
                  alt="DonutBoost" 
                  fill 
                  className="object-contain p-1"
                  onError={(e) => {
                    // Fallback to a styled D if logo missing
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-black text-primary text-xl select-none">D</div>
             </div>
             <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white leading-none">DONUT<span className="text-primary tracking-widest">BOOST</span></span>
                <span className="text-[10px] font-black text-primary italic tracking-widest leading-none mt-1">THE PREMIUM ECONOMY</span>
             </div>
          </Link>
        </div>

        {/* User Stats / Action Section */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-black/40 border border-white/5 rounded-2xl h-11 px-4 gap-4 hover:border-white/10 transition-colors">
             <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 bg-primary/10 rounded-lg">
                   <span className="text-primary font-black text-xs">D</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-black text-white leading-none">0.00</span>
                   <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">Balance</span>
                </div>
             </div>
             <Button size="sm" className="bg-primary text-black font-black h-8 rounded-lg px-4 gap-1 shadow-lg shadow-primary/20">
                <Plus size={14} />
                DEPOSIT
             </Button>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <Button className="h-11 bg-white/5 hover:bg-white/10 text-white font-bold px-6 rounded-xl border border-white/5 shadow-none">
              LOGIN
            </Button>
            <Button className="h-11 bg-primary text-black font-black px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              SIGN UP
            </Button>
          </div>
          
          <Button isIconOnly variant="ghost" className="md:hidden border-none text-muted">
             <Menu size={24} />
          </Button>
        </div>
      </div>
    </header>
  );
}

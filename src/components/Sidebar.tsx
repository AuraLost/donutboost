"use client";

import React from "react";
import { Button, Tooltip, Separator, ScrollShadow } from "@heroui/react";
import { 
  Home, Gift, Trophy,
  ChevronLeft, ChevronRight,
  TrendingUp, Bomb, Triangle, Dices, Coins, Bird, RotateCcw,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEconomy } from "@/hooks/use-economy";

const games = [
  { id: "crash",    name: "Crash",    icon: TrendingUp },
  { id: "mines",    name: "Mines",    icon: Bomb       },
  { id: "plinko",   name: "Plinko",   icon: Triangle   },
  { id: "dice",     name: "Dice",     icon: Dices      },
  { id: "coinflip", name: "Coin Flip",icon: Coins      },
  { id: "chicken",  name: "Chicken",  icon: Bird       },
  { id: "wheel",    name: "Wheel",    icon: RotateCcw  },
];

const navItems = [
  { name: "Home",    icon: Home,   href: "/home" },
  { name: "Dashboard", icon: Home,   href: "/" },
  { name: "Daily",   icon: Gift,   href: "/daily" },
  { name: "Live",    icon: Trophy, href: "/livebets" },
];

function NavBtn({ href, icon: Icon, label, active, collapsed }: {
  href: string; icon: React.ElementType; label: string; active: boolean; collapsed: boolean;
}) {
  return (
    <Link href={href}>
      <Tooltip isDisabled={!collapsed}>
        <Tooltip.Trigger>
          <Button
            fullWidth
            variant="ghost"
            className={`${collapsed ? "h-10 px-0 justify-center" : "h-10 px-3 justify-start"} rounded-xl border transition-all duration-200 ${
              active
                ? "bg-primary/15 text-primary border-primary/25"
                : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white hover:border-white/8"
            }`}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span className="ml-2.5 text-[13px] font-bold truncate">{label}</span>}
            {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content placement="right">{label}</Tooltip.Content>
      </Tooltip>
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const { balance } = useEconomy();

  const formatBal = (v: number) => {
    if (v >= 1e12) return "$" + (v/1e12).toFixed(1) + "T";
    if (v >= 1e9)  return "$" + (v/1e9).toFixed(1) + "B";
    if (v >= 1e6)  return "$" + (v/1e6).toFixed(1) + "M";
    if (v >= 1e3)  return "$" + (v/1e3).toFixed(1) + "K";
    return "$" + v.toLocaleString();
  };

  const openWallet = () => window.dispatchEvent(new Event("open-wallet"));

  if (pathname === "/") return null;

  return (
    // Wrapper uses overflow-visible so the toggle button can poke out
    <div
      className={`relative h-full flex-shrink-0 transition-[width] duration-300 ease-in-out border-r border-white/5 bg-black/60 backdrop-blur-xl flex flex-col ${
        collapsed ? "w-[60px]" : "w-[200px]"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute top-5 right-2 z-50 w-7 h-7 rounded-full bg-[#111] border border-white/15 flex items-center justify-center text-primary shadow-lg hover:bg-primary hover:text-black hover:border-transparent transition-all"
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>

      {/* Scrollable nav content */}
      <ScrollShadow className="flex-1 flex flex-col gap-1 px-2 pt-5 pb-2 overflow-y-auto overflow-x-visible">
        {navItems.map(item => (
          <NavBtn key={item.href} href={item.href} icon={item.icon} label={item.name} active={pathname === item.href} collapsed={collapsed} />
        ))}

        <Separator className="bg-white/5 my-2" />

        {!collapsed && (
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-2 mb-0.5">Games</p>
        )}
        {games.map(game => (
          <NavBtn key={game.id} href={`/games/${game.id}`} icon={game.icon} label={game.name} active={pathname === `/games/${game.id}`} collapsed={collapsed} />
        ))}
      </ScrollShadow>

      {/* Footer: wallet balance */}
      <div className={`p-2 border-t border-white/5 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <button onClick={openWallet} className="w-10 h-10 flex items-center justify-center rounded-xl text-primary hover:bg-primary/20 transition-colors">
            <Wallet size={17} />
          </button>
        ) : (
          <button onClick={openWallet} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
            <Wallet size={15} className="text-primary shrink-0" />
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[11px] font-black text-white truncate leading-none" style={{ fontFamily: "'Space Mono', monospace" }}>{formatBal(balance)}</span>
              <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest leading-none mt-0.5">Wallet</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

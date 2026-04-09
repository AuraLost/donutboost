"use client";

import React from "react";
import { Button, Tooltip, Separator, ScrollShadow } from "@heroui/react";
import { 
  Home, 
  Gift, 
  Trophy, 
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Bomb,
  Dices,
  Triangle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const games = [
  { id: "crash",  name: "Crash",  icon: TrendingUp },
  { id: "mines",  name: "Mines",  icon: Bomb },
  { id: "plinko", name: "Plinko", icon: Triangle },
  { id: "dice",   name: "Dice",   icon: Dices },
];

const navItems = [
  { name: "Home",          icon: Home,    href: "/" },
  { name: "Daily Rewards", icon: Gift,    href: "/daily" },
  { name: "Live Wins",     icon: Trophy,  href: "/livebets" },
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
            className={`h-11 justify-start px-3 rounded-xl border transition-all duration-200 ${
              active
                ? "bg-primary/15 text-primary border-primary/25 shadow-sm shadow-primary/10"
                : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white hover:border-white/10"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-bold truncate">{label}</span>}
            {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content placement="right">{label}</Tooltip.Content>
      </Tooltip>
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(true);
  const pathname = usePathname();

  // Hide on landing page
  if (pathname === "/") return null;

  return (
    <aside
      className={`relative h-full flex flex-col flex-shrink-0 transition-[width] duration-300 ease-in-out border-r border-white/5 bg-black/60 backdrop-blur-xl overflow-hidden ${
        collapsed ? "w-[64px]" : "w-[210px]"
      }`}
    >
      {/* Toggle arrow — sits at top of content area */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 z-50 w-6 h-6 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-black hover:border-primary transition-all shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <ScrollShadow className="flex-1 flex flex-col gap-2 px-2.5 pt-6 pb-4 overflow-hidden">
        {/* Main nav */}
        <div className="flex flex-col gap-1">
          {navItems.map(item => (
            <NavBtn
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.name}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>

        <Separator className="bg-white/5 my-2" />

        {/* Games */}
        <div className="flex flex-col gap-1">
          {!collapsed && (
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-3 mb-1">Games</p>
          )}
          {games.map(game => (
            <NavBtn
              key={game.id}
              href={`/games/${game.id}`}
              icon={game.icon}
              label={game.name}
              active={pathname === `/games/${game.id}`}
              collapsed={collapsed}
            />
          ))}
        </div>
      </ScrollShadow>

      {/* Online dot */}
      <div className="p-3 border-t border-white/5 flex justify-center items-center">
        {collapsed ? (
          <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
        ) : (
          <div className="w-full flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-xl">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">System</span>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-success">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Online
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

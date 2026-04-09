"use client";

import React from "react";
import { 
  Button, 
  Tooltip, 
  Separator,
  ScrollShadow
} from "@heroui/react";
import { 
  Home, 
  Gift, 
  Trophy, 
  LayoutGrid,
  Zap,
  Dice5,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Gamepad2
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const games = [
  { id: "crash", name: "Crash", icon: Zap },
  { id: "mines", name: "Mines", icon: ShieldCheck },
  { id: "plinko", name: "Plinko", icon: LayoutGrid },
  { id: "dice", name: "Dice", icon: Dice5 },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const pathname = usePathname();

  // Hide sidebar entirely on the landing page
  if (pathname === "/") return null;

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Daily Rewards", icon: Gift, href: "/daily" },
    { name: "Live Wins", icon: Trophy, href: "/livebets" },
  ];

  return (
    <aside 
      className={`relative h-full flex flex-col transition-all duration-500 border-r border-white/5 bg-secondary/30 backdrop-blur-xl ${
        isCollapsed ? "w-[72px]" : "w-[220px]"
      }`}
    >
      {/* Collapse Toggle */}
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        className="absolute -right-3 top-20 z-50 rounded-full bg-secondary border border-white/5 shadow-xl text-primary"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      {/* Main Nav */}
      <ScrollShadow className="flex-1 px-3 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Tooltip isDisabled={!isCollapsed}>
                <Tooltip.Trigger>
                  <Button
                    fullWidth
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={`h-12 justify-start px-3 transition-all duration-300 rounded-2xl group border border-transparent ${
                      pathname === item.href 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-black/20 text-muted hover:bg-white/5 hover:text-white hover:border-white/5"
                    }`}
                  >
                    <item.icon size={20} className={`${pathname === item.href ? "text-primary" : "group-hover:text-primary transition-all duration-300"}`} />
                    {!isCollapsed && <span className="ml-3 font-bold tracking-tight text-sm">{item.name}</span>}
                    {pathname === item.href && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content placement="right">
                  {item.name}
                </Tooltip.Content>
              </Tooltip>
            </Link>
          ))}
        </div>

        <Separator className="bg-white/5" />

        <div className="flex flex-col gap-2">
          {!isCollapsed && <p className="text-[9px] font-black text-muted uppercase tracking-[0.25em] px-2 mb-1">Games</p>}
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <Tooltip isDisabled={!isCollapsed}>
                <Tooltip.Trigger>
                  <Button
                    fullWidth
                    variant={pathname.includes(game.id) ? "secondary" : "ghost"}
                    className={`h-12 justify-start px-3 transition-all duration-300 rounded-2xl group border border-transparent ${
                      pathname.includes(game.id) 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-black/20 text-muted hover:bg-white/5 hover:text-white hover:border-white/5"
                    }`}
                  >
                    <game.icon size={20} className={`${pathname.includes(game.id) ? "text-primary" : "group-hover:text-primary transition-all"}`} />
                    {!isCollapsed && <span className="ml-3 font-bold tracking-tight text-sm">{game.name}</span>}
                    {pathname.includes(game.id) && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content placement="right">
                  {game.name}
                </Tooltip.Content>
              </Tooltip>
            </Link>
          ))}
        </div>
      </ScrollShadow>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 bg-black/40">
         {!isCollapsed ? (
           <div className="bg-secondary/20 p-3 rounded-2xl">
              <div className="flex items-center justify-between">
                 <span className="text-[9px] text-muted font-black tracking-widest uppercase">System</span>
                 <span className="text-[10px] font-black text-success flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Online
                 </span>
              </div>
           </div>
         ) : (
           <div className="flex justify-center">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
           </div>
         )}
      </div>
    </aside>
  );
}

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
  Gamepad2,
  LayoutGrid,
  Zap,
  Dice5,
  Coins,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const games = [
  { id: "crash", name: "Crash", icon: Zap },
  { id: "mines", name: "Mines", icon: ShieldCheck },
  { id: "plinko", name: "Plinko", icon: LayoutGrid },
  { id: "dice", name: "Dice", icon: Dice5 },
  { id: "blackjack", name: "Blackjack", icon: Coins },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Daily Rewards", icon: Gift, href: "/daily" },
    { name: "Live Wins", icon: Trophy, href: "/livebets" },
  ];

  return (
    <aside 
      className={`relative h-full flex flex-col transition-all duration-500 border-r border-white/5 bg-secondary/30 backdrop-blur-xl ${
        isCollapsed ? "w-[80px]" : "w-[240px]"
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
      <ScrollShadow className="flex-1 px-3 py-6 space-y-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Tooltip isDisabled={!isCollapsed}>
                <Tooltip.Trigger>
                  <Button
                    fullWidth
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={`h-12 justify-start px-3 transition-all duration-300 rounded-xl group ${
                      pathname === item.href 
                        ? "bg-primary/20 text-primary border-none" 
                        : "text-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={22} className={`${pathname === item.href ? "text-primary" : "group-hover:text-primary transition-colors duration-300"}`} />
                    {!isCollapsed && <span className="ml-4 font-bold tracking-tight">{item.name}</span>}
                    {pathname === item.href && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
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

        <Separator className="bg-white/5 mx-2" />

        <div className="space-y-2">
          {!isCollapsed && <p className="text-[10px] font-black text-muted uppercase tracking-widest px-4 mb-4">GAMES</p>}
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <Tooltip isDisabled={!isCollapsed}>
                <Tooltip.Trigger>
                  <Button
                    fullWidth
                    variant={pathname.includes(game.id) ? "secondary" : "ghost"}
                    className={`h-12 justify-start px-3 transition-all duration-300 rounded-xl group ${
                      pathname.includes(game.id) 
                        ? "bg-primary/10 text-primary border-none" 
                        : "text-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <game.icon size={22} className={`${pathname.includes(game.id) ? "text-primary" : "group-hover:text-primary transition-colors"}`} />
                    {!isCollapsed && <span className="ml-4 font-bold tracking-tight">{game.name}</span>}
                    {pathname.includes(game.id) && !isCollapsed && (
                      <div className="ml-auto w-1 h-4 bg-primary rounded-full" />
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

      {/* Footer / Stats Block In Sidebar */}
      <div className="p-4 bg-black/20 border-t border-white/5">
         {!isCollapsed ? (
           <div className="bg-secondary/40 p-3 rounded-2xl space-y-2 border border-white/5">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] text-muted font-black">24H VOL</span>
                 <span className="text-xs font-black text-primary">12.4T</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
           </div>
         ) : (
           <div className="flex justify-center">
              <div className="w-1.5 h-8 bg-primary/20 rounded-full" />
           </div>
         )}
      </div>
    </aside>
  );
}

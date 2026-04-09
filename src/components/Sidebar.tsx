"use client";

import React from "react";
import { Button, Tooltip, TooltipTrigger, TooltipContent, Separator } from "@heroui/react";
import { 
  Home, 
  Gamepad2, 
  Users, 
  ShieldCheck, 
  Gift, 
  History, 
  Settings,
  Menu,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Gamepad2, label: "Games", href: "/games" },
  { icon: Users, label: "Referrals", href: "/referrals" },
  { icon: ShieldCheck, label: "Provably Fair", href: "/provably-fair" },
  { icon: Gift, label: "Daily Rewards", href: "/daily" },
  { icon: History, label: "Live Bets", href: "/livebets" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside 
      className={`flex flex-col border-r border-white/5 bg-sidebar-bg transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight text-primary">
            DONUT<span className="text-white">BOOST</span>
          </span>
        )}
        <Button
          isIconOnly
          variant="ghost"
          onPress={() => setIsCollapsed(!isCollapsed)}
          className="text-muted hover:text-white border-none shadow-none"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger>
                <div className="w-full">
                  <Link href={item.href}>
                    <Button
                      fullWidth
                      variant={isActive ? "outline" : "ghost"}
                      className={`justify-start h-12 gap-4 border-none shadow-none ${
                        isActive ? "bg-primary/10 text-primary" : "text-muted hover:text-white"
                      } ${isCollapsed ? "px-0 justify-center min-w-0" : "px-4"}`}

                    >
                      <item.icon size={22} className={isActive ? "text-primary" : ""} />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Button>
                  </Link>
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent placement="right">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>

      <Separator className="opacity-5" />

      <div className="p-4">
        <Tooltip>
          <TooltipTrigger>
            <div className="w-full">
              <Button
                fullWidth
                variant="ghost"
                className={`justify-start gap-4 text-muted hover:text-white border-none shadow-none ${isCollapsed ? "justify-center px-0 min-w-0" : "px-4"}`}
              >
                <Settings size={22} />
                {!isCollapsed && <span className="font-medium">Settings</span>}
              </Button>
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent placement="right">Settings</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
};


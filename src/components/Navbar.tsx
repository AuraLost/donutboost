"use client";

import React from "react";
import { 
  Header,
  Button,
  Chip
} from "@heroui/react";
import { Wallet, LogIn, UserPlus } from "lucide-react";

export const Navbar = () => {
  return (
    <Header 
      className="bg-nav-bg/50 border-b border-white/5 backdrop-blur-md h-16 px-6 sticky top-0 z-30"
    >
      <div className="flex items-center justify-between w-full h-full">
        <div className="flex items-center gap-4">
          <Chip
            variant="soft"

            className="hidden sm:flex bg-primary/10 text-primary border-none font-bold"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              $10,000,000 GIVEAWAY
            </div>
          </Chip>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="hidden md:flex bg-white/5 text-muted hover:text-white border-none shadow-none"
          >
            <div className="flex items-center gap-2">
              <Wallet size={18} />
              Connect Wallet
            </div>
          </Button>
          <Button 
            variant="ghost" 
            className="text-white font-medium border-none shadow-none"
          >
            <div className="flex items-center gap-2">
              <LogIn size={18} />
              Login
            </div>
          </Button>
          <Button 
            className="font-bold text-black border-none bg-primary"
          >
            <div className="flex items-center gap-2">
              <UserPlus size={18} />
              Register
            </div>
          </Button>
        </div>
      </div>
    </Header>
  );
};



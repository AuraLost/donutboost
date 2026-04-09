"use client";

import React from "react";
import { 
  Button, 
  Input, 
  Avatar, 
  AvatarImage,
  AvatarFallback,
  ScrollShadow, 
  Separator,
  Badge
} from "@heroui/react";
import { MessageSquare, Send, ChevronRight, Hash, Users } from "lucide-react";

const mockMessages = [
  { id: 1, user: "Steve", message: "Anyone won big on Crash today?", avatar: "https://i.pravatar.cc/150?u=steve" },
  { id: 2, user: "Alex", message: "Just hit a 5x multiplier! 🚀", avatar: "https://i.pravatar.cc/150?u=alex" },
  { id: 3, user: "Creeper", message: "Boom!", avatar: "https://i.pravatar.cc/150?u=creeper" },
  { id: 4, user: "Diamond", message: "Nice 10m payout just now.", avatar: "https://i.pravatar.cc/150?u=diamond" },
];

export function ChatSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[320px] h-full border-l border-white/5 bg-secondary/20 backdrop-blur-2xl">
      <div className="p-5 flex items-center justify-between border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
             <MessageSquare size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">LIVE CHAT</h2>
            <div className="flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
               <span className="text-[10px] font-bold text-success uppercase">428 online</span>
            </div>
          </div>
        </div>
        <Button isIconOnly size="sm" variant="ghost" className="border-none text-muted">
           <Users size={16} />
        </Button>
      </div>

      <ScrollShadow className="flex-1 p-5 space-y-6">
        {mockMessages.map((msg) => (
          <div key={msg.id} className="flex gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <Avatar size="sm" className="border-2 border-primary/20 shrink-0">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{msg.user[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{msg.user}</span>
                <span className="text-[9px] font-bold text-muted uppercase">12:3{msg.id}</span>
              </div>
              <div className="text-sm text-secondary-foreground bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 select-text leading-relaxed">
                {msg.message}
              </div>
            </div>
          </div>
        ))}
      </ScrollShadow>

      <div className="p-5 border-t border-white/5 bg-black/10 space-y-4">
        <div className="flex items-center justify-center p-4 border border-dashed border-primary/20 rounded-2xl bg-primary/5 group cursor-pointer hover:bg-primary/10 transition-colors">
          <p className="text-[10px] text-primary font-black text-center uppercase tracking-widest leading-none">
            Sign in to chat
          </p>
        </div>
        <div className="relative group grayscale opacity-50 pointer-events-none">
          <Input
            disabled
            placeholder="Type a message..."
            className="w-full bg-black/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted">
             <Send size={16} />
          </div>
        </div>
      </div>
    </aside>
  );
}

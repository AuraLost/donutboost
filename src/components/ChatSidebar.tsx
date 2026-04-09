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
import { MessageSquare, Send, ChevronRight } from "lucide-react";


const mockMessages = [
  { id: 1, user: "Steve", message: "Anyone won big on Crash today?", avatar: "https://i.pravatar.cc/150?u=steve" },
  { id: 2, user: "Alex", message: "Just hit a 5x multiplier! 🚀", avatar: "https://i.pravatar.cc/150?u=alex" },
  { id: 3, user: "CreeperBoom", message: "Nice! I'm still trying my luck on Mines.", avatar: "https://i.pravatar.cc/150?u=creeper" },
  { id: 4, user: "DiamondMan", message: "The new Wheel game is actually sick.", avatar: "https://i.pravatar.cc/150?u=diamond" },
];

export const ChatSidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside 
      className={`flex flex-col border-l border-white/5 bg-chat-bg transition-all duration-300 ${
        isCollapsed ? "w-0 overflow-hidden" : "w-80"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" />
          <span className="font-bold">LIVE CHAT</span>
          <Badge color="success" size="sm" variant="soft">
            <div className="px-1 text-[10px]">42</div>
          </Badge>
        </div>
        <Button
          isIconOnly
          variant="ghost"
          onPress={() => setIsCollapsed(true)}
          className="text-muted border-none shadow-none"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <ScrollShadow className="flex-1 p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
            <Avatar size="sm" className="border-2 border-primary/20">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback>{msg.user[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{msg.user}</span>
                <span className="text-[10px] text-muted">12:3{msg.id}</span>
              </div>
              <p className="text-sm text-muted bg-white/5 p-2 rounded-lg rounded-tl-none border border-white/5">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
      </ScrollShadow>

      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-center p-3 border border-dashed border-white/10 rounded-xl bg-white/5">
          <p className="text-xs text-muted text-center">
            Please <span className="text-primary cursor-pointer hover:underline">Login</span> to participate in chat
          </p>
        </div>
        <div className="relative opacity-50">
          <Input
            disabled
            placeholder="Type a message..."
            className="w-full"
          />
          <Send size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

    </aside>
  );
};

export const ChatToggleButton = ({ onToggle }: { onToggle: () => void }) => (
  <Button
    isIconOnly
    variant="primary"
    onPress={onToggle}
    className="fixed right-6 bottom-6 z-50 bg-secondary/20 hover:bg-secondary/40 backdrop-blur-md border border-white/10 rounded-full h-14 w-14 shadow-2xl"
  >
    <MessageSquare size={24} className="text-primary" />
  </Button>
);


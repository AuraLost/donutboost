"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <main className="dark text-foreground bg-background min-h-screen">
        {children}
      </main>
    </HeroUIProvider>
  );
}

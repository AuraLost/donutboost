"use client";

import { RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEconomy } from "@/hooks/use-economy";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrateFromUser = useEconomy((state) => state.hydrateFromUser);

  useEffect(() => {
    void hydrateFromUser();
  }, [hydrateFromUser]);

  return (
    <RouterProvider navigate={router.push}>
      <main className="dark text-foreground bg-background min-h-screen">{children}</main>
    </RouterProvider>
  );
}

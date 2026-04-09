import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ChatSidebar } from "@/components/ChatSidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DonutBoost | Play & Win",
  description: "The premium Minecraft-themed gambling platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark text-foreground h-full`}>
      <body className="antialiased h-full overflow-hidden bg-background">
        <Providers>
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            
            <div className="flex flex-col flex-1 min-w-0">
              <Navbar />
              <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {children}
              </main>
            </div>

            <ChatSidebar />
          </div>
        </Providers>
      </body>
    </html>
  );
}



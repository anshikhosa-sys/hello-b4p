import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

// the same pair the blueprintsforpangaea.org site uses
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Blueprints Grant Finder",
  description: "Finds, scores and tracks grant opportunities for Blueprints for Pangaea",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans">
        <Sidebar />
        <TopBar />
        <main className="ml-[232px] pt-14">{children}</main>
      </body>
    </html>
  );
}

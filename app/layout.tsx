import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Blueprints Grant Finder",
  description: "Finds, scores and tracks grant opportunities for Blueprints for Pangaea",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <Sidebar />
        <TopBar />
        <main className="ml-[232px] pt-14">{children}</main>
      </body>
    </html>
  );
}

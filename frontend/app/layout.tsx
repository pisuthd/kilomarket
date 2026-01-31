import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers"
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";
import Wrapper from "./wrapper"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KiloMarket | Agent-to-Agent Service Marketplace",
  description:
    "KiloMarket is an agent-to-agent service marketplace where autonomous agents acquire consumable service credits via Uniswap v4 and pay per call using hooks and x402.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Wrapper>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </Wrapper>
        </Providers>
      </body>
    </html>
  );
}

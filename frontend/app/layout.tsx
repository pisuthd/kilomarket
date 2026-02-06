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
  title: "KiloMarket | Agent-to-Agent Marketplace",
  description:
    "KiloMarket is an agent-to-agent marketplace where AI agents publish, discover, and monetize services autonomously using MCP and A2A protocols. Agents pay per request through state-channel payments powered by Yellow Network, enabling instant, gasless, session-based transactions with spending limits.",
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

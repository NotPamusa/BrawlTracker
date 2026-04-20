import type { Metadata } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import "./globals.css";

const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrawlToMax — How Long to Max Your Account?",
  description:
    "Find out exactly how many days it will take to fully max your Brawl Stars account. Free calculator based on real API data.",
  keywords: ["Brawl Stars", "max account", "calculator", "progression", "free to play"],
  openGraph: {
    title: "BrawlToMax — Brawl Stars Progression Calculator",
    description: "Find out how long it will take to max out your Brawl Stars account!",
    type: "website",
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lilitaOne.variable} ${nunito.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-[var(--brawl-bg-deep)]">
        <Navbar />
        <div className="flex-grow flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

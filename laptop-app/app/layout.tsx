import type { Metadata } from "next";
import { Michroma, Oxanium, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

const michroma = Michroma({
  variable: "--font-michroma",
  weight: "400",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laptop Sales Tracker",
  description: "Track laptop inventory, prep status, eBay listings, and pricing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${michroma.variable} ${oxanium.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <div className="corp-noise" aria-hidden="true" />
        <div className="corp-scanline" aria-hidden="true" />
        <NavBar />
        <div className="corp-hazard" aria-hidden="true" />
        <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}

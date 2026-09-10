import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Type ramp mirrors sinhaankur.com: Inter (sans), Fraunces (display italics),
// JetBrains Mono (eyebrows). Wired as CSS variables consumed in globals.css.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", axes: ["opsz", "SOFT", "WONK"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://crossfit.sinhaankur.com"),
  title: { default: "Kelo — Strength & CrossFit · Train longer, live longer", template: "%s · Kelo" },
  description:
    "Kelo is your strength & CrossFit coach: answer a few honest questions and get a safe, progressive plan with 3D step-by-step form for every movement. Track your lifts, body and streaks. Free, private, on your device. Train longer, live longer.",
  applicationName: "Kelo",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Kelo" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Kelo — Strength & CrossFit",
    description: "A safe, progressive plan with 3D form for every movement. Track lifts, body & streaks. Free, on your device. Train longer, live longer.",
    type: "website",
    url: "https://crossfit.sinhaankur.com",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kelo — Strength & CrossFit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kelo — Strength & CrossFit",
    description: "Safe, progressive plans · 3D form · track lifts, body & streaks. Free, on your device. Train longer, live longer.",
    images: ["/og.png"],
  },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0e0f13" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <body>
        {children}
        {/* Register the service worker so Kelo installs + works offline. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}

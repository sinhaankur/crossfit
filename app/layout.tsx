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
  title: "CrossFit Plan — a safe, personal workout plan you can keep",
  description:
    "Answer a few honest questions — body type, goal, diet, experience, equipment — and get a safe, progressive CrossFit-style plan with step-by-step form for every movement. Download it or bookmark it. No account, private, free. Consistency over extremes.",
  applicationName: "Kelo · CrossFit",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Kelo" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Your safe, personal CrossFit plan",
    description: "Body type + diet + goal → a progressive plan with steps for every move. Download or bookmark. No login.",
    type: "website",
    url: "https://crossfit.sinhaankur.com",
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

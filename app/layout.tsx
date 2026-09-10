import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crossfit.sinhaankur.com"),
  title: "CrossFit Plan — a safe, personal workout plan you can keep",
  description:
    "Answer a few honest questions — body type, goal, diet, experience, equipment — and get a safe, progressive CrossFit-style plan with step-by-step form for every movement. Download it or bookmark it. No account, private, free. Consistency over extremes.",
  applicationName: "CrossFit · sinhaankur",
  openGraph: {
    title: "Your safe, personal CrossFit plan",
    description: "Body type + diet + goal → a progressive plan with steps for every move. Download or bookmark. No login.",
    type: "website",
    url: "https://crossfit.sinhaankur.com",
  },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0e0f13" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

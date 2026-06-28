import type { Metadata, Viewport } from "next";
import { Outfit, Work_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streaming Guide",
  description: "What's new to watch today and this week, across your streaming platforms.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Streaming Guide",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${workSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0c0b0a] text-stone-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:bg-[#FF00AA] focus:text-stone-950 focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0c0b0a]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Grotesk, Silkscreen } from "next/font/google";
import { WalletProvider } from "@/providers/wallet-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-bricolage",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-silkscreen",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pixelboard.xyz"),
  title: {
    default: "PIXELBOARD - Collaborative Pixel Canvas",
    template: "%s | PIXELBOARD",
  },
  description: "One million pixels. Bought by degens, claimed by memecoins, paid for in tokens that get burned every 24 hours.",
  keywords: ["pixel art", "crypto", "memecoin", "nft", "robinhood chain", "pixel board", "collaborative canvas"],
  authors: [{ name: "PIXELBOARD" }],
  creator: "PIXELBOARD",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PIXELBOARD",
    title: "PIXELBOARD - Collaborative Pixel Canvas",
    description: "One million pixels. Bought by degens, claimed by memecoins, paid for in tokens that get burned.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PIXELBOARD - One million pixels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PIXELBOARD - Collaborative Pixel Canvas",
    description: "One million pixels. Bought by degens, claimed by memecoins.",
    creator: "@PIXELBOARD",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${spaceGrotesk.variable} ${silkscreen.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink font-body antialiased">
        <ThemeProvider>
          <WalletProvider>{children}</WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

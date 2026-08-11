import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Grotesk, Silkscreen } from "next/font/google";
import { WalletProvider } from "@/providers/wallet-provider";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://blokr.art"),
  title: {
    default: "BLOKR - Collaborative Pixel Canvas",
    template: "%s | BLOKR",
  },
  description: "One million pixels. Bought by degens, claimed by memecoins, paid for in tokens that get burned every 24 hours.",
  keywords: ["pixel art", "crypto", "memecoin", "nft", "robinhood chain", "pixel board", "collaborative canvas", "blok"],
  authors: [{ name: "BLOKR" }],
  creator: "BLOKR",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BLOKR",
    title: "BLOKR - Collaborative Pixel Canvas",
    description: "One million pixels. Bought by degens, claimed by memecoins, paid for in tokens that get burned.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BLOKR - One million pixels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BLOKR - Collaborative Pixel Canvas",
    description: "One million pixels. Bought by degens, claimed by memecoins.",
    creator: "@BLOKR",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BLOKR",
  description: "Collaborative pixel canvas on Robinhood Chain. One million pixels. Bought by degens, claimed by memecoins.",
  url: "https://blokr.art",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Plausible Analytics - privacy-first, no cookies */}
        <script
          defer
          data-domain="blokr.art"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="min-h-screen bg-black text-white font-body antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}

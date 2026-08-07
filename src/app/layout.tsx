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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://blok.art"),
  title: {
    default: "BLOK - Collaborative Pixel Canvas",
    template: "%s | BLOK",
  },
  description: "One million pixels. Bought by degens, claimed by memecoins, paid for in tokens that get burned every 24 hours.",
  keywords: ["pixel art", "crypto", "memecoin", "nft", "robinhood chain", "pixel board", "collaborative canvas", "blok"],
  authors: [{ name: "BLOK" }],
  creator: "BLOK",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BLOK",
    title: "BLOK - Collaborative Pixel Canvas",
    description: "One million pixels. Bought by degens, claimed by memecoins, paid for in tokens that get burned.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BLOK - One million pixels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BLOK - Collaborative Pixel Canvas",
    description: "One million pixels. Bought by degens, claimed by memecoins.",
    creator: "@BLOK",
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
  name: "BLOK",
  description: "Collaborative pixel canvas on Robinhood Chain. One million pixels. Bought by degens, claimed by memecoins.",
  url: "https://blok.art",
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
          data-domain="blok.art"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="min-h-screen bg-paper text-ink font-body antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}

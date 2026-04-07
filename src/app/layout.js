import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/providers/Web3Provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL("https://www.intelnode.io"),
  title: "IntelNode ($INOD) — Crypto Intelligence Hub",
  description: "A comprehensive crypto intelligence hub providing automated, institution-grade research reports on various crypto projects. Powered by AI-driven analytics and gated by the $INOD token ecosystem.",
  keywords: ["crypto", "AI", "intelligence", "blockchain", "DeFi", "research", "INOD", "IntelNode", "token analytics"],
  icons: {
    icon: "/agent.png",
    apple: "/agent.png",
  },
  openGraph: {
    title: "IntelNode ($INOD) — Crypto Intelligence Hub",
    description: "Institution-grade crypto research powered by AI. Automated analytics, signal intelligence, and gated research reports.",
    url: "https://www.intelnode.io",
    siteName: "IntelNode",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "IntelNode Intelligence Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntelNode ($INOD) — Crypto Intelligence Hub",
    description: "Institution-grade crypto research powered by AI. Automated analytics, signal intelligence, and gated research reports.",
    creator: "@intelnode",
    site: "@intelnode",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://www.intelnode.io",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.intelnode.io/#organization",
      name: "IntelNode",
      url: "https://www.intelnode.io",
      logo: "https://www.intelnode.io/agent.png",
      sameAs: [
        "https://x.com/intelnode",
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.intelnode.io/#website",
      url: "https://www.intelnode.io",
      name: "IntelNode ($INOD) — Crypto Intelligence Hub",
      description: "A comprehensive crypto intelligence hub providing automated, institution-grade research reports powered by AI analytics.",
      publisher: {
        "@id": "https://www.intelnode.io/#organization"
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`} style={{ backgroundColor: "#FFFFFF" }}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}


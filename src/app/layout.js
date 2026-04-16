import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/providers/Web3Provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL("https://www.intel-node.xyz"),
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
    url: "https://www.intel-node.xyz",
    siteName: "IntelNode",
    images: [
      {
        url: "https://www.intel-node.xyz/og.png",
        secureUrl: "https://www.intel-node.xyz/og.png",
        type: "image/png",
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
    creator: "@intelnode_ai",
    site: "@intelnode_ai",
    images: [
      {
        url: "https://www.intel-node.xyz/og.png",
        width: 1200,
        height: 630,
        alt: "IntelNode Intelligence Engine",
      },
    ],
  },
  alternates: {
    canonical: "https://www.intel-node.xyz",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.intel-node.xyz/#organization",
      name: "IntelNode",
      url: "https://www.intel-node.xyz",
      logo: "https://www.intel-node.xyz/agent.png",
      sameAs: [
        "https://x.com/intelnode_ai",
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.intel-node.xyz/#website",
      url: "https://www.intel-node.xyz",
      name: "IntelNode ($INOD) — Crypto Intelligence Hub",
      description: "A comprehensive crypto intelligence hub providing automated, institution-grade research reports powered by AI analytics.",
      publisher: {
        "@id": "https://www.intel-node.xyz/#organization"
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

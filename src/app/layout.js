import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/providers/Web3Provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL("https://www.chain-oracle.com"),
  title: "ChainOracle ($CORA) — AI Predictive Analytics",
  description: "Predict the next trending crypto before everyone else. AI-powered forecasting, curated alpha feeds, personalized watchlists, and real-time signal intelligence.",
  keywords: ["crypto", "AI", "predictive analytics", "blockchain", "DeFi", "forecast", "CORA", "ChainOracle", "token prediction"],
  icons: {
    icon: "/agent.png",
    apple: "/agent.png",
  },
  openGraph: {
    title: "ChainOracle ($CORA) — AI Predictive Analytics",
    description: "Predict the next trending crypto before everyone else with AI-powered forecasting and signal intelligence.",
    url: "https://www.chain-oracle.com",
    siteName: "ChainOracle",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ChainOracle Predictive Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainOracle ($CORA) — AI Predictive Analytics",
    description: "Predict the next trending crypto before everyone else with AI-powered forecasting and signal intelligence.",
    creator: "@aichainoracle",
    site: "@aichainoracle",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://www.chain-oracle.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.chain-oracle.com/#organization",
      name: "ChainOracle",
      url: "https://www.chain-oracle.com",
      logo: "https://www.chain-oracle.com/agent.png",
      sameAs: [
        "https://x.com/aichainoracle",
        "https://chain-oracle.gitbook.io/chain-oracle-docs"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.chain-oracle.com/#website",
      url: "https://www.chain-oracle.com",
      name: "ChainOracle ($CORA) — AI Predictive Analytics",
      description: "Predict the next trending crypto before everyone else with AI-powered forecasting and signal intelligence.",
      publisher: {
        "@id": "https://www.chain-oracle.com/#organization"
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`} style={{ backgroundColor: "#0A0A0F" }}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}

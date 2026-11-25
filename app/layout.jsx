import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  metadataBase: new URL("https://torn-abacus.vercel.app"),
  title: {
    default: "TornAbacus - Torn City Travel Profit & Financial Ledger",
    template: "%s | TornAbacus",
  },
  description:
    "Free, 100% client-side financial ledger, overseas travel tracker, and bazaar profit analytics dashboard for Torn City (torn.com). Realized profit COGS accounting, zero server storage, and dual TCT/Local time indexing.",
  keywords: [
    "Torn City",
    "Torn City travel",
    "Torn travel profit",
    "Torn overseas running",
    "Torn bazaar tracker",
    "Torn plushie running",
    "Torn flower running",
    "Torn profit calculator",
    "Torn ledger",
    "TornAbacus",
    "Torn City tools",
    "Torn API ledger",
    "Torn market tracker",
  ],
  authors: [{ name: "TornAbacus" }],
  creator: "TornAbacus",
  publisher: "TornAbacus",
  applicationName: "TornAbacus",
  alternates: {
    canonical: "https://torn-abacus.vercel.app",
  },
  openGraph: {
    title: "TornAbacus - Torn City Travel Profit & Financial Ledger",
    description:
      "100% client-side financial ledger, overseas travel tracker, and bazaar profit analytics dashboard for Torn City (torn.com). Zero server dependencies, private in-browser storage.",
    url: "https://torn-abacus.vercel.app",
    siteName: "TornAbacus",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TornAbacus - Torn City Travel Profit & Financial Ledger",
    description:
      "100% client-side financial ledger, overseas travel tracker, and bazaar profit analytics dashboard for Torn City (torn.com).",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TornAbacus",
  url: "https://torn-abacus.vercel.app",
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
  description:
    "A 100% client-side financial ledger, overseas travel profit tracker, and bazaar analytics tool for Torn City players.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  about: {
    "@type": "VideoGame",
    name: "Torn City",
    url: "https://www.torn.com",
    genre: ["MMORPG", "Text-based RPG", "Crime RPG"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('torn_theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200 transition-colors duration-150">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "TornAbacus - Client-Side Financial Ledger & Travel Profit Dashboard",
  description:
    "A 100% client-side financial ledger, overseas travel tracker, and bazaar profit analytics dashboard for Torn City (torn.com). Zero server dependencies, direct browser API ingestion, and dual TCT/Local time indexing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}

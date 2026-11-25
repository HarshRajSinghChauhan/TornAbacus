# TornAbacus 🧮✈️

> **Production-Ready, 100% Client-Side Financial Ledger & Travel Profit Dashboard for [Torn City](https://torn.com)**

Built with **Next.js 14+ (App Router)**, **React**, **Tailwind CSS**, **Recharts**, and **Lucide Icons**. Deployable directly to **Vercel** with **zero backend dependencies**.

---

## 🔒 Security & 100% Client-Side Architecture

* **Zero Backend Storage:** No server database (no Prisma, Supabase, Firebase, or PostgreSQL).
* **Local Storage Isolation:** Your Torn API key is saved exclusively in your browser's `localStorage` under `torn_api_key`.
* **Direct Browser Fetching:** All requests to `https://api.torn.com/` are performed directly via client components (`'use client'`). Your API key is never routed through any proxy or third-party server.
* **Instant Disconnect:** One-click "Disconnect / Clear Key" button wipes your key immediately from `localStorage`.
* **Rate-Limit Aware:** Client-side tracking keeps you safely under Torn's 100 requests/minute API ceiling.

---

## 🕒 Dual Timezone Engine (TCT & Local Time)

Torn City operates on **TCT (Torn City Time = UTC)**. To eliminate timezone confusion:
* **Live Dual Clock:** Persistent header clock displaying `HH:mm:ss TCT` and `HH:mm:ss Local (Timezone Name)`.
* **Event Timestamps:** Every transaction row and log entry displays synchronized dual timestamps: `14:35 TCT • 20:05 Local`.
* **Time Range Presets:**
  * `Today (TCT)`: From 00:00:00 TCT of the current day to now.
  * `Yesterday (TCT)`: Full previous 24h day (00:00:00 to 23:59:59 TCT).
  * `Last 24 Hours`: Rolling 24-hour window.
  * `Last 7 Days`: Rolling 7-day window.
  * `Custom Date Range`: Calendar picker converted into UTC epoch seconds.

---

## 📊 Core Features & Dashboard Components

### 1. Top KPI Metric Cards (The 5-Second Overview)
* 🟢 **Net Profit:** `Total Sales - Total Expenses - Fees` with dynamic **ROI % badge** (emerald for profit, rose for loss).
* 🔵 **Gross Revenue:** Total cash made from overseas item sales (Bazaar, Item Market, and Trader Trades).
* 🔴 **Total Expenses:** `Item Costs Abroad + Flight Tickets` with detailed breakdowns.
* 🟡 **Market Fees Paid:** Item Market listing fees and commissions deducted (3%–5%).
* ✈️ **Trips Run:** Count of flights taken with average profit per trip.

### 2. Visual Analytics
* 🍩 **Donut Chart (Expense Breakdown):** Real-time distribution between *Inventory Purchases*, *Flight Tickets*, and *Market Fees*.
* 📊 **Bar Chart (Top Profitable Items):** Interactive ranking of top profit drivers with revenue and cost tooltips.

### 3. "What Went Where" Itemized Ledger Table
* Searchable and sortable by Net Profit, Quantity Sold, ROI %, Cost Abroad, or Revenue.
* Columns:
  * `Item Name` (with country flag and destination tag, e.g. 🇨🇭 Switzerland, 🇦🇪 UAE, 🇰🇾 Cayman)
  * `Qty Bought`
  * `Total Cost Abroad`
  * `Avg Buy Price`
  * `Qty Sold`
  * `Total Revenue`
  * `Avg Sell Price`
  * `Fees Paid`
  * `Net Profit` (colored emerald green or rose red)
  * `Profit Margin / ROI %`
* **Export to CSV:** Download full ledger data to a `.csv` spreadsheet with one click.

### 4. Raw Transaction Stream
* Collapsible, chronologically indexed activity log.
* Badges: `Bought Abroad`, `Flight Ticket`, `Bazaar Sale`, `Market Sale`, `Trade Cash`.
* Dual timestamps (`14:35 TCT • 20:05 Local`), item quantity tags, and exact financial delta (`+$...` or `-$...`).

### 5. Built-In Demo Mode
* Test drive the entire dashboard with realistic travel logs across Switzerland, UAE, UK, Japan, Argentina, Cayman, and South Africa without needing an API key.

---

## 🚀 Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/TornAbacus.git
cd TornAbacus

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

Because **TornAbacus** has zero backend or database dependencies, it can be deployed to Vercel in 30 seconds:

```bash
npm run build
```

Or click deploy in the [Vercel Dashboard](https://vercel.com/new). No environment variables are required!

---

## 📜 License

MIT License. Designed for the Torn City community.

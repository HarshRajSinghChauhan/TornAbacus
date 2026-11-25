import { getItemDetails, getCountryByAreaId, getCountryForItem, getCountryDetails, resolveFlightDestination } from "./tornItems.js";

export const ACTION_TYPES = {
  BOUGHT_ABROAD: {
    label: "Bought Abroad",
    color: "text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
    badge: "✈️ Bought Abroad",
    type: "expense",
  },
  SHOP_BUY: {
    label: "City Shop Buy",
    color: "text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60",
    badge: "🏙️ City Shop Buy",
    type: "expense",
  },
  FLIGHT: {
    label: "Flight Ticket",
    color: "text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60",
    badge: "🎫 Flight Ticket",
    type: "expense",
  },
  BAZAAR_SALE: {
    label: "Bazaar Sale",
    color: "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
    badge: "🏪 Bazaar Sale",
    type: "revenue",
  },
  MARKET_SALE: {
    label: "Market Sale",
    color: "text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60",
    badge: "🏷️ Market Sale",
    type: "revenue",
  },
  TRADE: {
    label: "Trade Cash",
    color: "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
    badge: "🤝 Trade Cash",
    type: "revenue",
  },
};

/**
 * Parse an individual raw log entry into one or more financial events
 */
export function parseLogEntry(id, rawLog) {
  const timestamp = Number(rawLog.timestamp) || Math.floor(Date.now() / 1000);
  const title = (rawLog.title || "").trim();
  const category = (rawLog.category || "").toLowerCase();
  const logCode = Number(rawLog.log) || 0;
  const data = rawLog.data || {};

  // 1. Overseas Item Purchases
  // Torn Log 4201 ("Item abroad buy"), Log 2400 ("Item bought overseas"), or Travel + Buy
  if (
    logCode === 4201 ||
    logCode === 2400 ||
    title.toLowerCase().includes("item abroad buy") ||
    title.toLowerCase().includes("bought") && (category.includes("travel") || title.toLowerCase().includes("overseas"))
  ) {
    const rawItem = data.item_name || data.item || "";
    const itemInfo = getItemDetails(rawItem);
    const quantity = Number(data.quantity || data.qty || 1);
    
    let totalCost = Number(
      data.cost_total ??
      data.cost ??
      data.price ??
      (data.cost_each ? data.cost_each * quantity : 0)
    );

    // Prioritize canonical item country (e.g. Red Fox Plushie is UK, Banana Orchid is Cayman)
    let country =
      (itemInfo.country && itemInfo.country !== "Abroad" && itemInfo.country !== "Torn City")
        ? itemInfo.country
        : (data.country || (data.area ? getCountryByAreaId(data.area) : null) || "Abroad");

    // Regex fallback if structured fields are missing
    if (!itemInfo.name || totalCost === 0) {
      const match = title.match(/bought\s+([0-9,]+)x?\s+(.+?)(?:\s+in\s+([A-Za-z\s]+))?\s+for\s+\$([0-9,]+)/i);
      if (match) {
        const q = parseInt(match[1].replace(/,/g, ""), 10);
        const name = match[2].trim();
        const c = match[3] ? match[3].trim() : null;
        const cost = parseInt(match[4].replace(/,/g, ""), 10);
        return [{
          id,
          timestamp,
          action: "BOUGHT_ABROAD",
          title: `Bought ${q}x ${name}`,
          itemName: name,
          quantity: q,
          totalCost: cost,
          unitCost: q > 0 ? Math.round(cost / q) : cost,
          country: c || getCountryForItem(name) || "Abroad",
          fee: 0,
          revenue: 0,
        }];
      }
    }

    if (itemInfo.name) {
      return [{
        id,
        timestamp,
        action: "BOUGHT_ABROAD",
        title: `Bought ${quantity}x ${itemInfo.name}`,
        itemName: itemInfo.name,
        quantity,
        totalCost,
        unitCost: quantity > 0 ? Math.round(totalCost / quantity) : totalCost,
        country: country || "Abroad",
        fee: 0,
        revenue: 0,
      }];
    }
  }

  // 1b. NPC City Shop Purchases (Bits 'n' Bobs, Big Al's Gun Shop, Pharmacy, etc.)
  // Torn Log 4200 ("Items shop buy"), Log 4205, or title containing "shop buy"
  if (
    logCode === 4200 ||
    logCode === 4205 ||
    title.toLowerCase().includes("items shop buy") ||
    title.toLowerCase().includes("item shop buy") ||
    (title.toLowerCase().includes("bought") && (category.includes("shop") || title.toLowerCase().includes("shop")))
  ) {
    const shopName = data.shop_name || data.shop || data.building || "";

    // Array of items in single buy transaction
    if (Array.isArray(data.items) && data.items.length > 0) {
      return data.items.map((itemObj, idx) => {
        const rawItem = itemObj.id || itemObj.item || itemObj.name || "";
        const itemInfo = getItemDetails(rawItem);
        const qty = Number(itemObj.qty || itemObj.quantity || 1);
        const itemCost = Number(
          itemObj.cost_total ??
          itemObj.cost ??
          itemObj.price ??
          (itemObj.cost_each ? itemObj.cost_each * qty : 0)
        );
        const shopLabel = shopName || "City Shop";

        return {
          id: `${id}_${idx}`,
          timestamp,
          action: "SHOP_BUY",
          title: `Bought ${qty}x ${itemInfo.name} in ${shopLabel}`,
          itemName: itemInfo.name,
          quantity: qty,
          totalCost: itemCost,
          unitCost: qty > 0 ? Math.round(itemCost / qty) : itemCost,
          country: "Torn City",
          fee: 0,
          revenue: 0,
        };
      });
    }

    // Single item buy transaction
    const rawItem = data.item_name || data.item || data.name || "";
    const itemInfo = getItemDetails(rawItem);
    const quantity = Number(data.quantity || data.qty || 1);

    let totalCost = Number(
      data.cost_total ??
      data.cost ??
      data.price ??
      (data.cost_each ? data.cost_each * quantity : 0)
    );

    // Regex fallback if structured data fields are missing
    if (!itemInfo.name || totalCost === 0) {
      const match = title.match(/bought\s+([0-9,]+)x?\s+(.+?)(?:\s+(?:from|in)\s+(.+?))?\s+for\s+\$([0-9,]+)/i);
      if (match) {
        const q = parseInt(match[1].replace(/,/g, ""), 10);
        const name = match[2].trim();
        const shop = match[3] ? match[3].trim() : (shopName || "City Shop");
        const cost = parseInt(match[4].replace(/,/g, ""), 10);
        const parsedItem = getItemDetails(name);
        return [{
          id,
          timestamp,
          action: "SHOP_BUY",
          title: `Bought ${q}x ${parsedItem.name || name} in ${shop}`,
          itemName: parsedItem.name || name,
          quantity: q,
          totalCost: cost,
          unitCost: q > 0 ? Math.round(cost / q) : cost,
          country: "Torn City",
          fee: 0,
          revenue: 0,
        }];
      }
    }

    if (itemInfo.name) {
      const shopLabel = shopName || "City Shop";
      return [{
        id,
        timestamp,
        action: "SHOP_BUY",
        title: `Bought ${quantity}x ${itemInfo.name} in ${shopLabel}`,
        itemName: itemInfo.name,
        quantity,
        totalCost,
        unitCost: quantity > 0 ? Math.round(totalCost / quantity) : totalCost,
        country: "Torn City",
        fee: 0,
        revenue: 0,
      }];
    }
  }

  // 2. Flight Departures / Travel Tickets
  // Torn Log 6000 ("Travel depart"), Log 2405 / 2410
  if (
    logCode === 6000 ||
    logCode === 2405 ||
    logCode === 2410 ||
    title.toLowerCase().includes("travel depart") ||
    title.toLowerCase().includes("traveled to")
  ) {
    const isPersonal =
      data.travel_method === "personal" ||
      title.toLowerCase().includes("private") ||
      title.toLowerCase().includes("airstrip");

    // Resolve true destination and country based on flight duration and destination ID
    const flightInfo = resolveFlightDestination(data, title);
    const destName = flightInfo.destination;
    const country = flightInfo.country;

    let cost = 0;
    // Commercial flight fees only apply on outbound flights from Torn City.
    // Return flights home to Torn City are 100% free ($0 in Torn).
    // Private Airstrip flights are always $0 both ways.
    if (!isPersonal && !flightInfo.isHome) {
      cost = Number(data.cost ?? data.price ?? 0);
      if (cost === 0 && destName && destName !== "Torn City") {
        const cDetails = getCountryDetails(destName);
        if (cDetails && cDetails.flightCost) cost = cDetails.flightCost;
      }
    }

    const flightTitle = flightInfo.isHome
      ? (isPersonal ? `Flew home to Torn City from ${country} (Private Aircraft)` : `Flew home to Torn City from ${country}`)
      : (isPersonal ? `Flew to ${destName} (Private Aircraft)` : `Flew to ${destName}`);

    return [{
      id,
      timestamp,
      action: "FLIGHT",
      title: flightTitle || title,
      itemName: "Flight Ticket",
      quantity: 1,
      totalCost: cost,
      destination: destName,
      country: country,
      fee: 0,
      revenue: 0,
    }];
  }

  // 3. Item Market Sales
  // Torn Log 1113 ("Item market sell"), Log 1220-1225
  if (
    logCode === 1113 ||
    logCode >= 1220 && logCode <= 1225 ||
    title.toLowerCase().includes("item market sell") ||
    (category.includes("item market") && title.toLowerCase().includes("sell"))
  ) {
    const events = [];
    const fee = Number(data.fee || 0);

    // If data.items array is present (standard in Log 1113)
    if (Array.isArray(data.items) && data.items.length > 0) {
      data.items.forEach((itemObj, idx) => {
        const itemInfo = getItemDetails(itemObj.id || itemObj.item);
        const qty = Number(itemObj.qty || itemObj.quantity || 1);
        
        // In Torn, data.cost_total is already net of the 5% fee.
        // Gross revenue before fee is (cost_each * qty) or (cost_total + fee).
        const itemGrossRevenue = data.cost_each
          ? Number(data.cost_each) * qty
          : Number(data.cost_total || 0) + fee;

        events.push({
          id: `${id}_${idx}`,
          timestamp,
          action: "MARKET_SALE",
          title: `Sold ${qty}x ${itemInfo.name} on Item Market`,
          itemName: itemInfo.name,
          quantity: qty,
          revenue: itemGrossRevenue, // Pre-fee gross revenue
          fee,
          totalCost: 0,
          country: itemInfo.country,
        });
      });
      return events;
    }

    // Single item fallback
    const rawItem = data.item_name || data.item || "";
    const itemInfo = getItemDetails(rawItem);
    const qty = Number(data.quantity || data.qty || 1);
    const itemGrossRevenue = data.cost_each
      ? Number(data.cost_each) * qty
      : Number(data.cost_total || data.cost || data.price || 0) + fee;

    if (itemInfo.name && itemGrossRevenue > 0) {
      return [{
        id,
        timestamp,
        action: "MARKET_SALE",
        title: title || `Sold ${qty}x ${itemInfo.name} on Market`,
        itemName: itemInfo.name,
        quantity: qty,
        revenue: itemGrossRevenue,
        fee: fee > 0 ? fee : Math.round(itemGrossRevenue * 0.03),
        totalCost: 0,
        country: itemInfo.country,
      }];
    }
  }

  // 4. Bazaar Sales
  // Torn Log 1210-1215, or title containing bazaar
  if (
    logCode >= 1210 && logCode <= 1215 ||
    title.toLowerCase().includes("bazaar") ||
    category.includes("bazaar")
  ) {
    const rawItem = data.item_name || data.item || "";
    const itemInfo = getItemDetails(rawItem);
    const quantity = Number(data.quantity || data.qty || 1);
    let revenue = Number(data.cost_total ?? data.cost ?? data.price ?? 0);

    if (itemInfo.name && revenue > 0) {
      return [{
        id,
        timestamp,
        action: "BAZAAR_SALE",
        title: title || `Sold ${quantity}x ${itemInfo.name} in Bazaar`,
        itemName: itemInfo.name,
        quantity,
        revenue,
        totalCost: 0,
        fee: 0,
        country: itemInfo.country,
      }];
    }
  }

  // 5. Trader Trades
  // Torn Log 1300-1315
  if (
    logCode >= 1300 && logCode <= 1315 ||
    title.toLowerCase().includes("trade") && category.includes("trade")
  ) {
    let revenue = Number(data.cash || data.cost_total || data.cost || data.money || 0);
    const itemInfo = getItemDetails(data.item || data.item_name || "Traded Goods");
    const quantity = Number(data.quantity || 1);

    if (revenue > 0) {
      return [{
        id,
        timestamp,
        action: "TRADE",
        title: title || `Traded goods for cash`,
        itemName: itemInfo.name,
        quantity,
        revenue,
        totalCost: 0,
        fee: 0,
        country: itemInfo.country,
      }];
    }
  }

  return [];
}

/**
 * Process entire collection of Torn logs into Financial Ledger metrics
 */
export function processTornLogs(rawLogsObject) {
  if (!rawLogsObject) {
    return createEmptyLedger();
  }

  const entries = Array.isArray(rawLogsObject)
    ? rawLogsObject.map((log, idx) => ({ id: log.id || idx, data: log }))
    : Object.entries(rawLogsObject).map(([id, data]) => ({ id, data }));

  const parsedEvents = [];

  for (const { id, data } of entries) {
    const events = parseLogEntry(id, data);
    if (events && events.length > 0) {
      parsedEvents.push(...events);
    }
  }

  // Sort newest first
  parsedEvents.sort((a, b) => b.timestamp - a.timestamp);

  let grossRevenue = 0;
  let overseasCost = 0;
  let flightCost = 0;
  let marketFees = 0;
  let tripsRun = 0;

  const itemMap = new Map();

  for (const event of parsedEvents) {
    if (event.action === "BOUGHT_ABROAD" || event.action === "SHOP_BUY") {
      overseasCost += event.totalCost;
      const key = event.itemName;
      const current = itemMap.get(key) || createItemRecord(key, event.country);
      current.qtyBought += event.quantity;
      current.costAbroad += event.totalCost;
      if ((!current.country || current.country === "Abroad") && event.country) {
        current.country = event.country;
      }
      itemMap.set(key, current);
    } else if (event.action === "FLIGHT") {
      flightCost += event.totalCost;
      tripsRun += 1;
    } else if (event.action === "BAZAAR_SALE" || event.action === "MARKET_SALE" || event.action === "TRADE") {
      grossRevenue += event.revenue;
      marketFees += event.fee || 0;

      const key = event.itemName;
      const current = itemMap.get(key) || createItemRecord(key, event.country);
      current.qtySold += event.quantity;
      current.totalRevenue += event.revenue;
      current.feesPaid += event.fee || 0;
      if ((!current.country || current.country === "Abroad") && event.country) {
        current.country = event.country;
      }
      itemMap.set(key, current);
    }
  }

  const ledgerItems = Array.from(itemMap.values()).map((item) => {
    const avgCost = item.qtyBought > 0 ? item.costAbroad / item.qtyBought : 0;
    const avgBuyPrice = item.qtyBought > 0 ? Math.round(avgCost) : 0;
    const avgSellPrice = item.qtySold > 0 ? Math.round(item.totalRevenue / item.qtySold) : 0;
    
    // Units whose purchase cost is recognized in this period
    const unitsWithCost = Math.min(item.qtySold, item.qtyBought);
    const costOfGoodsSold = Math.round(unitsWithCost * avgCost);
    const qtyInStock = Math.max(item.qtyBought - item.qtySold, 0);
    const inventoryValue = Math.max(item.costAbroad - costOfGoodsSold, 0);
    
    const hasNoCostBasis = item.qtySold > 0 && item.qtyBought === 0;
    const hasPartialCostBasis = item.qtySold > item.qtyBought && item.qtyBought > 0;
    
    // Realized Net Profit = Revenue - COGS - Market Fees
    const itemNetProfit = item.totalRevenue - costOfGoodsSold - item.feesPaid;
    // ROI is only meaningful when goods have a recognized cost basis
    const itemRoi = costOfGoodsSold > 0 ? (itemNetProfit / costOfGoodsSold) * 100 : null;
    const country = item.country || getCountryForItem(item.name) || "Abroad";

    return {
      name: item.name,
      country,
      qtyBought: item.qtyBought,
      costAbroad: item.costAbroad,
      avgBuyPrice,
      qtySold: item.qtySold,
      totalRevenue: item.totalRevenue,
      avgSellPrice,
      feesPaid: item.feesPaid,
      costOfGoodsSold,
      qtyInStock,
      inventoryValue,
      hasNoCostBasis,
      hasPartialCostBasis,
      netProfit: itemNetProfit,
      roi: itemRoi,
    };
  });

  // Sort items with realized profit first, then unsold held inventory
  ledgerItems.sort((a, b) => {
    if (b.netProfit !== a.netProfit) return b.netProfit - a.netProfit;
    return b.inventoryValue - a.inventoryValue;
  });

  const cogsTotal = ledgerItems.reduce((s, i) => s + i.costOfGoodsSold, 0);
  const inventoryValue = ledgerItems.reduce((s, i) => s + i.inventoryValue, 0);

  const totalExpenses = overseasCost + flightCost; // Cash spent / outflows
  const netProfit = grossRevenue - cogsTotal - flightCost - marketFees; // Realized net profit
  const overallRoi = (cogsTotal + flightCost) > 0
    ? (netProfit / (cogsTotal + flightCost)) * 100 : 0;

  const expenseBreakdown = [
    { name: "Cost of Goods Sold", value: cogsTotal, color: "#f43f5e" },
    { name: "Flight Tickets", value: flightCost, color: "#a855f7" },
    { name: "Market Fees", value: marketFees, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  const topProfitableItems = ledgerItems
    .filter((item) => item.qtySold > 0 && item.netProfit !== 0)
    .slice(0, 7)
    .map((item) => ({
      name: item.name,
      profit: item.netProfit,
      revenue: item.totalRevenue,
      cost: item.costOfGoodsSold,
      country: item.country,
    }));

  return {
    kpis: {
      netProfit,
      grossRevenue,
      totalExpenses,
      cogsTotal,
      inventoryValue,
      overseasCost,
      flightCost,
      marketFees,
      tripsRun,
      roi: overallRoi,
    },
    ledgerItems,
    expenseBreakdown,
    topProfitableItems,
    rawEvents: parsedEvents,
    totalEventsCount: parsedEvents.length,
  };
}

function createItemRecord(name, country = null) {
  return {
    name,
    country: country || getCountryForItem(name),
    qtyBought: 0,
    costAbroad: 0,
    qtySold: 0,
    totalRevenue: 0,
    feesPaid: 0,
  };
}

function createEmptyLedger() {
  return {
    kpis: {
      netProfit: 0,
      grossRevenue: 0,
      totalExpenses: 0,
      cogsTotal: 0,
      inventoryValue: 0,
      overseasCost: 0,
      flightCost: 0,
      marketFees: 0,
      tripsRun: 0,
      roi: 0,
    },
    ledgerItems: [],
    expenseBreakdown: [],
    topProfitableItems: [],
    rawEvents: [],
    totalEventsCount: 0,
  };
}

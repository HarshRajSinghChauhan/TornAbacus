import { getItemDetails, getCountryByAreaId, getCountryForItem, getCountryDetails } from "./tornItems.js";

export const ACTION_TYPES = {
  BOUGHT_ABROAD: {
    label: "Bought Abroad",
    color: "text-rose-400 bg-rose-950/40 border-rose-800/60",
    badge: "✈️ Bought Abroad",
    type: "expense",
  },
  FLIGHT: {
    label: "Flight Ticket",
    color: "text-purple-400 bg-purple-950/40 border-purple-800/60",
    badge: "🎫 Flight Ticket",
    type: "expense",
  },
  BAZAAR_SALE: {
    label: "Bazaar Sale",
    color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
    badge: "🏪 Bazaar Sale",
    type: "revenue",
  },
  MARKET_SALE: {
    label: "Market Sale",
    color: "text-sky-400 bg-sky-950/40 border-sky-800/60",
    badge: "🏷️ Market Sale",
    type: "revenue",
  },
  TRADE: {
    label: "Trade Cash",
    color: "text-amber-400 bg-amber-950/40 border-amber-800/60",
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

    // Prioritize canonical item country (e.g. Red Fox Plushie is UK)
    let country =
      (itemInfo.country && itemInfo.country !== "Abroad")
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
        title: title || `Bought ${quantity}x ${itemInfo.name}`,
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

  // 2. Flight Departures / Travel Tickets
  // Torn Log 6000 ("Travel depart"), Log 2405 / 2410
  if (
    logCode === 6000 ||
    logCode === 2405 ||
    logCode === 2410 ||
    title.toLowerCase().includes("travel depart") ||
    title.toLowerCase().includes("traveled to")
  ) {
    // Determine destination
    const destAreaId = data.destination;
    const destName = data.country || (destAreaId ? getCountryByAreaId(destAreaId) : null) || "Overseas";
    
    // Check travel method ($0 for personal plane / airstrip)
    const isPersonal =
      data.travel_method === "personal" ||
      title.toLowerCase().includes("private") ||
      title.toLowerCase().includes("airstrip");

    let cost = 0;
    if (!isPersonal) {
      cost = Number(data.cost ?? data.price ?? 0);
      if (cost === 0 && destName) {
        const cDetails = getCountryDetails(destName);
        if (cDetails && cDetails.flightCost) cost = cDetails.flightCost;
      }
    }

    // Only count outbound flights or distinct travel departures as flight events
    return [{
      id,
      timestamp,
      action: "FLIGHT",
      title: isPersonal
        ? `Flew to ${destName} (Private Aircraft)`
        : `Flew to ${destName}`,
      itemName: "Flight Ticket",
      quantity: 1,
      totalCost: cost,
      destination: destName,
      country: destName,
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
    if (event.action === "BOUGHT_ABROAD") {
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

  const totalExpenses = overseasCost + flightCost;
  const netProfit = grossRevenue - totalExpenses - marketFees;
  const overallRoi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

  const ledgerItems = Array.from(itemMap.values()).map((item) => {
    const avgBuyPrice = item.qtyBought > 0 ? Math.round(item.costAbroad / item.qtyBought) : 0;
    const avgSellPrice = item.qtySold > 0 ? Math.round(item.totalRevenue / item.qtySold) : 0;
    const itemNetProfit = item.totalRevenue - item.costAbroad - item.feesPaid;
    const itemRoi = item.costAbroad > 0 ? (itemNetProfit / item.costAbroad) * 100 : 0;
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
      netProfit: itemNetProfit,
      roi: itemRoi,
    };
  });

  ledgerItems.sort((a, b) => b.netProfit - a.netProfit);

  const expenseBreakdown = [
    { name: "Inventory Purchases", value: overseasCost, color: "#f43f5e" },
    { name: "Flight Tickets", value: flightCost, color: "#a855f7" },
    { name: "Market Fees", value: marketFees, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  const topProfitableItems = ledgerItems
    .filter((item) => item.netProfit !== 0)
    .slice(0, 7)
    .map((item) => ({
      name: item.name,
      profit: item.netProfit,
      revenue: item.totalRevenue,
      cost: item.costAbroad,
      country: item.country,
    }));

  return {
    kpis: {
      netProfit,
      grossRevenue,
      totalExpenses,
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

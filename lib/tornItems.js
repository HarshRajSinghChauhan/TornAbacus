// Torn City Travel Items, Countries and Area ID Database

export const TORN_AREAS = {
  1: { name: "Torn City", code: "TC", flag: "🏙️", flightCost: 0 },
  2: { name: "Mexico", code: "MX", flag: "🇲🇽", flightCost: 6500 },
  3: { name: "Cayman Islands", code: "KY", flag: "🇰🇾", flightCost: 10000 },
  4: { name: "Canada", code: "CA", flag: "🇨🇦", flightCost: 9000 },
  5: { name: "Hawaii", code: "HI", flag: "🌺", flightCost: 13000 },
  6: { name: "United Kingdom", code: "UK", flag: "🇬🇧", flightCost: 18000 },
  7: { name: "Argentina", code: "AR", flag: "🇦🇷", flightCost: 21000 },
  8: { name: "Switzerland", code: "CH", flag: "🇨🇭", flightCost: 27000 },
  9: { name: "Japan", code: "JP", flag: "🇯🇵", flightCost: 32000 },
  10: { name: "United Kingdom", code: "UK", flag: "🇬🇧", flightCost: 18000 },
  11: { name: "UAE", code: "AE", flag: "🇦🇪", flightCost: 32000 },
  12: { name: "South Africa", code: "ZA", flag: "🇿🇦", flightCost: 40000 },
};

export const TORN_COUNTRIES = {
  "Switzerland": { code: "CH", flag: "🇨🇭", flightCost: 27000 },
  "Japan": { code: "JP", flag: "🇯🇵", flightCost: 32000 },
  "United Kingdom": { code: "UK", flag: "🇬🇧", flightCost: 18000 },
  "Argentina": { code: "AR", flag: "🇦🇷", flightCost: 21000 },
  "UAE": { code: "AE", flag: "🇦🇪", flightCost: 32000 },
  "Cayman Islands": { code: "KY", flag: "🇰🇾", flightCost: 10000 },
  "Canada": { code: "CA", flag: "🇨🇦", flightCost: 9000 },
  "Hawaii": { code: "HI", flag: "🌺", flightCost: 13000 },
  "Mexico": { code: "MX", flag: "🇲🇽", flightCost: 6500 },
  "China": { code: "CN", flag: "🇨🇳", flightCost: 35000 },
  "South Africa": { code: "ZA", flag: "🇿🇦", flightCost: 40000 },
};

// Common Torn City Item IDs (Plushies, Flowers, Drugs, Travel items)
export const TORN_ITEM_IDS = {
  // Plushies
  186: { name: "Sheep Plushie", country: "United Kingdom" },
  187: { name: "Teddy Bear Plushie", country: "Torn City" },
  215: { name: "Kitten Plushie", country: "Torn City" },
  258: { name: "Xanax", country: "Switzerland" },
  260: { name: "Dahlia", country: "Mexico" },
  261: { name: "Orchid", country: "Hawaii" },
  263: { name: "African Violet", country: "South Africa" },
  264: { name: "Cherry Blossom", country: "Japan" },
  266: { name: "Peony", country: "China" },
  267: { name: "Ceibo Flower", country: "Argentina" },
  268: { name: "Red Fox Plushie", country: "United Kingdom" },
  269: { name: "Monkey Plushie", country: "Argentina" },
  273: { name: "Nessie Plushie", country: "United Kingdom" },
  274: { name: "Wolverine Plushie", country: "Canada" },
  281: { name: "Chamois Plushie", country: "Switzerland" },
  282: { name: "Edelweiss", country: "Switzerland" },
  283: { name: "Donator Pack", country: "Torn City" },
  384: { name: "Camel Plushie", country: "UAE" },
  385: { name: "Red Fox Plushie", country: "United Kingdom" },
  617: { name: "Jaguar Plushie", country: "Mexico" },
  618: { name: "Stingray Plushie", country: "Cayman Islands" },
  619: { name: "Panda Plushie", country: "China" },
  620: { name: "Lion Plushie", country: "South Africa" },
  1491: { name: "Ergotamine Ampoule", country: "Switzerland" },
};

// Item Name mapping to Country
export const ITEM_TO_COUNTRY = {
  "Chamois Plushie": "Switzerland",
  "Edelweiss": "Switzerland",
  "Ergotamine Ampoule": "Switzerland",
  "Maneki Neko Plushie": "Japan",
  "Kabuki Mask": "Japan",
  "Cherry Blossom": "Japan",
  "Nessie Plushie": "United Kingdom",
  "Red Fox Plushie": "United Kingdom",
  "Heather": "United Kingdom",
  "Sheep Plushie": "United Kingdom",
  "Monkey Plushie": "Argentina",
  "Ceibo Flower": "Argentina",
  "Camel Plushie": "UAE",
  "Tribulus Omanense": "UAE",
  "Stingray Plushie": "Cayman Islands",
  "Banana Orchid": "Cayman Islands",
  "Wolverine Plushie": "Canada",
  "Crocus": "Canada",
  "Orchid": "Hawaii",
  "Jaguar Plushie": "Mexico",
  "Dahlia": "Mexico",
  "Panda Plushie": "China",
  "Peony": "China",
  "Lion Plushie": "South Africa",
  "African Violet": "South Africa",
  "Xanax": "Switzerland",
};

export function getItemDetails(itemIdOrName) {
  if (!itemIdOrName) return { name: "Unknown Item", country: "Abroad" };
  
  if (typeof itemIdOrName === "number" || (!isNaN(itemIdOrName) && typeof itemIdOrName === "string" && !isNaN(Number(itemIdOrName)))) {
    const id = Number(itemIdOrName);
    if (TORN_ITEM_IDS[id]) {
      return TORN_ITEM_IDS[id];
    }
    return { name: `Item #${id}`, country: "Abroad" };
  }

  const name = String(itemIdOrName).trim();
  const country = getCountryForItem(name);
  return { name, country: country || "Abroad" };
}

export function getCountryByAreaId(areaId) {
  const area = TORN_AREAS[Number(areaId)];
  return area ? area.name : null;
}

export function getCountryForItem(itemName) {
  if (!itemName) return null;
  const trimmed = itemName.trim();
  if (ITEM_TO_COUNTRY[trimmed]) return ITEM_TO_COUNTRY[trimmed];
  
  for (const [item, country] of Object.entries(ITEM_TO_COUNTRY)) {
    if (trimmed.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(trimmed.toLowerCase())) {
      return country;
    }
  }
  return null;
}

export function getCountryDetails(countryName) {
  if (!countryName) return null;
  return TORN_COUNTRIES[countryName] || {
    code: "??",
    flag: "✈️",
    flightCost: 0,
    items: [],
  };
}

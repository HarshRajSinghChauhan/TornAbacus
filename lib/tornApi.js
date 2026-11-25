/**
 * Torn API Client (100% Client-Side)
 * - Directly called from browser
 * - Key stored strictly in localStorage ('torn_api_key')
 * - Built-in client rate limit tracker (100 calls/min)
 */

export const STORAGE_KEY = "torn_api_key";

// Client-side rolling rate limiter (max 100 calls / 60 seconds)
const CALL_TIMESTAMPS = [];

function recordApiCall() {
  const now = Date.now();
  CALL_TIMESTAMPS.push(now);
  cleanupOldCalls(now);
}

function cleanupOldCalls(now = Date.now()) {
  const windowStart = now - 60000;
  while (CALL_TIMESTAMPS.length > 0 && CALL_TIMESTAMPS[0] < windowStart) {
    CALL_TIMESTAMPS.shift();
  }
}

export function getRateLimitStatus() {
  cleanupOldCalls();
  const current = CALL_TIMESTAMPS.length;
  const remaining = Math.max(0, 100 - current);
  let resetsInSeconds = 0;
  if (CALL_TIMESTAMPS.length > 0) {
    resetsInSeconds = Math.max(0, Math.ceil((CALL_TIMESTAMPS[0] + 60000 - Date.now()) / 1000));
  }
  return {
    used: current,
    remaining,
    limit: 100,
    resetsInSeconds,
  };
}

export function getStoredApiKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setStoredApiKey(key) {
  if (typeof window === "undefined") return;
  if (!key) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export function clearStoredApiKey() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

const TORN_ERROR_CODES = {
  1: "Key is empty",
  2: "Incorrect key: Please check your Torn API key",
  3: "Wrong type",
  4: "Wrong fields",
  5: "Too many requests: Torn rate limit reached (100/min)",
  6: "Incorrect ID",
  7: "Incorrect ID-entity relation",
  8: "IP block: Your IP has been temporarily restricted by Torn",
  9: "API system is currently offline",
  10: "Key owner is in Federal Jail",
  11: "Key change error",
  12: "Key read error",
  13: "Key access level too low: Requires a key with log permissions",
  14: "Daily read limit reached",
  16: "Access level of this key is not high enough: The log selection in Torn City strictly requires a Full Access key.",
  17: "Backend error",
  18: "Paused key",
};

/**
 * Validate an API key by fetching basic user details
 */
export async function testApiKey(key) {
  const cleanedKey = key?.trim();
  if (!cleanedKey) {
    return { valid: false, error: "Please enter an API key" };
  }

  recordApiCall();
  try {
    const res = await fetch(`https://api.torn.com/user/?selections=basic&key=${cleanedKey}`);
    if (!res.ok) {
      return { valid: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data = await res.json();
    if (data.error) {
      const msg = TORN_ERROR_CODES[data.error.code] || data.error.error || "Invalid API key";
      return { valid: false, error: msg, code: data.error.code };
    }

    return {
      valid: true,
      player: {
        name: data.name,
        player_id: data.player_id,
        level: data.level,
        status: data.status?.state,
      },
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message || "Failed to reach Torn API (Check your internet or CORS connection)",
    };
  }
}

/**
 * Fetch user activity logs for specified time range
 */
export async function fetchUserLogs(apiKey, fromTimestamp, toTimestamp = null) {
  const cleanedKey = apiKey?.trim();
  if (!cleanedKey) {
    throw new Error("No API key provided");
  }

  recordApiCall();
  let url = `https://api.torn.com/user/?selections=log&key=${cleanedKey}&from=${fromTimestamp}`;
  if (toTimestamp) {
    url += `&to=${toTimestamp}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  if (data.error) {
    const msg = TORN_ERROR_CODES[data.error.code] || data.error.error || "Failed to fetch logs";
    const err = new Error(msg);
    err.code = data.error.code;
    throw err;
  }

  return data.log || {};
}

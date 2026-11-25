/**
 * Timezone and Date Utility for TornAbacus
 * Dual timezone support: TCT (Torn City Time = UTC) and User's detected Local Timezone
 */

export function getLocalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch (e) {
    return "UTC";
  }
}

export function getLocalTimezoneAbbr() {
  try {
    const tz = getLocalTimezone();
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value : tz;
  } catch {
    return "Local";
  }
}

/**
 * Format a unix timestamp (in seconds or ms) into dual time string:
 * "14:35 TCT • 20:05 Local"
 */
export function formatDualTime(unixTimestamp) {
  if (!unixTimestamp) return { tct: "--:--", local: "--:--" };
  
  // Convert seconds to ms if needed
  const tsMs = unixTimestamp < 1e11 ? unixTimestamp * 1000 : unixTimestamp;
  const date = new Date(tsMs);
  const localTz = getLocalTimezone();

  const tctDateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });

  const tctFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const localFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: localTz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    tct: `${tctFormatter.format(date)} TCT`,
    local: `${localFormatter.format(date)} Local`,
    dateFormatted: tctDateFormatter.format(date),
    dateTct: date.toISOString().slice(0, 10),
    fullString: `${tctDateFormatter.format(date)} ${tctFormatter.format(date)} TCT • ${localFormatter.format(date)} Local`,
  };
}

/**
 * Format live clock string: "HH:mm:ss"
 */
export function formatLiveClock(date = new Date()) {
  const localTz = getLocalTimezone();
  const tzAbbr = getLocalTimezoneAbbr();

  const tct = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: localTz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return {
    tct,
    local,
    tzAbbr,
    localTz,
  };
}

/**
 * Calculate preset start and end timestamps in UNIX seconds
 */
export function getTimeRangeTimestamps(preset, customStart = null, customEnd = null) {
  const now = new Date();
  const nowSec = Math.floor(now.getTime() / 1000);

  // Today in TCT (UTC midnight)
  const todayTctMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ) / 1000;

  switch (preset) {
    case "today":
      return {
        from: todayTctMidnight,
        to: nowSec,
        label: "Today (TCT)",
      };

    case "yesterday": {
      const yesterdayStart = todayTctMidnight - 86400;
      const yesterdayEnd = todayTctMidnight - 1;
      return {
        from: yesterdayStart,
        to: yesterdayEnd,
        label: "Yesterday (TCT)",
      };
    }

    case "last24h":
      return {
        from: nowSec - 86400,
        to: nowSec,
        label: "Last 24 Hours",
      };

    case "last7d":
      return {
        from: nowSec - 7 * 86400,
        to: nowSec,
        label: "Last 7 Days",
      };

    case "custom": {
      const from = customStart
        ? Math.floor(new Date(customStart).getTime() / 1000)
        : nowSec - 86400;
      const to = customEnd
        ? Math.floor(new Date(customEnd).setHours(23, 59, 59, 999) / 1000)
        : nowSec;
      return {
        from,
        to,
        label: "Custom Range",
      };
    }

    default:
      return {
        from: todayTctMidnight,
        to: nowSec,
        label: "Today (TCT)",
      };
  }
}

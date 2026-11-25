import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with commas and dollar sign ($1,234,567)
 */
export function formatMoney(amount, showSign = false) {
  if (amount === undefined || amount === null || isNaN(amount)) return "$0";
  const num = Math.round(Number(amount));
  const sign = showSign && num > 0 ? "+" : "";
  return `${sign}$${Math.abs(num).toLocaleString("en-US")}${num < 0 ? " (loss)" : ""}`;
}

export function formatCompactMoney(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "$0";
  const num = Number(amount);
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  
  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}$${abs.toLocaleString("en-US")}`;
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  if (value === undefined || value === null || isNaN(value)) return "0.0%";
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(1)}%`;
}

/**
 * Format integer numbers
 */
export function formatNumber(val) {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return Number(val).toLocaleString("en-US");
}

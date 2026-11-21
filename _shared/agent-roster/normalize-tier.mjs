/**
 * normalize-tier.mjs — Canonical tier resolution for agent-roster.
 *
 * Normalizes input tier names into canonical tiers:
 *   - "strong" (from "strong", "sdd-strong")
 *   - "mid" (from "mid", "sdd-mid")
 *   - "cheap" (from "cheap", "sdd-cheap", "flash")
 *   - "frontend" (from "frontend", maps nativeTier -> "strong")
 *
 * @param {string} tier
 * @returns {"strong" | "mid" | "cheap" | "frontend" | string}
 */
export function normalizeTier(tier) {
  if (!tier) return "cheap";
  const t = String(tier).toLowerCase().trim();
  if (t === "sdd-strong" || t === "strong") return "strong";
  if (t === "sdd-mid" || t === "mid") return "mid";
  if (t === "sdd-cheap" || t === "cheap" || t === "flash") return "cheap";
  if (t === "frontend") return "frontend";
  return t;
}

export function nativeTier(tier) {
  const norm = normalizeTier(tier);
  if (norm === "strong" || norm === "frontend") return "strong";
  if (norm === "mid") return "mid";
  if (norm === "cheap") return "cheap";
  return tier;
}

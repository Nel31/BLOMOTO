export function formatCfa(amount: number | string | null | undefined) {
  const n = typeof amount === "string" ? Number(amount) : amount ?? 0;
  const safe = Number.isFinite(n as number) ? (n as number) : 0;
  // Pas de séparateurs de milliers: "60000" (pas "60 000" / "60 000")
  return `${Math.round(safe)} CFA`;
}


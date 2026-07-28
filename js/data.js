// Model data — CNOOC (0883.HK) Brent sensitivity, calibrated on 17 quarters of HKEX filings
// Source: Kimi Global Investment Research report "Deconstructing the Brent Linkage" (Jul 2026), Section 5 & Section 8
window.MODEL = {
  // Brent (US$/bbl) -> [net profit RMB bn, special oil gain levy RMB bn]  — FY2025 operational base
  grid: [
    [60,  95.1, 0.1], [65, 110.0, 0.6], [70, 124.0, 2.2], [75, 137.0, 5.1],
    [80, 149.2, 9.3], [85, 161.0, 14.0], [90, 172.4, 19.3], [95, 183.5, 25.0],
    [100, 194.4, 31.0], [105, 205.1, 37.1], [110, 215.9, 43.2], [115, 226.7, 49.4],
    [120, 237.5, 55.5]
  ],
  uplift2026: 1.065,      // 2026E run-rate: guided volume growth (780-800mmboe) over FY2025
  sharesBn: 47.5,
  rmbToHkd: 1.087,
  levyThresholdBrent: 67.8,
  fy2025: { brent: 69.1, np: 122.1, eps: 2.57, dpsHkd: 1.28 },
  q1_2026: { brent: 76.0, np: 39.14 },          // actual
  fallbackBrent: 86.0,
  fallbackPx: 22.98
};

// Piecewise-linear interpolation of the FY2025 grid; clamps outside range
window.npAt = function (brent) {
  const g = window.MODEL.grid;
  if (brent <= g[0][0]) return { np: g[0][1], levy: g[0][2] };
  if (brent >= g[g.length - 1][0]) return { np: g[g.length - 1][1], levy: g[g.length - 1][2] };
  for (let i = 0; i < g.length - 1; i++) {
    const [b0, n0, l0] = g[i], [b1, n1, l1] = g[i + 1];
    if (brent >= b0 && brent <= b1) {
      const t = (brent - b0) / (b1 - b0);
      return { np: n0 + t * (n1 - n0), levy: l0 + t * (l1 - l0) };
    }
  }
};

// Scenario wrapper: base = '2025' (FY2025 actuals) or '2026' (2026E run-rate)
window.npAtBase = function (brent, base) {
  const r = window.npAt(brent);
  if (base === '2026') return { np: r.np * window.MODEL.uplift2026, levy: r.levy * window.MODEL.uplift2026 };
  return r;
};

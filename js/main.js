/* CNOOC 0883.HK — Brent-linked daily earnings & dividend calculator (v2) */
(function () {
  const M = window.MODEL;
  const $ = (id) => document.getElementById(id);
  const inShares = $('shares'), inBrent = $('brent'), inPayout = $('payout'), inPx = $('px');
  let base = '2025';

  const fmt = (x, d = 2) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmt0 = (x) => x.toLocaleString('en-US', { maximumFractionDigits: 0 });

  function compute() {
    const shares = Math.max(0, parseFloat(inShares.value) || 0);
    const brent = Math.min(120, Math.max(60, parseFloat(inBrent.value) || M.fallbackBrent));
    const payout = Math.min(100, Math.max(0, parseFloat(inPayout.value) || 45)) / 100;
    const px = parseFloat(inPx.value) || M.fallbackPx;

    const { np, levy } = window.npAtBase(brent, base);
    const eps = np / M.sharesBn;
    const dpsHkd = eps * payout * M.rmbToHkd;
    const earnYrRmb = eps * shares;
    const earnYrHkd = earnYrRmb * M.rmbToHkd;
    const divYrHkd = dpsHkd * shares;

    $('earnDay').textContent = 'HK$ ' + fmt0(earnYrHkd / 365);
    $('earnYr').textContent = 'HK$ ' + fmt0(earnYrHkd) + '  (RMB ' + fmt0(earnYrRmb) + ')';
    $('divDay').textContent = 'HK$ ' + fmt0(divYrHkd / 365);
    $('divYr').textContent = 'HK$ ' + fmt0(divYrHkd);
    $('yield').textContent = fmt((dpsHkd / px) * 100, 2) + ' %';
    $('totDay').textContent = 'HK$ ' + fmt0((earnYrHkd + divYrHkd) / 365);
    $('pxEcho').textContent = fmt(px, 2);
    draw(brent, shares, payout);
  }

  /* ── canvas chart ── */
  const cv = $('chart'), ctx = cv.getContext('2d');
  function draw(curBrent, shares, payout) {
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const pad = { l: 64, r: 24, t: 30, b: 42 };
    const x0 = 60, x1 = 120;
    const earn = (b) => window.npAtBase(b, base).np / M.sharesBn * shares * M.rmbToHkd / 365;
    const div = (b) => window.npAtBase(b, base).np / M.sharesBn * payout * shares * M.rmbToHkd / 365;
    const yMax = Math.max(earn(x1), 10) * 1.10;
    const X = (b) => pad.l + (b - x0) / (x1 - x0) * (W - pad.l - pad.r);
    const Y = (v) => H - pad.b - v / yMax * (H - pad.t - pad.b);

    ctx.font = '10px Menlo, monospace';
    // y grid
    const raw = yMax / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const yStep = mag * (raw / mag > 5 ? 5 : raw / mag > 2 ? 2 : 1);
    ctx.strokeStyle = '#eef1f6'; ctx.fillStyle = '#8595a6';
    for (let v = 0; v <= yMax; v += yStep) {
      ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(W - pad.r, Y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText('HK$' + fmt0(v), pad.l - 8, Y(v) + 3);
    }
    ctx.textAlign = 'center';
    for (let b = x0; b <= x1; b += 10) ctx.fillText(String(b), X(b), H - pad.b + 16);
    ctx.fillText('BRENT (US$/BBL) →', (pad.l + W - pad.r) / 2, H - 8);

    const line = (fn, color, dash, w) => {
      ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []);
      ctx.beginPath();
      for (let b = x0; b <= x1; b += 0.5) { const px = X(b), py = Y(fn(b)); b === x0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
      ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    };
    // ghost of the other base for comparison
    const otherBase = base === '2026' ? '2025' : '2026';
    line((b) => window.npAtBase(b, otherBase).np / M.sharesBn * shares * M.rmbToHkd / 365, '#c9d4e2', [2, 3], 1.5);
    line(earn, '#2251ff');
    line(div, '#7d9bff', [6, 4]);

    // Q1'26 actual anchor
    const q1Earn = M.q1_2026.np * 4 / M.sharesBn * shares * M.rmbToHkd / 365;
    if (base === '2026') {
      ctx.fillStyle = '#008a6d'; ctx.beginPath(); ctx.arc(X(M.q1_2026.brent), Y(q1Earn), 4.5, 0, 7); ctx.fill();
      ctx.font = 'bold 10px Menlo, monospace'; ctx.textAlign = 'left';
      ctx.fillText("Q1'26 ACTUAL", X(M.q1_2026.brent) + 8, Y(q1Earn) - 8);
    }

    // live Brent marker
    const cb = Math.min(x1, Math.max(x0, curBrent));
    ctx.strokeStyle = '#051c2c'; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(X(cb), pad.t); ctx.lineTo(X(cb), H - pad.b); ctx.stroke(); ctx.setLineDash([]);
    const dot = (v, color, label, dy) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(cb), Y(v), 4, 0, 7); ctx.fill();
      ctx.font = 'bold 11px Menlo, monospace'; ctx.textAlign = cb > 98 ? 'right' : 'left';
      ctx.fillText(label, X(cb) + (cb > 98 ? -10 : 10), Y(v) + dy);
    };
    dot(earn(cb), '#2251ff', 'EARN HK$' + fmt0(earn(cb)) + '/DAY', -8);
    dot(div(cb), '#7d9bff', 'DIV HK$' + fmt0(div(cb)) + '/DAY', 17);

    // legend
    ctx.font = '10px Menlo, monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = '#2251ff'; ctx.fillText('— EARNINGS / DAY (' + (base === '2026' ? '2026E' : 'FY2025') + ' BASE)', pad.l + 8, pad.t - 9);
    ctx.fillStyle = '#7d9bff'; ctx.fillText('- - DIVIDEND / DAY', pad.l + 300, pad.t - 9);
    ctx.fillStyle = '#c9d4e2'; ctx.fillText('·· OTHER BASE', pad.l + 470, pad.t - 9);
  }

  /* ── live quotes (stooq CSV; CORS-enabled) ── */
  async function stooq(sym, timeoutMs) {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), timeoutMs || 6000);
    const r = await fetch('https://stooq.com/q/l/?s=' + sym + '&f=sd2t2ohlcv&h&e=csv', { cache: 'no-store', signal: ac.signal });
    clearTimeout(to);
    const cols = (await r.text()).trim().split('\n')[1].split(',');
    const close = parseFloat(cols[6]);
    if (!isFinite(close) || close <= 0) throw new Error('bad quote');
    return { close: close, ts: cols[1] + ' ' + (cols[2] || '') };
  }

  async function fetchBrent() {
    const tag = $('quoteTag');
    try {
      const q = await stooq('bz.f');
      $('brentNow').textContent = fmt(q.close, 2);
      $('brentTs').textContent = q.ts + ' · stooq BZ.F front month';
      tag.textContent = 'LIVE'; tag.className = 'pill live';
      inBrent.value = q.close.toFixed(1);
    } catch (e) {
      $('brentNow').textContent = fmt(parseFloat(inBrent.value) || M.fallbackBrent, 2);
      $('brentTs').textContent = 'fallback · last verified 28 Jul 2026 ≈ US$86–88';
      tag.textContent = 'OFFLINE — FALLBACK'; tag.className = 'pill stale';
    }
    compute();
  }

  async function fetchPx() {
    const tag = $('pxTag');
    try {
      const q = await stooq('0883.hk');
      $('pxNow').textContent = fmt(q.close, 2);
      $('pxTs').textContent = q.ts + ' · stooq 0883.HK';
      tag.textContent = 'LIVE'; tag.className = 'pill live';
      inPx.value = q.close.toFixed(2);
    } catch (e) {
      tag.textContent = 'WIND 28 JUL';
      tag.className = 'pill stale';
    }
    compute();
  }

  function fetchAll() { fetchBrent(); fetchPx(); }

  document.querySelectorAll('#baseSeg button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#baseSeg button').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); base = b.dataset.base; compute();
  }));
  [inShares, inBrent, inPayout, inPx].forEach(el => el.addEventListener('input', compute));
  $('refreshBtn').addEventListener('click', fetchAll);
  window.addEventListener('resize', compute);
  compute();          // render immediately with fallbacks, live quotes update when they land
  fetchAll();
})();

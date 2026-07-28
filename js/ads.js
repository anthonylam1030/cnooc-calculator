/* Ad integration — Google AdSense
 * HOW TO GO LIVE:
 *  1. Apply at https://adsense.google.com and get your site approved
 *     (requires a publicly accessible domain you own).
 *  2. Fill in your publisher ID and slot IDs below.
 *  3. The loader below injects the AdSense script and renders the units;
 *     until configured, the page shows neutral placeholder boxes.
 */
window.ADSENSE_CLIENT = '';          // e.g. 'ca-pub-1234567890123456'
window.ADSENSE_SLOT_TOP = '';        // leaderboard unit id
window.ADSENSE_SLOT_MID = '';        // in-content responsive unit id

(function () {
  if (!window.ADSENSE_CLIENT) return;   // placeholders stay

  // inject AdSense loader once
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + window.ADSENSE_CLIENT;
  document.head.appendChild(s);

  const render = (hostId, slotId, format) => {
    if (!slotId) return;
    const host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = '';
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', window.ADSENSE_CLIENT);
    ins.setAttribute('data-ad-slot', slotId);
    if (format === 'responsive') {
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
    } else {
      ins.style.width = '728px'; ins.style.height = '90px';
    }
    host.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  };

  render('adTop', window.ADSENSE_SLOT_TOP, 'leaderboard');
  render('adMid', window.ADSENSE_SLOT_MID, 'responsive');
})();

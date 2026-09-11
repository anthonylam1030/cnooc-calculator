import fs from 'fs';
import vm from 'vm';
const js=fs.readFileSync(new URL('./public/app.js',import.meta.url),'utf8');
new vm.Script(js);
const html=fs.readFileSync(new URL('./public/index.html',import.meta.url),'utf8');
for (const id of ['stockPrice','brentPrice','annualProfit','earningsChart','segmentChart','gasProfitChart','sensitivityTable','historyTable']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing ${id}`);
}
console.log('syntax and required DOM ids: ok');

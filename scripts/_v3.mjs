import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 30000 });
await p.waitForTimeout(900);
const m = await p.evaluate(() => {
  const h = document.querySelector('.fs-header');
  const stats = [...document.querySelectorAll('section')].find(s => s.textContent.includes('Open roles'));
  return { headerHeight: h?.offsetHeight, statsTop: stats ? Math.round(stats.getBoundingClientRect().top) : null, vh: window.innerHeight };
});
console.log('measure:', JSON.stringify(m));
await p.screenshot({ path: 'scripts/_v3.png' });
await b.close();

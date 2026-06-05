import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1340, height: 900 } });
await p.goto('http://localhost:3000/talent-staffing', { waitUntil:'load', timeout:30000 });
await p.evaluate(()=>{const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0 && e.textContent.trim()==='Specialisms'); if(el) el.scrollIntoView({block:'center'});});
await p.waitForTimeout(700);
await p.screenshot({ path:'scripts/_lt.png', clip:{x:0,y:120,width:1340,height:360} });
await b.close(); console.log('done');

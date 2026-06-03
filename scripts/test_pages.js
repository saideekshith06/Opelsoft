const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/jobs',
  'http://localhost:3000/dashboard/candidate',
  'http://localhost:3000/dashboard/employer',
  'http://localhost:3000/about-us',
  'http://localhost:3000/contact-us',
  'http://localhost:3000/login',
  'http://localhost:3000/register'
];

async function checkPages() {
  console.log('--- CHECKING WEB APP PAGE STATUSES ---');
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'GET' });
      console.log(`${url} -> status ${res.status}`);
      if (res.status !== 200) {
        console.error(`✕ Error on ${url}: Returned status ${res.status}`);
      }
    } catch (err) {
      console.error(`✕ Connection failed on ${url}: ${err.message}`);
    }
  }
}

checkPages();

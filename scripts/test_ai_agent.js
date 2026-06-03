const mysql = require('mysql2/promise');
const fs = require('fs');

// Parse .env.local file to load credentials
if (fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    process.env[key] = value;
  });
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'opelsoft',
};

async function testAiAgentFlow() {
  console.log('--- STARTING AUTOMATED AI AGENT WORKFLOW TESTING ---');
  
  const base_url = 'http://localhost:3000';
  
  let cookieString = '';

  const getJson = async (url) => {
    const res = await fetch(url, {
      headers: cookieString ? { 'Cookie': cookieString } : {}
    });
    return { status: res.status, data: await res.json() };
  };

  const postJson = async (url, data) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieString ? { 'Cookie': cookieString } : {})
      },
      body: JSON.stringify(data)
    });
    return { status: res.status, data: await res.json() };
  };

  const deleteJson = async (url) => {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: cookieString ? { 'Cookie': cookieString } : {}
    });
    return { status: res.status, data: await res.json() };
  };

  try {
    // 0. Log in to establish session
    console.log('\nStep 0: Establishing authenticated session for test...');
    const loginRes = await fetch(`${base_url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: 'linkedin-Nilanjana', password: 'password123' })
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error(`Login API returned success=false: ${loginData.message}`);
    }
    
    const rawCookies = loginRes.headers.getSetCookie 
      ? loginRes.headers.getSetCookie() 
      : [loginRes.headers.get('set-cookie')];
      
    const sessionCookie = rawCookies.find(c => c && c.startsWith('opelsoft_session='));
    if (!sessionCookie) {
      throw new Error('Session cookie not issued on login.');
    }
    cookieString = sessionCookie.split(';')[0];
    console.log('✓ Logged in as test user. Cookie obtained successfully.');

    // 1. Get initial agent config
    console.log('\nStep 1: Testing agent config fetching (/api/ai-agent/config)...');
    const configGet = await getJson(`${base_url}/api/ai-agent/config`);
    console.log('Response Status:', configGet.status);
    console.log('Response Data:', configGet.data);
    if (!configGet.data.success) {
      throw new Error('Config fetching failed.');
    }
    console.log('✓ Agent config fetch works successfully!');

    // 2. Save agent config
    console.log('\nStep 2: Testing agent config saving (/api/ai-agent/config)...');
    const testConfig = {
      status: 'active',
      preferred_roles: ['Software Engineer', 'React Developer', 'Fullstack Engineer'],
      target_locations: ['London', 'Remote'],
      target_salary: '45000',
      min_match_score: 75,
      slack_webhook_url: 'https://hooks.slack.com/services/mock/token',
      telegram_chat_id: '999888777',
      discord_webhook_url: 'https://discord.com/api/webhooks/mock/token'
    };
    
    const configSave = await postJson(`${base_url}/api/ai-agent/config`, testConfig);
    console.log('Response Status:', configSave.status);
    console.log('Response Data:', configSave.data);
    if (!configSave.data.success) {
      throw new Error('Config saving failed.');
    }
    console.log('✓ Agent config saving works successfully!');

    // 3. Register target career sources
    console.log('\nStep 3: Testing career source registration (/api/ai-agent/sources)...');
    const mockSource = { url: 'https://boards.greenhouse.io/openai' };
    const sourceAdd = await postJson(`${base_url}/api/ai-agent/sources`, mockSource);
    console.log('Response Status:', sourceAdd.status);
    console.log('Response Data:', sourceAdd.data);
    if (!sourceAdd.data.success) {
      throw new Error('Source registration failed.');
    }
    console.log('✓ Career source registration works successfully!');
    const addedSourceId = sourceAdd.data.source.id;

    // 4. Run the scraper & matcher pipeline
    console.log('\nStep 4: Testing scraper and matcher pipeline run (/api/ai-agent/run)...');
    const runRes = await postJson(`${base_url}/api/ai-agent/run`, {});
    console.log('Response Status:', runRes.status);
    console.log('Logs Count:', runRes.data.logs.length);
    console.log('Matches Found Count:', runRes.data.matches ? runRes.data.matches.length : 0);
    if (!runRes.data.success) {
      throw new Error('Agent run failed.');
    }
    console.log('✓ Scraper and matching pipeline ran successfully!');

    // 5. Query matches list
    console.log('\nStep 5: Testing matches list fetching (/api/ai-agent/matches)...');
    const matchesGet = await getJson(`${base_url}/api/ai-agent/matches`);
    console.log('Response Status:', matchesGet.status);
    console.log('Matches Returned:', matchesGet.data.matches.length);
    if (!matchesGet.data.success) {
      throw new Error('Matches list fetching failed.');
    }
    console.log('✓ Matches list fetching works successfully!');

    // 6. Delete target career source
    console.log('\nStep 6: Testing career source deletion (/api/ai-agent/sources)...');
    const sourceDel = await deleteJson(`${base_url}/api/ai-agent/sources?id=${addedSourceId}`);
    console.log('Response Status:', sourceDel.status);
    console.log('Response Data:', sourceDel.data);
    if (!sourceDel.data.success) {
      throw new Error('Source deletion failed.');
    }
    console.log('✓ Career source deletion works successfully!');

    // 7. Cleanup DB Matches and Configs created in test
    console.log('\nStep 7: Cleaning up mock test records from database...');
    const conn = await mysql.createConnection(dbConfig);
    // Find candidate user ID
    const [users] = await conn.query("SELECT id FROM new_users WHERE role = 'candidate' LIMIT 1");
    const userId = users[0].id;
    
    await conn.query('DELETE FROM new_ai_matches WHERE user_id = ?', [userId]);
    await conn.query('DELETE FROM new_ai_discovered_jobs WHERE id NOT IN (SELECT discovered_job_id FROM new_ai_matches)');
    console.log('Cleanup completed.');
    await conn.end();

    console.log('\n✓ ALL AI AGENT WORKFLOW TESTS PASSED SUCCESSFULLY! The Agent Platform backend is fully functional.');

  } catch (err) {
    console.error('\n✕ TEST AI AGENT FAILED:', err.message);
    process.exit(1);
  }
}

testAiAgentFlow();

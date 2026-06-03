const fs = require('fs');

const base_url = 'http://localhost:3000';

async function runAuthTests() {
  console.log('--- STARTING AUTHENTICATION PIPELINE VALIDATION ---');
  
  const testUsername = `testuser_${Math.floor(Math.random() * 100000)}`;
  const testEmail = `${testUsername}@opelsoft.com`;
  const testPassword = 'TestPassword123!';

  try {
    // 1. Test Registration
    console.log('\nStep 1: Testing User Registration (/api/auth/register)...');
    const registerRes = await fetch(`${base_url}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: testPassword,
        role: 'candidate'
      })
    });
    
    console.log('Status:', registerRes.status);
    const registerData = await registerRes.json();
    console.log('Data:', registerData);
    
    if (registerRes.status !== 200 || !registerData.success) {
      throw new Error('Registration failed.');
    }
    
    // Extract session cookie from headers
    const rawCookies = registerRes.headers.getSetCookie 
      ? registerRes.headers.getSetCookie() 
      : [registerRes.headers.get('set-cookie')];
      
    const sessionCookie = rawCookies.find(c => c && c.startsWith('opelsoft_session='));
    if (!sessionCookie) {
      throw new Error('Session cookie not issued on registration.');
    }
    console.log('✓ Registration passed. Cookie issued successfully.');
    
    // Parse pure cookie name/value
    const cookieString = sessionCookie.split(';')[0];
    
    // 2. Test Fetching authenticated details (Me endpoint)
    console.log('\nStep 2: Testing Session Validation (/api/auth/me)...');
    const meRes = await fetch(`${base_url}/api/auth/me`, {
      method: 'GET',
      headers: { 
        'Cookie': cookieString
      }
    });
    
    console.log('Status:', meRes.status);
    const meData = await meRes.json();
    console.log('Data:', meData);
    
    if (meRes.status !== 200 || !meData.success || meData.user.username !== testUsername) {
      throw new Error('Session validation failed.');
    }
    console.log('✓ Session verification passed. Authenticated user match confirmed.');

    // 3. Test Login
    console.log('\nStep 3: Testing Login with correct credentials (/api/auth/login)...');
    const loginRes = await fetch(`${base_url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: testUsername,
        password: testPassword
      })
    });
    
    console.log('Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Data:', loginData);
    
    if (loginRes.status !== 200 || !loginData.success) {
      throw new Error('Login failed with correct credentials.');
    }
    console.log('✓ Login passed successfully.');

    // 4. Test Login with incorrect credentials
    console.log('\nStep 4: Testing Login with incorrect password...');
    const badLoginRes = await fetch(`${base_url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: testUsername,
        password: 'WrongPassword!'
      })
    });
    
    console.log('Status:', badLoginRes.status);
    const badLoginData = await badLoginRes.json();
    console.log('Data:', badLoginData);
    
    if (badLoginRes.status === 200 || badLoginData.success) {
      throw new Error('Security vulnerability: Login succeeded with wrong password.');
    }
    console.log('✓ Security check passed. Rejected invalid login credentials.');

    // 5. Test Logout
    console.log('\nStep 5: Testing Session Termination (/api/auth/logout)...');
    const logoutRes = await fetch(`${base_url}/api/auth/logout`, {
      method: 'POST'
    });
    
    console.log('Status:', logoutRes.status);
    const logoutData = await logoutRes.json();
    console.log('Data:', logoutData);
    
    if (logoutRes.status !== 200 || !logoutData.success) {
      throw new Error('Session termination failed.');
    }
    console.log('✓ Session cleared successfully.');
    
    console.log('\n✓ ALL AUTHENTICATION FLOW TESTS COMPLETED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n✕ AUTHENTICATION TEST FAILED:', err.message);
    process.exit(1);
  }
}

runAuthTests();

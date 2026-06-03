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

async function testHiringFlow() {
  console.log('--- STARTING AUTOMATED FLOW TESTING ---');
  
  // 1. Setup fetch client or use basic node http requests
  const base_url = 'http://localhost:3000';
  
  const postJson = async (url, data) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { status: res.status, data: await res.json() };
  };

  try {
    // 2. Test Employer Job Creation Endpoint
    console.log('\nStep 1: Testing job posting endpoint (/api/jobs/create)...');
    const testJob = {
      title: 'Automated Test Engineer ' + new Date().toLocaleTimeString(),
      description: '<p>Opelsoft automated test engineer position for verifying Next.js routes.</p>',
      requirements: 'Must know Next.js, Node.js, and MySQL integration.',
      job_type: 'Full-time',
      industry: 'Technology',
      salary_package: '45000-50000',
      experience: '2-years',
      city: 'London',
      country: 'United Kingdom'
    };
    
    const postRes = await postJson(`${base_url}/api/jobs/create`, testJob);
    console.log('Response Status:', postRes.status);
    console.log('Response Data:', postRes.data);
    
    if (!postRes.data.success) {
      throw new Error('Job creation failed.');
    }
    console.log('✓ Job posting works successfully!');

    // 3. Connect to DB to check and get job ID
    const conn = await mysql.createConnection(dbConfig);
    const [jobs] = await conn.query('SELECT id, title FROM new_jobs ORDER BY id DESC LIMIT 1');
    if (jobs.length === 0) {
      throw new Error('No jobs found in database.');
    }
    const createdJob = jobs[0];
    console.log(`Retrieved newly created job from database: ID=${createdJob.id}, Title="${createdJob.title}"`);

    // 4. Test Candidate Application Endpoint
    console.log('\nStep 2: Testing candidate application endpoint (/api/jobs/apply)...');
    const appData = {
      jobId: createdJob.id,
      coverLetter: 'I am highly interested in the Automated Test position. I have extensive experience in node.',
      cvUrl: 'https://placeholder.com/automated_test_resume.pdf'
    };
    
    const applyRes = await postJson(`${base_url}/api/jobs/apply`, appData);
    console.log('Response Status:', applyRes.status);
    console.log('Response Data:', applyRes.data);
    
    if (!applyRes.data.success) {
      throw new Error('Candidate application failed.');
    }
    console.log('✓ Candidate job application works successfully!');

    // 5. Query the newly created job application from database
    const [apps] = await conn.query('SELECT id, status FROM new_job_applications ORDER BY id DESC LIMIT 1');
    if (apps.length === 0) {
      throw new Error('No job applications found in database.');
    }
    const createdApp = apps[0];
    console.log(`Retrieved job application from database: ID=${createdApp.id}, Status="${createdApp.status}"`);

    // 6. Test Employer Applicant Pipeline Status Update Endpoint
    console.log('\nStep 3: Testing hiring status update endpoint (/api/applications/status)...');
    const updateData = {
      applicationId: createdApp.id,
      status: 'shortlisted'
    };
    
    const updateRes = await postJson(`${base_url}/api/applications/status`, updateData);
    console.log('Response Status:', updateRes.status);
    console.log('Response Data:', updateRes.data);
    
    if (!updateRes.data.success) {
      throw new Error('Hiring status update failed.');
    }
    console.log('✓ Employer hiring status update works successfully!');

    // 7. Verify status change in DB
    const [finalApp] = await conn.query('SELECT status FROM new_job_applications WHERE id = ?', [createdApp.id]);
    console.log(`Final application status in DB: "${finalApp[0].status}"`);
    if (finalApp[0].status !== 'shortlisted') {
      throw new Error('Application status mismatch in database.');
    }
    
    console.log('\nStep 4: Cleaning up mock test records from database...');
    await conn.query('DELETE FROM new_job_applications WHERE id = ?', [createdApp.id]);
    await conn.query('DELETE FROM new_jobs WHERE id = ?', [createdJob.id]);
    console.log('Cleanup completed.');
    
    await conn.end();
    console.log('\n✓ ALL FLOW TESTS PASSED SUCCESSFULLY! The portal backend is fully functional.');

  } catch (err) {
    console.error('\n✕ TEST FLOW FAILED:', err.message);
    process.exit(1);
  }
}

testHiringFlow();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}


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
  multipleStatements: true
};

// PHP Serializer Parser Helper
function parsePhpSerialize(str) {
  if (!str) return null;
  let idx = 0;
  function parse() {
    if (idx >= str.length) return null;
    const type = str[idx];
    idx += 2; // skip type and colon
    if (type === 's') {
      const endLen = str.indexOf(':', idx);
      const len = parseInt(str.substring(idx, endLen), 10);
      idx = endLen + 2; // skip length, colon and quote
      const val = str.substring(idx, idx + len);
      idx += len + 2; // skip string and quote and semicolon
      return val;
    } else if (type === 'i' || type === 'd') {
      const endVal = str.indexOf(';', idx);
      const val = parseFloat(str.substring(idx, endVal));
      idx = endVal + 1; // skip semicolon
      return val;
    } else if (type === 'b') {
      const endVal = str.indexOf(';', idx);
      const val = str.substring(idx, endVal) === '1';
      idx = endVal + 1; // skip semicolon
      return val;
    } else if (type === 'a') {
      const endLen = str.indexOf(':', idx);
      const len = parseInt(str.substring(idx, endLen), 10);
      idx = endLen + 2; // skip length, colon and open brace
      const obj = {};
      const arr = [];
      let isArr = true;
      for (let i = 0; i < len; i++) {
        const key = parse();
        const val = parse();
        obj[key] = val;
        if (typeof key !== 'number' && key !== String(i)) {
          isArr = false;
        }
        arr.push(val);
      }
      idx += 1; // skip closing brace
      return isArr ? arr : obj;
    } else if (type === 'N') {
      return null;
    }
    return null;
  }
  try {
    return parse();
  } catch (e) {
    return null;
  }
}

function sanitizeDate(val) {
  if (!val) return new Date();
  if (val === '0000-00-00 00:00:00' || val === '0000-00-00') return new Date();
  
  let d;
  if (val instanceof Date) {
    d = val;
  } else {
    // If it's a timestamp in seconds
    if (typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val))) {
      d = new Date(parseInt(val, 10) * 1000);
    } else {
      d = new Date(val);
    }
  }
  
  if (isNaN(d.getTime())) {
    return new Date();
  }
  return d;
}

async function run() {
  console.log('Connecting to database...');
  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected!');

  try {
    // 1. Run schema.sql
    console.log('Initializing relational tables...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(schemaSql);
    console.log('Relational tables initialized!');

    // Clean existing records in the new tables to avoid duplicate key errors on rerun
    console.log('Clearing old migration records...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    await conn.query('TRUNCATE TABLE new_job_applications;');
    await conn.query('TRUNCATE TABLE new_transactions;');
    await conn.query('TRUNCATE TABLE new_jobs;');
    await conn.query('TRUNCATE TABLE new_candidate_profiles;');
    await conn.query('TRUNCATE TABLE new_employer_profiles;');
    await conn.query('TRUNCATE TABLE new_users;');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Old records cleared.');

    // 2. Query WordPress users and usermeta
    console.log('Querying WordPress users...');
    const [wpUsers] = await conn.query('SELECT ID, user_login, user_email, user_pass, user_registered FROM jtj_users');
    const [wpUserMeta] = await conn.query('SELECT user_id, meta_key, meta_value FROM jtj_usermeta');

    // Group usermeta by user ID
    const userMetaMap = {};
    wpUserMeta.forEach(row => {
      if (!userMetaMap[row.user_id]) {
        userMetaMap[row.user_id] = {};
      }
      // Handle multiple values for the same key (push to array if key exists)
      if (userMetaMap[row.user_id][row.meta_key]) {
        if (!Array.isArray(userMetaMap[row.user_id][row.meta_key])) {
          userMetaMap[row.user_id][row.meta_key] = [userMetaMap[row.user_id][row.meta_key]];
        }
        userMetaMap[row.user_id][row.meta_key].push(row.meta_value);
      } else {
        userMetaMap[row.user_id][row.meta_key] = row.meta_value;
      }
    });

    const userWpToNewIdMap = {};
    const usernameToNewIdMap = {};

    console.log(`Migrating ${wpUsers.length} users...`);
    for (const wpUser of wpUsers) {
      const meta = userMetaMap[wpUser.ID] || {};
      
      // Determine user role
      let role = 'candidate';
      const capStr = meta['jtj_capabilities'] || '';
      if (capStr.includes('administrator')) {
        role = 'admin';
      } else if (capStr.includes('subscriber')) {
        // Subscribers in this database could be candidates or employers.
        // If they have candidate CV or wishlist fields, let's treat them as candidates.
        role = 'candidate';
      } else if (capStr.includes('cs_candidate')) {
        role = 'candidate';
      }

      const regDate = sanitizeDate(wpUser.user_registered);

      // Insert user (pre-hashed with scrypt for development)
      const hashedPassword = hashPassword('password123');
      const [insertUserResult] = await conn.query(
        'INSERT INTO new_users (wp_user_id, username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [wpUser.ID, wpUser.user_login, wpUser.user_email, hashedPassword, role, regDate]
      );
      
      const newUserId = insertUserResult.insertId;
      userWpToNewIdMap[wpUser.ID] = newUserId;
      usernameToNewIdMap[wpUser.user_login.toLowerCase()] = newUserId;

      // Create profile details based on role
      if (role === 'candidate') {
        const skillsVal = meta['cs_skill_title'] 
          ? (Array.isArray(meta['cs_skill_title']) ? meta['cs_skill_title'] : [meta['cs_skill_title']])
          : [];
        const skillsPerc = meta['cs_skill_percentage']
          ? (Array.isArray(meta['cs_skill_percentage']) ? meta['cs_skill_percentage'] : [meta['cs_skill_percentage']])
          : [];
        const skillsArray = skillsVal.map((name, i) => ({ name, percentage: parseInt(skillsPerc[i] || '100', 10) }));

        // Edu
        const eduTitles = meta['cs_edu_title'] ? (Array.isArray(meta['cs_edu_title']) ? meta['cs_edu_title'] : [meta['cs_edu_title']]) : [];
        const eduInstitutes = meta['cs_edu_institute'] ? (Array.isArray(meta['cs_edu_institute']) ? meta['cs_edu_institute'] : [meta['cs_edu_institute']]) : [];
        const eduFroms = meta['cs_edu_from_date'] ? (Array.isArray(meta['cs_edu_from_date']) ? meta['cs_edu_from_date'] : [meta['cs_edu_from_date']]) : [];
        const eduTos = meta['cs_edu_to_date'] ? (Array.isArray(meta['cs_edu_to_date']) ? meta['cs_edu_to_date'] : [meta['cs_edu_to_date']]) : [];
        const eduDescs = meta['cs_edu_desc'] ? (Array.isArray(meta['cs_edu_desc']) ? meta['cs_edu_desc'] : [meta['cs_edu_desc']]) : [];
        const education = eduTitles.map((title, i) => ({
          title,
          institute: eduInstitutes[i] || '',
          from: eduFroms[i] || '',
          to: eduTos[i] || '',
          description: eduDescs[i] || ''
        }));

        // Exp
        const expTitles = meta['cs_exp_title'] ? (Array.isArray(meta['cs_exp_title']) ? meta['cs_exp_title'] : [meta['cs_exp_title']]) : [];
        const expCompanies = meta['cs_exp_company'] ? (Array.isArray(meta['cs_exp_company']) ? meta['cs_exp_company'] : [meta['cs_exp_company']]) : [];
        const expFroms = meta['cs_exp_from_date'] ? (Array.isArray(meta['cs_exp_from_date']) ? meta['cs_exp_from_date'] : [meta['cs_exp_from_date']]) : [];
        const expTos = meta['cs_exp_to_date'] ? (Array.isArray(meta['cs_exp_to_date']) ? meta['cs_exp_to_date'] : [meta['cs_exp_to_date']]) : [];
        const expDescs = meta['cs_exp_desc'] ? (Array.isArray(meta['cs_exp_desc']) ? meta['cs_exp_desc'] : [meta['cs_exp_desc']]) : [];
        const experience = expTitles.map((title, i) => ({
          title,
          company: expCompanies[i] || '',
          from: expFroms[i] || '',
          to: expTos[i] || '',
          description: expDescs[i] || ''
        }));

        const social = {
          facebook: meta['cs_facebook'] || '',
          twitter: meta['cs_twitter'] || '',
          linkedin: meta['cs_linkedin'] || ''
        };

        await conn.query(
          'INSERT INTO new_candidate_profiles (user_id, job_title, phone_number, minimum_salary, cover_letter, cv_url, skills, education, experience, social_links) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newUserId,
            meta['cs_job_title'] || '',
            meta['cs_phone_number'] || '',
            meta['cs_minimum_salary'] || '',
            meta['cs_cover_letter'] || '',
            meta['cs_candidate_cv'] || '',
            JSON.stringify(skillsArray),
            JSON.stringify(education),
            JSON.stringify(experience),
            JSON.stringify(social)
          ]
        );
      } else {
        // Admin or Employer Profile
        const social = {
          facebook: meta['cs_facebook'] || '',
          twitter: meta['cs_twitter'] || '',
          linkedin: meta['cs_linkedin'] || ''
        };

        const companyName = meta['billing_company'] || wpUser.user_login + ' Inc.';
        const companyAddress = meta['cs_post_comp_address'] || meta['cs_post_loc_address'] || '';

        await conn.query(
          'INSERT INTO new_employer_profiles (user_id, company_name, phone_number, company_address, logo_url, description, social_links) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            newUserId,
            companyName,
            meta['cs_phone_number'] || '',
            companyAddress,
            meta['user_img'] || '',
            meta['description'] || '',
            JSON.stringify(social)
          ]
        );
      }
    }
    console.log('Users migration finished.');

    // 3. Query jobs and metadata
    console.log('Querying WordPress jobs...');
    const [wpJobs] = await conn.query("SELECT ID, post_title, post_content, post_date FROM jtj_posts WHERE post_type = 'jobs' AND post_status = 'publish'");
    const [wpJobMeta] = await conn.query("SELECT post_id, meta_key, meta_value FROM jtj_postmeta WHERE post_id IN (SELECT ID FROM jtj_posts WHERE post_type = 'jobs')");

    // Group jobmeta by post ID
    const jobMetaMap = {};
    wpJobMeta.forEach(row => {
      if (!jobMetaMap[row.post_id]) {
        jobMetaMap[row.post_id] = {};
      }
      jobMetaMap[row.post_id][row.meta_key] = row.meta_value;
    });

    console.log(`Migrating ${wpJobs.length} jobs...`);
    for (const wpJob of wpJobs) {
      const meta = jobMetaMap[wpJob.ID] || {};

      // Handle employer mapping (cs_job_username)
      let employerUsername = (meta['cs_job_username'] || '').trim();
      let employerId = null;

      if (employerUsername) {
        let lookupKey = employerUsername.toLowerCase();
        if (usernameToNewIdMap[lookupKey]) {
          employerId = usernameToNewIdMap[lookupKey];
        } else {
          // Employer does not exist in new_users. We must create a placeholder employer to satisfy relational constraint.
          console.log(`Creating placeholder employer: "${employerUsername}"`);
          const placeholderEmail = `${employerUsername.replace(/\s+/g, '')}@placeholder.com`;
          const dummyHash = '$2b$10$placeholderpasswordhashforsecurity12345'; // dummy hash
          
          try {
            const [insertPlaceholderResult] = await conn.query(
              'INSERT INTO new_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
              [employerUsername, placeholderEmail, dummyHash, 'employer']
            );
            employerId = insertPlaceholderResult.insertId;
            usernameToNewIdMap[lookupKey] = employerId;

            // Also create employer profile for them
            await conn.query(
              'INSERT INTO new_employer_profiles (user_id, company_name, phone_number, company_address, logo_url, description) VALUES (?, ?, ?, ?, ?, ?)',
              [
                employerId,
                employerUsername.charAt(0).toUpperCase() + employerUsername.slice(1) + ' Ltd',
                '',
                meta['cs_post_comp_address'] || meta['cs_post_loc_address'] || '',
                meta['user_img'] || '',
                'Migrated placeholder employer account.'
              ]
            );
          } catch (err) {
            // In case of race conditions or duplicate entries, query again
            const [existing] = await conn.query('SELECT id FROM new_users WHERE username = ?', [employerUsername]);
            if (existing && existing.length > 0) {
              employerId = existing[0].id;
              usernameToNewIdMap[lookupKey] = employerId;
            }
          }
        }
      }

      // Format fields
      const closingDate = meta['cs_application_closing_date'] ? sanitizeDate(meta['cs_application_closing_date']) : null;
      const status = meta['cs_job_status'] || 'active';

      const latitude = meta['cs_post_loc_latitude'] ? parseFloat(meta['cs_post_loc_latitude']) : null;
      const longitude = meta['cs_post_loc_longitude'] ? parseFloat(meta['cs_post_loc_longitude']) : null;

      await conn.query(
        'INSERT INTO new_jobs (wp_job_id, employer_id, title, description, requirements, job_type, industry, qualification, experience, salary_package, gender, address, city, country, latitude, longitude, closing_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          wpJob.ID,
          employerId,
          wpJob.post_title,
          wpJob.post_content,
          meta['cs_job_desc'] || '',
          meta['Jobtype'] || 'Full-time',
          meta['industry'] || 'Technology',
          meta['qualification'] || '',
          meta['experiencetotal'] || '',
          meta['salarypackage'] || '',
          meta['gender'] || '',
          meta['cs_post_loc_address'] || '',
          meta['cs_post_loc_city'] || '',
          meta['cs_post_loc_country'] || '',
          latitude,
          longitude,
          closingDate,
          status,
          sanitizeDate(wpJob.post_date)
        ]
      );
    }
    console.log('Jobs migration finished.');

    // 4. Migrate transactions
    console.log('Querying transactions...');
    const [wpTransactions] = await conn.query("SELECT ID, post_title, post_date FROM jtj_posts WHERE post_type = 'cs-transactions'");
    const [wpTransMeta] = await conn.query("SELECT post_id, meta_key, meta_value FROM jtj_postmeta WHERE post_id IN (SELECT ID FROM jtj_posts WHERE post_type = 'cs-transactions')");

    // Group transmeta by post ID
    const transMetaMap = {};
    wpTransMeta.forEach(row => {
      if (!transMetaMap[row.post_id]) {
        transMetaMap[row.post_id] = {};
      }
      transMetaMap[row.post_id][row.meta_key] = row.meta_value;
    });

    console.log(`Migrating ${wpTransactions.length} transactions...`);
    for (const wpTrans of wpTransactions) {
      const meta = transMetaMap[wpTrans.ID] || {};

      const oldWpUserId = parseInt(meta['cs_transaction_user'] || '0', 10);
      const newUserId = userWpToNewIdMap[oldWpUserId] || null;

      const packageName = meta['cs_transaction_package'] || 'Standard Job Package';
      const amount = parseFloat(meta['cs_transaction_amount'] || '0');
      const paymentMethod = meta['cs_transaction_pay_method'] || 'PAYPAL';
      const status = meta['cs_transaction_status'] || 'completed';
      const listings = parseInt(meta['cs_transaction_listings'] || '0', 10);

      await conn.query(
        'INSERT INTO new_transactions (user_id, package_name, amount, payment_method, status, listings_granted, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newUserId,
          packageName,
          amount,
          paymentMethod,
          status,
          listings,
          sanitizeDate(wpTrans.post_date)
        ]
      );
    }
    console.log('Transactions migration finished.');

    // 5. Query candidate applied jobs from usermeta to populate job applications
    console.log('Populating job applications from candidate meta...');
    const [appliedJobsMeta] = await conn.query("SELECT user_id, meta_value FROM jtj_usermeta WHERE meta_key = 'cs-jobs-applied'");
    
    let appCount = 0;
    for (const row of appliedJobsMeta) {
      const candidateUserId = userWpToNewIdMap[row.user_id];
      if (!candidateUserId) continue;

      const oldJobIds = parsePhpSerialize(row.meta_value);
      if (Array.isArray(oldJobIds)) {
        for (const oldJobId of oldJobIds) {
          // Look up new job ID by wp_job_id
          const [jobRows] = await conn.query('SELECT id FROM new_jobs WHERE wp_job_id = ?', [oldJobId]);
          if (jobRows && jobRows.length > 0) {
            const jobId = jobRows[0].id;
            
            // Get application status
            const statusKey = `cs_job_application_status_${oldJobId}`;
            const [statusRows] = await conn.query('SELECT meta_value FROM jtj_usermeta WHERE user_id = ? AND meta_key = ?', [row.user_id, statusKey]);
            const status = statusRows && statusRows.length > 0 ? statusRows[0].meta_value : 'in-progress';

            await conn.query(
              'INSERT INTO new_job_applications (job_id, candidate_id, status, applied_at) VALUES (?, ?, ?, NOW())',
              [jobId, candidateUserId, status]
            );
            appCount++;
          }
        }
      }
    }
    console.log(`Applications migration finished. Populated ${appCount} applications.`);

    // Print summary stats
    const [usersCount] = await conn.query('SELECT COUNT(*) AS count, role FROM new_users GROUP BY role');
    const [jobsCount] = await conn.query('SELECT COUNT(*) AS count FROM new_jobs');
    const [transactionsCount] = await conn.query('SELECT COUNT(*) AS count FROM new_transactions');
    const [appsCount] = await conn.query('SELECT COUNT(*) AS count FROM new_job_applications');

    console.log('\n--- Migration Verification Summary ---');
    console.log(`Total Relational Jobs Migrated: ${jobsCount[0].count}`);
    console.log(`Total Relational Transactions Migrated: ${transactionsCount[0].count}`);
    console.log(`Total Relational Applications Migrated: ${appsCount[0].count}`);
    console.log('Total Relational Users Migrated by Role:');
    usersCount.forEach(row => {
      console.log(` - ${row.role}: ${row.count}`);
    });
    console.log('-------------------------------------\n');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await conn.end();
    console.log('Database connection closed.');
  }
}

run();

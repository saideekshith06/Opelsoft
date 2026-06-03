import pool from '@/lib/db';
import LoginClient from '@/components/LoginClient';

export const dynamic = 'force-dynamic';

async function getDemoProfiles() {
  try {
    const [candidates] = await pool.query(`
      SELECT u.id, u.username
      FROM new_users u 
      JOIN new_candidate_profiles cp ON u.id = cp.user_id 
      WHERE u.role = 'candidate' 
      LIMIT 1
    `);
    const [employers] = await pool.query(`
      SELECT u.id, u.username, ep.company_name 
      FROM new_users u 
      JOIN new_employer_profiles ep ON u.id = ep.user_id 
      WHERE u.role = 'employer' 
      LIMIT 1
    `);
    
    return {
      candidate: candidates[0] || null,
      employer: employers[0] || null
    };
  } catch (error) {
    console.error('Failed to load login demo profiles:', error);
    return { candidate: null, employer: null };
  }
}

export default async function LoginPage() {
  const { candidate, employer } = await getDemoProfiles();

  return (
    <LoginClient 
      candidate={candidate} 
      employer={employer} 
    />
  );
}

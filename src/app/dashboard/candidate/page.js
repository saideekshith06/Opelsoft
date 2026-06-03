import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CandidateDashboardClient from '@/components/CandidateDashboardClient';

export const dynamic = 'force-dynamic';

async function getCandidateDashboardData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('opelsoft_session')?.value;
    if (!token) return null;

    const session = verifyToken(token);
    if (!session || session.role !== 'candidate') return null;

    const userId = session.userId;

    // Fetch the specific candidate user
    const [users] = await pool.query(`
      SELECT u.username, u.email, cp.*
      FROM new_users u
      JOIN new_candidate_profiles cp ON u.id = cp.user_id
      WHERE u.id = ?
    `, [userId]);

    if (!users || users.length === 0) {
      return null;
    }

    const candidate = users[0];

    // Fetch applications for this user
    const [applications] = await pool.query(`
      SELECT ja.status, ja.applied_at, j.id AS job_id, j.title, j.city, j.country, j.salary_package, j.job_type,
             e.company_name
      FROM new_job_applications ja
      JOIN new_jobs j ON ja.job_id = j.id
      LEFT JOIN new_employer_profiles e ON j.employer_id = e.user_id
      WHERE ja.candidate_id = ?
      ORDER BY ja.applied_at DESC
    `, [userId]);

    return {
      candidate,
      applications
    };
  } catch (error) {
    console.error('Failed to query candidate dashboard data:', error);
    return null;
  }
}

export default async function CandidateDashboardPage() {
  const data = await getCandidateDashboardData();

  if (!data) {
    redirect('/login');
  }

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <CandidateDashboardClient 
        candidate={data.candidate} 
        applications={data.applications} 
      />
    </div>
  );
}

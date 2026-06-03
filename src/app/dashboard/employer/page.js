import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmployerDashboardClient from '@/components/EmployerDashboardClient';

export const dynamic = 'force-dynamic';

async function getEmployerDashboardData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('opelsoft_session')?.value;
    if (!token) return null;

    const session = verifyToken(token);
    if (!session || session.role !== 'employer') return null;

    const userId = session.userId;

    // Fetch specific employer user
    const [users] = await pool.query(`
      SELECT u.username, u.email, ep.*
      FROM new_users u
      JOIN new_employer_profiles ep ON u.id = ep.user_id
      WHERE u.id = ?
    `, [userId]);

    if (!users || users.length === 0) {
      return null;
    }

    const employer = users[0];

    // Fetch jobs posted by this employer
    const [jobs] = await pool.query(`
      SELECT *
      FROM new_jobs
      WHERE employer_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    // Fetch applications for jobs posted by this employer
    const [applications] = await pool.query(`
      SELECT ja.id, ja.status, ja.applied_at, ja.cv_url, ja.cover_letter,
             j.id AS job_id, j.title AS job_title,
             u.username, u.email
      FROM new_job_applications ja
      JOIN new_jobs j ON ja.job_id = j.id
      JOIN new_users u ON ja.candidate_id = u.id
      WHERE j.employer_id = ?
      ORDER BY ja.applied_at DESC
    `, [userId]);

    // Fetch transactions for this employer
    const [transactions] = await pool.query(`
      SELECT *
      FROM new_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    return {
      employer,
      jobs,
      applications,
      transactions
    };
  } catch (error) {
    console.error('Failed to query employer dashboard data:', error);
    return null;
  }
}

export default async function EmployerDashboardPage() {
  const data = await getEmployerDashboardData();

  if (!data) {
    redirect('/login');
  }

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <EmployerDashboardClient 
        employer={data.employer}
        jobs={data.jobs}
        applications={data.applications}
        transactions={data.transactions}
      />
    </div>
  );
}

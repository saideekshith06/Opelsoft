import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = getAuthUser(request);
    if (!session || session.role !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Candidate login required.' },
        { status: 401 }
      );
    }
    const candidateId = session.userId;

    const { jobId, coverLetter, cvUrl } = await request.json();

    if (!jobId) {
      return NextResponse.json({ success: false, message: 'Job ID is required' }, { status: 400 });
    }

    // Check if candidate already applied to this job
    const [existing] = await pool.query(
      'SELECT id FROM new_job_applications WHERE job_id = ? AND candidate_id = ?',
      [jobId, candidateId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, message: 'You have already applied for this job position.' }, { status: 400 });
    }

    // Insert application
    await pool.query(
      'INSERT INTO new_job_applications (job_id, candidate_id, status, cv_url, cover_letter, applied_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [jobId, candidateId, 'in-progress', cvUrl || 'http://placeholder.com/resume.pdf', coverLetter || '']
    );

    return NextResponse.json({ success: true, message: 'Successfully applied to this position!' });
  } catch (error) {
    console.error('Job application error:', error);
    return NextResponse.json({ success: false, message: 'Server error during job application.' }, { status: 500 });
  }
}

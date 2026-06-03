import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = getAuthUser(request);
    if (!session || session.role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Employer login required.' },
        { status: 401 }
      );
    }
    const employerId = session.userId;

    const data = await request.json();
    const { 
      title, description, requirements, job_type, industry, 
      qualification, experience, salary_package, gender, address, city, country 
    } = data;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Job title is required' }, { status: 400 });
    }

    // Insert job position assigned to the authenticated employer
    await pool.query(`
      INSERT INTO new_jobs (
        employer_id, title, description, requirements, job_type, industry, 
        qualification, experience, salary_package, gender, address, city, country, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [
      employerId, title, description || '', requirements || '', job_type || 'Full-time', industry || 'Technology',
      qualification || '', experience || '', salary_package || '', gender || '', address || '', city || '', country || ''
    ]);

    return NextResponse.json({ success: true, message: 'Job listing posted successfully!' });
  } catch (error) {
    console.error('Create job listing error:', error);
    return NextResponse.json({ success: false, message: 'Server error during job listing creation.' }, { status: 500 });
  }
}

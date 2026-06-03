import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { applicationId, status } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json({ success: false, message: 'Application ID and status are required' }, { status: 400 });
    }

    // Update job application status
    await pool.query(
      'UPDATE new_job_applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    return NextResponse.json({ success: true, message: 'Candidate application status updated successfully!' });
  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json({ success: false, message: 'Server error during status update.' }, { status: 500 });
  }
}

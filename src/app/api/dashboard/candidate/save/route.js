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
    const userId = session.userId;

    const data = await request.json();
    const { phone_number, minimum_salary, cover_letter, cv_url, skills, education, experience } = data;

    // Update profile for authenticated user
    await pool.query(`
      UPDATE new_candidate_profiles 
      SET phone_number = ?, minimum_salary = ?, cover_letter = ?, cv_url = ?, skills = ?, education = ?, experience = ?
      WHERE user_id = ?
    `, [phone_number, minimum_salary, cover_letter, cv_url, skills, education, experience, userId]);

    return NextResponse.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Save candidate profile error:', error);
    return NextResponse.json({ success: false, message: 'Server error during save profile.' }, { status: 500 });
  }
}

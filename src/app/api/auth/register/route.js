import pool from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { username, email, password, role } = data;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'All fields (username, email, password, role) are required.' },
        { status: 400 }
      );
    }

    if (role !== 'candidate' && role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Invalid role. Must be candidate or employer.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT id FROM new_users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username or email already exists.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const [userResult] = await pool.query(
      'INSERT INTO new_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    const userId = userResult.insertId;

    // Create profile
    if (role === 'candidate') {
      await pool.query(
        'INSERT INTO new_candidate_profiles (user_id, skills, education, experience) VALUES (?, ?, ?, ?)',
        [userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify([])]
      );
    } else if (role === 'employer') {
      await pool.query(
        'INSERT INTO new_employer_profiles (user_id, company_name) VALUES (?, ?)',
        [userId, `${username.charAt(0).toUpperCase() + username.slice(1)} Ltd`]
      );
    }

    // Generate JWT session token
    const token = signToken({ userId, username, role });

    // Set cookie on response
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful!',
      user: { id: userId, username, email, role }
    });

    response.cookies.set({
      name: 'opelsoft_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}

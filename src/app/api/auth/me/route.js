import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = getAuthUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated.' },
        { status: 401 }
      );
    }

    // Query user details
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM new_users WHERE id = ?',
      [session.userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth check (me) API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

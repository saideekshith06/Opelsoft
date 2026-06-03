import pool from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { usernameOrEmail, password } = data;

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Username/email and password are required.' },
        { status: 400 }
      );
    }

    // Query user by username or email
    const [users] = await pool.query(
      'SELECT * FROM new_users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid username, email, or password.' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Verify password hash
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid username, email, or password.' },
        { status: 400 }
      );
    }

    // Sign session token
    const token = signToken({ userId: user.id, username: user.username, role: user.role });

    // Set cookie on response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
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
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}

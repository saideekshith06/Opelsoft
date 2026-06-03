import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Helper to get candidate ID from session token
function getCandidateId(request) {
  const session = getAuthUser(request);
  if (!session || session.role !== 'candidate') {
    throw new Error('Unauthorized. Candidate login required.');
  }
  return session.userId;
}

export async function GET(request) {
  try {
    let userId;
    try {
      userId = getCandidateId(request);
    } catch (authErr) {
      return NextResponse.json({ success: false, message: authErr.message }, { status: 401 });
    }

    const [sources] = await pool.query("SELECT * FROM new_ai_career_sources WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return NextResponse.json({ success: true, sources });
  } catch (error) {
    console.error('GET AI Sources Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let userId;
    try {
      userId = getCandidateId(request);
    } catch (authErr) {
      return NextResponse.json({ success: false, message: authErr.message }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ success: false, message: 'URL is required.' }, { status: 400 });
    }
    
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Detect source type
    let sourceType = 'custom';
    if (normalizedUrl.includes('greenhouse.io')) {
      sourceType = 'greenhouse';
    } else if (normalizedUrl.includes('lever.co')) {
      sourceType = 'lever';
    } else if (normalizedUrl.includes('ycombinator.com') || normalizedUrl.includes('workatastartup.com')) {
      sourceType = 'yc';
    }
    
    // Check if source already exists for this user
    const [existing] = await pool.query("SELECT id FROM new_ai_career_sources WHERE user_id = ? AND url = ?", [userId, normalizedUrl]);
    
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'This career source is already registered.' }, { status: 400 });
    }
    
    const [insertRes] = await pool.query(`
      INSERT INTO new_ai_career_sources (user_id, url, source_type, status)
      VALUES (?, ?, ?, 'pending')
    `, [userId, normalizedUrl, sourceType]);
    
    const [newSource] = await pool.query("SELECT * FROM new_ai_career_sources WHERE id = ?", [insertRes.insertId]);
    
    return NextResponse.json({ success: true, source: newSource[0], message: 'Source added successfully!' });
  } catch (error) {
    console.error('POST AI Source Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    let userId;
    try {
      userId = getCandidateId(request);
    } catch (authErr) {
      return NextResponse.json({ success: false, message: authErr.message }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Source ID is required.' }, { status: 400 });
    }
    
    const [result] = await pool.query("DELETE FROM new_ai_career_sources WHERE id = ? AND user_id = ?", [id, userId]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Source not found or unauthorized.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Source deleted successfully!' });
  } catch (error) {
    console.error('DELETE AI Source Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

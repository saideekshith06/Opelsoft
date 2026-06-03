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
    
    const [matches] = await pool.query(`
      SELECT m.id AS match_id, m.match_score, m.recommendation_level, m.reasoning_summary, 
             m.risk_factors, m.missing_skills, m.status AS match_status, m.created_at AS matched_at,
             dj.id AS job_id, dj.company_name, dj.job_title, dj.url, dj.ats_type, dj.job_type, dj.location, dj.salary, dj.description
      FROM new_ai_matches m
      JOIN new_ai_discovered_jobs dj ON m.discovered_job_id = dj.id
      WHERE m.user_id = ?
      ORDER BY m.match_score DESC, m.created_at DESC
    `, [userId]);
    
    // Parse JSON strings
    const parsedMatches = matches.map(m => ({
      ...m,
      risk_factors: typeof m.risk_factors === 'string' ? JSON.parse(m.risk_factors) : (m.risk_factors || []),
      missing_skills: typeof m.missing_skills === 'string' ? JSON.parse(m.missing_skills) : (m.missing_skills || [])
    }));
    
    return NextResponse.json({ success: true, matches: parsedMatches });
  } catch (error) {
    console.error('GET AI Matches Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

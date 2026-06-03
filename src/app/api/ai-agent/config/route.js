import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Helper to get candidate ID from session cookie
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
    
    // Fetch configuration
    const [configs] = await pool.query("SELECT * FROM new_ai_agent_configs WHERE user_id = ?", [userId]);
    
    if (configs.length === 0) {
      // Create a default config if it doesn't exist
      const defaultRoles = JSON.stringify(['Software Engineer', 'React Developer', 'Fullstack Engineer']);
      const defaultLocations = JSON.stringify(['London', 'Remote', 'United Kingdom']);
      
      const [insertRes] = await pool.query(`
        INSERT INTO new_ai_agent_configs (user_id, status, preferred_roles, target_locations, target_salary, min_match_score)
        VALUES (?, 'active', ?, ?, '35000', 70)
      `, [userId, defaultRoles, defaultLocations]);
      
      return NextResponse.json({
        success: true,
        config: {
          id: insertRes.insertId,
          user_id: userId,
          status: 'active',
          preferred_roles: ['Software Engineer', 'React Developer', 'Fullstack Engineer'],
          target_locations: ['London', 'Remote', 'United Kingdom'],
          target_salary: '35000',
          min_match_score: 70,
          slack_webhook_url: '',
          telegram_chat_id: '',
          discord_webhook_url: ''
        }
      });
    }
    
    const config = configs[0];
    return NextResponse.json({
      success: true,
      config: {
        ...config,
        preferred_roles: typeof config.preferred_roles === 'string' ? JSON.parse(config.preferred_roles) : (config.preferred_roles || []),
        target_locations: typeof config.target_locations === 'string' ? JSON.parse(config.target_locations) : (config.target_locations || [])
      }
    });
  } catch (error) {
    console.error('GET AI Agent Config Error:', error.message);
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

    const data = await request.json();
    const { status, preferred_roles, target_locations, target_salary, min_match_score, slack_webhook_url, telegram_chat_id, discord_webhook_url } = data;
    
    // Check if configuration exists
    const [configs] = await pool.query("SELECT id FROM new_ai_agent_configs WHERE user_id = ?", [userId]);
    
    const rolesJson = JSON.stringify(preferred_roles || []);
    const locationsJson = JSON.stringify(target_locations || []);
    
    if (configs.length === 0) {
      await pool.query(`
        INSERT INTO new_ai_agent_configs (user_id, status, preferred_roles, target_locations, target_salary, min_match_score, slack_webhook_url, telegram_chat_id, discord_webhook_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, status || 'inactive', rolesJson, locationsJson, target_salary || '35000', min_match_score || 70, slack_webhook_url || '', telegram_chat_id || '', discord_webhook_url || '']);
    } else {
      await pool.query(`
        UPDATE new_ai_agent_configs 
        SET status = ?, preferred_roles = ?, target_locations = ?, target_salary = ?, min_match_score = ?, slack_webhook_url = ?, telegram_chat_id = ?, discord_webhook_url = ?
        WHERE user_id = ?
      `, [status || 'inactive', rolesJson, locationsJson, target_salary || '35000', min_match_score || 70, slack_webhook_url || '', telegram_chat_id || '', discord_webhook_url || '', userId]);
    }
    
    return NextResponse.json({ success: true, message: 'AI Agent config updated successfully!' });
  } catch (error) {
    console.error('POST AI Agent Config Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

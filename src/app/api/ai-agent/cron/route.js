import pool from '@/lib/db';
import { executeAgentPipeline } from '@/lib/agentRunner';
import { closeScraperBrowser } from '@/lib/scraper';
import { NextResponse } from 'next/server';

// The pipeline drives a headless browser (Playwright), so it must run in the Node runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Secure with CRON_SECRET check
    const expectedSecret = process.env.CRON_SECRET || 'opelsoft_cron_secret_token_123';
    if (token !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Secure cron token mismatch.' },
        { status: 401 }
      );
    }

    // Query all active candidate AI Agent configurations
    const [configs] = await pool.query(
      "SELECT user_id FROM new_ai_agent_configs WHERE status = 'active'"
    );

    console.log(`[CRON] Initializing background scrapes for ${configs.length} active candidates.`);
    
    const results = [];
    // Custom console logger bound to candidate context
    const createLogger = (userId) => (message, type) => {
      console.log(`[CRON] [Candidate:${userId}] [${type.toUpperCase()}] ${message}`);
    };

    for (const config of configs) {
      const uId = config.user_id;
      try {
        console.log(`[CRON] Executing scraper matching pipeline for Candidate User ID: ${uId}`);
        const matches = await executeAgentPipeline(uId, createLogger(uId));
        results.push({ userId: uId, success: true, matchesCount: matches.length });
      } catch (err) {
        console.error(`[CRON] Scraper failed for Candidate User ID ${uId}:`, err);
        results.push({ userId: uId, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully executed background crawls for ${configs.length} candidates.`,
      results
    });

  } catch (error) {
    console.error('CRON scraper endpoint error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during background scraper execution.' },
      { status: 500 }
    );
  } finally {
    // Release the shared headless browser once all candidates are processed.
    await closeScraperBrowser();
  }
}

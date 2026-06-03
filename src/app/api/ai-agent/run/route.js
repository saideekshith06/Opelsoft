import { getAuthUser } from '@/lib/auth';
import { executeAgentPipeline } from '@/lib/agentRunner';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const logs = [];
  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    logs.push({ time, message, type });
    console.log(`[AI-RUN] [${type.toUpperCase()}] ${message}`);
  };

  try {
    const session = getAuthUser(request);
    if (!session || session.role !== 'candidate') {
      addLog('Unauthorized session. Candidate login required.', 'error');
      return NextResponse.json(
        { success: false, logs, message: 'Unauthorized. Candidate login required.' },
        { status: 401 }
      );
    }
    
    addLog('Starting KAI Agentic AI recruiting workflow run...', 'info');
    
    // Execute the shared scraper and matchmaking pipeline
    const matches = await executeAgentPipeline(session.userId, addLog);
    
    addLog(`AI agent workflow execution successfully completed. Found ${matches.length} matches above threshold.`, 'success');
    return NextResponse.json({ success: true, logs, matches });

  } catch (error) {
    addLog(`CRITICAL ERROR DURING WORKFLOW RUN: ${error.message}`, 'error');
    console.error('AI Run Scraper matching pipeline error:', error);
    return NextResponse.json({ success: false, logs, message: error.message }, { status: 500 });
  }
}

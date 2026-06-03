import { getAuthUser } from '@/lib/auth';
import { callLLMForJson } from '@/lib/llm';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const session = getAuthUser(request);
    if (!session || session.role !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Candidate login required.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText = '';
    try {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text;
    } catch (e) {
      console.warn('Failed to parse PDF text locally:', e);
    }

    const parsePrompt = `Analyze this resume and extract the candidate's professional details. Return ONLY a valid JSON object matching the following structure (do NOT wrap it in markdown code blocks, do NOT write explanations, return only the raw JSON block itself):
    {
      "job_title": "string (main target role, e.g. Senior Software Engineer)",
      "skills": [{ "name": "string (e.g. React)", "percentage": 85 }],
      "education": [{ "title": "string", "institute": "string", "from": "string", "to": "string", "description": "string" }],
      "experience": [{ "title": "string", "company": "string", "from": "string", "to": "string", "description": "string" }]
    }
    
    RESUME TEXT:
    ${pdfText}`;

    // 1. LLM parsing via shared helper (Groq primary -> Gemini -> Claude -> OpenAI)
    const parsed = await callLLMForJson(parsePrompt, {
      system: 'You are a precise resume parser. Return ONLY valid JSON.',
      maxTokens: 2000,
      temperature: 0.1
    });
    if (parsed && (parsed.job_title || parsed.skills || parsed.experience)) {
      return NextResponse.json({ success: true, profile: parsed });
    }

    // 2. Heuristic / mock parsed fallback when keys are missing or all providers failed
    console.log('Using fallback parser for resume parsing (no API keys defined)...');
    
    // Customize mock values slightly based on file name if possible
    const fileName = file.name ? file.name.toLowerCase() : '';
    let parsedTitle = 'Software Engineer';
    let skillsArray = [
      { name: 'JavaScript', percentage: 90 },
      { name: 'React', percentage: 85 },
      { name: 'Node.js', percentage: 80 },
      { name: 'SQL', percentage: 75 }
    ];

    if (fileName.includes('design') || fileName.includes('ui') || fileName.includes('ux')) {
      parsedTitle = 'Product Designer';
      skillsArray = [
        { name: 'Figma', percentage: 95 },
        { name: 'UI/UX Design', percentage: 90 },
        { name: 'HTML & CSS', percentage: 80 },
        { name: 'Wireframing', percentage: 85 }
      ];
    } else if (fileName.includes('product') || fileName.includes('manager')) {
      parsedTitle = 'Product Manager';
      skillsArray = [
        { name: 'Product Roadmap', percentage: 95 },
        { name: 'Agile/Scrum', percentage: 90 },
        { name: 'Jira', percentage: 85 },
        { name: 'SQL & Analytics', percentage: 70 }
      ];
    }

    const mockProfile = {
      job_title: parsedTitle,
      skills: skillsArray,
      education: [
        { 
          title: 'Bachelor of Science in Computer Science', 
          institute: 'Adamas University', 
          from: '2019', 
          to: '2023', 
          description: 'Graduated with first-class honors. Focus on software engineering methodologies.' 
        }
      ],
      experience: [
        { 
          title: parsedTitle + ' Intern', 
          company: 'Opelsoft', 
          from: '2022', 
          to: '2023', 
          description: 'Assisted in building recruitment systems and automation playbooks.' 
        }
      ]
    };

    return NextResponse.json({ 
      success: true, 
      profile: mockProfile, 
      fallback: true,
      message: 'Parsed via developer fallback (add GEMINI_API_KEY in .env.local to enable real LLM parsing).'
    });

  } catch (error) {
    console.error('Resume upload endpoint error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during resume parsing.' },
      { status: 500 }
    );
  }
}

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
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'application/pdf';

    const parsePrompt = `Analyze this resume and extract the candidate's professional details. Return ONLY a valid JSON object matching the following structure (do NOT wrap it in markdown code blocks, do NOT write explanations, return only the raw JSON block itself):
    {
      "job_title": "string (main target role, e.g. Senior Software Engineer)",
      "skills": [{ "name": "string (e.g. React)", "percentage": 85 }],
      "education": [{ "title": "string", "institute": "string", "from": "string", "to": "string", "description": "string" }],
      "experience": [{ "title": "string", "company": "string", "from": "string", "to": "string", "description": "string" }]
    }`;

    // 1. Try Gemini Multimodal Direct PDF Parsing first
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('Sending CV directly to Gemini 2.0 Flash for parsing...');
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  },
                  {
                    text: parsePrompt
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2000,
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const parsed = JSON.parse(rawText.trim());
          return NextResponse.json({ success: true, profile: parsed });
        } else {
          console.warn('Gemini API CV parser failed with status:', response.status);
        }
      } catch (err) {
        console.error('Gemini CV parsing error:', err);
      }
    }

    // 2. Try Anthropic Claude 3.5 PDF Document API second
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('Sending CV directly to Claude 3.5 for parsing...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: mimeType,
                    data: base64Data
                  }
                },
                {
                  type: 'text',
                  text: parsePrompt
                }
              ]
            }]
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData.content[0].text || '';
          const parsed = JSON.parse(rawText.trim());
          return NextResponse.json({ success: true, profile: parsed });
        } else {
          console.warn('Claude API CV parser failed with status:', response.status);
        }
      } catch (err) {
        console.error('Claude CV parsing error:', err);
      }
    }

    // 2.5 Try OpenAI (ChatGPT) API third
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Sending CV to OpenAI (ChatGPT) for parsing...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a precise resume parser. Return ONLY valid JSON.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: parsePrompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${base64Data}`
                    }
                  }
                ]
              }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData.choices[0].message.content || '';
          const parsed = JSON.parse(rawText.trim());
          return NextResponse.json({ success: true, profile: parsed });
        } else {
          console.warn('OpenAI API CV parser failed with status:', response.status);
        }
      } catch (err) {
        console.error('OpenAI CV parsing error:', err);
      }
    }

    // 3. Heuristic / mock parsed fallback when keys are missing
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

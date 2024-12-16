import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function analyzeContent(content: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional career advisor. Analyze the provided company page content and extract key information for a cover letter."
        },
        {
          role: "user",
          content: `Analyze this content and extract: 1) Company values and culture 2) Key requirements and qualifications 3) Responsibilities and expectations. Content: ${content}`
        }
      ],
      temperature: 0.7,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    return null
  }
}

async function generateCoverLetter(companyInfo: string, jobInfo: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer. Create a compelling cover letter based on the company and job information provided."
        },
        {
          role: "user",
          content: `Generate a professional cover letter using this information about the company and role.
          Company Information: ${companyInfo}
          Job Information: ${jobInfo}

          Format the cover letter professionally with proper spacing and paragraphs.`
        }
      ],
      temperature: 0.7,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { pageContents } = await request.json()

    // Analyze both pages
    const aboutAnalysis = await analyzeContent(pageContents['/about'])
    const careersAnalysis = await analyzeContent(pageContents['/careers'])

    let coverLetter = null
    if (aboutAnalysis && careersAnalysis) {
      coverLetter = await generateCoverLetter(aboutAnalysis, careersAnalysis)
    }


    return NextResponse.json({
      success: true,
      analysis: {
        about: aboutAnalysis,
        careers: careersAnalysis
      },
      coverLetter
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to generate cover letter'
    }, { status: 500 })
  }
}

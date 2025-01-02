import { NextResponse } from 'next/server'

interface ParseRequest {
  coverLetter: string
}

export async function POST(request: Request) {
  try {
    const body: ParseRequest = await request.json()
    const { coverLetter } = body

    const parsedData = {
      contact: {
        email: extractEmail(coverLetter),
        phone: extractPhone(coverLetter),
      },
      sections: parseSections(coverLetter),
    }

    return NextResponse.json({ success: true, data: parsedData })
  } catch (error) {
    console.error('Error parsing cover letter:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to parse cover letter' },
      { status: 500 }
    )
  }
}

function extractEmail(text: string): string | null {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
  const match = text.match(emailRegex)
  return match ? match[0] : null
}

function extractPhone(text: string): string | null {
  const phoneRegex = /(\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g
  const match = text.match(phoneRegex)
  return match ? match[0] : null
}

function parseSections(text: string): { [key: string]: string } {
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/)

  // Basic section detection
  const sections: { [key: string]: string } = {
    introduction: paragraphs[0] || '',
    body: '',
    conclusion: paragraphs[paragraphs.length - 1] || '',
  }

  // Combine middle paragraphs as body
  if (paragraphs.length > 2) {
    sections.body = paragraphs.slice(1, -1).join('\n\n')
  }

  return sections
}

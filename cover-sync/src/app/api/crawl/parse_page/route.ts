import { NextResponse } from 'next/server'
import { fetchPageContent } from "../../lib/utils/pageParser"

export async function POST(request: Request) {
  try {
    const { urls, baseUrl } = await request.json()
    const pageContents: Record<string, string | null> = {}

    // Fetch content for each URL
    for (const path of urls) {
      const fullUrl = new URL(path, baseUrl).toString()
      const content = await fetchPageContent(fullUrl)
      if (content) {
        pageContents[path] = content
      }
    }

    return NextResponse.json({ pageContents })

  } catch (error) {
    return NextResponse.json({
      error: `${error} Failed to parse pages`,
      pageContents: {}
    }, { status: 500 })
  }
}

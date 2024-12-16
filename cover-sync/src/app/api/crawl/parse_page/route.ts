import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const fetchPageContent = async (url: string): Promise<string | null>  => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    const $ = cheerio.load(html)

    // Clean up the HTML
    $('script').remove()
    $('style').remove()

    return $('body').html()
  } catch (error) {
    console.error('Error fetching page content:', error)
    return null
  }
}

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
      error: 'Failed to parse pages',
      pageContents: {}
    }, { status: 500 })
  }
}

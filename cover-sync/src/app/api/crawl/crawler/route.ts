import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

const seenUrls = new Set<string>()

export const crawlPage = async (baseUrl: string, currentUrl: string): Promise<string[]> =>   {
  try {
    const response = await fetch(currentUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)',
      },
    })

    if (!response.ok) return []

    const html = await response.text()
    const $ = cheerio.load(html)
    const paths: string[] = []

    // Find all links
    $('a').each((_, element) => {
      const href = $(element).attr('href')
      if (!href) return

      try {
        // Convert relative URLs to absolute
        const url = new URL(href, currentUrl)

        // Only process URLs from the same hostname
        if (url.hostname === new URL(baseUrl).hostname) {
          const path = url.pathname
          if (!seenUrls.has(path)) {
            seenUrls.add(path)
            paths.push(path)
          }
        }
      } catch (e) {
        // Invalid URL, skip
      }
    })

    return paths
  } catch (error) {
    console.error('Error crawling:', error)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    seenUrls.clear() // Reset the seen URLs for new scan

    const paths = await crawlPage(url, url)

    return NextResponse.json({
      paths: Array.from(seenUrls).filter(path => path !== '/'),
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to crawl website',
      paths: []
    }, { status: 500 })
  }
}

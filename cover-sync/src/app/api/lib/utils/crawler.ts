import { parse } from 'node-html-parser'

const seenUrls = new Set<string>()

export const crawlPage = async (baseUrl: string, currentUrl: string): Promise<string[]> => {
  console.log('crawling page', currentUrl)
  try {
    const response = await fetch(currentUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)',
      },
    })

    if (!response.ok) return []

    const html = await response.text()
    const root = parse(html)
    const paths: string[] = []

    // Find all links
    root.querySelectorAll('a').forEach((element) => {
      const href = element.getAttribute('href')
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
        console.log('Invalid URL', e)
      }
    })

    return paths
  } catch (error) {
    console.error('Error crawling:', error)
    return []
  }
}

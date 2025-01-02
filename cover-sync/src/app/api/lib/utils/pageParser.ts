import { parse } from "node-html-parser";

export const fetchPageContent = async (url: string): Promise<string | null>  => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    const root = parse(html)

    // Clean up the HTML
    root.querySelectorAll('script').forEach(el => el.remove())
    root.querySelectorAll('style').forEach(el => el.remove())

    return root.querySelector('body')?.innerHTML || null
  } catch (error) {
    console.error('Error fetching page content:', error)
    return null
  }
}

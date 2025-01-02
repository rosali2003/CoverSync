import { NextResponse } from 'next/server'
import { crawlPage } from "../../lib/utils/crawler"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    const paths = await crawlPage(url, url)

    return NextResponse.json({
      paths: Array.from(paths).filter(path => path !== '/'),
    })

  } catch (error) {
    return NextResponse.json({
      error: `${error} Failed to crawl website`,
      paths: []
    }, { status: 500 })
  }
}

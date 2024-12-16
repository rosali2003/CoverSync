'use client'

import { useState } from 'react'

interface ScanResult {
  path: string
  status: number
  exists: boolean
}

export default function Home() {
  const [hostname, setHostname] = useState('')
  const [results, setResults] = useState<ScanResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCount, setScannedCount] = useState(0)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsScanning(true)
    setResults([])
    setScannedCount(0)

    const baseUrl = hostname.startsWith('http') ? hostname : `https://${hostname}`

    try {
      // First, crawl the site
      const crawlResponse = await fetch('/api/crawl/crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: baseUrl,
        }),
      })

      const crawlData = await crawlResponse.json()
      setResults(crawlData.paths.map((path: string) => ({
        path,
        status: 200,
        exists: true
      })))
      setScannedCount(crawlData.paths.length)

      // Check if we found the target paths
      const targetPaths = ['/careers', '/about']
      const foundPaths = crawlData.paths.filter((path: string) =>
        targetPaths.includes(path)
      )

      if (foundPaths.length > 0) {
        // Then parse those specific pages
        const parseResponse = await fetch('/api/crawl/parse_page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            urls: foundPaths,
            baseUrl: baseUrl
          }),
        })

        const parseData = await parseResponse.json()
        console.log('Parsed page contents:', parseData.pageContents)
        // Handle the parsed content as needed
      }

    } catch (error) {
      console.error('Error during scan:', error)
    }

    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Web Crawler</h1>

        <form onSubmit={handleScan} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="Enter hostname (e.g., example.com)"
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={isScanning}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isScanning ? 'Crawling...' : 'Crawl'}
            </button>
          </div>
        </form>

        {isScanning && (
          <div className="mb-4 text-blue-600">
            Scanning in progress... Found {scannedCount} paths
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Found Directories ({results.length})
            </h2>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-2 rounded bg-green-100"
                >
                  <span className="font-mono">{result.path}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

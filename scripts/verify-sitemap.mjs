import { spawn } from 'node:child_process'

const port = 3200
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })

const waitForServer = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${origin}/robots.txt`)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('The local production server did not start in time.')
}

try {
  await waitForServer()
  const response = await fetch(`${origin}/sitemap.xml`)
  if (!response.ok) throw new Error(`Sitemap returned HTTP ${response.status}.`)
  const xml = await response.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  if (!urls.length) throw new Error('Sitemap contains no URL.')
  const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index)
  if (duplicates.length) throw new Error(`Sitemap contains duplicate URLs: ${[...new Set(duplicates)].slice(0, 5).join(', ')}`)
  const invalid = urls.filter((url) => !url.startsWith('https://oxploria-web-app.vercel.app/'))
  if (invalid.length) throw new Error(`Sitemap contains URLs on another origin: ${invalid.slice(0, 5).join(', ')}`)
  console.log(`Sitemap verified: ${urls.length} unique URLs on https://oxploria-web-app.vercel.app.`)
} finally {
  server.kill()
}

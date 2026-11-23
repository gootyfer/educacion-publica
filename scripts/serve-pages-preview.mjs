import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, resolve, sep } from "node:path"

const root = resolve(process.argv[2] ?? "dist")
const port = Number(process.argv[3] ?? 4174)
const prefix = "/educacion-publica/"
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname
  if (!pathname.startsWith(prefix)) {
    response.writeHead(404).end()
    return
  }
  const relativePath = decodeURIComponent(pathname.slice(prefix.length))
  let filePath = resolve(root, relativePath || "index.html")
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end()
    return
  }

  try {
    if (!(await stat(filePath)).isFile()) throw new Error("not a file")
  } catch {
    filePath = resolve(root, "index.html")
  }

  response.writeHead(200, {
    "Content-Type":
      contentTypes[extname(filePath)] ?? "application/octet-stream",
  })
  createReadStream(filePath).pipe(response)
}).listen(port, "127.0.0.1", () => {
  console.log(`GitHub Pages preview: http://127.0.0.1:${port}${prefix}`)
})

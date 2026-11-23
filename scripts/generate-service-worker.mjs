import { createHash } from "node:crypto"
import { readdir, readFile, writeFile } from "node:fs/promises"
import { extname, join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const CACHE_PREFIX = "jornada-decente-"

export async function generateServiceWorker(rootDirectory) {
  const root = resolve(rootDirectory)
  const files = (await walk(root))
    .map((file) => relative(root, file).replaceAll("\\", "/"))
    .filter((file) => file !== "sw.js")
    .sort()
  const hash = createHash("sha256")
  for (const file of files) {
    hash.update(file)
    hash.update(await readFile(join(root, file)))
  }
  const revision = hash.digest("hex").slice(0, 12)
  const precache = [
    "./",
    ...files
      .filter(isCriticalAsset)
      .filter((file) => file !== "index.html")
      .map((file) => `./${file}`),
  ]
  await writeFile(
    join(root, "sw.js"),
    serviceWorkerSource(`${CACHE_PREFIX}${revision}`, precache),
  )
}

function isCriticalAsset(file) {
  return (
    file === "index.html" ||
    file === "manifest.webmanifest" ||
    file.startsWith("assets/") ||
    file.startsWith("game/") ||
    file.startsWith("icons/")
  )
}

function serviceWorkerSource(cacheName, precache) {
  return `const CACHE_PREFIX = ${JSON.stringify(CACHE_PREFIX)}
const CACHE_NAME = ${JSON.stringify(cacheName)}
const PRECACHE_URLS = ${JSON.stringify(precache, null, 2)}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  const scopePath = new URL(self.registration.scope).pathname
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME)
      const cacheKey = url.pathname === scopePath ? "./" : request
      try {
        const response = await fetch(request)
        if (response.ok) await cache.put(cacheKey, response.clone())
        return response
      } catch {
        return (await cache.match(cacheKey)) ?? (await cache.match("./")) ?? Response.error()
      }
    })())
    return
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  })())
})
`
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(file)))
    else files.push(file)
  }
  return files
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateServiceWorker(process.argv[2] ?? "dist")
}

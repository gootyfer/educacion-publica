import { readdir, readFile } from "node:fs/promises"
import { extname, join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { gzipSync } from "node:zlib"

export const DEFAULT_BUDGET_BYTES = 3 * 1024 * 1024

export async function checkGameBudget(
  rootDirectory,
  limitBytes = DEFAULT_BUDGET_BYTES,
) {
  const root = resolve(rootDirectory)
  const files = await walk(root)
  const included = files.filter((file) => {
    const path = relative(root, file).replaceAll("\\", "/")
    if (path.startsWith("audio/")) return false
    return (
      path.startsWith("game/") ||
      [".js", ".css", ".html"].includes(extname(path))
    )
  })
  let compressedBytes = 0
  for (const file of included) {
    compressedBytes += gzipSync(await readFile(file)).byteLength
  }
  return {
    ok: compressedBytes <= limitBytes,
    compressedBytes,
    limitBytes,
    files: included.map((file) => relative(root, file).replaceAll("\\", "/")),
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else files.push(path)
  }
  return files
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? "dist"
  const limit = process.argv[3]
    ? Number(process.argv[3])
    : DEFAULT_BUDGET_BYTES
  const result = await checkGameBudget(root, limit)
  console.log(
    `${result.ok ? "PASS" : "FAIL"} ${result.compressedBytes}/${result.limitBytes} bytes (${result.files.length} critical files)`,
  )
  if (!result.ok) process.exitCode = 1
}

// Assembles the site's real compiled stylesheet into a stable path for the
// design-sync converter.
//
// `next build` emits CSS to .next/static/chunks/<contenthash>.css — the name
// changes every build, so cfg.cssEntry can't point at it directly. This copies
// the chunks into .design-sync/.cache/css/site.css and the font files into
// .design-sync/.cache/media/, preserving the `url(../media/…)` references the
// compiled CSS already contains so they still resolve.
//
// Run after `npm run build`, before the converter.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const CHUNKS = '.next/static/chunks'
const MEDIA = '.next/static/media'
const OUT_DIR = '.design-sync/.cache/css'
const OUT_MEDIA = '.design-sync/.cache/media'
const OUT = join(OUT_DIR, 'site.css')

let chunkFiles
try {
  chunkFiles = readdirSync(CHUNKS).filter((f) => f.endsWith('.css'))
} catch {
  console.error(`✗ ${CHUNKS} not found — run \`npm run build\` first.`)
  process.exit(1)
}

if (chunkFiles.length === 0) {
  console.error(`✗ no .css chunks in ${CHUNKS} — run \`npm run build\` first.`)
  process.exit(1)
}

// Largest chunk first: that's the app stylesheet (fonts + tailwind + globals).
// Vendor CSS follows so its rules keep their original cascade position.
const sorted = chunkFiles
  .map((f) => ({ f, size: readFileSync(join(CHUNKS, f)).length }))
  .sort((a, b) => b.size - a.size)

rmSync(OUT_DIR, { recursive: true, force: true })
rmSync(OUT_MEDIA, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(OUT_MEDIA, { recursive: true })

const parts = sorted.map(({ f }) => `/* from ${f} */\n${readFileSync(join(CHUNKS, f), 'utf8')}`)
writeFileSync(OUT, parts.join('\n\n'), 'utf8')

let fonts = 0
for (const f of readdirSync(MEDIA)) {
  if (!/\.(woff2?|ttf|otf)$/.test(f)) continue
  copyFileSync(join(MEDIA, f), join(OUT_MEDIA, f))
  fonts++
}

console.log(`✓ ${OUT} (${readFileSync(OUT).length} bytes from ${sorted.length} chunk(s))`)
console.log(`✓ ${OUT_MEDIA} (${fonts} font file(s))`)
for (const { f, size } of sorted) console.log(`  · ${f} — ${size} bytes`)

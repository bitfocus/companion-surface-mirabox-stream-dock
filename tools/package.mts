import { spawnSync } from 'node:child_process'
import { access, readFile, readdir, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { create } from 'tar'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
const result = spawnSync(
	process.execPath,
	[require.resolve('@companion-module/tools/scripts/build-surface.js'), ...args],
	{ stdio: 'inherit' },
)
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
if (args.includes('--help')) process.exit(0)

const packageDir = path.resolve('pkg')
const prebuildDir = path.join(packageDir, 'node_modules/koffi/build/koffi')
// Match Companion's targets: https://github.com/bitfocus/companion/blob/main/tools/build/util.mts
const supportedPlatforms = new Set([
	'darwin_arm64',
	'darwin_x64',
	'linux_arm64',
	'linux_x64',
	'win32_arm64',
	'win32_x64',
])

// Fail packaging if an expected runtime binary is missing.
for (const platform of supportedPlatforms) {
	await access(path.join(prebuildDir, platform, 'koffi.node'))
}
for (const entry of await readdir(prebuildDir, { withFileTypes: true })) {
	if (!entry.isDirectory() || supportedPlatforms.has(entry.name)) continue
	const target = path.resolve(prebuildDir, entry.name)
	if (path.dirname(target) !== prebuildDir) throw new Error(`Invalid prebuild path: ${target}`)
	await rm(target, { recursive: true })
	console.log(`Removed unsupported Koffi prebuild: ${entry.name}`)
}

const { values } = parseArgs({ args, options: { output: { type: 'string' } }, strict: false })
const manifest = JSON.parse(await readFile(path.join(packageDir, 'companion/manifest.json'), 'utf8'))
const output = values.output ?? `${manifest.id}-${manifest.version}`.replace(/[^a-zA-Z0-9-.]/g, '-')
await create({ gzip: true, file: `${output}.tgz` }, ['pkg'])
console.log(`Wrote trimmed package: ${output}.tgz`)

import { dirname } from 'node:path'
import { promisify } from 'node:util'
import { getHidapiVersion } from 'node-hid'

export async function getFirmwareVersion(devicePath: string): Promise<string | undefined> {
	const { default: koffi } = await import('koffi')
	// Initialize node-hid's binding, then use its HIDAPI for the control transfer.
	// node-hid does not expose hid_get_input_report through its JavaScript API.
	getHidapiVersion()
	// Resolve the installed native binding at runtime, outside the Companion bundle.
	const { createRequire } = process.getBuiltinModule('node:module')
	const require = createRequire(typeof __filename === 'string' ? __filename : import.meta.url)
	const hidEntry = require.resolve('node-hid')
	const requireHid = createRequire(hidEntry)
	const { resolve } = requireHid('pkg-prebuilds/bindings') as {
		resolve(
			this: void,
			basePath: string,
			options: { name: string; napi_versions: number[] },
			verify: boolean,
			required: true,
		): string
	}
	const name = process.platform === 'linux' ? 'HID_hidraw' : 'HID'
	const hidapi = koffi.load(resolve(dirname(hidEntry), { name, napi_versions: [4] }, false, true))
	const open = promisify(hidapi.func('void *hid_open_path(const char *path)').async)
	const getInputReport = promisify(
		hidapi.func('int hid_get_input_report(void *device, void *data, size_t length)').async,
	)
	const close = promisify(hidapi.func('void hid_close(void *device)').async)

	const device = await open(devicePath)
	if (!device) throw new Error('Could not open HID device for firmware query')
	try {
		// The N4 family uses a 512-byte input report with report ID 0.
		const report = Buffer.alloc(513)
		const length: number = await getInputReport(device, report, report.length)
		if (length < 0) throw new Error('Could not read firmware input report')

		const data = report.subarray(1, length)
		const start = data.findIndex((byte) => byte !== 0)
		if (start < 0) return undefined
		const end = data.indexOf(0, start)
		return data.toString('utf8', start, end < 0 ? data.length : end).trim() || undefined
	} finally {
		await close(device)
	}
}

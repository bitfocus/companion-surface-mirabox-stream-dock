import type { StreamDockModelDefinition } from './list.js'
import { N4_1234Definition } from './N4-1234.js'

export const Mirabox_N4_ProDefinition: StreamDockModelDefinition = {
	...N4_1234Definition,
	productName: 'Mirabox Stream Dock N4 Pro',
	usbIds: [
		{
			vendorId: 0x5548,
			// 0x1008: China-market N4 Pro (firmware "V4.N4 Pro.02.010"), seen 2026-11-07
			productIds: [0x1021, 0x1008],
		},
	],
}

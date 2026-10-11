import type { StreamDockModelDefinition } from './list.js'
import { N4_1234Definition } from './N4-1234.js'

export const Mirabox_N4_ProDefinition: StreamDockModelDefinition = {
	...N4_1234Definition,
	productName: 'Mirabox Stream Dock N4 Pro',
	usbIds: [
		{
			vendorId: 0x5548,
			productIds: [0x1021],
		},
	],
}

import type { StreamDockModelDefinition } from './list.js'
import { MiraboxXLDefinition } from './Mirabox-XL.js'

// Same hardware as Mirabox XL, different USB ID.

export const StreonorS32Definition: StreamDockModelDefinition = {
	...MiraboxXLDefinition,
	productName: 'Streonor S32',
	usbIds: [
		{
			vendorId: 0x1500,
			productIds: [0x3008],
		},
	],
}

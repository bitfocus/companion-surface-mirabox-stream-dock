import type { StreamDockModelDefinition } from './list.js'
import { soomfon_CN002Definition } from './soomfon-CN002.js'

// Same hardware as CN002, different USB ID.

export const StreonorS6Definition: StreamDockModelDefinition = {
	...soomfon_CN002Definition,
	productName: 'Streonor S6',
	usbIds: [
		{
			vendorId: 0x1500,
			productIds: [0x3006],
		},
	],
}

import type { StreamDockModelDefinition } from './list.js'
import { N4_1234Definition } from './N4-1234.js'

// Hardware-identical to the Stream Dock N4: verified against a physical unit
// (USB 0x1500:0x3002, product string 'HOTSPOTEKUSB HID DEMO') that every input
// function code, output id, resolution and the icon rotation match.
export const soomfon_CN003Definition: StreamDockModelDefinition = {
	...N4_1234Definition,
	productName: 'soomfon Stream Controller Plus',
	usbIds: [
		{
			vendorId: 0x1500,
			productIds: [0x3002],
		},
	],
}

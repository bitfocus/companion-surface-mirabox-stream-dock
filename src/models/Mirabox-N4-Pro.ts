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
	ledArrayLength: 12,
	outputs: [
		...N4_1234Definition.outputs,
		{ type: 'led', id: 0, row: 3, column: 0, name: 'Rotary encoder LED 1' },
		{ type: 'led', id: 1, row: 3, column: 1, name: 'Rotary encoder LED 2' },
		{ type: 'led', id: 2, row: 3, column: 2, name: 'Rotary encoder LED 3' },
		{ type: 'led', id: 3, row: 3, column: 3, name: 'Rotary encoder LED 4' },
	],
}

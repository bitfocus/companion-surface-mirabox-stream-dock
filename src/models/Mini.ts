import type { StreamDockModelDefinition } from './list.js'

const columns = 3
const rows = 2

export const MiniDefinition: StreamDockModelDefinition = {
	productName: 'Stream Dock Mini',
	iconRotation: 90,
	usbIds: [{ vendorId: 0x5548, productIds: [0x1036] }],
	inputs: [
		...Array.from({ length: columns * rows }, (_, index) => ({
			type: 'button' as const,
			id: index + 1,
			row: Math.floor(index / columns),
			column: index % columns,
			name: `Button ${index + 1}`,
		})),
		// Each switch direction has its own press and release events.
		{ type: 'button', id: 0x24, row: 2, column: 0, name: 'DIP switch 1 left' },
		{ type: 'button', id: 0x25, row: 2, column: 1, name: 'DIP switch 1 push' },
		{ type: 'button', id: 0x26, row: 2, column: 2, name: 'DIP switch 1 right' },
		{ type: 'button', id: 0x21, row: 3, column: 0, name: 'DIP switch 2 left' },
		{ type: 'button', id: 0x22, row: 3, column: 1, name: 'DIP switch 2 push' },
		{ type: 'button', id: 0x23, row: 3, column: 2, name: 'DIP switch 2 right' },
	],
	outputs: Array.from({ length: columns * rows }, (_, index) => ({
		type: 'lcd' as const,
		id: index + 1,
		row: Math.floor(index / columns),
		column: index % columns,
		name: `LCD ${index + 1}`,
		resolutionx: 64,
		resolutiony: 64,
	})),
	pincodePositions: {
		pincode: [0, 3],
		0: [1, 3],
		1: [0, 1],
		2: [1, 1],
		3: [2, 1],
		4: [0, 0],
		5: [1, 0],
		6: [2, 0],
		7: [0, 2],
		8: [1, 2],
		9: [2, 2],
	},
}

export const MiniWDefinition: StreamDockModelDefinition = {
	...MiniDefinition,
	productName: 'Stream Dock MiniW',
	usbIds: [{ vendorId: 0x5548, productIds: [0x1037, 0x1040] }],
}

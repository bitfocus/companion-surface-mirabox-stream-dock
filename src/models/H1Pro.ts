import type { StreamDockModelDefinition } from './list.js'

const columns = 4
const rows = 3

export const H1ProDefinition: StreamDockModelDefinition = {
	productName: 'Stream Dock H1 Pro',
	iconRotation: 90,
	initialMode: 0x32,
	modeReport: 0x32,
	// In the native Stream Dock software, H1 Pro has no long-press behavior and reports 0x02 to cancel a press.
	// Companion supports long presses and has no matching cancel event, so adapt 0x02 to keyUp.
	buttonReleaseValues: [0x02],
	usbIds: [{ vendorId: 0x5548, productIds: [0x1030, 0x1033] }],
	inputs: Array.from({ length: columns * rows }, (_, index) => ({
		type: 'button' as const,
		id: index + 1,
		row: Math.floor(index / columns),
		column: index % columns,
		name: `Button ${index + 1}`,
	})),
	outputs: Array.from({ length: columns * rows }, (_, index) => {
		const row = Math.floor(index / columns)
		const column = index % columns
		return {
			type: 'lcd' as const,
			id: index + 1,
			row,
			column,
			name: `LCD ${index + 1}`,
			resolutionx: 64,
			resolutiony: 64,
		}
	}),
}

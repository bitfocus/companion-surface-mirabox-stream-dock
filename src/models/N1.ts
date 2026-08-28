import type { StreamDockModelDefinition } from './list.js'

export const N1_Definition: StreamDockModelDefinition = {
	productName: 'Stream Dock N1',
	iconRotation: 270,
	usbIds: [
		{
			vendorId: 0x6603,
			productIds: [0x1000],
		},
	],

	inputs: [
	// Top row physical controls (2 buttons + rotary press)
	{ type: 'button', id: 30, row: 0, column: 0, name: 'Top Button 1' },
	{ type: 'button', id: 31, row: 0, column: 1, name: 'Top Button 2' },
	{ type: 'button', id: 35, row: 0, column: 2, name: 'Rotary Press' },
	{ type: 'rotateLeft', id: 50, row: 0, column: 2, name: 'Rotary Left' },
	{ type: 'rotateRight', id: 51, row: 0, column: 2, name: 'Rotary Right' },

	// Interactive 3 x 5 grid
	{ type: 'button', id: 1, row: 1, column: 0, name: 'Button 1' },
	{ type: 'button', id: 2, row: 1, column: 1, name: 'Button 2' },
	{ type: 'button', id: 3, row: 1, column: 2, name: 'Button 3' },
	{ type: 'button', id: 4, row: 2, column: 0, name: 'Button 4' },
	{ type: 'button', id: 5, row: 2, column: 1, name: 'Button 5' },
	{ type: 'button', id: 6, row: 2, column: 2, name: 'Button 6' },
	{ type: 'button', id: 7, row: 3, column: 0, name: 'Button 7' },
	{ type: 'button', id: 8, row: 3, column: 1, name: 'Button 8' },
	{ type: 'button', id: 9, row: 3, column: 2, name: 'Button 9' },
	{ type: 'button', id: 10, row: 4, column: 0, name: 'Button 10' },
	{ type: 'button', id: 11, row: 4, column: 1, name: 'Button 11' },
	{ type: 'button', id: 12, row: 4, column: 2, name: 'Button 12' },
	{ type: 'button', id: 13, row: 5, column: 0, name: 'Button 13' },
	{ type: 'button', id: 14, row: 5, column: 1, name: 'Button 14' },
	{ type: 'button', id: 15, row: 5, column: 2, name: 'Button 15' },
	],
	outputs: [
	// Top non-interactive LCDs: 2 physical buttons + rotary dial
	{ type: 'lcd', id: 16, row: 0, column: 0, name: 'Top LCD 1', resolutionx: 90, resolutiony: 90 },
	{ type: 'lcd', id: 17, row: 0, column: 1, name: 'Top LCD 2', resolutionx: 90, resolutiony: 90 },
	{ type: 'lcd', id: 18, row: 0, column: 2, name: 'Top LCD 3', resolutionx: 90, resolutiony: 90 },
	// Interactive 3 x 5 grid
	{ type: 'lcd', id: 1, row: 1, column: 0, name: 'LCD 1', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 2, row: 1, column: 1, name: 'LCD 2', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 3, row: 1, column: 2, name: 'LCD 3', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 4, row: 2, column: 0, name: 'LCD 4', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 5, row: 2, column: 1, name: 'LCD 5', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 6, row: 2, column: 2, name: 'LCD 6', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 7, row: 3, column: 0, name: 'LCD 7', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 8, row: 3, column: 1, name: 'LCD 8', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 9, row: 3, column: 2, name: 'LCD 9', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 10, row: 4, column: 0, name: 'LCD 10', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 11, row: 4, column: 1, name: 'LCD 11', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 12, row: 4, column: 2, name: 'LCD 12', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 13, row: 5, column: 0, name: 'LCD 13', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 14, row: 5, column: 1, name: 'LCD 14', resolutionx: 100, resolutiony: 100 },
	{ type: 'lcd', id: 15, row: 5, column: 2, name: 'LCD 15', resolutionx: 100, resolutiony: 100 },
],
}

import type { StreamDockModelDefinition } from './list.js'

export const MiraboxXLDefinition: StreamDockModelDefinition = {
	productName: 'Stream Dock XL',
	iconRotation: 180,
	usbIds: [
		{
			vendorId: 0x5548,
			productIds: [0x1031, 0x1028], // 0x1031 international version, 0x1028 chinese version
		},
	],

	inputs: [
		// Left rocker
		{ type: 'button', id: 0x21, row: 0, column: 0, name: 'Left Rocker up' },
		{ type: 'button', id: 0x22, row: 1, column: 0, name: 'Left Rocker push' },
		{ type: 'button', id: 0x23, row: 2, column: 0, name: 'Left Rocker down' },
		// Right rocker
		{ type: 'button', id: 0x24, row: 0, column: 9, name: 'Right Rocker up' },
		{ type: 'button', id: 0x25, row: 1, column: 9, name: 'Right Rocker push' },
		{ type: 'button', id: 0x26, row: 2, column: 9, name: 'Right Rocker down' },
		// Row 0 (columns 1-8)
		{ type: 'button', id: 0x01, row: 0, column: 1, name: 'Button 1' },
		{ type: 'button', id: 0x02, row: 0, column: 2, name: 'Button 2' },
		{ type: 'button', id: 0x03, row: 0, column: 3, name: 'Button 3' },
		{ type: 'button', id: 0x04, row: 0, column: 4, name: 'Button 4' },
		{ type: 'button', id: 0x05, row: 0, column: 5, name: 'Button 5' },
		{ type: 'button', id: 0x06, row: 0, column: 6, name: 'Button 6' },
		{ type: 'button', id: 0x07, row: 0, column: 7, name: 'Button 7' },
		{ type: 'button', id: 0x08, row: 0, column: 8, name: 'Button 8' },
		// Row 1 (columns 1-8)
		{ type: 'button', id: 0x09, row: 1, column: 1, name: 'Button 9' },
		{ type: 'button', id: 0x0a, row: 1, column: 2, name: 'Button 10' },
		{ type: 'button', id: 0x0b, row: 1, column: 3, name: 'Button 11' },
		{ type: 'button', id: 0x0c, row: 1, column: 4, name: 'Button 12' },
		{ type: 'button', id: 0x0d, row: 1, column: 5, name: 'Button 13' },
		{ type: 'button', id: 0x0e, row: 1, column: 6, name: 'Button 14' },
		{ type: 'button', id: 0x0f, row: 1, column: 7, name: 'Button 15' },
		{ type: 'button', id: 0x10, row: 1, column: 8, name: 'Button 16' },
		// Row 2 (columns 1-8)
		{ type: 'button', id: 0x11, row: 2, column: 1, name: 'Button 17' },
		{ type: 'button', id: 0x12, row: 2, column: 2, name: 'Button 18' },
		{ type: 'button', id: 0x13, row: 2, column: 3, name: 'Button 19' },
		{ type: 'button', id: 0x14, row: 2, column: 4, name: 'Button 20' },
		{ type: 'button', id: 0x15, row: 2, column: 5, name: 'Button 21' },
		{ type: 'button', id: 0x16, row: 2, column: 6, name: 'Button 22' },
		{ type: 'button', id: 0x17, row: 2, column: 7, name: 'Button 23' },
		{ type: 'button', id: 0x18, row: 2, column: 8, name: 'Button 24' },
		// Row 3 (columns 1-8)
		{ type: 'button', id: 0x19, row: 3, column: 1, name: 'Button 25' },
		{ type: 'button', id: 0x1a, row: 3, column: 2, name: 'Button 26' },
		{ type: 'button', id: 0x1b, row: 3, column: 3, name: 'Button 27' },
		{ type: 'button', id: 0x1c, row: 3, column: 4, name: 'Button 28' },
		{ type: 'button', id: 0x1d, row: 3, column: 5, name: 'Button 29' },
		{ type: 'button', id: 0x1e, row: 3, column: 6, name: 'Button 30' },
		{ type: 'button', id: 0x1f, row: 3, column: 7, name: 'Button 31' },
		{ type: 'button', id: 0x20, row: 3, column: 8, name: 'Button 32' },
	],
	outputs: [
		// Row 0 (top, columns 1-8)
		{ type: 'lcd', id: 0x19, row: 0, column: 1, name: 'LCD 1', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x1a, row: 0, column: 2, name: 'LCD 2', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x1b, row: 0, column: 3, name: 'LCD 3', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x1c, row: 0, column: 4, name: 'LCD 4', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x1d, row: 0, column: 5, name: 'LCD 5', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x1e, row: 0, column: 6, name: 'LCD 6', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x1f, row: 0, column: 7, name: 'LCD 7', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x20, row: 0, column: 8, name: 'LCD 8', resolutionx: 80, resolutiony: 80 },
		// Row 1 (columns 1-8)
		{ type: 'lcd', id: 0x11, row: 1, column: 1, name: 'LCD 9', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x12, row: 1, column: 2, name: 'LCD 10', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x13, row: 1, column: 3, name: 'LCD 11', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x14, row: 1, column: 4, name: 'LCD 12', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x15, row: 1, column: 5, name: 'LCD 13', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x16, row: 1, column: 6, name: 'LCD 14', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x17, row: 1, column: 7, name: 'LCD 15', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x18, row: 1, column: 8, name: 'LCD 16', resolutionx: 80, resolutiony: 80 },
		// Row 2 (columns 1-8)
		{ type: 'lcd', id: 0x09, row: 2, column: 1, name: 'LCD 17', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x0a, row: 2, column: 2, name: 'LCD 18', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x0b, row: 2, column: 3, name: 'LCD 19', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x0c, row: 2, column: 4, name: 'LCD 20', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x0d, row: 2, column: 5, name: 'LCD 21', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x0e, row: 2, column: 6, name: 'LCD 22', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x0f, row: 2, column: 7, name: 'LCD 23', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x10, row: 2, column: 8, name: 'LCD 24', resolutionx: 80, resolutiony: 80 },
		// Row 3 (bottom, columns 1-8, ID starts at 0x01)
		{ type: 'lcd', id: 0x01, row: 3, column: 1, name: 'LCD 25', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x02, row: 3, column: 2, name: 'LCD 26', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x03, row: 3, column: 3, name: 'LCD 27', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x04, row: 3, column: 4, name: 'LCD 28', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x05, row: 3, column: 5, name: 'LCD 29', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x06, row: 3, column: 6, name: 'LCD 30', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x07, row: 3, column: 7, name: 'LCD 31', resolutionx: 80, resolutiony: 80 },
		{ type: 'lcd', id: 0x08, row: 3, column: 8, name: 'LCD 32', resolutionx: 80, resolutiony: 80 },
		// LED-Array
		{ type: 'led', id: 0x00, row: 3, column: 0, name: 'Side LEDs' },
	],

	pincodePositions: {
		pincode: [3, 3],
		0: [4, 3],
		1: [3, 2],
		2: [4, 2],
		3: [5, 2],
		4: [3, 1],
		5: [4, 1],
		6: [5, 1],
		7: [3, 0],
		8: [4, 0],
		9: [5, 0],
	},

	configFields: [
		{
			id: 'LEDmode',
			type: 'dropdown',
			label: 'Side LEDs mode',
			choices: [
				{ id: 'color', label: 'Dominant color of button 3/0' },
				{ id: 'animation', label: 'Rainbow animation' },
				{ id: 'off', label: 'Off' },
			],
			default: 'color',
		},
	],
}

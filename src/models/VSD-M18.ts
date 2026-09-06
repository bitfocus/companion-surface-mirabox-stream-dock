import type { StreamDockModelDefinition } from './list.js'

/**
 * VSDinside Stream Dock M18 (HOTSPOTEKUSB), USB 5548:1000.
 *
 * Verified against hardware by USB capture of the vendor software (VSD Craft
 * 3.10.202.0702) plus direct control of the device:
 *
 *  - button ids: 0x01-0x0f for the 5x3 grid, 0x25 / 0x30 / 0x31 for the three
 *    round buttons below it
 *  - LCD ids: rows inverted relative to the buttons, top row 0x0b-0x0f and
 *    bottom row 0x01-0x05
 *  - LCD resolution: 64x64, read from the SOF0 marker of six JPEGs captured
 *    from the vendor software
 *  - packet size: 1024 (HID output report is 1025 bytes including the report-id
 *    placeholder; the device declares no report ids)
 *  - iconRotation: 0 — images render upright with no mirroring
 *
 * Note the resolution differs from the existing M18V3 definition, which
 * declares 60x60. This device is a different USB id (5548:1000 rather than
 * 6603:1012) and its vendor software demonstrably sends 64x64.
 */
export const VSD_M18Definition: StreamDockModelDefinition = {
	productName: 'VSDinside Stream Dock M18',
	iconRotation: 0,
	usbIds: [{ vendorId: 0x5548, productIds: [0x1000] }],

	inputs: [
		{ type: 'button', id: 0x01, row: 0, column: 0, name: 'Button 1' },
		{ type: 'button', id: 0x02, row: 0, column: 1, name: 'Button 2' },
		{ type: 'button', id: 0x03, row: 0, column: 2, name: 'Button 3' },
		{ type: 'button', id: 0x04, row: 0, column: 3, name: 'Button 4' },
		{ type: 'button', id: 0x05, row: 0, column: 4, name: 'Button 5' },

		{ type: 'button', id: 0x06, row: 1, column: 0, name: 'Button 6' },
		{ type: 'button', id: 0x07, row: 1, column: 1, name: 'Button 7' },
		{ type: 'button', id: 0x08, row: 1, column: 2, name: 'Button 8' },
		{ type: 'button', id: 0x09, row: 1, column: 3, name: 'Button 9' },
		{ type: 'button', id: 0x0a, row: 1, column: 4, name: 'Button 10' },

		{ type: 'button', id: 0x0b, row: 2, column: 0, name: 'Button 11' },
		{ type: 'button', id: 0x0c, row: 2, column: 1, name: 'Button 12' },
		{ type: 'button', id: 0x0d, row: 2, column: 2, name: 'Button 13' },
		{ type: 'button', id: 0x0e, row: 2, column: 3, name: 'Button 14' },
		{ type: 'button', id: 0x0f, row: 2, column: 4, name: 'Button 15' },

		{ type: 'button', id: 0x25, row: 3, column: 1, name: 'Button 16' },
		{ type: 'button', id: 0x30, row: 3, column: 2, name: 'Button 17' },
		{ type: 'button', id: 0x31, row: 3, column: 3, name: 'Button 18' },
	],

	outputs: [
		{ type: 'lcd', id: 0x0b, row: 0, column: 0, name: 'LCD 1', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x0c, row: 0, column: 1, name: 'LCD 2', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x0d, row: 0, column: 2, name: 'LCD 3', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x0e, row: 0, column: 3, name: 'LCD 4', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x0f, row: 0, column: 4, name: 'LCD 5', resolutionx: 64, resolutiony: 64 },

		{ type: 'lcd', id: 0x06, row: 1, column: 0, name: 'LCD 6', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x07, row: 1, column: 1, name: 'LCD 7', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x08, row: 1, column: 2, name: 'LCD 8', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x09, row: 1, column: 3, name: 'LCD 9', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x0a, row: 1, column: 4, name: 'LCD 10', resolutionx: 64, resolutiony: 64 },

		{ type: 'lcd', id: 0x01, row: 2, column: 0, name: 'LCD 11', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x02, row: 2, column: 1, name: 'LCD 12', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x03, row: 2, column: 2, name: 'LCD 13', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x04, row: 2, column: 3, name: 'LCD 14', resolutionx: 64, resolutiony: 64 },
		{ type: 'lcd', id: 0x05, row: 2, column: 4, name: 'LCD 15', resolutionx: 64, resolutiony: 64 },
	],
}

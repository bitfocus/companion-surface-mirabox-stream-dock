import type { StreamDockInputDefinition, StreamDockModelDefinition, StreamDockOutputDefinition } from './list.js'

/**
 * Mirabox / VSDinside Stream Dock N1
 *
 * Hardware (from the official MiraboxSpace StreamDock-Device-SDK, StreamDockN1):
 * - 15 LCD keys, 96×96 px, hardware ids 0x01…0x0F (left→right, top→bottom, 3 columns × 5 rows)
 * - secondary screen strip split in 3 segments, image ids 16…18 (0x10…0x12), shown above the top controls.
 *   Native size is 64×64 per the C++ SDK, 80×80 per the Python SDK: selectable in the surface config.
 * - 2 physical buttons at the top, hardware ids 0x1E / 0x1F (press + release)
 * - 1 rotary encoder: push 0x23 (press + release), rotate left 0x32, rotate right 0x33
 * - input report 512 B, output report 1024 B
 * - boots in keyboard/numpad mode: must be switched to software mode with `CRT..MOD` (mode 2)
 *
 * Companion grid (3 columns × 6 rows):
 *   row 0      : [Top button 1] [Top button 2] [Knob]   (images on the 3 strip segments)
 *   rows 1 … 5 : keys 1 … 15
 *
 * By default the top buttons run the Companion buttons at row 0 (whose images are on the strip) and the
 * knob rotation browses pages natively (see `pageNav`). The knob press is always a normal Companion button.
 */

const KEY_COLUMNS = 3
const KEY_ROWS = 5
const KEY_ROW_OFFSET = 1

const keyInputs: StreamDockInputDefinition[] = []
const keyOutputs: StreamDockOutputDefinition[] = []

for (let i = 0; i < KEY_COLUMNS * KEY_ROWS; i++) {
	const id = i + 1
	const row = Math.floor(i / KEY_COLUMNS) + KEY_ROW_OFFSET
	const column = i % KEY_COLUMNS

	keyInputs.push({ type: 'button', id, row, column, name: `Button ${id}` })
	keyOutputs.push({ type: 'lcd', id, row, column, name: `LCD ${id}`, resolutionx: 96, resolutiony: 96 })
}

export const N1Definition: StreamDockModelDefinition = {
	productName: 'Stream Dock N1',
	iconRotation: 0,
	usbIds: [
		{
			vendorId: 0x6603,
			// 0x1011 = N1, 0x1000 = N1E / N1 EN (international)
			productIds: [0x1011, 0x1000],
		},
		{
			// VSDinside-branded N1 (reports as "HOTSPOTEKUSB HID DEMO"), verified on hardware
			vendorId: 0x5548,
			productIds: [0x1002],
		},
	],

	inputs: [
		// Top row: two physical buttons + rotary encoder
		{ type: 'button', id: 0x1e, row: 0, column: 0, name: 'Top button 1', pageNav: 'next' },
		{ type: 'button', id: 0x1f, row: 0, column: 1, name: 'Top button 2', pageNav: 'previous' },
		{ type: 'button', id: 0x23, row: 0, column: 2, name: 'Rotary encoder' },
		{ type: 'rotateLeft', id: 0x32, row: 0, column: 2, name: 'Rotary encoder', pageNav: 'previous' },
		{ type: 'rotateRight', id: 0x33, row: 0, column: 2, name: 'Rotary encoder', pageNav: 'next' },
		// Encoder codes used by other Stream Dock models: accepted too, in case VSDinside firmware differs from the SDK
		...[0x50, 0x60, 0x70, 0x90, 0xa0].flatMap((left): StreamDockInputDefinition[] => [
			{ type: 'rotateLeft', id: left, row: 0, column: 2, name: 'Rotary encoder', pageNav: 'previous' },
			{ type: 'rotateRight', id: left + 1, row: 0, column: 2, name: 'Rotary encoder', pageNav: 'next' },
		]),

		// 15 LCD keys
		...keyInputs,
	],

	outputs: [
		// Secondary screen strip: one segment above each top control
		{
			type: 'lcd',
			id: 0x10,
			row: 0,
			column: 0,
			name: 'Strip 1',
			resolutionx: 64,
			resolutiony: 64,
			nativeSizeConfig: 'stripSize',
		},
		{
			type: 'lcd',
			id: 0x11,
			row: 0,
			column: 1,
			name: 'Strip 2',
			resolutionx: 64,
			resolutiony: 64,
			nativeSizeConfig: 'stripSize',
		},
		{
			type: 'lcd',
			id: 0x12,
			row: 0,
			column: 2,
			name: 'Strip 3',
			resolutionx: 64,
			resolutiony: 64,
			nativeSizeConfig: 'stripSize',
		},

		// 15 LCD keys
		...keyOutputs,
	],

	// [column, row] — numpad-like layout on the 3×5 key block
	pincodePositions: {
		7: [0, 1],
		8: [1, 1],
		9: [2, 1],
		4: [0, 2],
		5: [1, 2],
		6: [2, 2],
		1: [0, 3],
		2: [1, 3],
		3: [2, 3],
		pincode: [0, 4],
		0: [1, 4],
	},

	// The N1 is a composite device (keyboard + vendor HID): the control interface is not necessarily interface 0
	hidMatch: 'vendorUsagePage',

	// Needed for the "Change page directly" knob mode (must also be enabled in the surface settings)
	changePageLabel: 'Knob rotation changes page',

	deviceModes: {
		software: 2,
		defaultOnClose: 0,
	},

	configFields: [
		{
			id: 'stripSize',
			type: 'dropdown',
			label: 'Top strip image size (change if the strip icons look wrong)',
			choices: [
				{ id: '64', label: '64 × 64 (default)' },
				{ id: '80', label: '80 × 80' },
			],
			default: '64',
		},
		{
			id: 'topButtonsMode',
			type: 'dropdown',
			label: 'Top buttons',
			choices: [
				{ id: 'companion', label: 'Run the Companion buttons shown on the strip (default)' },
				{ id: 'nav', label: 'Fixed page navigation (button 1 = page up, button 2 = page down)' },
				{ id: 'navInverted', label: 'Fixed page navigation, inverted' },
			],
			default: 'companion',
		},
		{
			id: 'knobMode',
			type: 'dropdown',
			label: 'Knob rotation',
			choices: [
				{ id: 'topButtons', label: 'Press the top buttons: right = button 1, left = button 2 (default)' },
				{ id: 'nav', label: 'Change page directly' },
				{ id: 'companion', label: 'Rotate actions of the Companion button at row 0 / column 2' },
			],
			default: 'topButtons',
		},
		{
			id: 'n1ModeOnClose',
			type: 'dropdown',
			label: 'Mode when Companion releases the device',
			choices: [
				{ id: 'keyboard', label: 'Keyboard / numpad (standalone)' },
				{ id: 'calculator', label: 'Calculator (standalone)' },
				{ id: 'software', label: 'Stay in software mode (blank)' },
			],
			default: 'keyboard',
		},
	],
}

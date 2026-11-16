import type { StreamDockInputDefinition, StreamDockModelDefinition } from './list.js'
import { N4_1234Definition } from './N4-1234.js'

const touchKeyWidth = 200

/**
 * The N4 Pro adds an RGB LED above each encoder. The four RGB triplets form a
 * 12-byte SETLB payload.
 */
export const N4ProDefinition: StreamDockModelDefinition = {
	...N4_1234Definition,
	productName: 'Stream Dock N4 Pro',
	usbIds: [{ vendorId: 0x5548, productIds: [0x1008, 0x1021, 0x1023] }],
	ledArrayLength: 12,
	knobReleaseMinFirmware: 13,
	inputs: N4_1234Definition.inputs.map((input): StreamDockInputDefinition => {
		if (input.type === 'push' && input.row === 2) {
			return { ...input, type: 'button' }
		}
		if (input.type === 'push' && input.row === 3) {
			return { ...input, type: 'knobPress' }
		}

		return { ...input }
	}),
	touchSoftKeys: {
		minX: 114,
		maxX: 693,
		inputIds: [0x40, 0x41, 0x42, 0x43],
		reportRegionWidth: touchKeyWidth,
	},
	outputs: [
		...N4_1234Definition.outputs,
		{ type: 'led', id: 0, row: 3, column: 0, name: 'Rotary encoder LED 1' },
		{ type: 'led', id: 1, row: 3, column: 1, name: 'Rotary encoder LED 2' },
		{ type: 'led', id: 2, row: 3, column: 2, name: 'Rotary encoder LED 3' },
		{ type: 'led', id: 3, row: 3, column: 3, name: 'Rotary encoder LED 4' },
	],
	configFields: [
		{
			id: 'vibrationEnabled',
			type: 'checkbox',
			label: 'Enable vibration',
			default: true,
		},
	],
}

export function getN4ProDefinition(firmwareRevision: number | undefined): StreamDockModelDefinition {
	if (firmwareRevision === undefined || firmwareRevision < 16) return N4ProDefinition

	return {
		...N4ProDefinition,
		outputs: N4ProDefinition.outputs.map((output) =>
			output.type === 'lcd' && output.row === 2 ? { ...output, resolutionx: touchKeyWidth, resolutiony: 112 } : output,
		),
	}
}

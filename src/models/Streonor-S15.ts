import type { StreamDockModelDefinition } from './list.js'
import { HSV_293SDefinition } from './HSV-293S.js'

// Same hardware as HSV-293S, different USB ID.
// The right-hand strip is display only, so drop the softbutton inputs at column 5.
const BUTTON_RESOLUTION = 94
const STRIP_RESOLUTION = 82

export const StreonorS15Definition: StreamDockModelDefinition = {
	...HSV_293SDefinition,
	productName: 'Streonor S15',
	usbIds: [
		{
			vendorId: 0x1500,
			productIds: [0x3005],
		},
	],
	inputs: HSV_293SDefinition.inputs.filter((input) => input.column < 5),
	outputs: HSV_293SDefinition.outputs.map((output) => {
		if (output.type !== 'lcd') return output
		if (output.name.startsWith('LCD '))
			return { ...output, resolutionx: BUTTON_RESOLUTION, resolutiony: BUTTON_RESOLUTION }
		if (output.name.startsWith('Strip '))
			return { ...output, resolutionx: STRIP_RESOLUTION, resolutiony: STRIP_RESOLUTION }
		return output
	}),
}

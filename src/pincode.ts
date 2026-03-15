import { SurfacePincodeMap } from '@companion-surface/base'
import { getControlIdFromXy } from './util.js'
import type { PincodePositionDefinition, StreamDockModelDefinition } from './models/list.js'

export function generatePincodeMap(model: StreamDockModelDefinition): SurfacePincodeMap | null {
	let pincodePositions: Required<PincodePositionDefinition> = {
		pincode: [0, 1],
		0: [4, 1],
		1: [1, 2],
		2: [2, 2],
		3: [3, 2],
		4: [1, 1],
		5: [2, 1],
		6: [3, 1],
		7: [1, 0],
		8: [2, 0],
		9: [3, 0],
	}

	if (typeof model.pincodePositions === 'object') {
		pincodePositions = { ...pincodePositions, ...model.pincodePositions }
	}
	return {
		type: 'single-page',
		pincode: getControlIdFromXy(...pincodePositions.pincode),
		0: getControlIdFromXy(...pincodePositions[0]),
		1: getControlIdFromXy(...pincodePositions[1]),
		2: getControlIdFromXy(...pincodePositions[2]),
		3: getControlIdFromXy(...pincodePositions[3]),
		4: getControlIdFromXy(...pincodePositions[4]),
		5: getControlIdFromXy(...pincodePositions[5]),
		6: getControlIdFromXy(...pincodePositions[6]),
		7: getControlIdFromXy(...pincodePositions[7]),
		8: getControlIdFromXy(...pincodePositions[8]),
		9: getControlIdFromXy(...pincodePositions[9]),
	}
}

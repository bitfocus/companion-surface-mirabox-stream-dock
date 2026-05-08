import type { SomeCompanionInputField, SurfaceModuleManifestUsbIds } from '@companion-surface/base'
import { Mirabox283V3Definition } from './293V3.js'
import { MiraboxXLDefinition } from './Mirabox-XL.js'
import { N4_1245Definition } from './N4-1245.js'
import { N4_1234Definition } from './N4-1234.js'
import { N3_293N3Definition } from './N3-293N3.js'
import { HSV_293SDefinition } from './HSV-293S.js'
import { HSV_293S_3Definition } from './HSV-293S-3.js'
import { HSV_293S_2Definition } from './HSV-293S-2.js'
import { M18V3Definition } from './M18V3.js'
import { Ajaz_AKP153Definition } from './Ajazz-AKP153.js'
import { Ajaz_AKP153EDefinition } from './Ajazz-AKP153E.js'
import { Ajaz_AKP03EDefinition } from './Ajazz-AKP03E.js'
import { Ajaz_AKP05EDefinition } from './Ajazz-AKP05E.js'

export interface StreamDockModelDefinition {
	productName: string
	usbIds: SurfaceModuleManifestUsbIds[]
	iconRotation: number
	/** If set, the packet size will be overridden */
	packetSize?: number

	inputs: StreamDockInputDefinition[]
	outputs: StreamDockOutputDefinition[]

	/** If set, the default 4x3 map starting top left will be overridden */
	pincodePositions?: PincodePositionDefinition

	/** If set, additional configuration options will be available */
	configFields?: Array<SomeCompanionInputField>
}
export interface StreamDockInputDefinition {
	type: 'button' | 'push' | 'rotateLeft' | 'rotateRight' | 'swipeLeft' | 'swipeRight'
	id: number
	row: number
	column: number
	name: string
}
export type StreamDockOutputDefinition = StreamdockOutputLcdDefinition | StreamdockOutputLedDefinition

export type StreamdockOutputLcdDefinition = {
	type: 'lcd'
	id: number
	row: number
	column: number
	name: string
	resolutionx: number
	resolutiony: number
}

export type StreamdockOutputLedDefinition = {
	type: 'led'
	id: number
	row: number
	column: number
	name: string
}

export type NumberPair = [number, number]
export interface PincodePositionDefinition {
	pincode?: NumberPair
	0?: NumberPair
	1?: NumberPair
	2?: NumberPair
	3?: NumberPair
	4?: NumberPair
	5?: NumberPair
	6?: NumberPair
	7?: NumberPair
	8?: NumberPair
	9?: NumberPair
}

export const AllModels: StreamDockModelDefinition[] = [
	Mirabox283V3Definition,
	MiraboxXLDefinition,
	N4_1234Definition,
	N4_1245Definition,
	N3_293N3Definition,
	HSV_293SDefinition,
	HSV_293S_2Definition,
	HSV_293S_3Definition,
	M18V3Definition,
	Ajaz_AKP153Definition,
	Ajaz_AKP153EDefinition,
	Ajaz_AKP03EDefinition,
	Ajaz_AKP05EDefinition,
]

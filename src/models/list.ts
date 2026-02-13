import type { SurfaceModuleManifestUsbIds } from '@companion-surface/base'
import { Mirabox283V3Definition } from './293V3.js'
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

export interface StreamDockModelDefinition {
	productName: string
	usbIds: SurfaceModuleManifestUsbIds[]
	iconRotation: number
	/** If set, the packet size will be overridden */
	packetSize?: number
	/** If set and above zero, a heartbeat signal will be sent every heartbeat ms to keep the device alive */
	heartbeat?: number

	inputs: StreamDockInputDefinition[]
	outputs: StreamDockOutputDefinition[]
}
export interface StreamDockInputDefinition {
	type: 'button' | 'push' | 'rotateLeft' | 'rotateRight' | 'swipeLeft' | 'swipeRight'
	id: number
	row: number
	column: number
	name: string
}
export interface StreamDockOutputDefinition {
	type: 'lcd'
	id: number
	row: number
	column: number
	name: string
	resolutionx: number
	resolutiony: number
}

export const AllModels: StreamDockModelDefinition[] = [
	Mirabox283V3Definition,
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
]

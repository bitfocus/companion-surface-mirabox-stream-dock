import type { SomeCompanionInputField, SurfaceModuleManifestUsbIds } from '@companion-surface/base'
import { Mirabox283V3Definition } from './293V3.js'
import { MiraboxXLDefinition } from './Mirabox-XL.js'
import { N4_1245Definition } from './N4-1245.js'
import { N4_1234Definition } from './N4-1234.js'
import { N4ProDefinition } from './N4-Pro.js'
import { N3_293N3Definition } from './N3-293N3.js'
import { HSV_293SDefinition } from './HSV-293S.js'
import { HSV_293S_3Definition } from './HSV-293S-3.js'
import { HSV_293S_2Definition } from './HSV-293S-2.js'
import { M18V3Definition } from './M18V3.js'
import { VSDinsideM18Definition } from './VSDinside-M18.js'
import { M3Definition } from './M3.js'
import { N1Definition } from './N1.js'
import { K1ProDefinition } from './K1Pro.js'
import { H1ProDefinition } from './H1Pro.js'
import { MiniDefinition, MiniWDefinition } from './Mini.js'
import { Ajaz_AKP153Definition } from './Ajazz-AKP153.js'
import { Ajaz_AKP153EDefinition } from './Ajazz-AKP153E.js'
import { Ajaz_AKP03EDefinition } from './Ajazz-AKP03E.js'
import { StreonorS15Definition } from './Streonor-S15.js'
import { Ajaz_AKP05EDefinition } from './Ajazz-AKP05E.js'
import { soomfon_CN002Definition } from './soomfon-CN002.js'

export interface StreamDockModelDefinition {
	productName: string
	usbIds: SurfaceModuleManifestUsbIds[]
	iconRotation: number
	/** If set, the packet size will be overridden */
	packetSize?: number
	/** JPEG bytes carried by each image report. Defaults to packetSize. */
	imagePacketDataSize?: number
	/** HID output report ID. Defaults to zero. */
	reportId?: number
	/** HID collection selector. Interface defaults to zero when omitted. */
	hidInterface?: number
	hidUsagePage?: number
	hidUsage?: number
	/** Number of bytes in the SETLB LED payload. Defaults to three (one RGB LED). */
	ledArrayLength?: number
	/** If set, a mode switch command will be sent on connect (e.g. the N1 must be switched to console mode) */
	initialMode?: number
	/** If set, an input ACK with this function byte reports that the required mode became active. */
	modeReport?: number
	/** Parameter paired with modeReport. Defaults to zero. */
	modeReportValue?: number
	/**
	 * Additional input parameter values that must be adapted to button release.
	 * Some Stream Dock devices have a native "cancel press" state, but Companion
	 * has no equivalent input event because it supports holding a key between
	 * keyDown and keyUp. Models can list their native cancel values here so the
	 * cancelled press is ended with keyUp in Companion. 0x00 is always release.
	 */
	buttonReleaseValues?: number[]
	/** Minimum numeric firmware suffix for separate knob press and release events. */
	knobReleaseMinFirmware?: number
	/** If true, send the report-ID 4 WEB-off command before other initialization commands. */
	disableWebModeOnConnect?: boolean
	/** Touch-strip coordinates used to turn one touch contact into soft-key down/up events. */
	touchSoftKeys?: {
		minX: number
		maxX: number
		inputIds: number[]
		/** Width of one soft-key region in a TP report. */
		reportRegionWidth: number
	}

	inputs: StreamDockInputDefinition[]
	outputs: StreamDockOutputDefinition[]

	/** If set, the default 4x3 map starting top left will be overridden */
	pincodePositions?: PincodePositionDefinition

	/** If set, additional configuration options will be available */
	configFields?: Array<SomeCompanionInputField>
}
export interface StreamDockInputDefinition {
	type: 'button' | 'push' | 'knobPress' | 'rotateLeft' | 'rotateRight' | 'swipeLeft' | 'swipeRight'
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
	N4ProDefinition,
	N3_293N3Definition,
	HSV_293SDefinition,
	HSV_293S_2Definition,
	HSV_293S_3Definition,
	M18V3Definition,
	VSDinsideM18Definition,
	M3Definition,
	N1Definition,
	Ajaz_AKP153Definition,
	Ajaz_AKP153EDefinition,
	K1ProDefinition,
	H1ProDefinition,
	MiniDefinition,
	MiniWDefinition,
	Ajaz_AKP03EDefinition,
	StreonorS15Definition,
	Ajaz_AKP05EDefinition,
	soomfon_CN002Definition,
]

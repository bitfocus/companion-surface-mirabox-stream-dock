import {
	createModuleLogger,
	type DiscoveredSurfaceInfo,
	type HIDDevice,
	type OpenSurfaceResult,
	type SurfaceContext,
	type SurfacePlugin,
} from '@companion-surface/base'
import { generatePincodeMap as createPincodeMap } from './pincode.js'
import { MiraboxWrapper } from './instance.js'
import { createSurfaceSchema } from './surface-schema.js'
import { createConfigFields } from './config.js'
import { getFirmwareVersion } from './firmware.js'
import { HIDAsync } from 'node-hid'
import { AllModels, StreamDockModelDefinition } from './models/list.js'
import { getN4ProDefinition, N4ProDefinition } from './models/N4-Pro.js'

export interface MiraboxPluginInfo {
	device: HIDDevice
	model: StreamDockModelDefinition
}

const logger = createModuleLogger('Plugin')

const MiraboxPlugin: SurfacePlugin<MiraboxPluginInfo> = {
	init: async (): Promise<void> => {
		// Nothing to do
		console.log('initializing Mirabox Surface integration')
	},
	destroy: async (): Promise<void> => {
		// Nothing to do
	},

	checkSupportsHidDevice: (device: HIDDevice): DiscoveredSurfaceInfo<MiraboxPluginInfo> | null => {
		// Match the device against known models
		const model = AllModels.find((model) => {
			const usbIdMatches = model.usbIds.some(
				(usbId) => usbId.vendorId === device.vendorId && usbId.productIds.includes(device.productId),
			)
			if (!usbIdMatches || device.interface !== (model.hidInterface ?? 0)) return false
			// macOS exposes all collections on an interface through the same HID path.
			// Companion keeps the last collection for that path when opening a device,
			// so its usage can differ from the collection that passed discovery.
			// An explicit interface selector still excludes the keyboard interface.
			if (process.platform !== 'darwin' || model.hidInterface === undefined) {
				if (model.hidUsagePage !== undefined && device.usagePage !== model.hidUsagePage) return false
				if (model.hidUsage !== undefined && device.usage !== model.hidUsage) return false
			}
			return true
		})
		if (!model) return null

		logger.debug(`Checked HID device: ${model.productName}`)

		return {
			surfaceId: `streamdock:${device.serialNumber}`,
			description: `Mirabox ${model.productName}`,
			pluginInfo: {
				device,
				model,
			},
		}
	},

	openSurface: async (
		surfaceId: string,
		pluginInfo: MiraboxPluginInfo,
		context: SurfaceContext,
	): Promise<OpenSurfaceResult> => {
		let firmwareVersion: string | undefined
		if (pluginInfo.model.knobReleaseMinFirmware !== undefined) {
			firmwareVersion = await getFirmwareVersion(pluginInfo.device.path).catch((error: unknown) => {
				logger.warn(`Could not read firmware version for ${surfaceId}: ${String(error)}`)
				return undefined
			})
			logger.debug(`Firmware version for ${surfaceId}: ${firmwareVersion ?? 'unknown'}`)
		}
		const revision = firmwareVersion?.match(/^V\d+\..+\.(\d+)\D*$/i)?.[1]
		const firmwareRevision = revision === undefined ? undefined : Number(revision)
		const model = pluginInfo.model === N4ProDefinition ? getN4ProDefinition(firmwareRevision) : pluginInfo.model

		const device = await HIDAsync.open(pluginInfo.device.path).catch((error: unknown) => {
			throw new Error(`Failed to open HID device ${pluginInfo.device.path}: ${String(error)}`, { cause: error })
		})

		logger.debug(`Opening ${pluginInfo.device.path} device: ${pluginInfo.model.productName} (${surfaceId})`)

		return {
			surface: new MiraboxWrapper(surfaceId, pluginInfo.device, device, model, context, firmwareRevision),
			registerProps: {
				brightness: true,
				surfaceLayout: createSurfaceSchema(model),
				pincodeMap: createPincodeMap(model),
				configFields: createConfigFields(model),
				location: null,
			},
		}
	},
}
export default MiraboxPlugin

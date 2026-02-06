import {
	createModuleLogger,
	type DiscoveredSurfaceInfo,
	type HIDDevice,
	type OpenSurfaceResult,
	type SurfaceContext,
	type SurfacePlugin,
} from '@companion-surface/base'
import { generatePincodeMap } from './pincode.js'
import { MiraboxWrapper } from './instance.js'
import { createSurfaceSchema } from './surface-schema.js'
import { HIDAsync } from 'node-hid'
import { AllModels, StreamDockModelDefinition } from './models/list.js'

export interface MiraboxPluginInfo {
	device: HIDDevice
	model: StreamDockModelDefinition
}

const logger = createModuleLogger('Plugin')

const MiraboxPlugin: SurfacePlugin<MiraboxPluginInfo> = {
	init: async (): Promise<void> => {
		// Nothing to do
	},
	destroy: async (): Promise<void> => {
		// Nothing to do
	},

	checkSupportsHidDevice: (device: HIDDevice): DiscoveredSurfaceInfo<MiraboxPluginInfo> | null => {
		if (device.interface !== 0) return null

		// Match the device against known models
		const model = AllModels.find((model) =>
			model.usbIds.some((usbId) => usbId.vendorId === device.vendorId && usbId.productIds.includes(device.productId)),
		)
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
		const device = await HIDAsync.open(pluginInfo.device.path).catch(() => {
			throw new Error(`Device not found: ${pluginInfo.device.path}`)
		})

		logger.debug(`Opening ${pluginInfo.device.path} device: ${pluginInfo.model.productName} (${surfaceId})`)

		return {
			surface: new MiraboxWrapper(surfaceId, pluginInfo.device, device, pluginInfo.model, context),
			registerProps: {
				brightness: true,
				surfaceLayout: createSurfaceSchema(pluginInfo.model),
				pincodeMap: generatePincodeMap(pluginInfo.model),
				configFields: null,
				location: null,
			},
		}
	},
}
export default MiraboxPlugin

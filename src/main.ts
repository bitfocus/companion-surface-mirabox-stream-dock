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
		console.log('initializing Mirabox Surface integration')
	},
	destroy: async (): Promise<void> => {
		// Nothing to do
	},

	checkSupportsHidDevice: (device: HIDDevice): DiscoveredSurfaceInfo<MiraboxPluginInfo> | null => {
		// Match the device against known models
		const model = AllModels.find((model) =>
			model.usbIds.some((usbId) => usbId.vendorId === device.vendorId && usbId.productIds.includes(device.productId)),
		)
		if (!model) return null

		if (model.hidMatch === 'vendorUsagePage') {
			// Composite devices (e.g. N1: keyboard + vendor HID). The control interface is the vendor-defined
			// collection (usagePage > 0x0401, usage 1), same rule as the official Mirabox SDK.
			const isVendorCollection = (device.usagePage ?? 0) > 0x0401 && device.usage === 1
			if (!isVendorCollection) {
				logger.debug(
					`Skipping ${model.productName} HID collection: interface ${device.interface}, usagePage 0x${(device.usagePage ?? 0).toString(16)}, usage ${device.usage}`,
				)
				return null
			}
		} else if (device.interface !== 0) {
			return null
		}

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
				pincodeMap: createPincodeMap(pluginInfo.model),
				configFields: createConfigFields(pluginInfo.model),
				location: null,
				canChangePage: pluginInfo.model.changePageLabel ? { label: pluginInfo.model.changePageLabel } : undefined,
			},
		}
	},
}
export default MiraboxPlugin

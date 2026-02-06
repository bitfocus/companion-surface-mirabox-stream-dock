import type { StreamDockModelDefinition } from './list.js'
import { HSV_293S_3Definition } from './HSV-293S-3.js'

export const Ajaz_AKP153EDefinition: StreamDockModelDefinition = {
	...HSV_293S_3Definition,
	productName: 'AJAZZ AKP-153E',
	usbIds: [
		{
			vendorId: 0x0300,
			productIds: [0x3010],
		},
	],
}

import type { StreamDockModelDefinition } from './list.js'
import { HSV_293S_2Definition } from './HSV-293S-2.js'

// The GK150K uses the HSV293S protocol with 512-byte HID reports.
export const MadDogGK150KDefinition: StreamDockModelDefinition = {
	...HSV_293S_2Definition,
	productName: 'MAD DOG GK150K',
	usbIds: [{ vendorId: 0x0c00, productIds: [0x1000] }],
}

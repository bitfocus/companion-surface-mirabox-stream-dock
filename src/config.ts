import { SomeCompanionInputField } from '@companion-surface/base'
import { StreamDockModelDefinition } from './models/list.js'

export function createConfigFields(model: StreamDockModelDefinition): Array<SomeCompanionInputField> | null {
	if (Array.isArray(model.configFields)) {
		return model.configFields
	} else {
		return null
	}
}

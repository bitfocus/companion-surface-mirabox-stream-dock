import { type SurfaceSchemaLayoutDefinition } from '@companion-surface/base'
import { getControlId } from './util.js'
import type { StreamDockModelDefinition } from './models/list.js'

export function createSurfaceSchema(model: StreamDockModelDefinition): SurfaceSchemaLayoutDefinition {
	const surfaceLayout: SurfaceSchemaLayoutDefinition = {
		stylePresets: {
			default: {
				// Ignore default, as it is hard to translate into for our existing layout
			},
			empty: {},
		},
		controls: {},
	}

	// Start with the outputs, to define the styles needed
	for (const output of model.outputs) {
		const controlId = getControlId(output)

		let resolutionx: number, resolutiony: number
		if (output.type === 'lcd') {
			// use LCDs resolution if LCD, otherwise 48x48. Currently this affects only LEDs
			resolutionx = output.resolutionx
			resolutiony = output.resolutiony
		} else {
			resolutionx = 48
			resolutiony = 48
		}

		const presetId = `btn_${resolutionx}x${resolutiony}`
		if (!surfaceLayout.stylePresets[presetId]) {
			surfaceLayout.stylePresets[presetId] = {
				bitmap: {
					w: resolutionx,
					h: resolutiony,
					format: 'rgb',
				},
			}
		}

		surfaceLayout.controls[controlId] = {
			row: output.row,
			column: output.column,
			stylePreset: presetId,
		}
	}

	// Fill in any missing inputs with no style
	for (const input of model.inputs) {
		const controlId = getControlId(input)

		// Skip if already defined by an output
		if (surfaceLayout.controls[controlId]) {
			continue
		}

		surfaceLayout.controls[controlId] = {
			row: input.row,
			column: input.column,
			stylePreset: 'empty',
		}
	}

	return surfaceLayout
}

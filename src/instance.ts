import {
	CardGenerator,
	HostCapabilities,
	SurfaceDrawProps,
	SurfaceContext,
	SurfaceInstance,
	createModuleLogger,
	ModuleLogger,
	HIDDevice,
} from '@companion-surface/base'
import { setTimeout } from 'node:timers/promises'
import { findDominantColor, getControlId, hsvToRgb, translateRotation } from './util.js'
import { StreamDock } from './streamdock.js'
import type { HIDAsync } from 'node-hid'
import type { StreamDockModelDefinition } from './models/list.js'
import * as imageRs from '@julusian/image-rs'

export class MiraboxWrapper implements SurfaceInstance {
	readonly #logger: ModuleLogger

	readonly #streamDock: StreamDock
	readonly #surfaceId: string
	readonly #context: SurfaceContext
	private config: Record<string, any> = {}

	public get surfaceId(): string {
		return this.#surfaceId
	}
	public get productName(): string {
		return this.#streamDock.productName
	}

	public constructor(
		surfaceId: string,
		deviceInfo: HIDDevice,
		device: HIDAsync,
		model: StreamDockModelDefinition,
		context: SurfaceContext,
	) {
		this.#logger = createModuleLogger(`Instance/${surfaceId}`)
		this.#streamDock = new StreamDock(deviceInfo, device, model)
		this.#surfaceId = surfaceId
		this.#context = context

		this.#streamDock.on('error', (e) => context.disconnect(e as any))

		this.#streamDock.on('down', (control) => {
			this.#context.keyDownById(getControlId(control))
		})

		this.#streamDock.on('up', (control) => {
			this.#context.keyUpById(getControlId(control))
		})

		this.#streamDock.on('push', (control) => {
			this.#context.keyDownUpById(getControlId(control))
		})

		this.#streamDock.on('rotate', (control, amount) => {
			if (amount > 0) {
				this.#context.rotateRightById(getControlId(control))
			} else {
				this.#context.rotateLeftById(getControlId(control))
			}
		})
	}

	async init(): Promise<void> {
		await this.#streamDock.wakeScreen()
		await this.#streamDock.clearPanel()
		await this.#streamDock.setLedBrightness(0)
	}

	async close(): Promise<void> {
		await this.#streamDock.clearPanel().catch(() => null)

		await this.#streamDock.close()
	}

	updateCapabilities(_capabilities: HostCapabilities): void {
		// Not used
	}

	async updateConfig(config: Record<string, any>): Promise<void> {
		this.config = { ...this.config, ...config }
		console.log('updateConfig called', JSON.stringify(this.config, null, 2))
		if (this.config.LEDmode === 'animation') {
			await this.#streamDock.setLedArray([0, 0, 0])
		} else if (this.config.LEDmode === 'off') {
			await Promise.all([this.#streamDock.setLedArray([0, 0, 1]), this.#streamDock.setLedBrightness(0)])
		} else if (this.config.LEDmode === 'color') {
			let lastCol: [number, number, number]
			if (Array.isArray(this.config.XlLedColor)) {
				lastCol = hsvToRgb(this.config.XlLedColor[0], this.config.XlLedColor[1], this.config.XlLedColor[2])
			} else {
				lastCol = [10, 10, 10]
			}
			await Promise.all([
				this.#streamDock.setLedArray(lastCol),
				this.#streamDock.setLedBrightness(this.config.brightness ?? 100),
			])
		}
	}

	async ready(): Promise<void> {}

	async setBrightness(percent: number): Promise<void> {
		if (this.#streamDock.outputs.find((op) => op.type === 'led')) {
			await Promise.all([this.#streamDock.setBrightness(percent), this.#streamDock.setLedBrightness(percent)])
		} else {
			await this.#streamDock.setBrightness(percent)
		}
	}
	async blank(): Promise<void> {
		await this.#streamDock.clearPanel()
	}
	async draw(signal: AbortSignal, drawProps: SurfaceDrawProps): Promise<void> {
		const output = this.#streamDock.outputs.find((control) => getControlId(control) === drawProps.controlId)
		if (!output) return

		if (output.type === 'lcd') {
			if (!drawProps.image || output.resolutionx < 1 || output.resolutiony < 1) {
				return
			}

			const imageRsRotation = translateRotation(this.#streamDock.iconRotation)

			let rotatedBitmap = drawProps.image
			if (imageRsRotation) {
				let image = imageRs.ImageTransformer.fromBuffer(
					drawProps.image,
					output.resolutionx,
					output.resolutiony,
					'rgb',
				).rotate(imageRsRotation)

				// pad, in case a button is non-square
				const dimensions = image.getCurrentDimensions()
				const xOffset = (output.resolutionx - dimensions.width) / 2
				const yOffset = (output.resolutiony - dimensions.height) / 2
				image = image.pad(Math.floor(xOffset), Math.ceil(xOffset), Math.floor(yOffset), Math.ceil(yOffset), {
					red: 0,
					green: 0,
					blue: 0,
					alpha: 255,
				})

				const computedImage = await image.toBuffer('rgb')
				rotatedBitmap = computedImage.buffer
			}

			const maxAttempts = 3
			for (let attempts = 1; attempts <= maxAttempts; attempts++) {
				try {
					if (signal.aborted) return

					await this.#streamDock.setKeyImage(output.column, output.row, Buffer.from(rotatedBitmap))
					return
				} catch (e) {
					if (signal.aborted) return

					if (attempts == maxAttempts) {
						this.#logger.debug(`fillImage failed after ${attempts} attempts: ${e}`)
						this.#context.disconnect(e as any)
						return
					}
					await setTimeout(20)
				}
			}
		} else if (output.type === 'led') {
			if (!drawProps.image) {
				this.#logger.warn('no image for led output')
				return
			}
			const [h, s, v] = findDominantColor(drawProps.image)

			if (this.#streamDock.productName === 'Stream Dock XL') {
				// for XL there is a mode setting for the side LEDs. We need to memorize color changes, in case they are switched off and on.
				this.config.XlLedColor = [h, s, v]
				if (this.config.LEDmode === 'animation' || this.config.LEDmode === 'off') {
					return
				}
			}

			if (v > 0) {
				await Promise.all([
					this.#streamDock.setLedArray(hsvToRgb(h, s, v)),
					this.#streamDock.setLedBrightness(this.config.brightness),
				])
			} else {
				if (this.#streamDock.productName === 'Stream Dock XL') {
					// the XL has only one LED and it can't be switched completely off with color only
					await Promise.all([this.#streamDock.setLedBrightness(0), this.#streamDock.setLedArray([0, 0, 1])])
				} else {
					await this.#streamDock.setLedArray([0, 0, 1])
				}
			}
		}
	}
	async showStatus(_signal: AbortSignal, _cardGenerator: CardGenerator): Promise<void> {
		// not implemented
	}
}

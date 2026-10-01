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
import type { StreamDockInputDefinition, StreamDockModelDefinition } from './models/list.js'
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
			if (this.#handlePageNav(control)) return
			this.#context.keyDownById(getControlId(control))
		})

		this.#streamDock.on('up', (control) => {
			if (this.#isPageNav(control)) return
			this.#context.keyUpById(getControlId(control))
		})

		this.#streamDock.on('push', (control) => {
			if (this.#handlePageNav(control)) return
			this.#context.keyDownUpById(getControlId(control))
		})

		const reportedUnknown = new Set<number>()
		this.#streamDock.on('unknown', (code, parameter) => {
			// log each unknown code once, to help map new firmware without flooding the log
			if (reportedUnknown.has(code)) return
			reportedUnknown.add(code)
			this.#logger.warn(
				`Unknown input from ${this.#streamDock.productName}: code 0x${code.toString(16)}, value 0x${parameter.toString(16)}`,
			)
		})

		this.#streamDock.on('rotate', (control, amount) => {
			this.#logger.debug(`${control.name} rotation ${amount > 0 ? 'right' : 'left'} (0x${control.id.toString(16)})`)
			if (control.pageNav && (this.config.knobMode ?? 'topButtons') === 'topButtons') {
				// reuse the Companion buttons on the top row (e.g. Page up / Page down)
				this.#context.keyDownUpById(amount > 0 ? '0/0' : '0/1')
				return
			}
			if (this.#handlePageNav(control)) return
			if (amount > 0) {
				this.#context.rotateRightById(getControlId(control))
			} else {
				this.#context.rotateLeftById(getControlId(control))
			}
		})
	}

	async init(): Promise<void> {
		const modes = this.#streamDock.deviceModes
		if (modes) {
			// Devices like the N1 ignore images and send no key events until switched to software mode
			await this.#streamDock.setDeviceMode(modes.software)
			await setTimeout(100)
		}
		await this.#streamDock.wakeScreen()
		await this.#streamDock.clearPanel()
		await this.#streamDock.setLedBrightness(0)
	}

	async close(): Promise<void> {
		await this.#streamDock.clearPanel().catch(() => null)

		const modes = this.#streamDock.deviceModes
		if (modes) {
			const closeMode = this.#resolveCloseMode(modes.defaultOnClose)
			if (closeMode !== modes.software) {
				// hand the device back to its standalone function (numpad / calculator)
				await this.#streamDock.setDeviceMode(closeMode).catch(() => null)
			}
		}

		await this.#streamDock.close()
	}

	#isPageNav(control: StreamDockInputDefinition): boolean {
		if (!control.pageNav) return false
		if (control.type === 'button' || control.type === 'push') {
			const mode = this.config.topButtonsMode ?? 'companion'
			return mode === 'nav' || mode === 'navInverted'
		}
		return this.config.knobMode === 'nav'
	}

	/** Handles inputs flagged as page navigation. Returns true if the event was consumed */
	#handlePageNav(control: StreamDockInputDefinition): boolean {
		if (!this.#isPageNav(control)) return false
		if (this.#context.isLocked) return true

		let forward = control.pageNav === 'next'
		// inversion applies to the top buttons only, the knob keeps its natural direction
		if (this.config.topButtonsMode === 'navInverted' && control.type === 'button') forward = !forward

		this.#context.changePage(forward)
		return true
	}

	#resolveCloseMode(fallback: number): number {
		switch (this.config.n1ModeOnClose) {
			case 'keyboard':
				return 0
			case 'calculator':
				return 1
			case 'software':
				return 2
			default:
				return fallback
		}
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

			// Some outputs (N1 strip) have an uncertain native size: rescale to the configured one
			let targetSize: { width: number; height: number } | undefined
			if (output.nativeSizeConfig) {
				const native = Number(this.config[output.nativeSizeConfig])
				if (native > 0 && (native !== output.resolutionx || native !== output.resolutiony)) {
					const scaled = await imageRs.ImageTransformer.fromBuffer(
						Buffer.from(rotatedBitmap),
						output.resolutionx,
						output.resolutiony,
						'rgb',
					)
						.scale(native, native, 'Exact')
						.toBuffer('rgb')
					rotatedBitmap = scaled.buffer
					targetSize = { width: native, height: native }
				}
			}

			const maxAttempts = 3
			for (let attempts = 1; attempts <= maxAttempts; attempts++) {
				try {
					if (signal.aborted) return

					await this.#streamDock.setKeyImage(output.column, output.row, Buffer.from(rotatedBitmap), targetSize)
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

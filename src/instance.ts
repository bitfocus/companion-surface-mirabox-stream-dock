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
import { getControlId, translateRotation } from './util.js'
import { StreamDock } from './streamdock.js'
import type { HIDAsync } from 'node-hid'
import type { StreamDockModelDefinition } from './models/list.js'
import * as imageRs from '@julusian/image-rs'
import { Heartbeat } from './heartbeat.js'

export class MiraboxWrapper implements SurfaceInstance {
	readonly #logger: ModuleLogger

	readonly #streamDock: StreamDock
	readonly #surfaceId: string
	readonly #context: SurfaceContext
	readonly #heartbeat: Heartbeat

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
		this.#heartbeat = new Heartbeat(this.#streamDock.heartbeatInterval).unref()

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

		this.#heartbeat.on('beat', () => {
			this.#streamDock.sendHeartbeat().catch(() => null)
		})
	}

	async init(): Promise<void> {
		await this.#streamDock.wakeScreen()
		await this.#streamDock.clearPanel()
		this.#heartbeat.setInterval(this.#streamDock.heartbeatInterval).start()
	}

	async close(): Promise<void> {
		this.#heartbeat.stop()

		await this.#streamDock.clearPanel().catch(() => null)

		await this.#streamDock.close()
	}

	updateCapabilities(_capabilities: HostCapabilities): void {
		// Not used
	}

	async ready(): Promise<void> {}

	async setBrightness(percent: number): Promise<void> {
		await this.#streamDock.setBrightness(percent)
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
		}
	}
	async showStatus(_signal: AbortSignal, _cardGenerator: CardGenerator): Promise<void> {
		// TODO - not implemented
	}
}

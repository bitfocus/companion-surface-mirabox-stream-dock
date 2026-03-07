import type { HIDDevice } from '@companion-surface/base'
import type { HIDAsync } from 'node-hid'
import EventEmitter from 'node:events'
import type { StreamDockInputDefinition, StreamDockModelDefinition, StreamDockOutputDefinition } from './models/list.js'
import jpg from '@julusian/jpeg-turbo'

export interface StreamDockEvents {
	error: [error: Error]
	push: [action: StreamDockInputDefinition]
	up: [action: StreamDockInputDefinition]
	down: [action: StreamDockInputDefinition]
	rotate: [action: StreamDockInputDefinition, direction: -1 | 1]
}

/**
 * Class Definition for the Mirabox Stream Dock
 *
 */
export class StreamDock extends EventEmitter<StreamDockEvents> {
	private static cmdPrefix = [0x43, 0x52, 0x54, 0, 0]

	private readonly info: HIDDevice
	private readonly device: HIDAsync
	private readonly model: StreamDockModelDefinition

	get packetSize(): number {
		return this.model.packetSize ?? 1024
	}

	constructor(deviceInfo: HIDDevice, device: HIDAsync, model: StreamDockModelDefinition) {
		super()

		this.info = deviceInfo
		this.device = device
		this.model = model

		this.device.on('error', (error) => {
			console.error(`Stream Dock Error: ${error}`)
			this.emit('error', error)
		})

		this.device.on('data', (data) => {
			// console.log(`received data ${Array.from(data).slice(0,16).map(d => (d as number).toString(16))}`)
			if (data.length >= 11) {
				const functionRaw = data[9]
				const parameterRaw = data[10]

				const action = this.model.inputs.find((input) => {
					return input.id === functionRaw
				})

				if (action) {
					if (action.type === 'button') {
						if (parameterRaw === 0x00) {
							this.emit('up', action)
						} else {
							this.emit('down', action)
						}
					} else if (action.type === 'push') {
						this.emit('push', action)
					} else if (action.type === 'rotateLeft') {
						this.emit('rotate', action, -1)
					} else if (action.type === 'rotateRight') {
						this.emit('rotate', action, 1)
					} else if (action.type === 'swipeLeft') {
						this.emit('rotate', action, -1)
					} else if (action.type === 'swipeRight') {
						this.emit('rotate', action, 1)
					} else {
						console.error(`Unknown action received: ${parameterRaw} from ${this.info.path}`)
					}
				}
			}
		})
	}

	private async sendCmdSimple(dataArr: Array<number>): Promise<void> {
		const data = Buffer.from(dataArr)

		const prefixbuffer = Buffer.from(StreamDock.cmdPrefix)
		const writebuffer = Buffer.concat([Buffer.from([0]), prefixbuffer, data], this.packetSize + 1)

		if (dataArr.length + prefixbuffer.byteLength > this.packetSize) {
			console.error(
				`Data length problem while sending packet to stream dock. Should be ${this.packetSize}B, but is ${dataArr.length + prefixbuffer.byteLength}B`,
			)
		}

		await this.writeRaw(writebuffer)
	}

	/**
	 * Sends a command to the device sync
	 *
	 * The command will be packetized in packages of packetSize bytes. Smaller commands are zero-padded, larger commands are chunked.
	 * @param data the data to be sent
	 * @param prefix optional prefix. If not set, the default prefix will be used
	 */
	private async sendDrawKeyCmd(data: Buffer): Promise<void> {
		const ps: Promise<void>[] = []

		for (let offset = 0; offset < data.byteLength; offset += this.packetSize) {
			const chunk = data.subarray(offset, offset + this.packetSize)
			const writebuffer = Buffer.concat([Buffer.from([0]), chunk], this.packetSize + 1)

			ps.push(
				this.writeRaw(writebuffer).catch((e) => {
					throw new Error('Sending command to Stream Dock failed ' + e)
				}),
			)
		}

		await Promise.all(ps)
	}

	get serialNumber(): string {
		return this.info.serialNumber
	}

	get productName(): string {
		return this.model.productName ?? 'Unknown'
	}

	/**
	 * The amount of columns found in the surface
	 */
	get columns(): number {
		return (
			Math.max(
				...this.model.inputs.map((input) => input.column),
				...this.model.outputs.map((output) => output.column),
			) + 1
		)
	}

	/**
	 * The amount of rows found in the surface
	 */
	get rows(): number {
		return (
			Math.max(...this.model.inputs.map((input) => input.row), ...this.model.outputs.map((output) => output.row)) + 1
		)
	}

	get outputs(): StreamDockOutputDefinition[] {
		return this.model.outputs
	}

	get iconRotation(): number {
		return this.model.iconRotation
	}

	get heartbeatInterval(): number {
		return this.model.heartbeat ?? -1
	}

	async writeRaw(data: Buffer): Promise<void> {
		const written = await this.device.write(data).catch(() => {
			throw new Error('Write to Stream Dock failed!')
		})
		if (typeof written === 'number' && written !== data.length) {
			throw new Error('Write to Stream Dock failed')
		}
	}

	async wakeScreen(): Promise<void> {
		await this.sendCmdSimple([0x44, 0x49, 0x53]).catch((e) => {
			console.error('Sending wake screen to Stream Dock failed ' + e)
		})
	}

	async clearPanel(): Promise<void> {
		await this.sendCmdSimple([0x43, 0x4c, 0x45, 0, 0, 0, 0xff]).catch((e) => {
			console.error('Sending clear panel to Stream Dock failed ' + e)
		})
	}

	async refresh(): Promise<void> {
		await this.sendCmdSimple([0x53, 0x54, 0x50]).catch((e) => {
			console.error('Sending refresh to Stream Dock failed ' + e)
		})
	}

	async setBrightness(value: number): Promise<void> {
		const clamped = Math.max(Math.min(value, 100), 0)
		const y = Math.pow(clamped / 100, 0.75)

		const brightness = Math.round(y * 100)

		await this.sendCmdSimple([0x4c, 0x49, 0x47, 0, 0, brightness]).catch((e) => {
			console.error('Sending brightness to Stream Dock failed ' + e)
		})
	}

	async setKeyImage(column: number, row: number, imageBuffer: Buffer): Promise<void> {
		const output = this.outputs.find((output) => output.row === row && output.column === column)

		if (!output) return

		// console.log('sending image', column, row, output.id)

		let imgData: Buffer = Buffer.from([])
		let size = 0xffffff
		let quality: number

		for (quality = 90; quality > 11; quality -= 10) {
			// 90% quality will fit almost all images in the 10k limit
			const options = {
				format: jpg.FORMAT_RGB,
				width: output.resolutionx,
				height: output.resolutiony,
				subsampling: jpg.SAMP_422,
				quality,
			}

			try {
				imgData = await jpg.compress(imageBuffer, options)
			} catch (error) {
				console.error(`compressing jpg at position ${row}/${column} failed`, error)
			}

			// console.log('imgData', Array.from(imgData).map(d => d.toString(16).padStart(2, '0')).join(' '))

			size = imgData.byteLength
			if (size <= 10240) break
		}

		if (size > 10240) {
			imgData = imgData.subarray(0, 10240)
			console.error(
				`Streamdock image at position ${row}/${column} could not be compressed to 10KB or less, truncating to 10KB`,
			)
		}

		// console.log(`image ${row}/${column} size ${size}B compression ${quality}%`)

		this.sendCmdSimple([
			0x42,
			0x41,
			0x54,
			(size >> 24) & 0xff,
			(size >> 16) & 0xff,
			(size >> 8) & 0xff,
			size & 0xff,
			output.id,
		]).catch((e) => {
			console.error('Sending set image command to Stream Dock failed ' + e)
		})
		this.sendDrawKeyCmd(imgData).catch((e) => {
			console.error('Sending image data to Stream Dock failed ' + e)
		})
		await this.refresh()
	}

	async clearKeyImage(keyId: number): Promise<void> {
		await this.sendCmdSimple([0x43, 0x4c, 0x45, 0, 0, 0, keyId]).catch((e) => {
			console.error('Sending clear key image to Stream Dock failed ' + e)
		})
	}

	async sendHeartbeat(): Promise<void> {
		await this.sendCmdSimple([0x43, 0x4f, 0x4e, 0x4e, 0x45, 0x43, 0x54]).catch((e) => {
			console.error('Sending heartbeat to Stream Dock failed ' + e)
		})
	}

	async close(): Promise<void> {
		await this.sendCmdSimple([0x43, 0x4c, 0x45, 0, 0, 0x44, 0x43]).catch((e) => {
			console.error('Sending close to Stream Dock failed ' + e)
		})
		await this.device.close()
	}
}

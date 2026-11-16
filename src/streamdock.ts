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
	mode: [mode: number]
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
	private heartbeatInterval: NodeJS.Timeout | undefined
	private activeTouchSoftKey: StreamDockInputDefinition | undefined
	private usesTouchReports = false
	private touchStartX: number | undefined
	private imageTransferQueue: Promise<void> = Promise.resolve()

	get packetSize(): number {
		return this.model.packetSize ?? 1024
	}

	constructor(deviceInfo: HIDDevice, device: HIDAsync, model: StreamDockModelDefinition, firmwareRevision?: number) {
		super()

		this.info = deviceInfo
		this.device = device
		this.model = model
		const hasKnobRelease =
			model.knobReleaseMinFirmware !== undefined &&
			firmwareRevision !== undefined &&
			firmwareRevision >= model.knobReleaseMinFirmware
		const touch = model.touchSoftKeys

		this.device.on('error', (error) => {
			console.error(`Stream Dock Error: ${error}`)
			this.emit('error', error)
		})

		this.device.on('data', (data) => {
			// console.log(
			// 	`received data ${Array.from(data)
			// 		.slice(0, 16)
			// 		.map((d) => (d as number).toString(16))}`,
			// )
			const hasReportId =
				(touch && data[0] === 0x00) ||
				(data.length >= 4 && data[0] !== 0x41 && data[1] === 0x41 && data[2] === 0x43 && data[3] === 0x4b)
			const packet = hasReportId ? data.subarray(1) : data
			if (touch) {
				if (packet[0] === 0x54 && packet[1] === 0x50) {
					this.handleTouchReport(packet, touch.inputIds, touch.reportRegionWidth)
					return
				}
				// N4 Pro also reports control replies on this endpoint.
				if (
					packet[0] !== 0x41 ||
					packet[1] !== 0x43 ||
					packet[2] !== 0x4b ||
					packet[5] !== 0x4f ||
					packet[6] !== 0x4b
				) {
					return
				}
			}
			if (packet.length >= 11) {
				const functionRaw = packet[9]
				const parameterRaw = packet[10]
				const action = this.model.inputs.find((input) => input.id === functionRaw)
				if (touch) {
					if (this.usesTouchReports) {
						if (touch.inputIds.includes(functionRaw) || action?.type === 'swipeLeft' || action?.type === 'swipeRight') {
							return
						}
					} else if (action?.type !== 'knobPress' && this.handleLegacyTouchSoftKey(packet)) {
						return
					}
				}

				if (this.model.modeReport === functionRaw && parameterRaw === (this.model.modeReportValue ?? 0x00)) {
					this.emit('mode', functionRaw)
					return
				}

				if (action) {
					if (action.type === 'button') {
						if (parameterRaw === 0x00 || this.model.buttonReleaseValues?.includes(parameterRaw)) {
							this.emit('up', action)
						} else {
							this.emit('down', action)
						}
					} else if (action.type === 'knobPress') {
						if (parameterRaw === 0x01) this.emit(hasKnobRelease ? 'down' : 'push', action)
						if (parameterRaw === 0x00 && hasKnobRelease) this.emit('up', action)
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

		this.heartbeatInterval = setInterval(() => void this.sendHeartbeat(), 8000)
	}

	private handleTouchReport(packet: Buffer, inputIds: number[], regionWidth: number): void {
		if (packet.length < 14 || packet[2] > 3) return
		this.usesTouchReports = true

		const phase = packet[2]
		const x = packet.readUInt16BE(4)
		if (phase === 0) {
			const inputId = inputIds[Math.floor(x / regionWidth)]
			const action = this.model.inputs.find((input) => input.id === inputId)
			if (this.activeTouchSoftKey?.id !== action?.id) {
				this.releaseTouchSoftKey()
				this.activeTouchSoftKey = action
				if (action) this.emit('down', action)
			}
			this.touchStartX = action ? x : undefined
		} else if (phase === 2 || phase === 3) {
			const startX = this.touchStartX
			this.touchStartX = undefined
			this.releaseTouchSoftKey()

			// TP reports down, move, up and cancel. Detect a swipe on up using
			// half a soft-key width as the minimum horizontal travel.
			if (phase === 3 || startX === undefined || x >= inputIds.length * regionWidth) return
			const travel = x - startX
			if (Math.abs(travel) < regionWidth / 2) return

			const direction = travel < 0 ? -1 : 1
			const swipe = this.model.inputs.find((input) => input.type === (direction < 0 ? 'swipeLeft' : 'swipeRight'))
			if (swipe) this.emit('rotate', swipe, direction)
		}
	}

	private releaseTouchSoftKey(): void {
		const action = this.activeTouchSoftKey
		this.activeTouchSoftKey = undefined
		if (action) this.emit('up', action)
	}

	private handleLegacyTouchSoftKey(data: Buffer): boolean {
		const touch = this.model.touchSoftKeys
		if (!touch || data.length < 13 || data[3] !== 0x00 || data[4] !== 0x00) return false

		const isTouchFunction = data[9] === 0x00 || touch.inputIds.includes(data[9])
		if (data[10] === 0x01 && isTouchFunction) {
			const x = (data[11] << 8) | data[12]
			const clampedX = Math.max(touch.minX, Math.min(touch.maxX, x))
			const region = Math.min(
				touch.inputIds.length - 1,
				Math.floor(((clampedX - touch.minX) * touch.inputIds.length) / (touch.maxX - touch.minX + 1)),
			)
			const action = this.model.inputs.find((input) => input.id === touch.inputIds[region])
			if (action) {
				if (this.activeTouchSoftKey && this.activeTouchSoftKey.id !== action.id) {
					this.emit('up', this.activeTouchSoftKey)
				}
				this.activeTouchSoftKey = action
				this.emit('down', action)
			}
			return true
		}

		if (data[10] !== 0x01 && this.activeTouchSoftKey) {
			this.releaseTouchSoftKey()

			const releaseAction = this.model.inputs.find((input) => input.id === data[9])
			if (releaseAction?.type === 'swipeLeft') this.emit('rotate', releaseAction, -1)
			if (releaseAction?.type === 'swipeRight') this.emit('rotate', releaseAction, 1)
			return true
		}

		return false
	}

	private async sendCmdSimple(dataArr: Array<number>, reportId = this.model.reportId ?? 0): Promise<void> {
		const data = Buffer.from(dataArr)

		const prefixbuffer = Buffer.from(StreamDock.cmdPrefix)
		const writebuffer = Buffer.concat([Buffer.from([reportId]), prefixbuffer, data], this.packetSize + 1)

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
		const imagePacketDataSize = this.model.imagePacketDataSize ?? this.packetSize

		for (let offset = 0; offset < data.byteLength; offset += imagePacketDataSize) {
			const chunk = data.subarray(offset, offset + imagePacketDataSize)
			const writebuffer = Buffer.concat([Buffer.from([this.model.reportId ?? 0]), chunk], this.packetSize + 1)

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

	get ledArrayLength(): number {
		return this.model.ledArrayLength ?? 3
	}

	/**
	 * The mode the device should be switched into on connect, if it supports multiple modes.
	 */
	get initialMode(): number | undefined {
		return this.model.initialMode
	}

	get disableWebModeOnConnect(): boolean {
		return this.model.disableWebModeOnConnect ?? false
	}

	async disableWebMode(): Promise<void> {
		await this.sendCmdSimple([0x57, 0x45, 0x42, 0x00]).catch((e) => {
			console.error('Sending Web mode off command to Stream Dock failed ' + e)
		})
	}

	/**
	 * Switch the operating mode of the device.
	 *
	 * Some devices (such as the N1) have multiple modes - on the N1 these are calculator,
	 * numpad and console, normally toggled by pressing the rotary encoder. Only in console
	 * mode (0x33) does the device render images sent by the software, so it must be switched
	 * into that mode when connecting.
	 */
	async setMode(mode: number): Promise<void> {
		await this.sendCmdSimple([0x4d, 0x4f, 0x44, 0, 0, mode]).catch((e) => {
			console.error('Sending mode switch to Stream Dock failed ' + e)
		})
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

	async clearPanelAfterImages(): Promise<void> {
		const operation = this.imageTransferQueue.then(async () => {
			await this.clearPanel()
		})
		this.imageTransferQueue = operation.catch(() => undefined)
		await operation
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

	async setLedBrightness(value: number): Promise<void> {
		const clamped = Math.max(Math.min(value, 100), 0)
		const y = Math.pow(clamped / 100, 0.75)
		const brightness = Math.round(y * 100)
		await this.sendCmdSimple([0x4c, 0x42, 0x4c, 0x49, 0x47, brightness]).catch((e) => {
			console.error('Sending LED brightness value to Stream Dock failed ' + e)
		})
	}

	async setVibration(enabled: boolean): Promise<void> {
		await this.sendCmdSimple([
			0x51,
			0x55,
			0x43,
			0x4d,
			0x44,
			0x1f,
			0x11,
			0x00,
			enabled ? 0x11 : 0xff,
			0x00,
			0x11,
			0x00,
		]).catch((e) => {
			console.error('Sending vibration setting to Stream Dock failed ' + e)
		})
	}

	async setKeyImage(column: number, row: number, imageBuffer: Buffer): Promise<void> {
		const transfer = this.imageTransferQueue.then(async () => {
			await this.setKeyImageNow(column, row, imageBuffer)
		})
		this.imageTransferQueue = transfer.catch(() => undefined)
		await transfer
	}

	private async setKeyImageNow(column: number, row: number, imageBuffer: Buffer): Promise<void> {
		const output = this.outputs.find((output) => output.row === row && output.column === column)

		if (!output || output.type != 'lcd') return

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

		await this.sendCmdSimple([
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
		await this.sendDrawKeyCmd(imgData).catch((e) => {
			console.error('Sending image data to Stream Dock failed ' + e)
		})
		await this.refresh()
	}

	async clearKeyImage(keyId: number): Promise<void> {
		await this.sendCmdSimple([0x43, 0x4c, 0x45, 0, 0, 0, keyId]).catch((e) => {
			console.error('Sending clear key image to Stream Dock failed ' + e)
		})
	}

	async setLedArray(values: number[]): Promise<void> {
		await this.sendCmdSimple([0x53, 0x45, 0x54, 0x4c, 0x42, ...values]).catch((e) => {
			console.error('Sending LED array values to Stream Dock failed ' + e)
		})
	}

	async sendHeartbeat(): Promise<void> {
		await this.sendCmdSimple([0x43, 0x4f, 0x4e, 0x4e, 0x45, 0x43, 0x54]).catch((e) => {
			console.error('Sending heartbeat to Stream Dock failed ' + e)
		})
	}

	async close(): Promise<void> {
		if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
		await this.sendCmdSimple([0x43, 0x4c, 0x45, 0, 0, 0x44, 0x43]).catch((e) => {
			console.error('Sending close to Stream Dock failed ' + e)
		})
		await this.device.close()
	}
}

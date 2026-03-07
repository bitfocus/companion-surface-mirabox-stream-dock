import { EventEmitter } from 'node:events'

export interface HeartbeatEvents {
	beat: []
	start: []
	stop: []
	intervalChanged: [number]
}

export class Heartbeat extends EventEmitter<HeartbeatEvents> {
	private pulse: NodeJS.Timeout | null = null
	private interval: number = 0
	private isRefed: boolean = true
	private pendingImmediateBeat: boolean = false

	constructor(interval: number = 0) {
		super()
		this.interval = interval
	}

	start(immediate?: boolean): this {
		if (this.pulse !== null) {
			return this
		}

		if (this.interval < 1) {
			return this
		}

		if (immediate === true) {
			this.emit('beat')
		} else if (immediate === undefined && this.pendingImmediateBeat) {
			this.emit('beat')
		}
		this.pendingImmediateBeat = false
		this.createPulse()
		this.emit('start')
		return this
	}

	stop(): this {
		if (this.pulse !== null) {
			this.clearPulse()
			this.emit('stop')
		}
		return this
	}

	setInterval(interval: number, immediate?: boolean): this {
		this.interval = interval
		this.emit('intervalChanged', interval)
		if (this.pulse !== null) {
			if (interval < 1) {
				this.stop()
			} else {
				this.clearPulse()
				this.createPulse()
				if (immediate) {
					this.emit('beat')
				}
			}
		} else if (immediate !== undefined) {
			this.pendingImmediateBeat = immediate
		}
		return this
	}

	getInterval(): number {
		return this.interval
	}

	refresh(): this {
		if (this.pulse !== null) {
			this.pulse.refresh()
		}
		return this
	}

	ref(): this {
		this.isRefed = true
		if (this.pulse !== null) {
			this.pulse.ref()
		}
		return this
	}

	unref(): this {
		this.isRefed = false
		if (this.pulse !== null) {
			this.pulse.unref()
		}
		return this
	}

	hasRef(): boolean {
		return this.pulse !== null ? this.pulse.hasRef() : this.isRefed
	}

	isBeating(): boolean {
		return this.pulse !== null
	}

	isRunning(): boolean {
		return this.isBeating()
	}

	private createPulse(): void {
		this.pulse = setInterval(() => {
			this.emit('beat')
		}, this.interval)
		if (!this.isRefed) {
			this.pulse.unref()
		}
	}

	private clearPulse(): void {
		if (this.pulse !== null) {
			clearInterval(this.pulse)
			this.pulse = null
		}
	}
}

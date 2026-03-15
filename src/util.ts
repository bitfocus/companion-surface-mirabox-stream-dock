import type { StreamDockInputDefinition, StreamDockOutputDefinition } from './models/list.js'
import type * as imageRs from '@julusian/image-rs'

export function getControlId(control: StreamDockInputDefinition | StreamDockOutputDefinition, xOffset = 0): string {
	return `${control.row}/${control.column + xOffset}`
}
export function getControlIdFromXy(column: number, row: number): string {
	return `${row}/${column}`
}

export function translateRotation(rotation: number | null): imageRs.RotationMode | null {
	if (rotation === 90) return 'CW270'
	if (rotation === -90) return 'CW90'
	if (rotation === 180) return 'CW180'
	return null
}

// r, g, b in [0...255]  ->  h in [0...360], s,v in [0...1]
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
	const rf = r / 255
	const gf = g / 255
	const bf = b / 255

	const max = Math.max(rf, gf, bf)
	const min = Math.min(rf, gf, bf)
	const d = max - min

	let h = 0
	const v = max
	const s = max === 0 ? 0 : d / max

	if (d !== 0) {
		switch (max) {
			case rf:
				h = ((gf - bf) / d) % 6
				break
			case gf:
				h = (bf - rf) / d + 2
				break
			default: // bf
				h = (rf - gf) / d + 4
				break
		}
		h *= 60
		if (h < 0) h += 360
	}

	return [h, s, v]
}

// h in [0...360], s,v in [0...1]  ->  r,g,b in [0...255]
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
	const c = v * s
	const hp = (h % 360) / 60
	const x = c * (1 - Math.abs((hp % 2) - 1))

	let rf = 0,
		gf = 0,
		bf = 0

	if (hp >= 0 && hp < 1) {
		rf = c
		gf = x
		bf = 0
	} else if (hp >= 1 && hp < 2) {
		rf = x
		gf = c
		bf = 0
	} else if (hp >= 2 && hp < 3) {
		rf = 0
		gf = c
		bf = x
	} else if (hp >= 3 && hp < 4) {
		rf = 0
		gf = x
		bf = c
	} else if (hp >= 4 && hp < 5) {
		rf = x
		gf = 0
		bf = c
	} else {
		rf = c
		gf = 0
		bf = x
	}

	const m = v - c
	const r = Math.round((rf + m) * 255)
	const g = Math.round((gf + m) * 255)
	const b = Math.round((bf + m) * 255)

	return [r, g, b]
}

/**
 * finds the dominant color, it uses a small quantization for the hue and larger quantizations for saturation and brightness
 * @param pixels array with multiple R,G,B values 0...255
 * @returns array with dominant color as HSV values 0...360, 0...1, 0...1
 */
export function findDominantColor(pixels: Uint8Array): [number, number, number] {
	const buckets = new Map<string, { count: number; color: [number, number, number] }>()
	for (let i = 0; i < pixels.length - 2; i += 3) {
		const red = pixels[i]
		const green = pixels[i + 1]
		const blue = pixels[i + 2]

		let [h, s, v] = rgbToHsv(red, green, blue)
		h = Math.round((h + 180) / 4) * 4 - 180 // shift hue temporarily to avoid rounding errors around 0/360 degrees
		s = Math.round(s * 100)
		v = Math.round(v * 100)

		const key = `${h}_${s}_${v}`
		const count = buckets.get(key)?.count ?? 0
		buckets.set(key, { count: count + 1, color: [h, s, v] })
	}
	const bucketArr = Array.from(buckets.entries())
	let dominantHSV: [number, number, number]
	if (bucketArr.length > 1) {
		dominantHSV = bucketArr.sort((a, b) => b[1].count - a[1].count)[0][1].color
	} else {
		dominantHSV = bucketArr[0][1].color
	}

	return [dominantHSV[0], dominantHSV[1] / 100, dominantHSV[2] / 100]
}

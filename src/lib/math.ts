export const EPSILON = 1e-6 as const

export function epsilonToZero(value: number) {
  if (Math.abs(value) < EPSILON) {
    return 0
  }
  return value
}

export function normalizeAngle(angle: number) {
  const twoPi = 2 * Math.PI
  return ((angle % twoPi) + twoPi) % twoPi
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export function mix(value1: number, value2: number, factor: number) {
  return value1 * (1 - factor) + value2 * factor
}

export function transformRange(
  value: number,
  min: number,
  max: number,
  targetMin: number,
  targetMax: number,
  clampResult = false,
) {
  const result =
    targetMin + ((value - min) * (targetMax - targetMin)) / (max - min)
  return clampResult ? clamp(result, targetMin, targetMax) : result
}

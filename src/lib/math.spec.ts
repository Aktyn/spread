import { describe, it, expect } from "vitest"
import { normalizeAngle, clamp, mix, transformRange } from "./math"

describe(normalizeAngle.name, () => {
  it("should normalize positive angles", () => {
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI)
    expect(normalizeAngle((5 * Math.PI) / 2)).toBeCloseTo(Math.PI / 2)
  })

  it("should normalize negative angles", () => {
    expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI)
    expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(Math.PI)
  })

  it("should handle angles within the 0 to 2*PI range", () => {
    expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI)
    expect(normalizeAngle(0)).toBe(0)
  })
})

describe(clamp.name, () => {
  it("should return the value if within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it("should clamp to the minimum value", () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it("should clamp to the maximum value", () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe(mix.name, () => {
  it("should correctly mix two values", () => {
    expect(mix(0, 10, 0.5)).toBe(5)
    expect(mix(10, 20, 0.25)).toBe(12.5)
    expect(mix(-10, 10, 0.75)).toBe(5)
  })
})

describe(transformRange.name, () => {
  it("should correctly transform a value from one range to another", () => {
    expect(transformRange(5, 0, 10, 0, 100)).toBe(50)
    expect(transformRange(0, -10, 10, 0, 1)).toBe(0.5)
  })

  it("should clamp the result if clampResult is true", () => {
    expect(transformRange(15, 0, 10, 0, 100, true)).toBe(100)
    expect(transformRange(-5, 0, 10, 0, 100, true)).toBe(0)
  })
})

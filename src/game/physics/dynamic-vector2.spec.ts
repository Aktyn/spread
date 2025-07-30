import { describe, it, expect } from "vitest"
import { DynamicVector2 } from "./dynamic-vector2"
import { EPSILON } from "@/lib/math"

describe(DynamicVector2.name, () => {
  it("should initialize with default values (0, 0)", () => {
    const vector = new DynamicVector2()
    expect(vector.x).toBe(0)
    expect(vector.y).toBe(0)
    expect(vector.length).toBe(0)
    expect(vector.angle).toBe(0)
  })

  it("should initialize with provided x and y values", () => {
    const vector = new DynamicVector2(3, 4)
    expect(vector.x).toBe(3)
    expect(vector.y).toBe(4)
    expect(vector.length).toBe(5) // Length is calculated from x,y in the constructor
    expect(vector.angle).toBeCloseTo(0.9272952180016122, EPSILON) // Angle is calculated from x,y in the constructor
  })

  it("should set angle and recalculate x,y coordinates", () => {
    const vector = new DynamicVector2()
    vector.setLength(5, Math.PI / 2) // 90 degrees, length 5

    expect(vector.length).toBe(5)
    expect(vector.angle).toBe(Math.PI / 2)
    expect(vector.x).toBeCloseTo(0, 10) // cos(90°) ≈ 0
    expect(vector.y).toBeCloseTo(5, 10) // sin(90°) ≈ 1, so 5 * 1 = 5
  })

  it("should set angle while keeping current length", () => {
    const vector = new DynamicVector2()
    vector.setLength(10, 0) // Start with length 10, angle 0
    vector.setAngle(Math.PI) // Change to 180 degrees

    expect(vector.length).toBe(10)
    expect(vector.angle).toBe(Math.PI)
    expect(vector.x).toBeCloseTo(-10, 10) // cos(180°) = -1, so 10 * -1 = -10
    expect(vector.y).toBeCloseTo(0, 10) // sin(180°) = 0
  })

  it("should set length with default angle", () => {
    const vector = new DynamicVector2()
    vector.setAngle(Math.PI / 4) // Set initial angle to 45 degrees
    vector.setLength(5) // Set length, should keep current angle

    expect(vector.length).toBe(5)
    expect(vector.angle).toBe(Math.PI / 4)
    expect(vector.x).toBeCloseTo(5 * Math.cos(Math.PI / 4), 10)
    expect(vector.y).toBeCloseTo(5 * Math.sin(Math.PI / 4), 10)
  })

  it("should set length with new angle", () => {
    const vector = new DynamicVector2()
    vector.setLength(8, Math.PI / 3) // 60 degrees, length 8

    expect(vector.length).toBe(8)
    expect(vector.angle).toBe(Math.PI / 3)
    expect(vector.x).toBeCloseTo(8 * Math.cos(Math.PI / 3), 10) // 8 * 0.5 = 4
    expect(vector.y).toBeCloseTo(8 * Math.sin(Math.PI / 3), 10) // 8 * √3/2 ≈ 6.928
  })

  it("should handle zero length", () => {
    const vector = new DynamicVector2()
    vector.setLength(0, Math.PI / 2)

    expect(vector.length).toBe(0)
    expect(vector.angle).toBe(Math.PI / 2)
    expect(vector.x).toBe(0)
    expect(vector.y).toBe(0)
  })

  it("should handle negative length", () => {
    const vector = new DynamicVector2()
    vector.setLength(-5, 0)

    expect(vector.length).toBe(-5)
    expect(vector.angle).toBe(0)
    expect(vector.x).toBe(-5) // -5 * cos(0) = -5 * 1 = -5
    expect(vector.y).toBeCloseTo(0, EPSILON) // -5 * sin(0) = -5 * 0 = 0
  })
})

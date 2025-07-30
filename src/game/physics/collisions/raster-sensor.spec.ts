import { describe, it, expect, beforeEach } from "vitest"
import { RasterSensor, RasterSensorShape } from "./raster-sensor"

describe("RasterSensor", () => {
  let sensor: RasterSensor

  beforeEach(() => {
    sensor = new RasterSensor(RasterSensorShape.Circle)
  })

  it("should have Shape static property", () => {
    expect(RasterSensor.Shape).toBe(RasterSensorShape)
    expect(RasterSensor.Shape.Circle).toBe(RasterSensorShape.Circle)
  })

  it("should create sensor with Circle shape", () => {
    expect(sensor).toBeDefined()
    expect(sensor).toBeInstanceOf(RasterSensor)
  })

  it("should be iterable and yield sensor points", () => {
    const points = Array.from(sensor)
    expect(points).toHaveLength(16) // Circle shape has 16 points

    // Each point should be a 2-element array
    points.forEach((point) => {
      expect(point).toHaveLength(2)
      expect(typeof point[0]).toBe("number")
      expect(typeof point[1]).toBe("number")
    })
  })

  it("should generate circle points correctly", () => {
    const points = Array.from(sensor)

    // Check that points form a circle (distance from origin should be ~1 for unit circle)
    points.forEach((point) => {
      const distance = Math.sqrt(point[0] ** 2 + point[1] ** 2)
      expect(distance).toBeCloseTo(1, 10) // Unit circle
    })
  })

  it("should apply transform correctly", () => {
    const centerX = 5
    const centerY = 3
    const radius = 2
    const rotation = Math.PI / 4 // 45 degrees

    sensor.applyTransform(centerX, centerY, radius, rotation)

    const points = Array.from(sensor)

    // Check that points are transformed correctly
    points.forEach((point) => {
      // Points should be centered around (centerX, centerY)
      const distanceFromCenter = Math.sqrt(
        (point[0] - centerX) ** 2 + (point[1] - centerY) ** 2,
      )
      expect(distanceFromCenter).toBeCloseTo(radius, 5)
    })
  })

  it("should handle zero radius", () => {
    sensor.applyTransform(10, 20, 0, 0)

    const points = Array.from(sensor)

    // All points should be at the center when radius is 0
    points.forEach((point) => {
      expect(point[0]).toBeCloseTo(10, 10)
      expect(point[1]).toBeCloseTo(20, 10)
    })
  })

  it("should handle zero rotation", () => {
    sensor.applyTransform(0, 0, 1, 0)

    const points = Array.from(sensor)

    // First point should be at (1, 0) for zero rotation
    expect(points[0][0]).toBeCloseTo(1, 10)
    expect(points[0][1]).toBeCloseTo(0, 10)
  })

  it("should handle negative radius", () => {
    sensor.applyTransform(0, 0, -1, 0)

    const points = Array.from(sensor)

    // Points should form a circle with radius 1 but inverted
    points.forEach((point) => {
      const distance = Math.sqrt(point[0] ** 2 + point[1] ** 2)
      expect(distance).toBeCloseTo(1, 10)
    })

    // First point should be at (-1, 0) for negative radius
    expect(points[0][0]).toBeCloseTo(-1, 10)
    expect(points[0][1]).toBeCloseTo(0, 10)
  })

  it("should maintain 16 points for Circle shape", () => {
    // Test that the circle shape always has 16 points
    const points = Array.from(sensor)
    expect(points).toHaveLength(16)
  })
})

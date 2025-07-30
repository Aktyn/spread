import { describe, it, expect, beforeEach, vi } from "vitest"
import { Physics } from "./physics"
import type { RasterObject } from "./raster-object"
import type { DynamicObject } from "./dynamic-object"

describe(Physics.name, () => {
  let physics: Physics

  beforeEach(() => {
    physics = new Physics()
  })

  it("should create a physics instance", () => {
    expect(physics).toBeDefined()
    expect(physics).toBeInstanceOf(Physics)
  })

  it("should have addObject method", () => {
    expect(typeof physics.addObject).toBe("function")
  })

  it("should have removeObject method", () => {
    expect(typeof physics.removeObject).toBe("function")
  })

  it("should have update method", () => {
    expect(typeof physics.update).toBe("function")
  })

  it("should add raster objects", () => {
    const mockRasterObject = {
      getPixel: vi.fn(),
    } as unknown as RasterObject

    expect(() => {
      physics.addObject(mockRasterObject)
    }).not.toThrow()
  })

  it("should add dynamic objects", () => {
    const mockDynamicObject = {
      sensor: [[0, 0]],
      velocity: [0, 0],
      solver: {
        clearForces: vi.fn(),
        calculateTotalImpulse: vi.fn().mockReturnValue(null),
      },
    } as unknown as DynamicObject

    expect(() => {
      physics.addObject(mockDynamicObject)
    }).not.toThrow()
  })

  it("should remove objects", () => {
    const mockRasterObject = {
      getPixel: vi.fn(),
    } as unknown as RasterObject

    physics.addObject(mockRasterObject)

    expect(() => {
      physics.removeObject(mockRasterObject)
    }).not.toThrow()
  })

  it("should handle update with deltaTime", () => {
    expect(() => {
      physics.update(0.016) // 60 FPS
    }).not.toThrow()
  })

  it("should handle update with zero deltaTime", () => {
    expect(() => {
      physics.update(0)
    }).not.toThrow()
  })

  it("should handle update with large deltaTime", () => {
    expect(() => {
      physics.update(1.0)
    }).not.toThrow()
  })
})

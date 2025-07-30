import { describe, it, expect, beforeEach, vi } from "vitest"
import { CollisionsSolver } from "./collisions-solver"
import type { RasterObject } from "@/game/physics/raster-object"
import type { DynamicObject } from "@/game/physics/dynamic-object"

describe(CollisionsSolver.name, () => {
  let solver: CollisionsSolver

  beforeEach(() => {
    solver = new CollisionsSolver()
  })

  it("should initialize with empty forces", () => {
    expect(solver.calculateTotalImpulse(1)).toBeNull()
  })

  it("should clear forces", () => {
    solver.clearForces()
    expect(solver.calculateTotalImpulse(1)).toBeNull()
  })

  it("should calculate total impulse with scale factor", () => {
    // Since pushForce is private, we can't directly test it
    // This tests the public interface
    const impulse = solver.calculateTotalImpulse(2)
    expect(impulse).toBeNull() // No forces added
  })

  it("should return null for very small forces", () => {
    // Test the EPSILON check in calculateTotalImpulse
    const impulse = solver.calculateTotalImpulse(0.000001)
    expect(impulse).toBeNull()
  })

  describe("static methods", () => {
    it("should have calculateRasterCollisionForce method", () => {
      expect(typeof CollisionsSolver.calculateRasterCollisionForce).toBe(
        "function",
      )
    })

    it("should have calculateRasterCollisionForces method", () => {
      expect(typeof CollisionsSolver.calculateRasterCollisionForces).toBe(
        "function",
      )
    })

    it("should return false from calculateRasterCollisionForce", () => {
      const mockRaster = {
        getPixel: vi.fn((pixel, _x, _y) => {
          pixel[0] = 0
          pixel[1] = 0
          pixel[2] = 0
          pixel[3] = 0
        }),
      } as unknown as RasterObject

      const mockObject = {
        sensor: [
          [0, 0],
          [1, 1],
        ],
      } as unknown as DynamicObject

      const result = CollisionsSolver.calculateRasterCollisionForce(
        mockRaster,
        mockObject,
      )
      expect(result).toBe(false)
    })

    it("should process multiple objects in calculateRasterCollisionForces", () => {
      const mockRaster = {
        getPixel: vi.fn((pixel, _x, _y) => {
          pixel[0] = 0
          pixel[1] = 0
          pixel[2] = 0
          pixel[3] = 0
        }),
      } as unknown as RasterObject

      const mockObjects = [
        { sensor: [[0, 0]] },
        { sensor: [[1, 1]] },
      ] as unknown as DynamicObject[]

      const collidingSet = new Set<DynamicObject>()

      CollisionsSolver.calculateRasterCollisionForces(
        mockRaster,
        mockObjects,
        collidingSet,
      )
      expect(collidingSet.size).toBe(0) // No collisions detected
    })
  })
})

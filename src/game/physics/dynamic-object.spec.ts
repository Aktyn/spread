import { describe, expect, it } from "vitest"
import { DynamicObject } from "./dynamic-object"
import { type CollisionsSolver } from "./collisions/collisions-solver"

describe(DynamicObject.name, () => {
  it("should be implementable as an interface", () => {
    // Test that the interface can be implemented
    class TestDynamicObject implements DynamicObject {
      // @ts-expect-error value overload in a test file
      sensor = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]
      // @ts-expect-error value overload in a test file
      velocity = [0, 0] as [number, number]
      // @ts-expect-error value overload in a test file
      solver = {
        clearForces: () => {},
        calculateTotalImpulse: () => null,
      } as CollisionsSolver
    }

    const testObject = new TestDynamicObject()
    expect(testObject).toBeDefined()
    expect(testObject).toBeInstanceOf(TestDynamicObject)
  })

  it("should have sensor property as array of coordinate pairs", () => {
    class TestDynamicObject implements DynamicObject {
      // @ts-expect-error value overload in a test file
      sensor = [
        [0, 0],
        [1, 1],
      ]
      // @ts-expect-error value overload in a test file
      velocity = [0, 0] as [number, number]
      // @ts-expect-error value overload in a test file
      solver = {
        clearForces: () => {},
        calculateTotalImpulse: () => null,
      } as CollisionsSolver
    }

    const testObject = new TestDynamicObject()
    expect(Array.isArray(testObject.sensor)).toBe(true)
    expect(testObject.sensor).toHaveLength(2)
    expect(testObject.sensor[0]).toEqual([0, 0])
    expect(testObject.sensor[1]).toEqual([1, 1])
  })

  it("should have velocity property as DynamicVector2", () => {
    const testObject = new DynamicObject()
    expect(testObject.velocity).toBeDefined()
    expect(typeof testObject.velocity.x).toBe("number")
    expect(typeof testObject.velocity.y).toBe("number")
    expect(testObject.velocity.x).toBe(0) // Default value
    expect(testObject.velocity.y).toBe(0) // Default value
  })

  it("should have sensor property as RasterSensor", () => {
    const testObject = new DynamicObject()
    expect(testObject.sensor).toBeDefined()
    expect(typeof testObject.sensor[Symbol.iterator]).toBe("function") // Should be iterable
    expect(testObject.sensor.constructor.name).toBe("RasterSensor")
  })

  it("should have solver property", () => {
    const testObject = new DynamicObject()
    expect(testObject.solver).toBeDefined()
    expect(typeof testObject.solver.clearForces).toBe("function")
    expect(typeof testObject.solver.calculateTotalImpulse).toBe("function")
  })
})

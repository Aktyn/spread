import { describe, it, expect } from "vitest"
import type { PhysicalObject } from "./physical-object"

describe("PhysicalObject", () => {
  it("should be implementable as an interface", () => {
    // Test that the interface can be implemented
    class TestPhysicalObject implements PhysicalObject {
      // Empty implementation since the interface is empty
    }

    const testObject = new TestPhysicalObject()
    expect(testObject).toBeDefined()
    expect(testObject).toBeInstanceOf(TestPhysicalObject)
  })

  it("should allow objects to satisfy the interface", () => {
    // Test that plain objects can satisfy the interface
    const physicalObject: PhysicalObject = {}
    expect(physicalObject).toBeDefined()
    expect(typeof physicalObject).toBe("object")
  })
})

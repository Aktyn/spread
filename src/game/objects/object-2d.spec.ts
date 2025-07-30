import { describe, it, expect, beforeEach } from "vitest"
import { Object2D } from "./object-2d"

// Create a concrete implementation for testing the abstract class
class TestObject2D extends Object2D {
  // No additional implementation needed for testing base functionality
}

describe(Object2D.name, () => {
  let object: TestObject2D

  beforeEach(() => {
    object = new TestObject2D()
  })

  it("should initialize with default values", () => {
    expect(object.x).toBe(0)
    expect(object.y).toBe(0)
    expect(object.width).toBe(1)
    expect(object.height).toBe(1)
    expect(object.rotation).toBe(0)
    expect(object.visible).toBe(false)
    expect(object.moved).toBe(true)
  })

  it("should set transform with all parameters", () => {
    object.setTransform(10, 20, 5, 3, Math.PI / 4)

    expect(object.x).toBe(10)
    expect(object.y).toBe(20)
    expect(object.width).toBe(5)
    expect(object.height).toBe(3)
    expect(object.rotation).toBe(Math.PI / 4)
    expect(object.moved).toBe(true)
  })

  it("should set position", () => {
    object.setTransform(0, 0, 2, 3, 0)
    object.setPosition(5, 7)

    expect(object.x).toBe(5)
    expect(object.y).toBe(7)
    expect(object.width).toBe(2) // Should preserve width
    expect(object.height).toBe(3) // Should preserve height
    expect(object.rotation).toBe(0) // Should preserve rotation
  })

  it("should set scale", () => {
    object.setTransform(5, 7, 1, 1, Math.PI / 6)
    object.setScale(4, 6)

    expect(object.x).toBe(5) // Should preserve x
    expect(object.y).toBe(7) // Should preserve y
    expect(object.width).toBe(4)
    expect(object.height).toBe(6)
    expect(object.rotation).toBe(Math.PI / 6) // Should preserve rotation
  })

  it("should set rotation", () => {
    object.setTransform(3, 4, 2, 2, 0)
    object.setRotation(Math.PI / 3)

    expect(object.x).toBe(3) // Should preserve x
    expect(object.y).toBe(4) // Should preserve y
    expect(object.width).toBe(2) // Should preserve width
    expect(object.height).toBe(2) // Should preserve height
    expect(object.rotation).toBe(Math.PI / 3)
  })

  it("should copy transform from another object", () => {
    const sourceObject = new TestObject2D()
    sourceObject.setTransform(15, 25, 8, 6, Math.PI / 2)

    object.copyTransform(sourceObject)

    expect(object.x).toBe(15)
    expect(object.y).toBe(25)
    expect(object.width).toBe(8)
    expect(object.height).toBe(6)
    expect(object.rotation).toBe(Math.PI / 2)
  })

  it("should check visibility correctly when object is visible", () => {
    object.setTransform(5, 5, 2, 2, 0)
    const viewport = new Float32Array([4, 4, 10, 10]) // x, y, width, height

    object.checkVisibility(viewport)

    expect(object.visible).toBe(true)
    expect(object.moved).toBe(false) // Should be set to false after visibility check
  })

  it("should check visibility correctly when object is not visible", () => {
    object.setTransform(100, 100, 2, 2, 0) // Far outside viewport
    const viewport = new Float32Array([0, 0, 10, 10])

    object.checkVisibility(viewport)

    expect(object.visible).toBe(false)
    expect(object.moved).toBe(false)
  })

  it("should mark as moved when transform changes", () => {
    object.checkVisibility(new Float32Array([0, 0, 10, 10])) // Reset moved to false
    expect(object.moved).toBe(false)

    object.setTransform(1, 1, 1, 1, 0)
    expect(object.moved).toBe(true)
  })

  it("should handle zero rotation without matrix rotation", () => {
    object.setTransform(5, 5, 2, 2, 0)
    // This tests the branch where rotation is effectively zero (within EPSILON)
    expect(object.rotation).toBe(0)
    expect(object.moved).toBe(true)
  })
})

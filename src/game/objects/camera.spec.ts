import { describe, it, expect, beforeEach } from "vitest"
import { Camera } from "./camera"

describe(Camera.name, () => {
  let camera: Camera

  beforeEach(() => {
    camera = new Camera()
  })

  it("should create a camera instance", () => {
    expect(camera).toBeDefined()
    expect(camera).toBeInstanceOf(Camera)
  })

  it("should have changed property", () => {
    expect(typeof camera.changed).toBe("boolean")
  })

  it("should have follow method", () => {
    expect(typeof camera.follow).toBe("function")
  })

  it("should have update method", () => {
    expect(typeof camera.update).toBe("function")
  })

  it("should have getVector method", () => {
    expect(typeof camera.getVector).toBe("function")
  })

  it("should handle follow with object", () => {
    const mockObject = {
      x: 10,
      y: 20,
      width: 1,
      height: 1,
    }

    expect(() => {
      camera.follow(mockObject)
    }).not.toThrow()
  })

  it("should handle update with deltaTime", () => {
    expect(() => {
      camera.update(0.016)
    }).not.toThrow()
  })

  it("should return vector from getVector", () => {
    const vector = camera.getVector()
    expect(vector).toBeDefined()
    expect(vector instanceof Float32Array).toBe(true)
  })

  it("should handle update without following object", () => {
    expect(() => {
      camera.update(0.016)
    }).not.toThrow()
  })

  it("should handle zero deltaTime", () => {
    expect(() => {
      camera.update(0)
    }).not.toThrow()
  })
})

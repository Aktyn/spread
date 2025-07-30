import { describe, it, expect } from "vitest"
import type { RasterObject, PIXEL_DATA } from "./raster-object"

describe("RasterObject", () => {
  it("should be implementable as an interface", () => {
    // Test that the interface can be implemented
    class TestRasterObject implements RasterObject {
      getPixel(outPixel: PIXEL_DATA, _x: number, _y: number): void {
        outPixel[0] = 255
        outPixel[1] = 0
        outPixel[2] = 0
        if (outPixel.length === 4) {
          outPixel[3] = 255
        }
      }
    }

    const testObject = new TestRasterObject()
    expect(testObject).toBeDefined()
    expect(testObject).toBeInstanceOf(TestRasterObject)
    expect(typeof testObject.getPixel).toBe("function")
  })

  it("should have getPixel method that modifies outPixel array", () => {
    class TestRasterObject implements RasterObject {
      getPixel(outPixel: PIXEL_DATA, x: number, y: number): void {
        outPixel[0] = x % 256
        outPixel[1] = y % 256
        outPixel[2] = 128
        if (outPixel.length === 4) {
          outPixel[3] = 255
        }
      }
    }

    const testObject = new TestRasterObject()
    const pixel: PIXEL_DATA = [0, 0, 0, 0]

    testObject.getPixel(pixel, 100, 50)

    expect(pixel[0]).toBe(100)
    expect(pixel[1]).toBe(50)
    expect(pixel[2]).toBe(128)
    expect(pixel[3]).toBe(255)
  })

  it("should work with RGB pixel data (3 channels)", () => {
    class TestRasterObject implements RasterObject {
      getPixel(outPixel: PIXEL_DATA, _x: number, _y: number): void {
        outPixel[0] = 255
        outPixel[1] = 128
        outPixel[2] = 64
      }
    }

    const testObject = new TestRasterObject()
    const pixel: [number, number, number] = [0, 0, 0]

    testObject.getPixel(pixel, 0, 0)

    expect(pixel[0]).toBe(255)
    expect(pixel[1]).toBe(128)
    expect(pixel[2]).toBe(64)
  })
})

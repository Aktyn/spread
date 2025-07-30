import { describe, it, expect, beforeEach, vi } from "vitest"
import { Tile } from "./tile"
import type { Renderer } from "@/graphics/renderer"
import type { PixelData } from "@/game/physics/raster-object"

// Mock dependencies
vi.mock("@/graphics/texture")
vi.mock("@/graphics/sprite")

describe("Tile", () => {
  let mockRenderer: Renderer
  let tile: Tile

  beforeEach(() => {
    mockRenderer = {
      gl: {
        RGBA: 6408,
        RGB: 6407,
      },
      layers: {
        background: { addObjects: vi.fn(), removeObjects: vi.fn() },
      },
    } as unknown as Renderer
  })

  it("should have TILE_SCALE static property", () => {
    expect(Tile.TILE_SCALE).toBe(1)
    expect(typeof Tile.TILE_SCALE).toBe("number")
  })

  it("should have floorToTileScale static method", () => {
    expect(typeof Tile.floorToTileScale).toBe("function")
  })

  it("should floor values to tile scale correctly", () => {
    expect(Tile.floorToTileScale(1.7)).toBe(1)
    expect(Tile.floorToTileScale(2.3)).toBe(2)
    expect(Tile.floorToTileScale(0.5)).toBe(0)
    expect(Tile.floorToTileScale(-1.5)).toBe(-2)
  })

  it("should create tile instance", () => {
    expect(() => {
      tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    }).not.toThrow()
  })

  it("should have getPixel method", () => {
    tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    expect(typeof tile.getPixel).toBe("function")
  })

  it("should have setDirty method", () => {
    tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    expect(typeof tile.setDirty).toBe("function")
  })

  it("should have update method", () => {
    tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    expect(typeof tile.update).toBe("function")
  })

  it("should have dispose method", () => {
    tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    expect(typeof tile.dispose).toBe("function")
  })

  it("should handle getPixel method", () => {
    tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    const pixel = [0, 0, 0, 0] as PixelData
    expect(() => {
      tile.getPixel(pixel, 0, 0)
    }).not.toThrow()
  })

  it("should handle setDirty method", () => {
    tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    expect(() => {
      tile.setDirty()
    }).not.toThrow()
  })

  it("should handle update method", () => {
    tile = new Tile(mockRenderer, 0, 0, 0, "background", false)
    expect(() => {
      tile.update()
    }).not.toThrow()
  })
})

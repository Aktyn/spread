import { describe, it, expect, beforeEach, vi } from "vitest"
import { TiledLayer } from "./tiled-layer"
import type { Renderer } from "@/graphics/renderer"
import type { Camera } from "./camera"
import type { GameConfig } from "../config"
import type { TerrainGenerator } from "../utils/terrain-generator"

// Mock dependencies
vi.mock("./tiles-chunk")
vi.mock("../utils/terrain-generator")

describe("TiledLayer", () => {
  let mockRenderer: Renderer
  let mockCamera: Camera
  let mockConfig: GameConfig
  let mockTerrainGenerator: TerrainGenerator
  let tiledLayer: TiledLayer

  beforeEach(() => {
    mockRenderer = {
      layers: {
        background: { addObjects: vi.fn(), removeObjects: vi.fn() },
      },
    } as unknown as Renderer

    mockCamera = {
      x: 0,
      y: 0,
      getVector: vi.fn().mockReturnValue(new Float32Array([0, 0, 10, 10])),
    } as unknown as Camera

    mockConfig = {
      worldUpdateManhattanDistance: 64,
      minimumReadyTilesManhattanDistance: 6,
    }

    mockTerrainGenerator = {
      generateTileData: vi.fn().mockResolvedValue(new Uint8Array(64 * 64 * 4)),
    } as unknown as TerrainGenerator
  })

  it("should create a tiled layer instance", () => {
    expect(() => {
      tiledLayer = new TiledLayer(
        mockRenderer,
        mockCamera,
        mockConfig,
        0,
        "background",
        mockTerrainGenerator,
      )
    }).not.toThrow()
  })

  it("should have ready property", () => {
    tiledLayer = new TiledLayer(
      mockRenderer,
      mockCamera,
      mockConfig,
      0,
      "background",
      mockTerrainGenerator,
    )
    expect(typeof tiledLayer.ready).toBe("boolean")
  })

  it("should have update method", () => {
    tiledLayer = new TiledLayer(
      mockRenderer,
      mockCamera,
      mockConfig,
      0,
      "background",
      mockTerrainGenerator,
    )
    expect(typeof tiledLayer.update).toBe("function")
  })

  it("should have getChunksCount method", () => {
    tiledLayer = new TiledLayer(
      mockRenderer,
      mockCamera,
      mockConfig,
      0,
      "background",
      mockTerrainGenerator,
    )
    expect(typeof tiledLayer.getChunksCount).toBe("function")
  })

  it("should have dispose method", () => {
    tiledLayer = new TiledLayer(
      mockRenderer,
      mockCamera,
      mockConfig,
      0,
      "background",
      mockTerrainGenerator,
    )
    expect(typeof tiledLayer.dispose).toBe("function")
  })

  it("should handle update with deltaTime", () => {
    tiledLayer = new TiledLayer(
      mockRenderer,
      mockCamera,
      mockConfig,
      0,
      "background",
      mockTerrainGenerator,
    )
    expect(() => {
      tiledLayer.update(0.016)
    }).not.toThrow()
  })

  it("should return numeric chunks count", () => {
    tiledLayer = new TiledLayer(
      mockRenderer,
      mockCamera,
      mockConfig,
      0,
      "background",
      mockTerrainGenerator,
    )
    const count = tiledLayer.getChunksCount()
    expect(typeof count).toBe("number")
    expect(count).toBeGreaterThanOrEqual(0)
  })

  it("should handle dispose without errors", () => {
    tiledLayer = new TiledLayer(
      mockRenderer,
      mockCamera,
      mockConfig,
      0,
      "background",
      mockTerrainGenerator,
    )
    expect(() => {
      tiledLayer.dispose()
    }).not.toThrow()
  })
})

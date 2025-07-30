import { describe, it, expect, vi, beforeEach } from "vitest"
import { Game } from "./game"
import type { Renderer } from "@/graphics/renderer"

// Mock all the dependencies
vi.mock("./objects/camera")
vi.mock("./objects/player")
vi.mock("./objects/tiled-layer")
vi.mock("./objects/tiles-chunk")
vi.mock("./steering")
vi.mock("./utils/terrain-generator")
vi.mock("@/game/physics/physics")

describe("Game", () => {
  let mockRenderer: Renderer
  let game: Game

  beforeEach(async () => {
    // Create a mock renderer with the required structure
    mockRenderer = {
      layers: {
        background: { addObjects: vi.fn(), removeObjects: vi.fn() },
        solid: { addObjects: vi.fn(), removeObjects: vi.fn() },
        objects: { addObjects: vi.fn(), removeObjects: vi.fn() },
      },
      assets: {
        textures: {
          player: {},
        },
      },
      setViewport: vi.fn(),
    } as unknown as Renderer

    // Mock TilesChunk static methods
    const TilesChunk = await import("./objects/tiles-chunk")
    vi.spyOn(TilesChunk.TilesChunk, "clearQueue").mockImplementation(() => {})
    vi.spyOn(TilesChunk.TilesChunk, "queueSize").mockReturnValue(0)
  })

  it("should create a game instance", () => {
    expect(() => {
      game = new Game(mockRenderer)
    }).not.toThrow()
  })

  it("should have camera property", () => {
    game = new Game(mockRenderer)
    expect(game.camera).toBeDefined()
  })

  it("should have player property", () => {
    game = new Game(mockRenderer)
    expect(game.player).toBeDefined()
  })

  it("should have totalChunksCount property", () => {
    game = new Game(mockRenderer)
    expect(typeof game.totalChunksCount).toBe("number")
    expect(game.totalChunksCount).toBe(0)
  })

  it("should have chunksInQueue getter", () => {
    game = new Game(mockRenderer)
    expect(typeof game.chunksInQueue).toBe("number")
  })

  it("should have waitingForChunks getter", () => {
    game = new Game(mockRenderer)
    expect(typeof game.waitingForChunks).toBe("boolean")
  })

  it("should have update method", () => {
    game = new Game(mockRenderer)
    expect(typeof game.update).toBe("function")
  })

  it("should have dispose method", () => {
    game = new Game(mockRenderer)
    expect(typeof game.dispose).toBe("function")
  })

  it("should handle update with time parameter", () => {
    game = new Game(mockRenderer)
    expect(() => {
      game.update(1000)
    }).not.toThrow()
  })

  it("should handle dispose without errors", () => {
    game = new Game(mockRenderer)
    expect(() => {
      game.dispose()
    }).not.toThrow()
  })
})

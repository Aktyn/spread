import { describe, it, expect, beforeEach, vi } from "vitest"
import { TerrainGenerator } from "./terrain-generator"

// Mock the worker
vi.mock("./terrain-generator.worker?worker", () => ({
  default: vi.fn().mockImplementation(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
  })),
}))

describe("TerrainGenerator", () => {
  let terrainGenerator: TerrainGenerator

  beforeEach(() => {
    const WorkerMock = vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
    }))

    // Mock the Worker constructor
    vi.doMock("./terrain-generator.worker?worker", () => ({
      default: WorkerMock,
    }))

    terrainGenerator = new TerrainGenerator({
      seed: "test-seed",
      fade: 1,
    })
  })

  it("should create terrain generator instance", () => {
    expect(terrainGenerator).toBeDefined()
    expect(terrainGenerator).toBeInstanceOf(TerrainGenerator)
  })

  it("should have options property", () => {
    expect(terrainGenerator.options).toBeDefined()
    expect(terrainGenerator.options.seed).toBe("test-seed")
    expect(terrainGenerator.options.fade).toBe(1)
  })

  it("should have generateTileData method", () => {
    expect(typeof terrainGenerator.generateTileData).toBe("function")
  })

  it("should have dispose method", () => {
    expect(typeof terrainGenerator.dispose).toBe("function")
  })

  it("should return promise from generateTileData", () => {
    const result = terrainGenerator.generateTileData(0, 0)
    expect(result).toBeInstanceOf(Promise)
  })

  it("should handle dispose without errors", () => {
    expect(() => {
      terrainGenerator.dispose()
    }).not.toThrow()
  })

  it("should handle multiple generateTileData calls", () => {
    expect(() => {
      void terrainGenerator.generateTileData(0, 0)
      void terrainGenerator.generateTileData(1, 1)
      void terrainGenerator.generateTileData(2, 2)
    }).not.toThrow()
  })

  it("should handle worker message processing", () => {
    // Test that the worker message handler is set up
    expect(typeof terrainGenerator["worker"].onmessage).toBe("function")
  })
})

import { describe, it, expect, beforeEach, vi } from "vitest"
import { TilesChunk } from "./tiles-chunk"

// Mock dependencies
vi.mock("./tile")
vi.mock("../utils/terrain-generator")

describe("TilesChunk", () => {
  beforeEach(() => {
    // Clear any existing queue state
    TilesChunk.clearQueue()
  })

  it("should have static clearQueue method", () => {
    expect(typeof TilesChunk.clearQueue).toBe("function")
  })

  it("should have static queueSize method", () => {
    expect(typeof TilesChunk.queueSize).toBe("function")
  })

  it("should initialize with queue size 0", () => {
    expect(TilesChunk.queueSize()).toBe(0)
  })

  it("should handle clearQueue without errors", () => {
    expect(() => {
      TilesChunk.clearQueue()
    }).not.toThrow()
  })

  it("should return numeric queue size", () => {
    const size = TilesChunk.queueSize()
    expect(typeof size).toBe("number")
    expect(size).toBeGreaterThanOrEqual(0)
  })

  it("should maintain queue size after clear", () => {
    TilesChunk.clearQueue()
    expect(TilesChunk.queueSize()).toBe(0)
  })
})

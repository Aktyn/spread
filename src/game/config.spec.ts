import { describe, it, expect } from "vitest"
import { defaultGameConfig, type GameConfig } from "./config"

describe("config", () => {
  it("should have defaultGameConfig with correct values", () => {
    expect(defaultGameConfig.worldUpdateManhattanDistance).toBe(64)
    expect(defaultGameConfig.minimumReadyTilesManhattanDistance).toBe(6)
  })

  it("should have numeric values for distances", () => {
    expect(typeof defaultGameConfig.worldUpdateManhattanDistance).toBe("number")
    expect(typeof defaultGameConfig.minimumReadyTilesManhattanDistance).toBe(
      "number",
    )
  })

  it("should have worldUpdateManhattanDistance greater than minimumReadyTilesManhattanDistance", () => {
    expect(defaultGameConfig.worldUpdateManhattanDistance).toBeGreaterThan(
      defaultGameConfig.minimumReadyTilesManhattanDistance,
    )
  })

  it("should export GameConfig type", () => {
    // Type test - this will fail at compile time if type doesn't exist
    const config: GameConfig = {
      worldUpdateManhattanDistance: 32,
      minimumReadyTilesManhattanDistance: 3,
    }
    expect(config).toBeDefined()
  })
})

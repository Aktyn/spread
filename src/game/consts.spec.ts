import { describe, it, expect } from "vitest"
import { Consts } from "./consts"

describe("Consts", () => {
  it("should have TILE_RESOLUTION constant", () => {
    expect(Consts.TILE_RESOLUTION).toBe(64)
    expect(typeof Consts.TILE_RESOLUTION).toBe("number")
  })

  it("should have Z_INDEX object with correct values", () => {
    expect(Consts.Z_INDEX).toBeDefined()
    expect(Consts.Z_INDEX.BACKGROUND_TILE).toBe(0)
    expect(Consts.Z_INDEX.COLLISION_TILE).toBe(1)
    expect(Consts.Z_INDEX.PLAYER).toBe(2)
  })

  it("should have Z_INDEX values in ascending order", () => {
    expect(Consts.Z_INDEX.BACKGROUND_TILE).toBeLessThan(
      Consts.Z_INDEX.COLLISION_TILE,
    )
    expect(Consts.Z_INDEX.COLLISION_TILE).toBeLessThan(Consts.Z_INDEX.PLAYER)
  })
})

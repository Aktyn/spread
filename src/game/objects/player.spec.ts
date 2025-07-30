import { describe, it, expect, beforeEach, vi } from "vitest"
import { Player } from "./player"
import type { Renderer } from "@/graphics/renderer"
import type { Texture } from "@/graphics/texture"
import type { Steering } from "../steering"

// Mock dependencies
vi.mock("@/graphics/sprite")

describe("Player", () => {
  let mockRenderer: Renderer
  let mockTexture: Texture
  let mockSteering: Steering
  let player: Player

  beforeEach(() => {
    mockRenderer = {
      gl: {},
    } as unknown as Renderer

    mockTexture = {} as unknown as Texture

    mockSteering = {
      isPressed: vi.fn().mockReturnValue(false),
    } as unknown as Steering
  })

  it("should create a player instance", () => {
    expect(() => {
      player = new Player(mockRenderer, mockTexture, mockSteering)
    }).not.toThrow()
  })

  it("should have sprite property", () => {
    player = new Player(mockRenderer, mockTexture, mockSteering)
    expect(player.sprite).toBeDefined()
  })

  it("should have updateControls method", () => {
    player = new Player(mockRenderer, mockTexture, mockSteering)
    expect(typeof player.updateControls).toBe("function")
  })

  it("should handle updateControls with deltaTime", () => {
    player = new Player(mockRenderer, mockTexture, mockSteering)
    expect(() => {
      player.updateControls(0.016)
    }).not.toThrow()
  })

  it("should handle updateControls with zero deltaTime", () => {
    player = new Player(mockRenderer, mockTexture, mockSteering)
    expect(() => {
      player.updateControls(0)
    }).not.toThrow()
  })

  it("should handle updateControls with large deltaTime", () => {
    player = new Player(mockRenderer, mockTexture, mockSteering)
    expect(() => {
      player.updateControls(1.0)
    }).not.toThrow()
  })

  it("should interact with steering for controls", () => {
    player = new Player(mockRenderer, mockTexture, mockSteering)
    player.updateControls(0.016)

    // Verify that steering is being used
    expect(mockSteering.isPressed).toHaveBeenCalled()
  })
})

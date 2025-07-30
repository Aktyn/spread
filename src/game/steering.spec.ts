import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { Steering } from "./steering"

describe("Steering", () => {
  let steering: Steering
  let mockAddEventListener: ReturnType<typeof vi.fn>
  let mockRemoveEventListener: ReturnType<typeof vi.fn>
  let keyDownHandler: (event: KeyboardEvent) => void
  let keyUpHandler: (event: KeyboardEvent) => void

  beforeEach(() => {
    mockAddEventListener = vi.fn(
      (event: string, handler: (event: KeyboardEvent) => void) => {
        if (event === "keydown") {
          keyDownHandler = handler
        } else if (event === "keyup") {
          keyUpHandler = handler
        }
      },
    )
    mockRemoveEventListener = vi.fn()

    // Mock document event listeners
    Object.defineProperty(document, "addEventListener", {
      value: mockAddEventListener,
      writable: true,
    })
    Object.defineProperty(document, "removeEventListener", {
      value: mockRemoveEventListener,
      writable: true,
    })

    steering = new Steering()
  })

  afterEach(() => {
    steering.dispose()
    vi.restoreAllMocks()
  })

  it("should initialize with all keys unpressed", () => {
    expect(steering.isPressed(Steering.Keys.Left)).toBe(false)
    expect(steering.isPressed(Steering.Keys.Right)).toBe(false)
    expect(steering.isPressed(Steering.Keys.Up)).toBe(false)
    expect(steering.isPressed(Steering.Keys.Down)).toBe(false)
    expect(steering.isPressed(Steering.Keys.A)).toBe(false)
    expect(steering.isPressed(Steering.Keys.D)).toBe(false)
    expect(steering.isPressed(Steering.Keys.W)).toBe(false)
    expect(steering.isPressed(Steering.Keys.S)).toBe(false)
  })

  it("should add event listeners on construction", () => {
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function),
    )
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    )
  })

  it("should remove event listeners on dispose", () => {
    steering.dispose()
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function),
    )
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    )
  })

  it("should return true when checking multiple keys and at least one is pressed", () => {
    // Simulate key press by calling the captured event handler
    const keyDownEvent = new KeyboardEvent("keydown", { key: "ArrowLeft" })
    keyDownHandler(keyDownEvent)

    expect(steering.isPressed(Steering.Keys.Left, Steering.Keys.Right)).toBe(
      true,
    )
  })

  it("should return false when checking multiple keys and none are pressed", () => {
    expect(steering.isPressed(Steering.Keys.Left, Steering.Keys.Right)).toBe(
      false,
    )
  })
})

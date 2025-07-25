import { describe, it, expect, vi } from "vitest"
import { cn, assert, wait } from "./utils"

describe(cn.name, () => {
  it("should merge class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white")
    expect(cn("p-4", "p-2")).toBe("p-2")
  })
})

describe(assert.name, () => {
  it("should not throw an error if the condition is true", () => {
    expect(() => assert(true, "This should not throw")).not.toThrow()
  })

  it("should throw an error if the condition is false", () => {
    expect(() => assert(false, "This should throw")).toThrow(
      "This should throw",
    )
  })
})

describe(wait.name, () => {
  it("should resolve after the specified time", async () => {
    vi.useFakeTimers()
    const waitPromise = wait(1000)
    vi.advanceTimersByTime(1000)
    await expect(waitPromise).resolves.toBeUndefined()
    vi.useRealTimers()
  })
})

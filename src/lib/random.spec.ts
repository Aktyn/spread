import { describe, it, expect } from "vitest"
import { randomInRange, randomIntInRange, shuffle } from "./random"

describe(randomInRange.name, () => {
  it("should return a number within the specified range", () => {
    const min = 10
    const max = 20
    const result = randomInRange(min, max)
    expect(result).toBeGreaterThanOrEqual(min)
    expect(result).toBeLessThan(max)
  })
})

describe(randomIntInRange.name, () => {
  it("should return an integer within the specified range", () => {
    const min = 5
    const max = 10
    const result = randomIntInRange(min, max)
    expect(result).toBeGreaterThanOrEqual(min)
    expect(result).toBeLessThan(max)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe(shuffle.name, () => {
  it("should return an array with the same elements", () => {
    const array = [1, 2, 3, 4, 5]
    const shuffled = shuffle([...array])
    expect(shuffled).toHaveLength(array.length)
    expect(shuffled.sort()).toEqual(array.sort())
  })

  it("should return a shuffled array", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    let sameOrder = true
    for (let i = 0; i < 10; i++) {
      const shuffled = shuffle([...array])
      if (JSON.stringify(array) !== JSON.stringify(shuffled)) {
        sameOrder = false
        break
      }
    }
    expect(sameOrder).toBe(false)
  })
})

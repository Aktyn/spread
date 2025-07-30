import { describe, it, expect, beforeEach } from "vitest"
import { Queue } from "./queue"

describe("Queue", () => {
  let queue: Queue<{ id: number }>
  let testElement1: { id: number }
  let testElement2: { id: number }
  let testElement3: { id: number }

  beforeEach(() => {
    queue = new Queue()
    testElement1 = { id: 1 }
    testElement2 = { id: 2 }
    testElement3 = { id: 3 }
  })

  it("should initialize with size 0", () => {
    expect(queue.size).toBe(0)
  })

  it("should return null for next when empty", () => {
    expect(queue.next).toBe(null)
  })

  it("should add elements with default priority 0", () => {
    queue.add(testElement1)
    expect(queue.size).toBe(1)
    expect(queue.next).toBe(testElement1)
  })

  it("should add elements with specified priority", () => {
    queue.add(testElement1, 5)
    queue.add(testElement2, 10)
    expect(queue.size).toBe(2)
    expect(queue.next).toBe(testElement2) // Higher priority should be first
  })

  it("should sort elements by priority (highest first)", () => {
    queue.add(testElement1, 1)
    queue.add(testElement2, 3)
    queue.add(testElement3, 2)

    expect(queue.next).toBe(testElement2) // Priority 3
  })

  it("should remove elements", () => {
    queue.add(testElement1, 1)
    queue.add(testElement2, 2)

    queue.remove(testElement1)
    expect(queue.size).toBe(1)
    expect(queue.next).toBe(testElement2)
  })

  it("should handle removing non-existent elements", () => {
    queue.add(testElement1)
    queue.remove(testElement2)
    expect(queue.size).toBe(1)
    expect(queue.next).toBe(testElement1)
  })

  it("should clear all elements", () => {
    queue.add(testElement1)
    queue.add(testElement2)

    queue.clear()
    expect(queue.size).toBe(0)
    expect(queue.next).toBe(null)
  })

  it("should change element priority", () => {
    queue.add(testElement1, 1)
    queue.add(testElement2, 2)

    queue.changePriority(testElement1, 5)
    expect(queue.next).toBe(testElement1) // Should now be first
  })

  it("should handle changing priority of non-existent element", () => {
    queue.add(testElement1, 1)
    queue.changePriority(testElement2, 5)

    expect(queue.size).toBe(1)
    expect(queue.next).toBe(testElement1)
  })
})

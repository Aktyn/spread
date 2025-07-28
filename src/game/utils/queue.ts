export class Queue<T extends object> {
  private priorityQueue: Array<{ element: T; priority: number }> = []

  get size() {
    return this.priorityQueue.length
  }

  private sort() {
    this.priorityQueue.sort((a, b) => b.priority - a.priority)
  }

  add(element: T, priority?: number) {
    this.priorityQueue.push({ element, priority: priority ?? 0 })
    this.sort()
  }

  remove(element: T) {
    const i = this.priorityQueue.findIndex((item) => item.element === element)
    if (i > -1) {
      this.priorityQueue.splice(i, 1)
    }
  }

  clear() {
    this.priorityQueue = []
  }

  changePriority(element: T, priority: number) {
    const item = this.priorityQueue.find((item) => item.element === element)
    if (item) {
      item.priority = priority
      this.sort()
    }
  }

  get next() {
    return this.priorityQueue[0]?.element ?? null
  }
}

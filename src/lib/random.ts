export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function randomIntInRange(min: number, max: number) {
  return Math.floor(randomInRange(min, max))
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomIntInRange(0, i + 1)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function normalizeAngle(angle: number) {
  return angle % (2 * Math.PI)
}

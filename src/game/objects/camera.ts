import { Consts } from "../consts"
import { EPSILON } from "@/lib/math"

type Target = { x: number; y: number; width: number; height: number }

export class Camera {
  private resolution = { width: 0, height: 0 }
  private readonly vector: Float32Array
  public changed = false
  private target: Target | null = null

  private targetX = 0
  private targetY = 0
  private followSpeed = 20
  private smoothingEnabled = true

  constructor() {
    this.vector = new Float32Array([0, 0, 1, 1])
  }

  getVector() {
    return this.vector
  }

  get x() {
    return this.vector[0]
  }

  set x(value: number) {
    this.vector[0] = value
    this.changed = true
  }

  get y() {
    return this.vector[1]
  }

  set y(value: number) {
    this.vector[1] = value
    this.changed = true
  }

  get width() {
    return this.vector[2]
  }

  set width(value: number) {
    this.vector[2] = value
    this.changed = true
  }

  get height() {
    return this.vector[3]
  }

  set height(value: number) {
    this.vector[3] = value
    this.changed = true
  }

  get aspect() {
    return this.resolution.width / this.resolution.height
  }

  setResolution(width: number, height: number) {
    this.resolution.width = width
    this.resolution.height = height

    const scaleH = (Consts.TILE_RESOLUTION * 2) / this.resolution.height
    this.width = scaleH / this.aspect
    this.height = scaleH
  }

  move(x: number, y: number) {
    this.vector[0] += x
    this.vector[1] += y
    this.changed = true
  }

  follow(target: Target) {
    this.target = target
    if (target) {
      this.targetX = target.x + target.width / 2
      this.targetY = target.y + target.height / 2
    }
  }

  /**
   * Set the speed at which the camera follows the target
   * @param speed Higher values = faster following (default: 5)
   */
  setFollowSpeed(speed: number) {
    this.followSpeed = Math.max(0.1, speed)
  }

  /**
   * Enable or disable smooth camera movement
   * @param enabled If false, camera will snap directly to target
   */
  setSmoothingEnabled(enabled: boolean) {
    this.smoothingEnabled = enabled
  }

  update(deltaTime: number) {
    if (this.target) {
      this.targetX = this.target.x + this.target.width / 2
      this.targetY = this.target.y + this.target.height / 2

      if (this.smoothingEnabled) {
        const lerpFactor = Math.min(1, this.followSpeed * deltaTime)

        const newX = this.x + (this.targetX - this.x) * lerpFactor
        const newY = this.y + (this.targetY - this.y) * lerpFactor

        if (
          Math.abs(newX - this.x) > EPSILON ||
          Math.abs(newY - this.y) > EPSILON
        ) {
          this.x = newX
          this.y = newY
        }
      } else {
        this.x = this.targetX
        this.y = this.targetY
      }
    }
  }
}

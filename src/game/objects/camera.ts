import type { Object2D } from "./object-2d"
import { Consts } from "../consts"

export class Camera {
  private resolution = { width: 0, height: 0 }
  private vector: Float32Array
  public changed = false
  private target: Object2D | null = null

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

  follow(target: Object2D) {
    this.target = target
  }

  //TODO: damp camera movement
  update(_deltaTime: number) {
    if (this.target) {
      this.x = this.target.x + this.target.width / 2
      this.y = this.target.y + this.target.height / 2
    }
  }
}

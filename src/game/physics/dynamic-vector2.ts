import type { vec2 } from "gl-matrix"

export class DynamicVector2 {
  private _length = 0
  private _angle = 0

  constructor(
    private _x = 0,
    private _y = 0,
  ) {
    this.recalculatePolar()
  }

  private recalculateCartesian() {
    this._x = this._length * Math.cos(this._angle)
    this._y = this._length * Math.sin(this._angle)
  }

  private recalculatePolar() {
    this._length = Math.sqrt(this._x ** 2 + this._y ** 2)
    this._angle = Math.atan2(this._y, this._x)
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  get angle() {
    return this._angle
  }

  setAngle(angle: number) {
    this._angle = angle
    this.recalculateCartesian()
  }

  get length() {
    return this._length
  }

  setLength(length: number, angle = this._angle) {
    this._length = length
    this._angle = angle
    this.recalculateCartesian()
  }

  applyImpulse(impulse: vec2) {
    this._x += impulse[0]
    this._y += impulse[1]

    this.recalculatePolar()
  }
}

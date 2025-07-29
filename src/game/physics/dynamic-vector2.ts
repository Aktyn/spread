export class DynamicVector2 {
  private _x: number
  private _y: number

  private _length = 0
  private _angle = 0

  constructor(x = 0, y = 0) {
    this._x = x
    this._y = y
  }

  private recalculateXY() {
    this._x = this._length * Math.cos(this._angle)
    this._y = this._length * Math.sin(this._angle)
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
    this.recalculateXY()
  }

  get length() {
    return this._length
  }

  setLength(length: number, angle = this._angle) {
    this._length = length
    this._angle = angle
    this.recalculateXY()
  }
}

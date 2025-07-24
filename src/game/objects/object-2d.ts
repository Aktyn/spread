import { mat3 } from "gl-matrix"

export abstract class Object2D {
  protected matrix: mat3 = mat3.create()

  private _x = 0
  private _y = 0
  private _width = 1
  private _height = 1
  private _rotation = 0

  private _visible = false
  private _moved = true

  constructor() {
    this.setTransform(0, 0, 1, 1)
  }

  get visible() {
    return this._visible
  }

  get moved() {
    return this._moved
  }

  checkVisibility(viewport: Float32Array) {
    const [x, y, width, height] = viewport

    this._visible =
      this.y + this.height > y - 1 / height &&
      this.y < y + 1 / height &&
      this.x + this.width > x - 1 / width &&
      this.x < x + 1 / width
    this._moved = false
  }

  get x() {
    return this._x
  }
  get y() {
    return this._y
  }
  get width() {
    return this._width
  }
  get height() {
    return this._height
  }
  get rotation() {
    return this._rotation
  }

  setTransform(
    x: number,
    y: number,
    width: number,
    height: number,
    rotation = 0,
  ) {
    this._x = x
    this._y = y
    this._width = width
    this._height = height
    this._rotation = rotation

    if (Math.abs(rotation) > 1e-6) {
      mat3.fromTranslation(this.matrix, [width / 2 + x, height / 2 + y])
      mat3.rotate(this.matrix, this.matrix, rotation)
      mat3.translate(this.matrix, this.matrix, [-width / 2, -height / 2])
    } else {
      mat3.fromTranslation(this.matrix, [x, y])
    }
    mat3.scale(this.matrix, this.matrix, [width, height])

    this._moved = true
  }

  setPosition(x: number, y: number) {
    this.setTransform(x, y, this.width, this.height, this.rotation)
  }

  setScale(width: number, height: number) {
    this.setTransform(this.x, this.y, width, height, this.rotation)
  }

  setRotation(rotation: number) {
    this.setTransform(this.x, this.y, this.width, this.height, rotation)
  }
}

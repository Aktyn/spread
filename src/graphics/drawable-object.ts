import { Object2D } from "../game/objects/object-2d"

export abstract class DrawableObject extends Object2D {
  /** Positive integer, objects with higher z-index will be drawn on top of objects with lower z-index */
  abstract zIndex: number

  abstract draw(transformUniform: WebGLUniformLocation): void
}

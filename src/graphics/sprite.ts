import { DrawableObject } from "./drawable-object"
import type { Texture } from "./texture"

export class Sprite extends DrawableObject {
  constructor(
    protected readonly gl: WebGL2RenderingContext,
    protected readonly texture: Texture,
    public readonly zIndex: number,
  ) {
    super()
  }

  draw(transformUniform: WebGLUniformLocation) {
    this.texture.bind()
    this.gl.uniformMatrix3fv(transformUniform, false, this.matrix)
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4)
  }
}

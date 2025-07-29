import type { DrawableObject } from "./drawable-object"
import type { ShaderVariant } from "./shader"
import { Shader } from "./shader"

export class Layer {
  private readonly shader: Shader
  // <
  // "v_position",
  // "u_texture" | "u_transform" | "u_camera"
  // >

  /** Grouped by z-index */
  private objects: DrawableObject[][] = []

  constructor(
    private readonly gl: WebGL2RenderingContext,
    shaderVariant: ShaderVariant,
    private readonly viewport: Float32Array,
  ) {
    this.shader = new Shader(gl, shaderVariant)

    gl.enableVertexAttribArray(this.shader.attributes.v_position)
    gl.vertexAttribPointer(
      this.shader.attributes.v_position,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )
  }

  dispose() {
    for (let zIndex = 0; zIndex < this.objects.length; zIndex++) {
      if (!(zIndex in this.objects)) {
        continue
      }
      this.removeObjects(...this.objects[zIndex])
    }
    this.objects = []
  }

  draw(viewportChanged: boolean) {
    this.shader.use()
    this.gl.uniform1i(this.shader.uniforms.u_texture, 0) // TODO: might be enough to call it once

    if (viewportChanged) {
      this.gl.uniform4fv(this.shader.uniforms.u_camera, this.viewport)
    }

    for (const layer of this.objects) {
      if (!layer) {
        continue
      }

      for (const object of layer) {
        if (viewportChanged || object.moved) {
          object.checkVisibility(this.viewport)
        }

        if (object.visible) {
          object.draw(this.shader.uniforms.u_transform)
        }
      }
    }
    // this.gl.bindTexture(this.gl.TEXTURE_2D, null)
  }

  addObjects(...objects: DrawableObject[]) {
    for (const object of objects) {
      this.objects[object.zIndex] ??= []
      this.objects[object.zIndex].push(object)
    }
  }

  removeObjects(...objects: DrawableObject[]) {
    for (const object of objects) {
      if (!(object.zIndex in this.objects)) {
        continue
      }
      this.objects[object.zIndex] = this.objects[object.zIndex].filter(
        (object) => !objects.includes(object),
      )
    }
  }
}

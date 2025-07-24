import { assert } from "../lib/utils"
import { Assets } from "./assets"
import type { DrawableObject } from "./drawable-object"
import { Shader } from "./shader"
import { SquareBuffer } from "./square-buffer"

export class Renderer {
  public readonly gl: WebGL2RenderingContext
  private readonly shader: Shader<
    "v_position",
    "u_texture" | "u_transform" | "u_camera"
  >
  private readonly squareBuffer: SquareBuffer

  public readonly assets: Assets

  private viewport: Float32Array = new Float32Array([0, 0, 1, 1])
  private viewportChanged = false

  /** Grouped by z-index */
  private objects: DrawableObject[][] = []

  constructor(private readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: false,
      premultipliedAlpha: false,
    })
    assert(!!gl, "WebGL 2 not supported")

    this.gl = gl

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    this.shader = new Shader(
      gl,
      Shader.Variants.Fullscreen,
      ["v_position"],
      ["u_texture", "u_transform", "u_camera"],
    )

    this.assets = new Assets(gl)

    gl.enableVertexAttribArray(this.shader.attributes.v_position)
    gl.vertexAttribPointer(
      this.shader.attributes.v_position,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )

    this.squareBuffer = new SquareBuffer(gl)
  }

  dispose() {
    //TODO
  }

  setSize(width: number, height: number) {
    console.info("Setting renderer size:", width, height)

    this.canvas.width = width
    this.canvas.height = height

    this.clear()
  }

  setViewport(vector: Float32Array) {
    this.viewport.set(vector)

    this.viewportChanged = true
    this.gl.uniform4fv(this.shader.uniforms.u_camera, this.viewport)
  }

  clear() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(0, 0, 0, 1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  draw() {
    // this.clear()

    this.shader.use()
    this.gl.uniform1i(this.shader.uniforms.u_texture, 0) // TODO: probably enough to call it once

    this.squareBuffer.bind()

    for (const layer of this.objects) {
      if (!layer) {
        continue
      }

      for (const object of layer) {
        if (this.viewportChanged || object.moved) {
          object.checkVisibility(this.viewport)
        }

        if (object.visible) {
          object.draw(this.shader.uniforms.u_transform)
        }
      }
    }

    this.viewportChanged = false
  }

  addObjects(...objects: DrawableObject[]) {
    for (const object of objects) {
      this.objects[object.zIndex] ??= []
      this.objects[object.zIndex].push(object)
    }
  }

  removeObjects(...objects: DrawableObject[]) {
    for (const object of objects) {
      this.objects[object.zIndex] = this.objects[object.zIndex].filter(
        (object) => !objects.includes(object),
      )
    }
  }
}

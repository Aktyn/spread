import { assert } from "@/lib/utils"
import { Assets } from "./assets"
import { Framebuffer } from "./framebuffer"
import { Layer } from "./layer"
import { Shader, ShaderVariant } from "./shader"
import { SquareBuffer } from "./square-buffer"

export class Renderer {
  public readonly gl: WebGL2RenderingContext

  private readonly squareBuffer
  public readonly assets

  private readonly viewport = new Float32Array([0, 0, 1, 1])
  private viewportChanged = false

  public readonly layers
  private readonly framebuffers: {
    background: Framebuffer
    solid: Framebuffer
    objects: Framebuffer
  }

  private readonly combineShader: Shader

  constructor(private readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
    })
    assert(!!gl, "WebGL 2 not supported")

    this.gl = gl

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    this.layers = {
      background: new Layer(gl, ShaderVariant.Basic, this.viewport),
      solid: new Layer(gl, ShaderVariant.Basic, this.viewport),
      objects: new Layer(gl, ShaderVariant.Basic, this.viewport),
    } as const

    this.framebuffers = {
      background: new Framebuffer(gl, canvas.width, canvas.height),
      solid: new Framebuffer(gl, canvas.width, canvas.height),
      objects: new Framebuffer(gl, canvas.width, canvas.height),
    }

    this.combineShader = new Shader(gl, ShaderVariant.Combine)

    this.assets = new Assets(gl)

    this.squareBuffer = new SquareBuffer(gl)
  }

  dispose() {
    for (const layer in this.layers) {
      this.layers[layer as keyof typeof this.layers].dispose()
    }
  }

  setSize(width: number, height: number) {
    console.info("Setting renderer size:", width, height)

    this.canvas.width = width
    this.canvas.height = height

    this.framebuffers.background.dispose()
    this.framebuffers.background = new Framebuffer(this.gl, width, height)
    this.framebuffers.solid.dispose()
    this.framebuffers.solid = new Framebuffer(this.gl, width, height)
    this.framebuffers.objects.dispose()
    this.framebuffers.objects = new Framebuffer(this.gl, width, height)

    this.clear()
  }

  setViewport(vector: Float32Array) {
    this.viewport.set(vector)

    this.viewportChanged = true
  }

  clear() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  draw() {
    // this.clear()

    this.squareBuffer.bind()

    // Draw layers to framebuffers
    this.framebuffers.background.bind()
    // this.clear()
    this.layers.background.draw(this.viewportChanged)

    this.framebuffers.solid.bind()
    this.clear()
    this.layers.solid.draw(this.viewportChanged)

    this.framebuffers.objects.bind()
    this.clear()
    this.layers.objects.draw(this.viewportChanged)

    // Combine framebuffers
    this.framebuffers.objects.unbind() // unbinds any fbo
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.clear()

    this.combineShader.use()

    this.gl.uniform2f(
      this.combineShader.uniforms.u_viewport_scale,
      this.viewport[2],
      this.viewport[3],
    )

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(
      this.gl.TEXTURE_2D,
      this.framebuffers.background.texture,
    )
    this.gl.uniform1i(this.combineShader.uniforms.u_background, 0)

    this.gl.activeTexture(this.gl.TEXTURE1)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.framebuffers.solid.texture)
    this.gl.uniform1i(this.combineShader.uniforms.u_solid, 1)

    this.gl.activeTexture(this.gl.TEXTURE2)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.framebuffers.objects.texture)
    this.gl.uniform1i(this.combineShader.uniforms.u_objects, 2)

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4)
    // this.gl.bindTexture(this.gl.TEXTURE_2D, null)

    this.viewportChanged = false
  }
}

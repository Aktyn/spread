import { assert } from "../lib/utils"

export class Framebuffer {
  public readonly framebuffer: WebGLFramebuffer
  public readonly texture: WebGLTexture

  constructor(
    private readonly gl: WebGL2RenderingContext,
    public readonly width: number,
    public readonly height: number,
    // enableTransparency: boolean, //TODO
  ) {
    this.texture = this.createTexture(gl, width, height)

    const framebuffer = gl.createFramebuffer()
    assert(!!framebuffer, "Failed to create framebuffer")
    this.framebuffer = framebuffer

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0,
    )

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer is not complete:", status)
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  private createTexture(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
  ): WebGLTexture {
    const texture = gl.createTexture()
    assert(!!texture, "Failed to create texture")

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    )

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.bindTexture(gl.TEXTURE_2D, null)

    return texture
  }

  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer)
    this.gl.viewport(0, 0, this.width, this.height)
  }

  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
  }

  dispose() {
    this.gl.deleteFramebuffer(this.framebuffer)
    this.gl.deleteTexture(this.texture)
  }
}

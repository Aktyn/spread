export type ImageSource = {
  data: Uint8Array
  width: number
  height: number

  /** @default gl.RGB */
  format?: number
}

export class Texture {
  private readonly texture: WebGLTexture

  public static loadFromFile(
    gl: WebGL2RenderingContext,
    path: string,
  ): Texture {
    const texture = new Texture(gl)

    const image = new Image()
    image.src = path
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height

      const context = canvas.getContext("2d")
      if (!context) {
        return
      }
      context.clearRect(0, 0, image.width, image.height)
      context.drawImage(image, 0, 0)

      const imageData = context.getImageData(0, 0, image.width, image.height)

      texture.update({
        data: new Uint8Array(imageData.data),
        width: image.width,
        height: image.height,
        format: gl.RGBA,
      })
    }

    return texture
  }

  constructor(
    private readonly gl: WebGL2RenderingContext,
    source?: ImageSource,
  ) {
    this.texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    if (source) {
      this.update(source)
    }
  }

  dispose() {
    this.gl.deleteTexture(this.texture)
  }

  update(source: ImageSource, gl = this.gl) {
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      source.format ?? gl.RGB,
      source.width,
      source.height,
      0,
      source.format ?? gl.RGB,
      gl.UNSIGNED_BYTE,
      source.data,
    )
  }

  bind(gl = this.gl) {
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
  }
}

export class SquareBuffer {
  private readonly buffer: WebGLBuffer

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.buffer = gl.createBuffer()
    this.bind()
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      gl.STATIC_DRAW,
    )
  }

  bind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
  }
}

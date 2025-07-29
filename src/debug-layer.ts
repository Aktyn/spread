import { mat3 } from "gl-matrix"

export class DebugLayer {
  public static ctx: CanvasRenderingContext2D | null = null

  static enable(canvas: HTMLCanvasElement) {
    DebugLayer.ctx = canvas.getContext("2d", {
      alpha: true,
      antialias: true,
    }) as CanvasRenderingContext2D
    if (!DebugLayer.ctx) {
      throw new Error("Failed to get canvas context")
    }
  }

  static disable() {
    DebugLayer.ctx = null
  }

  static clear(vector: Float32Array, ctx = DebugLayer.ctx!) {
    ctx.resetTransform()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const [x, y, width, height] = vector

    const matrix = mat3.create()

    const wScale = (ctx.canvas.width * width) / 2
    const hScale = (ctx.canvas.height * height) / 2

    mat3.fromTranslation(matrix, [
      (ctx.canvas.width - x * 2 * wScale) / 2,
      (ctx.canvas.height + y * 2 * hScale) / 2,
    ])
    mat3.scale(matrix, matrix, [wScale, -hScale])

    ctx.transform(
      matrix[0],
      matrix[1],
      matrix[3],
      matrix[4],
      matrix[6],
      matrix[7],
    )
  }
}

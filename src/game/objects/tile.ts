import type { Renderer } from "@/graphics/renderer"
import { Consts } from "../consts"
import { type ImageSource, Texture } from "@/graphics/texture"
import { Sprite } from "@/graphics/sprite"
import type { PIXEL_DATA, RasterObject } from "@/game/physics/raster-object"

export class Tile extends Sprite implements RasterObject {
  public static readonly TILE_SCALE = 1

  public readonly source
  private readonly channels: 4 | 3

  private dirty = false

  /** Update texture every N frames */
  private readonly textureUpdateFrequency = 6
  private textureUpdateCounter = 0

  constructor(
    private readonly renderer: Renderer,
    x: number,
    y: number,
    zIndex: number,
    private readonly rendererLayer: keyof Renderer["layers"],
    enableTransparency: boolean,
    data?: Uint8Array,
  ) {
    const channels = enableTransparency ? 4 : 3

    const source: ImageSource = {
      data:
        data ??
        new Uint8Array(
          Consts.TILE_RESOLUTION * Consts.TILE_RESOLUTION * channels,
        ),
      width: Consts.TILE_RESOLUTION,
      height: Consts.TILE_RESOLUTION,
      format: enableTransparency ? renderer.gl.RGBA : renderer.gl.RGB,
    }

    super(renderer.gl, new Texture(renderer.gl, source), zIndex)

    this.source = source
    this.channels = channels
    this.setTransform(x, y, Tile.TILE_SCALE, Tile.TILE_SCALE)
    // this.setTransform(
    //   x,
    //   y,
    //   Tile.TILE_SCALE * 0.984375,
    //   Tile.TILE_SCALE * 0.984375,
    //   0,
    // )

    this.renderer.layers[this.rendererLayer].addObjects(this)
  }

  dispose() {
    this.renderer.layers[this.rendererLayer].removeObjects(this)
    this.texture.dispose()
  }

  getPixel(outPixel: PIXEL_DATA, x: number, y: number) {
    const pixelX = Math.floor(
      ((x - this.x) / Tile.TILE_SCALE) * Consts.TILE_RESOLUTION,
    )
    const pixelY = Math.floor(
      ((y - this.y) / Tile.TILE_SCALE) * Consts.TILE_RESOLUTION,
    )

    const pixelIndex =
      (pixelX +
        (Consts.TILE_RESOLUTION - pixelY - 1) * Consts.TILE_RESOLUTION) *
      this.channels

    outPixel[0] = this.source.data[pixelIndex]
    outPixel[1] = this.source.data[pixelIndex + 1]
    outPixel[2] = this.source.data[pixelIndex + 2]
    if (outPixel.length === 4) {
      outPixel[3] = this.source.data[pixelIndex + 3]
    }
  }

  /** Should be called after every change to the source.data */
  setDirty() {
    this.dirty = true
  }

  update(force = false) {
    if (!this.visible || !this.dirty) {
      return
    }

    if (
      force ||
      this.textureUpdateCounter++ % this.textureUpdateFrequency === 0
    ) {
      this.texture.update(this.source)
      this.textureUpdateCounter = 0
    }

    this.dirty = false
  }

  public static floorToTileScale(value: number) {
    return Math.floor(value / Tile.TILE_SCALE) * Tile.TILE_SCALE
  }
}

import type { Renderer } from "../../graphics/renderer"
import { Consts } from "../consts"
import { Texture, type ImageSource } from "../../graphics/texture"
import { Sprite } from "../../graphics/sprite"

export class Tile extends Sprite {
  public static readonly TILE_SCALE = 1

  public readonly source: ImageSource

  private dirty = false

  /** Update texture every 5 frames */
  private readonly textureUpdateFrequency = 6
  private textureUpdateCounter = 0

  constructor(
    private readonly renderer: Renderer,
    x: number,
    y: number,
    zIndex: number,
    enableTransparency: boolean,
  ) {
    const channels = enableTransparency ? 4 : 3

    const buffer = new Uint8Array(
      Consts.TILE_RESOLUTION * Consts.TILE_RESOLUTION * channels,
    )
    // buffer.fill(128)
    const source: ImageSource = {
      data: buffer,
      width: Consts.TILE_RESOLUTION,
      height: Consts.TILE_RESOLUTION,
      format: enableTransparency ? renderer.gl.RGBA : renderer.gl.RGB,
    }

    super(renderer.gl, new Texture(renderer.gl, source), zIndex)

    this.source = source
    this.setTransform(x, y, Tile.TILE_SCALE, Tile.TILE_SCALE) //TODO: restore
    // this.setTransform(
    //   x,
    //   y,
    //   Tile.TILE_SCALE * 0.984375,
    //   Tile.TILE_SCALE * 0.984375,
    //   0,
    // )
  }

  dispose() {
    this.renderer.removeObjects(this)
    this.texture.dispose()
  }

  /** Should be called after every change to the source.data */
  setDirty() {
    this.dirty = true
  }

  update(force = false) {
    if (!this.visible || !this.dirty) {
      return
    }

    // if (Math.random() > 0.99) {
    // if (Math.random() > 0.999999) {
    //   this.source.data.fill(Math.random() * 16 + 16)
    // } else {
    //   return
    // }

    if (
      force ||
      this.textureUpdateCounter++ % this.textureUpdateFrequency === 0
    ) {
      this.texture.update(this.source)
      this.textureUpdateCounter = 0
    }

    this.dirty = false
  }
}

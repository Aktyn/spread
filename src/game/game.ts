import type { Renderer } from "../graphics/renderer"
import { defaultGameConfig } from "./config"
import { Consts } from "./consts"
import { Camera } from "./objects/camera"
import { Player } from "./objects/player"
import { TiledLayer } from "./objects/tiled-layer"
import { Steering } from "./steering"

export class Game {
  private lastTime = 0
  public totalChunksCount = 0

  private readonly steering = new Steering()
  public readonly camera = new Camera()
  public readonly player: Player

  private readonly backgroundPaintLayer: TiledLayer

  constructor(private readonly renderer: Renderer) {
    this.backgroundPaintLayer = new TiledLayer(
      renderer,
      this.camera,
      defaultGameConfig,
      Consts.Z_INDEX.BACKGROUND_TILE,
    )

    this.player = new Player(
      renderer,
      renderer.assets.textures.player,
      this.steering,
    )
    renderer.addObjects(this.player)

    this.camera.follow(this.player)
  }

  dispose() {
    this.steering.dispose()
    this.backgroundPaintLayer.dispose()

    this.renderer.removeObjects(this.player)
  }

  update(time: number) {
    const deltaTime = (time - this.lastTime) / 1000
    this.lastTime = time

    if (deltaTime > 1) {
      console.warn("Skipping frame due to delta time exceeding 1000ms")
      return
    }

    this.player.update(deltaTime)

    this.backgroundPaintLayer.update(deltaTime)
    this.totalChunksCount = this.backgroundPaintLayer.getChunksCount()

    this.camera.update(deltaTime)

    if (this.camera.changed) {
      this.renderer.setViewport(this.camera.getVector())
      this.camera.changed = false
    }
  }
}

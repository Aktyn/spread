import type { Renderer } from "../graphics/renderer"
import { defaultGameConfig } from "./config"
import { Consts } from "./consts"
import { Camera } from "./objects/camera"
import { Player } from "./objects/player"
import { TiledLayer } from "./objects/tiled-layer"
import { Steering } from "./steering"
import { TerrainGenerator } from "./utils/terrain-generator"

export class Game {
  private lastTime = 0
  public totalChunksCount = 0

  private readonly steering = new Steering()
  public readonly camera = new Camera()
  public readonly player: Player

  private readonly groundLayer: TiledLayer
  private readonly collisionLayer: TiledLayer

  constructor(private readonly renderer: Renderer) {
    this.groundLayer = new TiledLayer(
      renderer,
      this.camera,
      defaultGameConfig,
      Consts.Z_INDEX.BACKGROUND_TILE,
      new TerrainGenerator({
        seed: "ground-layer-seed",
        fade: 1,
      }),
    )

    this.collisionLayer = new TiledLayer(
      renderer,
      this.camera,
      defaultGameConfig,
      Consts.Z_INDEX.COLLISION_TILE,
      new TerrainGenerator({
        seed: "collision-layer-seed",
        fade: 0,
        transparentBackground: true,
      }),
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
    this.groundLayer.dispose()
    this.collisionLayer.dispose()

    this.renderer.removeObjects(this.player)
  }

  update(time: number) {
    let deltaTime = (time - this.lastTime) / 1000
    this.lastTime = time

    if (deltaTime > 1) {
      console.warn("Skipping frame due to delta time exceeding 1000ms")
      return
    }

    if (!this.groundLayer.ready || !this.collisionLayer.ready) {
      console.log("Game is not ready") //TODO: show loading screen or something like that
      deltaTime = 0
    }

    this.player.update(deltaTime)

    this.totalChunksCount = 0

    this.groundLayer.update(deltaTime)
    this.totalChunksCount += this.groundLayer.getChunksCount()

    this.collisionLayer.update(deltaTime)
    this.totalChunksCount += this.collisionLayer.getChunksCount()

    this.camera.update(deltaTime)

    if (this.camera.changed) {
      this.renderer.setViewport(this.camera.getVector())
      this.camera.changed = false
    }
  }
}

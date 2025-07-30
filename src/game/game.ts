import type { Renderer } from "@/graphics/renderer"
import { defaultGameConfig } from "./config"
import { Consts } from "./consts"
import { Camera } from "./objects/camera"
import { Player } from "./objects/player"
import { TiledLayer } from "./objects/tiled-layer"
import { TilesChunk } from "./objects/tiles-chunk"
import { Steering } from "./steering"
import { TerrainGenerator } from "./utils/terrain-generator"
import { Physics } from "@/game/physics/physics"

export class Game {
  private lastTime = 0
  public totalChunksCount = 0

  private readonly physics = new Physics()
  private readonly steering = new Steering()
  public readonly camera = new Camera()
  public readonly player

  private readonly groundLayer
  private readonly collisionLayer

  constructor(private readonly renderer: Renderer) {
    this.groundLayer = new TiledLayer(
      renderer,
      this.camera,
      defaultGameConfig,
      Consts.Z_INDEX.BACKGROUND_TILE,
      "background",
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
      "solid",
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
    renderer.layers.objects.addObjects(this.player.sprite)

    this.camera.follow(this.player)

    this.physics.addObject(this.collisionLayer)
    this.physics.addObject(this.player)
  }

  dispose() {
    TilesChunk.clearQueue()

    this.steering.dispose()
    this.groundLayer.dispose()
    this.collisionLayer.dispose()

    this.renderer.layers.objects.removeObjects(this.player.sprite)

    this.physics.removeObject(this.collisionLayer)
    this.physics.removeObject(this.player)
  }

  get chunksInQueue() {
    return TilesChunk.queueSize()
  }

  get waitingForChunks() {
    return !this.groundLayer.ready || !this.collisionLayer.ready
  }

  update(time: number) {
    let deltaTime = (time - this.lastTime) / 1000.0
    this.lastTime = time

    if (deltaTime > 0.1) {
      console.warn("Skipping frame due to delta time exceeding 100ms")
      return
    }

    if (this.waitingForChunks) {
      deltaTime = 0
    }

    this.player.updateControls(deltaTime)

    this.totalChunksCount = 0

    this.groundLayer.update(deltaTime)
    this.totalChunksCount += this.groundLayer.getChunksCount()

    this.collisionLayer.update(deltaTime)
    this.totalChunksCount += this.collisionLayer.getChunksCount()

    this.camera.update(deltaTime)

    if (!this.waitingForChunks) {
      this.physics.update(deltaTime)
    }

    if (this.camera.changed) {
      this.renderer.setViewport(this.camera.getVector())
      this.camera.changed = false
    }
  }
}

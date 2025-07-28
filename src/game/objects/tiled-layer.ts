import type { Renderer } from "../../graphics/renderer"
import type { GameConfig } from "../config"
import type { TerrainGenerator } from "../utils/terrain-generator"
import type { Camera } from "./camera"
import { TilesChunk } from "./tiles-chunk"

type ChunkX = number
type ChunkY = number

export class TiledLayer {
  private readonly tileChunks = new Map<ChunkX, Map<ChunkY, TilesChunk>>()

  private currentChunkX = -Number.MAX_SAFE_INTEGER
  private currentChunkY = -Number.MAX_SAFE_INTEGER
  private currentChunksRange = 0
  private _ready = false

  constructor(
    private readonly renderer: Renderer,
    private readonly camera: Camera,
    private readonly gameConfig: GameConfig,
    private readonly zIndex: number,
    private readonly rendererLayer: keyof Renderer["layers"],
    private readonly terrainGenerator: TerrainGenerator,
  ) {}

  dispose() {
    for (const chunk of this.getChunksAsArray()) {
      chunk.dispose()
    }
  }

  get ready() {
    return this._ready
  }

  private getChunksAsArray() {
    return Array.from(this.tileChunks.values()).flatMap((row) =>
      Array.from(row.values()),
    )
  }

  getChunksCount() {
    return Array.from(this.tileChunks.values()).reduce(
      (acc, row) => acc + row.size,
      0,
    )
  }

  private updateLoadedChunks(originX: number, originY: number) {
    const chunkX = TilesChunk.floorToChunkSize(originX)
    const chunkY = TilesChunk.floorToChunkSize(originY)

    const largerAxis = Math.max(1 / this.camera.width, 1 / this.camera.height)
    const n = Math.ceil(largerAxis / TilesChunk.CHUNK_SIZE) + 1

    if (
      chunkX === this.currentChunkX &&
      chunkY === this.currentChunkY &&
      n === this.currentChunksRange
    ) {
      return
    }

    this.currentChunkX = chunkX
    this.currentChunkY = chunkY
    this.currentChunksRange = n

    const chunksRange = n * TilesChunk.CHUNK_SIZE

    for (
      let x = chunkX - chunksRange;
      x <= chunkX + chunksRange;
      x += TilesChunk.CHUNK_SIZE
    ) {
      let column = this.tileChunks.get(x)

      if (!column) {
        column = new Map<number, TilesChunk>()
        this.tileChunks.set(x, column)
      }

      for (
        let y = chunkY - chunksRange;
        y <= chunkY + chunksRange;
        y += TilesChunk.CHUNK_SIZE
      ) {
        let chunk = column.get(y)
        if (!chunk) {
          const priority =
            1 -
            ((x + TilesChunk.CHUNK_SIZE / 2 - originX) ** 2 +
              (y + TilesChunk.CHUNK_SIZE / 2 - originY) ** 2)

          chunk = new TilesChunk(
            this.renderer,
            this.terrainGenerator,
            x,
            y,
            this.zIndex,
            this.rendererLayer,
            this.terrainGenerator.options.transparentBackground ?? false,
            priority,
          )

          column.set(y, chunk)
        } else if (!chunk.ready) {
          const priority =
            1 -
            ((x + TilesChunk.CHUNK_SIZE / 2 - originX) ** 2 +
              (y + TilesChunk.CHUNK_SIZE / 2 - originY) ** 2)

          chunk.reprioritise(priority)
        }
      }
    }
  }

  private removeChunk(chunk: TilesChunk) {
    const column = this.tileChunks.get(chunk.x)
    if (column) {
      column.delete(chunk.y)
      if (!column.size) {
        this.tileChunks.delete(chunk.x)
      }
    }
    chunk.dispose()
  }

  update(deltaTime: number) {
    this.updateLoadedChunks(this.camera.x, this.camera.y)

    //TODO: pregenerate chunks within distance of worldUpdateManhattanDistance (just generate from perlin noise and store externally, without rendering)

    const chunks = this.getChunksAsArray()

    this._ready = true

    for (const chunk of chunks) {
      if (
        chunk.x + TilesChunk.CHUNK_SIZE <
          this.camera.x - this.gameConfig.worldUpdateManhattanDistance ||
        chunk.x >
          this.camera.x + this.gameConfig.worldUpdateManhattanDistance ||
        chunk.y <
          this.camera.y - this.gameConfig.worldUpdateManhattanDistance ||
        chunk.y > this.camera.y + this.gameConfig.worldUpdateManhattanDistance
      ) {
        this.removeChunk(chunk)
        continue
      }

      if (
        !chunk.ready &&
        chunk.x + TilesChunk.CHUNK_SIZE >
          this.camera.x - this.gameConfig.minimumReadyTilesManhattanDistance &&
        chunk.x <
          this.camera.x + this.gameConfig.minimumReadyTilesManhattanDistance &&
        chunk.y + TilesChunk.CHUNK_SIZE >
          this.camera.y - this.gameConfig.minimumReadyTilesManhattanDistance &&
        chunk.y <
          this.camera.y + this.gameConfig.minimumReadyTilesManhattanDistance
      ) {
        this._ready = false
      }

      chunk.update(deltaTime)
    }
  }
}

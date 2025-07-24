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

  constructor(
    private readonly renderer: Renderer,
    private readonly camera: Camera,
    private readonly gameConfig: GameConfig,
    private readonly zIndex: number,
    private readonly terrainGenerator: TerrainGenerator,
  ) {}

  dispose() {
    for (const chunk of this.getChunksAsArray()) {
      chunk.dispose()
    }
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

  private updateLoadedChunks() {
    const chunkX = TilesChunk.floorToChunkSize(this.camera.x)
    const chunkY = TilesChunk.floorToChunkSize(this.camera.y)

    const largerAxis = Math.max(1 / this.camera.width, 1 / this.camera.height)
    const n = Math.ceil(largerAxis / TilesChunk.CHUNK_SIZE)

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

    for (
      let x = chunkX - n * TilesChunk.CHUNK_SIZE;
      x <= chunkX + n * TilesChunk.CHUNK_SIZE;
      x += TilesChunk.CHUNK_SIZE
    ) {
      let column = this.tileChunks.get(x)

      if (!column) {
        column = new Map<number, TilesChunk>()
        this.tileChunks.set(x, column)
      }

      for (
        let y = chunkY - n * TilesChunk.CHUNK_SIZE;
        y <= chunkY + n * TilesChunk.CHUNK_SIZE;
        y += TilesChunk.CHUNK_SIZE
      ) {
        if (!column.has(y)) {
          const chunk = new TilesChunk(
            this.renderer,
            this.terrainGenerator,
            x,
            y,
            this.zIndex,
            this.terrainGenerator.options.transparentBackground ?? false,
          )

          column.set(y, chunk)
          this.renderer.addObjects(...chunk)
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
    this.updateLoadedChunks()

    const chunks = this.getChunksAsArray()

    //TODO: develop meaningful update logic
    for (const chunk of chunks) {
      if (
        chunk.x + TilesChunk.CHUNK_SIZE <
          this.camera.x - this.gameConfig.worldUpdateDistance ||
        chunk.x > this.camera.x + this.gameConfig.worldUpdateDistance ||
        chunk.y < this.camera.y - this.gameConfig.worldUpdateDistance ||
        chunk.y > this.camera.y + this.gameConfig.worldUpdateDistance
      ) {
        this.removeChunk(chunk)
        continue
      }

      chunk.update(deltaTime)
    }
  }
}

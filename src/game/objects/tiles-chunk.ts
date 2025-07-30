import type { Renderer } from "@/graphics/renderer"
import { randomIntInRange, shuffle } from "@/lib/random"
import { wait } from "@/lib/utils"
import { Queue } from "../utils/queue"
import type { TerrainGenerator } from "../utils/terrain-generator"
import { Tile } from "./tile"
import { type PixelData, RasterObject } from "@/game/physics/raster-object"
import { DebugLayer } from "@/debug-layer"

export class TilesChunk extends RasterObject {
  private static Queue = new Queue<TilesChunk>()

  public static queueSize() {
    return TilesChunk.Queue.size
  }

  public static clearQueue() {
    TilesChunk.Queue.clear()
  }

  public static readonly CHUNK_SIZE = 8

  private tiles: Tile[][] = []
  private disposed = false
  private _ready = false //TODO: use this flag to defer first render if not enough surrounding tiles are ready

  /**
   * It means that the structure of this chunk has been changed and should be stored in external storage\
   * Unchanged chunk can be easily regenerated with perlin noise
   * */
  // private eligibleForStorage = false //TODO: use and implement storage logic

  constructor(
    private readonly renderer: Renderer,
    terrainGenerator: TerrainGenerator,
    public readonly x: number,
    public readonly y: number,
    private readonly zIndex: number,
    private readonly rendererLayer: keyof Renderer["layers"],
    private readonly enableTransparency: boolean,
    priority: number,
  ) {
    super()

    TilesChunk.Queue.add(this, priority)
    void this.generate(terrainGenerator).finally(() => {
      TilesChunk.Queue.remove(this)
    })
  }

  dispose() {
    TilesChunk.Queue.remove(this)

    for (const tile of this) {
      tile.dispose()
    }
    this.tiles.length = 0
    this.disposed = true
  }

  reprioritise(priority: number) {
    TilesChunk.Queue.changePriority(this, priority)
  }

  get ready() {
    return this._ready
  }

  getPixel(outPixel: PixelData, x: number, y: number) {
    const tileX = Tile.floorToTileScale(x - this.x)
    const tileY = Tile.floorToTileScale(y - this.y)

    const tile = this.tiles[tileX]?.[tileY]

    if (!tile) {
      throw new Error(
        "Tile not found. All tiles overlapping with dynamic objects must be generated/loaded before rendering.",
      )
    }

    tile.getPixel(outPixel, x, y)

    if (DebugLayer.ctx && outPixel[0] > 0) {
      DebugLayer.ctx.fillStyle = "#fff1"
      DebugLayer.ctx.fillRect(tile.x, tile.y, Tile.TILE_SCALE, Tile.TILE_SCALE)
    }
  }

  private async generate(terrainGenerator: TerrainGenerator) {
    let next = TilesChunk.Queue.next
    while (next && next !== this) {
      await wait(4)
      next = TilesChunk.Queue.next
    }

    if (this.disposed) {
      return
    }

    const tilesToGenerate: Array<{ x: number; y: number }> = []
    for (let x = 0; x < TilesChunk.CHUNK_SIZE; x++) {
      for (let y = 0; y < TilesChunk.CHUNK_SIZE; y++) {
        tilesToGenerate.push({ x, y })
      }
    }

    shuffle(tilesToGenerate)

    const generatedTiles = await Promise.all(
      tilesToGenerate.map(async (tileIndexes) => {
        await wait(randomIntInRange(2, 8))

        const tileX = this.x + tileIndexes.x * Tile.TILE_SCALE
        const tileY = this.y + tileIndexes.y * Tile.TILE_SCALE

        const tileData = await terrainGenerator.generateTileData(tileX, tileY)

        const tile = new Tile(
          this.renderer,
          tileX,
          tileY,
          this.zIndex,
          this.rendererLayer,
          this.enableTransparency,
          tileData,
        )

        // tile.source.data.set(tileData)
        // tile.setDirty()
        // tile.update(true)

        if (this.disposed) {
          tile.dispose()
        }

        return { tile, tileIndexes }
      }),
    )

    generatedTiles.sort(
      (a, b) =>
        a.tileIndexes.y +
        a.tileIndexes.x * TilesChunk.CHUNK_SIZE -
        (b.tileIndexes.y + b.tileIndexes.x * TilesChunk.CHUNK_SIZE),
    )

    if (!this.disposed) {
      this.tiles = Array.from({ length: TilesChunk.CHUNK_SIZE }, (_, indexX) =>
        Array.from({ length: TilesChunk.CHUNK_SIZE }, (_, indexY) => {
          return generatedTiles[indexY + indexX * TilesChunk.CHUNK_SIZE].tile
        }),
      )
    }

    this._ready = true
  }

  update(_deltaTime: number) {
    for (const tile of this) {
      tile.update()
    }
  }

  public static floorToChunkSize(value: number) {
    return Math.floor(value / TilesChunk.CHUNK_SIZE) * TilesChunk.CHUNK_SIZE
  }

  *[Symbol.iterator]() {
    for (let x = 0; x < this.tiles.length; x++) {
      for (let y = 0; y < this.tiles[x].length; y++) {
        yield this.tiles[x][y]
      }
    }
  }
}

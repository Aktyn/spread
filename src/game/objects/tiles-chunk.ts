import type { Renderer } from "../../graphics/renderer"
import { randomIntInRange, shuffle } from "../../lib/random"
import { wait } from "../../lib/utils"
import type { TerrainGenerator } from "../utils/terrain-generator"
import { Tile } from "./tile"

export class TilesChunk {
  public static readonly CHUNK_SIZE = 8

  private readonly tiles: Tile[][]
  private disposed = false
  private ready = false //TODO: use this flag to defer first render if not enough surrounding tiles are ready

  /**
   * It means that structure of this chunk has been changed and should be stored in external storage\
   * Unchanged chunk can be easily regenerated with perlin noise
   * */
  private eligibleForStorage = false

  constructor(
    renderer: Renderer,
    terrainGenerator: TerrainGenerator,
    public readonly x: number,
    public readonly y: number,
    zIndex: number,
    enableTransparency: boolean,
  ) {
    this.tiles = Array.from({ length: TilesChunk.CHUNK_SIZE }, (_, indexX) =>
      Array.from({ length: TilesChunk.CHUNK_SIZE }, (_, indexY) => {
        return new Tile(
          renderer,
          x + indexX,
          y + indexY,
          zIndex,
          enableTransparency,
        )
      }),
    )

    void this.generate(terrainGenerator)
  }

  private async generate(terrainGenerator: TerrainGenerator) {
    const allTiles: Tile[] = []
    for (let x = 0; x < TilesChunk.CHUNK_SIZE; x++) {
      for (let y = 0; y < TilesChunk.CHUNK_SIZE; y++) {
        allTiles.push(this.tiles[x][y])
      }
    }

    shuffle(allTiles)

    for (const tile of allTiles) {
      await wait(randomIntInRange(4, 16))
      const tileData = await terrainGenerator.generateTileData(tile.x, tile.y)

      if (this.disposed) {
        return
      }

      tile.source.data.set(tileData)
      tile.setDirty()
      tile.update(true)
    }

    this.ready = true
  }

  dispose() {
    for (const tile of this) {
      tile.dispose()
    }
    this.tiles.length = 0
    this.disposed = true
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

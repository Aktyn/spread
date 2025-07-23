import type { Renderer } from "../../graphics/renderer"
import { Tile } from "./tile"

export class TilesChunk {
  public static readonly CHUNK_SIZE = 8

  private readonly tiles: Tile[][];

  *[Symbol.iterator]() {
    for (let x = 0; x < this.tiles.length; x++) {
      for (let y = 0; y < this.tiles[x].length; y++) {
        yield this.tiles[x][y]
      }
    }
  }

  /**
   * It means that structure of this chunk has been changed and should be stored in external storage\
   * Unchanged chunk can be easily regenerated with perlin noise
   * */
  private eligibleForStorage = false

  constructor(
    renderer: Renderer,
    public readonly x: number,
    public readonly y: number,
    zIndex: number,
  ) {
    const chunkShade = Math.random() * 192 + 64

    this.tiles = Array.from({ length: TilesChunk.CHUNK_SIZE }, (_, indexX) =>
      Array.from({ length: TilesChunk.CHUNK_SIZE }, (_, indexY) => {
        const tile = new Tile(renderer, x + indexX, y + indexY, zIndex)
        tile.source.data.fill(chunkShade)
        tile.setDirty()
        tile.update(true)
        return tile
      }),
    )

    //TODO: implement localforage synchronization
  }

  dispose() {
    for (const tile of this) {
      tile.dispose()
    }
    this.tiles.length = 0
  }

  update(_deltaTime: number) {
    for (const tile of this) {
      tile.update()
    }
  }

  public static floorToChunkSize(value: number) {
    return Math.floor(value / TilesChunk.CHUNK_SIZE) * TilesChunk.CHUNK_SIZE
  }
}

import { Consts } from "../consts"
import type { TerrainGeneratorOptions } from "./terrain-generator.worker"
import Worker from "./terrain-generator.worker?worker"

type WorkerResponse = {
  id: number
  tileData: Uint8Array
}

type PendingRequest = {
  resolve: (data: Uint8Array) => void
  reject: (reason?: unknown) => void
}

export class TerrainGenerator {
  private readonly worker: Worker
  private nextId = 0
  private readonly pendingRequests = new Map<number, PendingRequest>()

  constructor(public readonly options: TerrainGeneratorOptions) {
    this.worker = new Worker()
    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      this.handleWorkerMessage(e.data)
    }
  }

  private handleWorkerMessage(data: WorkerResponse) {
    const { id, tileData } = data
    const request = this.pendingRequests.get(id)

    if (request) {
      this.pendingRequests.delete(id)
      request.resolve(tileData)
    }
  }

  public generateTileData(tileX: number, tileY: number) {
    return new Promise<Uint8Array>((resolve, reject) => {
      const id = this.nextId++
      this.pendingRequests.set(id, { resolve, reject })

      this.worker.postMessage({
        id,
        tileX,
        tileY,
        tileResolution: Consts.TILE_RESOLUTION,
        options: this.options,
      })
    })
  }

  public dispose() {
    this.worker.terminate()
  }
}

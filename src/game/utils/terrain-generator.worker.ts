import { createNoise2D, type NoiseFunction2D } from "simplex-noise"
import alea from "alea"
import { clamp, EPSILON, mix, transformRange } from "@/lib/math"

type LayerParameters = {
  /**
   * The scale of simplex noise pattern\
   * Higher scale will produce bigger islands
   */
  scale: number

  /**
   * The transform function to apply to the value
   * @param value - The value to transform (between 0 and 1)
   * @returns The transformed value
   */
  transform?: (value: number) => number
}

export type TerrainGeneratorOptions = {
  seed: string
  fade?: number
  transparentBackground?: boolean
}

class TerrainGeneratorWorker {
  private readonly noise2D: NoiseFunction2D

  constructor(private readonly options: TerrainGeneratorOptions) {
    this.noise2D = createNoise2D(alea(options.seed))
  }

  private get channels() {
    return this.options.transparentBackground ? 4 : 3
  }

  private calculateLayerValue(layer: LayerParameters, x: number, y: number) {
    const value = transformRange(
      this.noise2D(x / layer.scale, y / layer.scale),
      -1,
      1,
      0,
      1,
    )
    return layer.transform ? layer.transform(value) : value
  }

  private fadeLayerValues(
    value1: number,
    value2: number,
    channelFactor: number,
  ) {
    const fade = this.options.fade ?? 1

    if (fade > EPSILON) {
      return value1 <= fade
        ? mix(channelFactor, value2, (fade - value1) / fade)
        : channelFactor
    } else {
      return value1 === 0 ? value2 : channelFactor
    }
  }

  private calculateBackground(x: number, y: number) {
    const background = this.calculateLayerValue(
      TerrainGeneratorWorker.Layers.background,
      x,
      y,
    )
    const background2 = this.calculateLayerValue(
      TerrainGeneratorWorker.Layers.background2,
      x,
      y,
    )
    return background * background2
  }

  private calculateColor(x: number, y: number): [number, number, number] {
    const biomes = this.calculateLayerValue(
      TerrainGeneratorWorker.Layers.biomes,
      x,
      y,
    )

    const colorBiome = this.calculateLayerValue(
      TerrainGeneratorWorker.Layers.color,
      -y,
      -x,
    )
    const [red, green, blue] = getBiomeChannels(colorBiome)

    const background = this.options.transparentBackground
      ? 0
      : this.calculateBackground(x, y)

    const mixedRed = this.fadeLayerValues(biomes, background, red)
    const mixedGreen = this.fadeLayerValues(biomes, background, green)
    const mixedBlue = this.fadeLayerValues(biomes, background, blue)

    const redValue = clamp(mixedRed * 256, 0, 255)
    const greenValue = clamp(mixedGreen * 256, 0, 255)
    const blueValue = clamp(mixedBlue * 256, 0, 255)

    return [redValue, greenValue, blueValue]
  }

  generateTile(offsetX: number, offsetY: number, tileSize: number) {
    const colorData = new Uint8Array(tileSize * tileSize * this.channels)

    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const [r, g, b] = this.calculateColor(offsetX + x, offsetY - y)

        const index = (y * tileSize + x) * this.channels
        colorData[index] = r
        colorData[index + 1] = g
        colorData[index + 2] = b

        if (this.channels === 4) {
          colorData[index + 3] = r === 0 && g === 0 && b === 0 ? 0 : 255
        }
      }
    }

    return colorData
  }

  static readonly Layers = {
    biomes: {
      scale: 1_000,
      transform: (value: number) =>
        transformRange(value, 0.75, 0.875, 0, 1, true),
    },

    background: {
      scale: 1,
      transform: (value: number) => value * 0.25 + 0.5,
      // transform: () => 0.75,
    },
    background2: {
      scale: 500,
      transform: (value: number) => value * 0.6 + 0.4,
      // transform: () => 1,
    },

    color: {
      scale: 10_000,
    },
  } as const satisfies Record<string, LayerParameters>
}

/** All probabilities should sum to 1 */
const biomeProbabilities = {
  singleChannel: 0.9,
  twoChannels: 0.09,
  white: 0.01,
}
const lightness = 0.33

function getBiomeChannels(value: number): [number, number, number] {
  const pSingle = biomeProbabilities.singleChannel
  const pTwo = pSingle + biomeProbabilities.twoChannels

  if (value < pSingle) {
    const index = Math.floor((value / pSingle) * 3)
    const colors: [number, number, number][] = [
      [1, lightness, lightness], // red
      [lightness, 1, lightness], // green
      [lightness, lightness, 1], // blue
    ]
    return colors[index]
  }

  if (value < pTwo) {
    const relativeValue = value - pSingle
    const index = Math.floor(
      (relativeValue / biomeProbabilities.twoChannels) * 3,
    )
    const colors: [number, number, number][] = [
      [1, 1, lightness], // yellow
      [1, lightness, 1], // pink
      [lightness, 1, 1], // cyan
    ]
    return colors[index]
  }

  return [1, 1, 1] // white
}

type WorkerRequest = {
  id: number
  tileX: number
  tileY: number
  tileResolution: number
  options: TerrainGeneratorOptions
}

let generator: TerrainGeneratorWorker | null = null
let currentSeed: string | null = null

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, tileX, tileY, tileResolution, options } = e.data

  if (options.seed !== currentSeed) {
    generator = new TerrainGeneratorWorker(options)
    currentSeed = options.seed
  }

  generator ??= new TerrainGeneratorWorker(options)

  const tileData = generator.generateTile(
    tileX * tileResolution,
    tileY * tileResolution,
    tileResolution,
  )

  self.postMessage({ id, tileData })
}

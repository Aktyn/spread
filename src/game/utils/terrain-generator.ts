import { createNoise2D, type NoiseFunction2D } from "simplex-noise"
import alea from "alea"
import { clamp, mix, transformRange } from "../../lib/math"

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

export class TerrainGenerator {
  private readonly noise2D: NoiseFunction2D

  constructor(seed: string) {
    this.noise2D = createNoise2D(alea(seed))
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
    fade = 0, //.66,
  ) {
    if (fade > 1e-6) {
      return value1 <= fade
        ? mix(channelFactor, value2, (fade - value1) / fade)
        : channelFactor
    } else {
      return value1 === 0 ? value2 : channelFactor
    }
  }

  private calculateColor(x: number, y: number): [number, number, number] {
    const biomes = this.calculateLayerValue(
      TerrainGenerator.Layers.biomes,
      x,
      y,
    )

    // const red = this.calculateLayerValue(TerrainGenerator.Layers.color, -y, x)
    // const green = this.calculateLayerValue(TerrainGenerator.Layers.color, y, -x)
    // const blue = this.calculateLayerValue(TerrainGenerator.Layers.color, -y, -x)
    const colorBiome = this.calculateLayerValue(
      TerrainGenerator.Layers.color,
      -y,
      -x,
    )
    const [red, green, blue] = getBiomeChannels(colorBiome)

    const ground = this.calculateLayerValue(
      TerrainGenerator.Layers.ground,
      x,
      y,
    )

    const mixedRed = this.fadeLayerValues(biomes, ground, red)
    const mixedGreen = this.fadeLayerValues(biomes, ground, green)
    const mixedBlue = this.fadeLayerValues(biomes, ground, blue)

    const redValue = clamp(mixedRed * 256, 0, 255)
    const greenValue = clamp(mixedGreen * 256, 0, 255)
    const blueValue = clamp(mixedBlue * 256, 0, 255)

    return [redValue, greenValue, blueValue]
  }

  generateTile(
    dataRGB: Uint8Array,
    offsetX: number,
    offsetY: number,
    tileSize: number,
  ) {
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const [r, g, b] = this.calculateColor(offsetX + x, offsetY - y)

        const index = (y * tileSize + x) * 3
        dataRGB[index] = r
        dataRGB[index + 1] = g
        dataRGB[index + 2] = b
      }
    }
  }

  static readonly Layers = {
    biomes: {
      scale: 1_000,
      transform: (value: number) =>
        transformRange(value, 0.75, 0.875, 0, 1, true),
    },

    ground: {
      scale: 1,
      transform: (value: number) => value * 0.2,
    },

    color: {
      scale: 10_000,
      // transform: (value: number) =>
      //   transformRange(value, 0.33, 0.66, 0, 1, true),
    },
  } as const satisfies Record<string, LayerParameters>
}

/** All probabilities should sum to 1 */
const biomeProbabilities = {
  singleChannel: 0.9,
  twoChannels: 0.09,
  white: 0.01,
}

function getBiomeChannels(value: number): [number, number, number] {
  const pSingle = biomeProbabilities.singleChannel
  const pTwo = pSingle + biomeProbabilities.twoChannels

  if (value < pSingle) {
    const index = Math.floor((value / pSingle) * 3)
    const colors: [number, number, number][] = [
      [1, 0, 0], // red
      [0, 1, 0], // green
      [0, 0, 1], // blue
    ]
    return colors[index]
  }

  if (value < pTwo) {
    const relativeValue = value - pSingle
    const index = Math.floor(
      (relativeValue / biomeProbabilities.twoChannels) * 3,
    )
    const colors: [number, number, number][] = [
      [1, 1, 0], // yellow
      [1, 0, 1], // pink
      [0, 1, 1], // cyan
    ]
    return colors[index]
  }

  return [1, 1, 1] // white
}

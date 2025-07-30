import type { PhysicalObject } from "@/game/physics/physical-object"

export type PixelData =
  | [number, number, number]
  | [number, number, number, number]

export abstract class RasterObject implements PhysicalObject {
  abstract getPixel(
    /** RGB or RGBA */
    outPixel: PixelData,
    x: number,
    y: number,
  ): void
}

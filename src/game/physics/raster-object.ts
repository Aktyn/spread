import type { PhysicalObject } from "@/game/physics/physical-object"

export type PIXEL_DATA =
  | [number, number, number]
  | [number, number, number, number]

export abstract class RasterObject implements PhysicalObject {
  abstract getPixel(
    /** RGB or RGBA */
    outPixel: PIXEL_DATA,
    x: number,
    y: number,
  ): void
}

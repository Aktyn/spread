import { vec2 } from "gl-matrix"
import { epsilonToZero } from "@/lib/math"

type SensorPoint = [number, number]

export enum RasterSensorShape {
  Circle,
}

export class RasterSensor {
  public static readonly Shape = RasterSensorShape

  private readonly shapePoints: ReadonlyArray<SensorPoint>
  private readonly points: Array<SensorPoint>

  constructor(shape: RasterSensorShape) {
    this.shapePoints = shapes[shape]
    this.points = this.shapePoints.map((p) => [...p] as SensorPoint)
  }

  applyTransform(
    centerX: number,
    centerY: number,
    radius: number,
    rotation: number,
  ) {
    for (let i = 0; i < this.shapePoints.length; i++) {
      vec2.rotate(
        this.points[i],
        this.shapePoints[i],
        vec2.fromValues(0, 0),
        rotation,
      )
      vec2.scale(this.points[i], this.points[i], radius)

      this.points[i][0] = epsilonToZero(this.points[i][0] + centerX)
      this.points[i][1] = epsilonToZero(this.points[i][1] + centerY)
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.points.length; i++) {
      yield this.points[i]
    }
  }
}

const shapes: { [key in RasterSensorShape]: SensorPoint[] } = {
  [RasterSensorShape.Circle]: Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * Math.PI * 2
    return [
      epsilonToZero(Math.cos(angle)),
      epsilonToZero(Math.sin(angle)),
    ] as SensorPoint
  }),
}

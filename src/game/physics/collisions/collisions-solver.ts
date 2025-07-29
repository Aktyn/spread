import type { RasterObject } from "@/game/physics/raster-object"
import { vec2 } from "gl-matrix"
import type { DynamicObject } from "@/game/physics/dynamic-object"
import { EPSILON } from "@/lib/math"
import { DebugLayer } from "@/debug-layer"
import { Consts } from "@/game/consts"

export class CollisionsSolver {
  private accumulatedForces: Array<vec2> = []

  private pushForce(force: vec2) {
    this.accumulatedForces.push(force)
  }

  public clearForces() {
    this.accumulatedForces = []
  }

  calculateTotalImpulse(scaleFactor: number) {
    if (!this.accumulatedForces.length) {
      return null
    }

    const totalForce = vec2.create()
    for (const force of this.accumulatedForces) {
      vec2.add(totalForce, totalForce, force)
    }

    vec2.scale(totalForce, totalForce, scaleFactor)
    if (vec2.squaredLength(totalForce) < EPSILON ** 2) {
      return null
    }
    return totalForce
  }

  static calculateRasterCollisionForce(
    raster: RasterObject,
    object: DynamicObject,
  ) {
    //TODO: calculate average collision point from all colliding sensor points
    const pixel = [0, 0, 0, 0] as [number, number, number, number]
    for (const sensorPoint of object.sensor) {
      raster.getPixel(pixel, sensorPoint[0], sensorPoint[1])
      if (pixel[3] > 0) {
        // console.log("Pixel collision detected")

        if (DebugLayer.ctx) {
          DebugLayer.ctx.fillStyle = "#f22"
          DebugLayer.ctx.beginPath()
          DebugLayer.ctx.arc(
            sensorPoint[0],
            sensorPoint[1],
            (1 / Consts.TILE_RESOLUTION) * 2,
            0,
            Math.PI * 2,
          )
          DebugLayer.ctx.fill()
        }
      }
    }

    // object.velocity

    // object.solver.pushForce(force)

    return false //returns true if an object is colliding
  }

  static calculateRasterCollisionForces(
    raster: RasterObject,
    objects: DynamicObject[],
    collidingObjectsSet: Set<DynamicObject>,
  ) {
    for (let i = 0; i < objects.length; i++) {
      if (CollisionsSolver.calculateRasterCollisionForce(raster, objects[i])) {
        collidingObjectsSet.add(objects[i])
      }
    }
  }
}

import type { PixelData, RasterObject } from "@/game/physics/raster-object"
import { vec2 } from "gl-matrix"
import type { DynamicObject } from "@/game/physics/dynamic-object"
import { DebugLayer } from "@/debug-layer"
import { Consts } from "@/game/consts"
import { sumVectors } from "@/lib/math"

export class CollisionsSolver {
  private accumulatedPositionSolverVectors: Array<vec2> = []
  private accumulatedImpulses: Array<vec2> = []

  get hasAccumulatedForces() {
    return (
      this.accumulatedPositionSolverVectors.length > 0 ||
      this.accumulatedImpulses.length > 0
    )
  }

  private addPositionSolverVector(vector: vec2) {
    this.accumulatedPositionSolverVectors.push(vector)
  }

  private addImpulse(impulse: vec2) {
    this.accumulatedImpulses.push(impulse)
  }

  public clear() {
    this.accumulatedPositionSolverVectors = []
    this.accumulatedImpulses = []
  }

  calculateTotalPositionSolverVector() {
    return sumVectors(this.accumulatedPositionSolverVectors)
  }

  calculateTotalImpulse() {
    return sumVectors(this.accumulatedImpulses)
  }

  static calculateRasterCollisionForce(
    raster: RasterObject,
    object: DynamicObject,
  ) {
    //TODO: calculate average collision point from all colliding sensor points

    let triggeredSensorPoints = 0
    let collisionOriginsSumX = 0
    let collisionOriginsSumY = 0

    const pixel = [0, 0, 0] as PixelData
    for (const sensorPoint of object.sensor) {
      raster.getPixel(pixel, sensorPoint[0], sensorPoint[1])
      if (pixel[0] > 0 || pixel[1] > 0 || pixel[2] > 0) {
        triggeredSensorPoints++

        collisionOriginsSumX += sensorPoint[0]
        collisionOriginsSumY += sensorPoint[1]

        if (DebugLayer.ctx) {
          DebugLayer.ctx.fillStyle = "#f22"
          DebugLayer.ctx.beginPath()
          DebugLayer.ctx.arc(
            sensorPoint[0],
            sensorPoint[1],
            1 / Consts.TILE_RESOLUTION,
            0,
            Math.PI * 2,
          )
          DebugLayer.ctx.fill()
        }
      }
    }

    if (triggeredSensorPoints > 0) {
      const collisionOriginX = collisionOriginsSumX / triggeredSensorPoints
      const collisionOriginY = collisionOriginsSumY / triggeredSensorPoints

      const positionSolverVector = vec2.fromValues(
        object.centerX - collisionOriginX,
        object.centerY - collisionOriginY,
      )
      object.solver.addPositionSolverVector(positionSolverVector)

      if (DebugLayer.ctx) {
        DebugLayer.ctx.strokeStyle = "#f44"
        DebugLayer.ctx.lineWidth = 1 / Consts.TILE_RESOLUTION
        DebugLayer.ctx.beginPath()
        DebugLayer.ctx.moveTo(collisionOriginX, collisionOriginY)
        DebugLayer.ctx.lineTo(object.centerX, object.centerY)
        DebugLayer.ctx.stroke()
      }

      const wallRayAngle = Math.atan2(
        positionSolverVector[1],
        positionSolverVector[0],
      )

      const reflectionImpulse = calculateReflectionImpulse(
        object.velocity.x,
        object.velocity.y,
        wallRayAngle,
        object.elasticity,
      )
      object.solver.addImpulse(reflectionImpulse)

      if (DebugLayer.ctx) {
        const rayLen = vec2.length(positionSolverVector)

        DebugLayer.ctx.strokeStyle = "#000"
        DebugLayer.ctx.lineWidth = 1 / Consts.TILE_RESOLUTION
        DebugLayer.ctx.beginPath()
        DebugLayer.ctx.moveTo(
          collisionOriginX - Math.cos(wallRayAngle + Math.PI / 2) * rayLen,
          collisionOriginY - Math.sin(wallRayAngle + Math.PI / 2) * rayLen,
        )
        DebugLayer.ctx.lineTo(
          collisionOriginX + Math.cos(wallRayAngle + Math.PI / 2) * rayLen,
          collisionOriginY + Math.sin(wallRayAngle + Math.PI / 2) * rayLen,
        )
        DebugLayer.ctx.stroke()

        const normalizedReflection = vec2.create()
        vec2.normalize(normalizedReflection, reflectionImpulse)
        DebugLayer.ctx.strokeStyle = "#5f5"
        DebugLayer.ctx.beginPath()
        DebugLayer.ctx.moveTo(object.centerX, object.centerY)
        DebugLayer.ctx.lineTo(
          object.centerX + normalizedReflection[0] * rayLen,
          object.centerY + normalizedReflection[1] * rayLen,
        )
        DebugLayer.ctx.stroke()

        DebugLayer.ctx.fillStyle = "#0ff"
        DebugLayer.ctx.beginPath()
        DebugLayer.ctx.arc(
          collisionOriginX,
          collisionOriginY,
          (1 / Consts.TILE_RESOLUTION) * 2,
          0,
          Math.PI * 2,
        )
        DebugLayer.ctx.fill()
      }

      return true
    }

    return false
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

/** Note: the result is meant to adjusting existing object's trajectory, not to replace it */
function calculateReflectionImpulse(
  velocityX: number,
  velocityY: number,
  wallAngle: number,
  elasticity: number,
) {
  const nX = Math.cos(wallAngle)
  const nY = Math.sin(wallAngle)

  const dot = velocityX * nX + velocityY * nY

  // Compute the reflection
  return [-(1 + elasticity) * dot * nX, -(1 + elasticity) * dot * nY] as [
    number,
    number,
  ]
}

import type { PhysicalObject } from "@/game/physics/physical-object"
import { Object2D } from "@/game/objects/object-2d"
import { DynamicVector2 } from "@/game/physics/dynamic-vector2"
import { EPSILON } from "@/lib/math"
import { CollisionsSolver } from "@/game/physics/collisions/collisions-solver"
import { vec2 } from "gl-matrix"
import { RasterSensor } from "@/game/physics/collisions/raster-sensor"

export class DynamicObject extends Object2D implements PhysicalObject {
  private readonly parameters = {
    velocity: new DynamicVector2(),
    angularVelocity: 0,
    // friction: 0,
    // elasticity: 0,
    // mass: 1,
    // damping ??
  }

  public readonly solver = new CollisionsSolver()
  public readonly sensor = new RasterSensor(RasterSensor.Shape.Circle)

  private updateSensor() {
    this.sensor.applyTransform(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      this.rotation + Math.PI / 2, //TODO: fix incorrect sensor rotation
    )
  }

  get velocity() {
    return this.parameters.velocity
  }

  solveCollisions(deltaTime: number) {
    const factor = Math.min(deltaTime / 1000, 0.1)
    const impulse = this.solver.calculateTotalImpulse(factor)

    if (!impulse) {
      return
    }

    // Prevent from moving in a single iteration by more than defined maximum relative to the object's radius
    const maxJumpLength = (this.width + this.height) / 16 // radius / 4
    const impulseLength = vec2.length(impulse)
    if (impulseLength > maxJumpLength) {
      vec2.scale(impulse, vec2.normalize(impulse, impulse), maxJumpLength)
    }

    this.setPosition(this.x + impulse[0], this.y + impulse[1])
    this.updateSensor()
  }

  /** Should only be called from Physics.update method */
  update(deltaTime: number) {
    //TODO: detect idle objects (velocities below epsilon) to prevent unnecessary updates (resume on collision)

    // if (DebugLayer.ctx) {
    //   DebugLayer.ctx.fillStyle = "#f22"
    //   for (const point of this.sensor) {
    //     DebugLayer.ctx.beginPath()
    //     DebugLayer.ctx.arc(
    //       point[0],
    //       point[1],
    //       (1 / Consts.TILE_RESOLUTION) * 2,
    //       0,
    //       Math.PI * 2,
    //     )
    //     DebugLayer.ctx.fill()
    //   }
    // }

    let moved = false
    let x = this.x
    let y = this.y
    let rotation = this.velocity.angle

    const angularVelocityStep = this.parameters.angularVelocity * deltaTime
    if (Math.abs(angularVelocityStep) > EPSILON) {
      rotation += angularVelocityStep
      moved = true
    }

    const velocityXStep = this.parameters.velocity.x * deltaTime
    const velocityYStep = this.parameters.velocity.y * deltaTime
    if (
      Math.abs(velocityXStep) > EPSILON ||
      Math.abs(velocityYStep) > EPSILON
    ) {
      x += velocityXStep
      y += velocityYStep
      moved = true
    }

    if (moved) {
      this.setTransform(x, y, this.width, this.height, rotation - Math.PI / 2)
      this.updateSensor()
    }
  }
}

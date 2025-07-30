import type { PhysicalObject } from "@/game/physics/physical-object"
import { Object2D } from "@/game/objects/object-2d"
import { DynamicVector2 } from "@/game/physics/dynamic-vector2"
import { EPSILON, isVectorAlmostZero } from "@/lib/math"
import { CollisionsSolver } from "@/game/physics/collisions/collisions-solver"
import { vec2 } from "gl-matrix"
import { RasterSensor } from "@/game/physics/collisions/raster-sensor"

export class DynamicObject extends Object2D implements PhysicalObject {
  private readonly parameters = {
    velocity: new DynamicVector2(),
    angularVelocity: 0,
    // friction: 0,
    /** Elastic collision factor (bounciness), between 0 and 1 */
    elasticity: 1,
    /** Used to calculate collision forces between two dynamic objects */
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

  get angularVelocity() {
    return this.parameters.angularVelocity
  }

  get elasticity() {
    return this.parameters.elasticity
  }

  solveCollisions() {
    if (!this.solver.hasAccumulatedForces) {
      return
    }

    //TODO: more sophisticated collision solving algorithm in which the object will iteratively move back to its previous position (by few pixels in each step) until its sensors will no longer detect collision; in case of persisting collision (object was already colliding in previous frame) this approach will not work
    const positionSolverVector =
      this.solver.calculateTotalPositionSolverVector()
    if (!isVectorAlmostZero(positionSolverVector)) {
      /**
       * Divide total forces by this factor for more accurate collision solving\
       * Should be equal to 1 / iterations
       * */
      const iterationStepFactor = 0.1 //TODO: 1 / collisionSolverIterations
      vec2.scale(
        positionSolverVector,
        positionSolverVector,
        iterationStepFactor,
      )

      this.setPosition(
        this.x + positionSolverVector[0],
        this.y + positionSolverVector[1],
      )
      this.updateSensor()
    }

    const impulseVector = this.solver.calculateTotalImpulse()
    if (!isVectorAlmostZero(impulseVector)) {
      this.velocity.applyImpulse(impulseVector)
      //TODO: calculate and apply impulse to angular velocity
    }

    this.solver.clear()
  }

  /** Should only be called from Physics's update method or from derived classes with `super.update(deltaTime)` */
  update(deltaTime: number) {
    //TODO: detect idle objects (velocities below epsilon) to prevent unnecessary updates (resume on collision)

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

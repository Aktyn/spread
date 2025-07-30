import { RasterObject } from "@/game/physics/raster-object"
import type { PhysicalObject } from "@/game/physics/physical-object"
import { DynamicObject } from "@/game/physics/dynamic-object"
import { CollisionsSolver } from "@/game/physics/collisions/collisions-solver"

export class Physics {
  private readonly rasterObjects: Array<RasterObject> = []
  private readonly dynamicObjects: Array<DynamicObject> = []
  private readonly staticObjects: Array<PhysicalObject> = []

  addObject(...objects: PhysicalObject[]) {
    for (const object of objects) {
      if (object instanceof RasterObject) {
        this.rasterObjects.push(object)
      } else if (object instanceof DynamicObject) {
        this.dynamicObjects.push(object)
      } else {
        //TODO: add dynamic/static objects to different array
        this.staticObjects.push(object)
      }
    }
  }

  removeObject(...objects: PhysicalObject[]) {
    for (const object of objects) {
      if (object instanceof RasterObject) {
        this.rasterObjects.splice(this.rasterObjects.indexOf(object), 1)
      } else if (object instanceof DynamicObject) {
        this.dynamicObjects.splice(this.dynamicObjects.indexOf(object), 1)
      } else {
        this.staticObjects.splice(this.staticObjects.indexOf(object), 1)
      }
    }
  }

  update(deltaTime: number) {
    for (const dynamicObject of this.dynamicObjects) {
      dynamicObject.update(deltaTime)
    }

    //TODO: consider iterative approach until all collisions are solved (restricted to max iterations per frame)
    const collidingObjects = new Set<DynamicObject>()
    for (const rasterObject of this.rasterObjects) {
      CollisionsSolver.calculateRasterCollisionForces(
        rasterObject,
        this.dynamicObjects,
        collidingObjects,
      )
    }

    if (collidingObjects.size) {
      console.info(`Solving ${collidingObjects.size} collisions...`)
    }

    for (const object of collidingObjects.values()) {
      object.solveCollisions()
    }
  }
}

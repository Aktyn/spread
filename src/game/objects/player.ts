import type { Renderer } from "@/graphics/renderer"
import { Sprite } from "@/graphics/sprite"
import type { Texture } from "@/graphics/texture"
import { EPSILON, normalizeAngle } from "@/lib/math"
import { Consts } from "../consts"
import { Steering } from "../steering"
import { DynamicObject } from "@/game/physics/dynamic-object"

export class Player extends DynamicObject {
  public readonly sprite

  private static readonly MAX_SPEED = 10 as const
  private static readonly MIN_SPEED = EPSILON * 1_000
  private static readonly ROTATION_SPEED = Math.PI
  private static readonly ACCELERATION = 20 as const

  /** Constant length of a dynamic object's velocity vector **/
  // private constantSpeed = 0

  private static readonly START_ANGLE = Math.PI / 2

  constructor(
    renderer: Renderer,
    texture: Texture,
    private readonly steering: Steering,
  ) {
    super()
    this.setTransform(0, 0, 1, 1, 0)

    this.velocity.setLength(Player.MIN_SPEED)
    this.velocity.setAngle(Player.START_ANGLE)

    this.sprite = new Sprite(renderer.gl, texture, Consts.Z_INDEX.PLAYER)
  }

  updateControls(deltaTime: number) {
    if (this.steering.isPressed(Steering.Keys.Left, Steering.Keys.A)) {
      this.velocity.setAngle(
        normalizeAngle(this.velocity.angle + deltaTime * Player.ROTATION_SPEED),
      )
    }
    if (this.steering.isPressed(Steering.Keys.Right, Steering.Keys.D)) {
      this.velocity.setAngle(
        normalizeAngle(this.velocity.angle - deltaTime * Player.ROTATION_SPEED),
      )
    }

    if (this.steering.isPressed(Steering.Keys.Up, Steering.Keys.W)) {
      this.applySpeed(
        Math.min(
          this.velocity.length + deltaTime * Player.ACCELERATION,
          Player.MAX_SPEED,
        ),
      )
    }
    if (this.steering.isPressed(Steering.Keys.Down, Steering.Keys.S)) {
      this.applySpeed(
        Math.max(
          this.velocity.length - deltaTime * Player.ACCELERATION,
          Player.MIN_SPEED,
        ),
      )
    }
  }

  private applySpeed(speed: number) {
    this.velocity.setLength(speed)
  }

  update(deltaTime: number) {
    super.update(deltaTime)

    this.sprite.copyTransform(this)
  }
}

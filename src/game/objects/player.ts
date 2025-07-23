import type { Renderer } from "../../graphics/renderer"
import { Sprite } from "../../graphics/sprite"
import type { Texture } from "../../graphics/texture"
import { normalizeAngle } from "../../lib/math"
import { Consts } from "../consts"
import { Steering } from "../steering"

export class Player extends Sprite {
  private static MAX_SPEED = 10
  private static MIN_SPEED = 0 //0.2
  private static ROTATION_SPEED = Math.PI
  private static ACCELERATION = 20
  private speed = 0 //1
  private angle = Math.PI / 2

  constructor(
    renderer: Renderer,
    texture: Texture,
    private readonly steering: Steering,
  ) {
    super(renderer.gl, texture, Consts.Z_INDEX.PLAYER)

    this.setTransform(0, 0, 1, 1, 0)
  }

  update(deltaTime: number) {
    if (this.steering.isPressed(Steering.Keys.Left, Steering.Keys.A)) {
      this.angle = normalizeAngle(
        this.angle + deltaTime * Player.ROTATION_SPEED,
      )
    }
    if (this.steering.isPressed(Steering.Keys.Right, Steering.Keys.D)) {
      this.angle = normalizeAngle(
        this.angle - deltaTime * Player.ROTATION_SPEED,
      )
    }
    if (this.steering.isPressed(Steering.Keys.Up, Steering.Keys.W)) {
      this.speed = Math.min(
        this.speed + deltaTime * Player.ACCELERATION,
        Player.MAX_SPEED,
      )
    }
    if (this.steering.isPressed(Steering.Keys.Down, Steering.Keys.S)) {
      this.speed = Math.max(
        this.speed - deltaTime * Player.ACCELERATION,
        Player.MIN_SPEED,
      )
    }

    this.setRotation(this.angle - Math.PI / 2)
    this.setPosition(
      this.x + this.speed * Math.cos(this.angle) * deltaTime,
      this.y + this.speed * Math.sin(this.angle) * deltaTime,
    )
  }
}

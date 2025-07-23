enum Key {
  Left = "ArrowLeft",
  Right = "ArrowRight",
  Up = "ArrowUp",
  Down = "ArrowDown",
  A = "a",
  D = "d",
  W = "w",
  S = "s",
}

export class Steering {
  public static Keys = Key

  private states = new Map<Key, boolean>(
    Object.values(Key).map((key) => [key, false]),
  )

  private keyUpListener = this.onKeyUp.bind(this)
  private keyDownListener = this.onKeyDown.bind(this)

  constructor() {
    document.addEventListener("keyup", this.keyUpListener)
    document.addEventListener("keydown", this.keyDownListener)
  }

  dispose() {
    document.removeEventListener("keyup", this.keyUpListener)
    document.removeEventListener("keydown", this.keyDownListener)
  }

  private toggleKey(key: Key, state: boolean) {
    if (this.states.has(key)) {
      this.states.set(key, state)
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    this.toggleKey(event.key as Key, false)
  }

  private onKeyDown(event: KeyboardEvent) {
    this.toggleKey(event.key as Key, true)
  }

  isPressed(...keys: Key[]) {
    return keys.some((key) => this.states.get(key))
  }
}

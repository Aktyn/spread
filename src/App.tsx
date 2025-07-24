import { useRef, useEffect } from "react"
import { assert } from "./lib/utils"
import { Stats, type StatsInterface, type StatsItem } from "./components/stats"
import { Renderer } from "./graphics/renderer"
import { Game } from "./game/game"

const statsItems = [
  {
    name: "frame",
    label: "Frame",
    format: (value) => `${value.toFixed(2)}ms`,
  },
  {
    name: "player-x",
    label: "Player X",
    format: (value) => value.toFixed(2),
  },
  {
    name: "player-y",
    label: "Player Y",
    format: (value) => value.toFixed(2),
  },
  {
    name: "chunks-count",
    label: "Total chunks",
    format: (value) => Math.round(value),
  },
] as const satisfies Array<StatsItem>

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<StatsInterface>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const canvas = container.querySelector("canvas")
    assert(!!canvas, "Canvas element is not initialized")

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        canvas.style.width = `${entry.contentRect.width}px`
        canvas.style.height = `${entry.contentRect.height}px`

        const width = entry.contentRect.width * window.devicePixelRatio
        const height = entry.contentRect.height * window.devicePixelRatio

        game.camera.setResolution(width, height)
        renderer.setSize(width, height)
      }
    })
    observer.observe(container)

    let animationFrameId: number

    const step = (time: number) => {
      const start = performance.now()

      game.update(time)
      renderer.draw()

      statsRef.current?.update("frame", performance.now() - start)
      statsRef.current?.update("player-x", game.player.x)
      statsRef.current?.update("player-y", game.player.y)
      statsRef.current?.update("chunks-count", game.totalChunksCount)

      animationFrameId = requestAnimationFrame(step)
    }

    const renderer = new Renderer(canvas)
    const game = new Game(renderer)
    step(0)

    return () => {
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      game.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-dvw h-dvh flex items-center justify-center relative overflow-hidden"
    >
      <canvas></canvas>
      <Stats ref={statsRef} items={statsItems} />
    </div>
  )
}

export default App

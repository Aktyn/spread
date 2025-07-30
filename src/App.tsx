import { useRef, useEffect, useState } from "react"
import { assert } from "./lib/utils"
import { Stats, type StatsInterface, type StatsItem } from "./components/stats"
import { Renderer } from "./graphics/renderer"
import { Game } from "./game/game"
import { Check, Loader2, X } from "lucide-react"
import { DebugLayer } from "@/debug-layer"
import { Button } from "@/components/common/button"

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
    name: "player-speed",
    label: "Player speed",
    format: (value) => value.toFixed(2),
  },
  {
    name: "chunks-queue",
    label: "Loading chunks",
    format: (value) => Math.round(value),
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

  const [showChunksLoading, setShowChunksLoading] = useState(false)
  const [showDebugLayer, setShowDebugLayer] = useState(
    localStorage.getItem("debug-layer") === "true",
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const canvas =
      container.querySelector<HTMLCanvasElement>("canvas:first-child")
    assert(!!canvas, "Canvas element is not initialized")

    const debugLayerCanvas = document.getElementById(
      "debug-layer",
    ) as HTMLCanvasElement

    if (showDebugLayer) {
      DebugLayer.enable(debugLayerCanvas)
      localStorage.setItem("debug-layer", "true")
    } else {
      DebugLayer.disable()
      localStorage.setItem("debug-layer", "false")
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        canvas.style.width = `${entry.contentRect.width}px`
        canvas.style.height = `${entry.contentRect.height}px`

        const width = entry.contentRect.width * window.devicePixelRatio
        const height = entry.contentRect.height * window.devicePixelRatio

        if (showDebugLayer && debugLayerCanvas) {
          debugLayerCanvas.style.width = canvas.style.width
          debugLayerCanvas.style.height = canvas.style.height
          debugLayerCanvas.width = width
          debugLayerCanvas.height = height
        }

        game.camera.setResolution(width, height)
        renderer.setSize(width, height)
      }
    })
    observer.observe(container)

    let animationFrameId: number

    const step = (time: number) => {
      const start = performance.now()

      setShowChunksLoading(game.waitingForChunks)

      if (debugLayerCanvas) {
        DebugLayer.clear(game.camera.getVector())
      }

      game.update(time)
      renderer.draw()

      statsRef.current?.update("frame", performance.now() - start)
      statsRef.current?.update("player-x", game.player.x)
      statsRef.current?.update("player-y", game.player.y)
      statsRef.current?.update("player-speed", game.player.velocity.length)
      statsRef.current?.update("chunks-queue", game.chunksInQueue)
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
  }, [showDebugLayer])

  return (
    <div
      ref={containerRef}
      className="w-dvw h-dvh flex items-center justify-center relative overflow-hidden *:absolute"
    >
      <canvas></canvas>
      {showDebugLayer && (
        <canvas id="debug-layer" className="pointer-events-none"></canvas>
      )}
      {showChunksLoading && (
        <div className="absolute inset-0 backdrop-blur-sm bg-background/20 flex flex-col gap-2 items-center justify-center font-bold text-xl pointer-events-none">
          <Loader2 className="animate-spin size-16" />
          <span>Generating chunks...</span>
        </div>
      )}
      <Stats ref={statsRef} items={statsItems}>
        {process.env.NODE_ENV === "development" && (
          <div className="flex items-center justify-center col-span-2 p-1">
            <Button onClick={() => setShowDebugLayer((show) => !show)}>
              {showDebugLayer ? <Check /> : <X />}
              Toggle debug layer
            </Button>
          </div>
        )}
      </Stats>
    </div>
  )
}

export default App

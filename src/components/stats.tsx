import {
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"

export interface StatsInterface {
  update: (name: string, value: number) => void
}

export type StatsItem = {
  name: string
  label: ReactNode
  format?: (value: number) => ReactNode
}

type StatsProps = {
  ref: RefObject<StatsInterface | null>
  items: Array<StatsItem>
  updateInterval?: number
}

export function Stats({ ref, items, updateInterval = 1000 }: StatsProps) {
  const buffers = useRef(new Map<string, number[]>())

  const [results, setResults] = useState<
    Array<{ item: StatsItem; average: number | null }>
  >([])

  useEffect(() => {
    const interval = setInterval(() => {
      const iterationResults: typeof results = []
      for (const item of items) {
        const buffer = buffers.current.get(item.name) ?? []
        const average =
          buffer.length > 0
            ? buffer.reduce((acc, v) => acc + v, 0) / buffer.length
            : null
        buffers.current.set(item.name, [])
        iterationResults.push({ item, average })
      }
      setResults(iterationResults)
    }, updateInterval)

    return () => {
      clearInterval(interval)
    }
  }, [items, updateInterval])

  useImperativeHandle(
    ref,
    () => ({
      update: (name: string, value: number) => {
        const buffer = buffers.current.get(name) ?? []
        buffer.push(value)
        buffers.current.set(name, buffer)
      },
    }),
    [],
  )

  if (results.length === 0) {
    return null
  }

  return (
    <div className="absolute top-1 right-1 text-sm p-1 border border-border/50 rounded-md bg-background-darker grid grid-cols-[auto_auto] gap-1 items-center *:odd:justify-self-end">
      {results.map(({ item, average }) => (
        <Fragment key={item.name}>
          <label className="text-muted-foreground">{item.label}:</label>
          <b>
            {average !== null
              ? item.format
                ? item.format(average)
                : average
              : "N/A"}
          </b>
        </Fragment>
      ))}
    </div>
  )
}

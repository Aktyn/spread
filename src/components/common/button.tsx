import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const Button = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "flex flex-row items-center gap-2 p-2 cursor-pointer bg-background/20 border rounded-md hover:text-primary hover:border-primary transition-colors *:[svg]:size-5",
        props.className,
      )}
    />
  )
}

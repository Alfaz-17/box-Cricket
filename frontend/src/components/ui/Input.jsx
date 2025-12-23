import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border-2 border-input bg-muted/30 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-0 focus:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/20",
      className
    )}
    ref={ref}
    {...props} />
))
Input.displayName = "Input"

export { Input }

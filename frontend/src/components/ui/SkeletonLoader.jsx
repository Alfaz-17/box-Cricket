import React from 'react'
import { cn } from '../../lib/utils'

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/20", className)}
      {...props}
    />
  )
}

const BoxCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden h-full">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="h-9 w-1/4 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl mt-4" />
      </div>
    </div>
  )
}

const SlotPickerSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, BoxCardSkeleton, SlotPickerSkeleton }

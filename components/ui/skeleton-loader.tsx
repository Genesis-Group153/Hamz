import { Loader2, Sparkles } from 'lucide-react'

export const SkeletonLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
      {/* Animated circles */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground animate-pulse">
          Loading amazing events...
        </p>
        <p className="text-sm text-muted-foreground">
          Please wait just a moment
        </p>
      </div>
    </div>
  )
}

// Skeleton for event cards
export const EventCardSkeleton = () => {
  return (
    <div className="group rounded-xl overflow-hidden shadow-lg border border-border bg-card hover:shadow-xl transition-all duration-300">
      {/* Image skeleton with shimmer effect */}
      <div className="w-full h-56 bg-gradient-to-br from-muted via-muted/80 to-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        {/* Image placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground/20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Badge */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-14 bg-muted rounded-full animate-pulse" />
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="h-6 bg-muted rounded-md w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
        
        {/* Details */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded-md w-32 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded-md w-40 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded-md w-28 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
        
        {/* Price and button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="h-7 bg-muted rounded-md w-28 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="h-9 bg-muted rounded-lg w-32 animate-pulse" style={{ animationDelay: '0.7s' }} />
        </div>
      </div>
    </div>
  )
}

// Grid of skeleton cards
export const EventsGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Compact loading for inline use
export const CompactLoader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        <Loader2 className="absolute inset-0 h-8 w-8 text-primary animate-spin" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{text}</span>
    </div>
  )
}


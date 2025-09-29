import { forwardRef } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      <input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-md border border-border-primary bg-background-tertiary pl-10 pr-3 py-1 text-sm text-text-primary placeholder:text-text-tertiary transition-colors',
          'focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
})
SearchBar.displayName = 'SearchBar'

export { SearchBar }

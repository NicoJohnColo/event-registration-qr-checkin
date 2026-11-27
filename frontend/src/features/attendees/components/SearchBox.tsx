import { Search } from 'lucide-react'
import { Input } from '../../../components/ui/Input'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  totalVisible: number
  isFetching?: boolean
}

export function SearchBox({ value, onChange, totalVisible, isFetching = false }: SearchBoxProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1 sm:max-w-sm">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClear={() => onChange('')}
          placeholder="Search name or code…"
          aria-label="Search attendees"
          className="!bg-white border-border/80 sm:!bg-[#F3F5F9] sm:border-transparent"
          leftIcon={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        />
      </div>

      <span className="shrink-0 rounded-full border border-border/80 bg-white px-2 py-0.5 text-[10.5px] font-bold text-brand-navy/75 sm:border-0 sm:bg-transparent sm:px-0 sm:text-xs sm:font-semibold sm:text-brand-navy/65">
        {isFetching
          ? 'Updating…'
          : `${totalVisible} ${totalVisible === 1 ? 'attendee' : 'attendees'}`}
      </span>
    </div>
  )
}

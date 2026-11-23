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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:max-w-md">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClear={() => onChange('')}
          placeholder="Search by attendee name or ticket code..."
          aria-label="Search attendees"
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      <p className="text-xs font-semibold text-brand-navy/65">
        {isFetching ? 'Updating...' : `Showing ${totalVisible} ${totalVisible === 1 ? 'attendee' : 'attendees'}`}
      </p>
    </div>
  )
}

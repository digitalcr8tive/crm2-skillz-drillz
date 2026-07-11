import type { Slot } from '../lib/data'
import { formatDate, formatTime } from '../lib/data'

type Props = {
  slots: Slot[]
  selectedId: string
  onSelect: (slot: Slot) => void
}

export function SlotPicker({ slots, selectedId, onSelect }: Props) {
  if (!slots.length) return <p className="empty-state">No open training times are available right now. Please call 980-208-7327.</p>
  return (
    <div className="slot-grid" role="radiogroup" aria-label="Available training dates">
      {slots.map((slot) => (
        <button
          className={`slot ${selectedId === slot.id ? 'slot--selected' : ''}`}
          type="button"
          role="radio"
          aria-checked={selectedId === slot.id}
          key={slot.id}
          onClick={() => onSelect(slot)}
        >
          <strong>{formatDate(slot.startsAt)}</strong>
          <span>{formatTime(slot.startsAt)}</span>
          <small>{slot.spotsLeft} {slot.spotsLeft === 1 ? 'spot' : 'spots'} open</small>
        </button>
      ))}
    </div>
  )
}

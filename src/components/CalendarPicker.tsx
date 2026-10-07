import { useMemo, useState } from 'react'
import { formatTime, type Slot } from '../lib/data'
import { isTrainingDate, trainingDateKey } from '../lib/trainingSchedule'

type Props = {
  slots: Slot[]
  selectedId: string
  onSelect: (slot: Slot) => void
}

const dateKey = (value: string | Date) => {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const fullDateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export function CalendarPicker({ slots, selectedId, onSelect }: Props) {
  const firstSlot = new Date(`${trainingDateKey(slots[0]?.startsAt ?? new Date())}T12:00:00`)
  const [month, setMonth] = useState(() => new Date(firstSlot.getFullYear(), firstSlot.getMonth(), 1))
  const selectedSlot = slots.find((slot) => slot.id === selectedId)
  const [selectedDate, setSelectedDate] = useState(() => selectedSlot ? trainingDateKey(selectedSlot.startsAt) : '')

  const slotsByDate = useMemo(() => slots.reduce<Record<string, Slot[]>>((grouped, slot) => {
    const key = trainingDateKey(slot.startsAt)
    grouped[key] = [...(grouped[key] ?? []), slot]
    return grouped
  }, {}), [slots])

  const days = useMemo(() => {
    const firstWeekday = month.getDay()
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return [...Array(firstWeekday).fill(null), ...Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))]
  }, [month])

  const chooseDate = (date: Date, daySlots: Slot[]) => {
    const key = dateKey(date)
    setSelectedDate(key)
    if (daySlots.length === 1) onSelect(daySlots[0])
  }

  const changeMonth = (offset: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  const selectedDaySlots = slotsByDate[selectedDate] ?? []

  return (
    <div className="booking-calendar">
      <div className="calendar-toolbar">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">←</button>
        <strong>{monthLabel.format(month)}</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">→</button>
      </div>
      <p>Monday–Thursday · 3–7 p.m. Central · One-hour sessions</p>
      <div className="calendar-legend"><span><i className="calendar-key calendar-key--open" /> Open</span><span><i className="calendar-key calendar-key--closed" /> No training</span></div>
      <div className="calendar-weekdays" aria-hidden="true">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid" role="grid" aria-label="Training availability calendar">
        {days.map((date, index) => {
          if (!date) return <span className="calendar-day calendar-day--blank" key={`blank-${index}`} />
          const key = dateKey(date)
          const daySlots = slotsByDate[key] ?? []
          const closed = !isTrainingDate(key)
          const inPast = key < trainingDateKey(new Date())
          const available = !closed && !inPast && daySlots.length > 0
          const classes = ['calendar-day', closed ? 'calendar-day--closed' : '', available ? 'calendar-day--available' : '', selectedDate === key ? 'calendar-day--selected' : ''].filter(Boolean).join(' ')

          return (
            <button
              className={classes}
              type="button"
              key={key}
              disabled={!available}
              onClick={() => chooseDate(date, daySlots)}
              aria-label={closed ? `${fullDateLabel.format(date)}, no training` : available ? `${fullDateLabel.format(date)}, ${daySlots.length} time${daySlots.length === 1 ? '' : 's'} available` : `${fullDateLabel.format(date)}, unavailable`}
            >
              <strong>{date.getDate()}</strong>
              {closed ? <small>Closed</small> : available ? <small>{daySlots.length} time{daySlots.length === 1 ? '' : 's'}</small> : null}
            </button>
          )
        })}
      </div>
      {selectedDate && (
        <div className="calendar-time-options">
          <p><strong>{fullDateLabel.format(new Date(`${selectedDate}T12:00:00`))}</strong> — choose a time</p>
          <div className="calendar-time-list" role="radiogroup" aria-label="Available training times">
            {selectedDaySlots.map((slot) => (
              <button className={`calendar-time${slot.id === selectedId ? ' calendar-time--selected' : ''}`} type="button" key={slot.id} onClick={() => onSelect(slot)} aria-pressed={slot.id === selectedId}>
                <strong>{formatTime(slot.startsAt)}</strong>
                <span>{slot.spotsLeft} spot{slot.spotsLeft === 1 ? '' : 's'} open</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

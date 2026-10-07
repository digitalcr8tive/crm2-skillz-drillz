export const trainingDateKey = (value: string | Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value))
  const part = (name: string) => parts.find((item) => item.type === name)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

// Calendar cells are civil dates; slot timestamps are instants in Central time.
export const isTrainingDate = (key: string) => {
  const day = new Date(`${key}T12:00:00Z`).getUTCDay()
  return day >= 1 && day <= 4
}

export const isTrainingDay = (value: string | Date) => isTrainingDate(trainingDateKey(value))

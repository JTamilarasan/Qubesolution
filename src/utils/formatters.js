export function formatDate(value) {
  if (!value) return '—'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function formatMonth(value) {
  if (!value) return '—'
  const text = String(value).trim()
  const namedMonth = text.match(/^([A-Za-z]{3,9})[- /](\d{2}|\d{4})$/)
  if (namedMonth) {
    const year = namedMonth[2].slice(-2)
    return `${namedMonth[1].slice(0, 3).replace(/^./, (letter) => letter.toUpperCase())}-${year}`
  }
  const parsed = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(parsed.getTime())) return text
  const adjusted = new Date(parsed.getTime() + (12 * 60 * 60 * 1000))
  return `${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(adjusted)}-${String(adjusted.getFullYear()).slice(-2)}`
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'there'
}

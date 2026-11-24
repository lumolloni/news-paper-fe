export function timeAgo(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units: [number, string][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
  ]
  if (seconds < 60) return 'just now'
  for (let i = 1; i < units.length; i++) {
    if (seconds < units[i][0]) {
      const value = Math.floor(seconds / units[i - 1][0])
      return `${value} ${units[i - 1][1]}${value > 1 ? 's' : ''} ago`
    }
  }
  const years = Math.floor(seconds / 31557600)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

export function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

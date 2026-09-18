/** Shared Recharts styling so every chart reads as part of one system. */
export const chartGrid = {
  stroke: 'rgb(var(--ers-line))',
  strokeDasharray: '3 3',
  vertical: false
} as const;

export const chartAxis = {
  stroke: 'rgb(var(--ers-muted))',
  fontSize: 12,
  tickLine: false,
  axisLine: false
} as const;

export const chartTooltip = {
  contentStyle: {
    backgroundColor: 'rgb(var(--ers-surface))',
    border: '1px solid rgb(var(--ers-line))',
    borderRadius: 10,
    fontSize: 12,
    color: 'rgb(var(--ers-ink))',
    boxShadow: '0 8px 24px -8px rgb(15 23 42 / 0.18)'
  },
  labelStyle: { color: 'rgb(var(--ers-muted))', fontWeight: 600, marginBottom: 2 },
  cursor: { fill: 'rgb(var(--ers-line) / 0.4)' }
} as const;

export const seriesColors = [
'rgb(var(--ers-primary))',
'rgb(var(--ers-info))',
'rgb(var(--ers-warning))',
'rgb(var(--ers-success))',
'rgb(var(--ers-violet))',
'rgb(var(--ers-muted))'];
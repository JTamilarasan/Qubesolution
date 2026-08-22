import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import { Avatar, Box, Card, CardContent, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'
import { useCollection } from '../../hooks/useCollection'
import { firstName } from '../../utils/formatters'

function SummaryCard({ label, value, helper, icon: Icon }) {
  return <Card variant="outlined"><CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}><Stack direction="row" justifyContent="space-between"><Box><Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography><Typography sx={{ mt: .75, fontSize: 28, fontWeight: 700 }}>{value}</Typography><Typography variant="caption" color="text.secondary">{helper}</Typography></Box><Avatar variant="rounded" sx={{ bgcolor: 'primary.50', color: 'primary.dark', width: 40, height: 40 }}><Icon fontSize="small" /></Avatar></Stack></CardContent></Card>
}

function ForecastBars({ records }) {
  const recent = [...records].sort((a, b) => a.year - b.year || a.month - b.month).slice(-6)
  const max = Math.max(1, ...recent.flatMap((item) => [Number(item.hours ?? item.forecastHours ?? 0), Number(item.actualHours || 0)]))
  return <Box sx={{ minHeight: 210, mt: 2.5, display: 'flex', alignItems: 'flex-end', gap: { xs: 1, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>{recent.map((item) => { const fc = Number(item.hours ?? item.forecastHours ?? 0), ac = Number(item.actualHours || 0); return <Stack key={`${item.year}-${item.month}`} alignItems="center" justifyContent="flex-end" sx={{ flex: 1, height: 190 }}><Stack direction="row" alignItems="flex-end" spacing={.5} sx={{ flex: 1, width: '100%', justifyContent: 'center' }}><Box title={`Forecast ${fc}`} sx={{ width: '32%', maxWidth: 24, height: `${Math.max(3, (fc / max) * 150)}px`, bgcolor: 'secondary.main', borderRadius: '4px 4px 0 0' }} /><Box title={`Actual ${ac}`} sx={{ width: '32%', maxWidth: 24, height: `${Math.max(3, (ac / max) * 150)}px`, bgcolor: 'primary.main', borderRadius: '4px 4px 0 0' }} /></Stack><Typography variant="caption" color="text.secondary">{String(item.monthName || item.month).slice(0, 3)}</Typography></Stack> })}</Box>
}

function ProjectAllocation({ employees }) {
  const counts = Object.values(employees.reduce((result, item) => { const key = item.projectId || 'unassigned'; result[key] ||= { name: item.projectName || 'Unassigned', count: 0 }; result[key].count += 1; return result }, {})).sort((a, b) => b.count - a.count).slice(0, 5)
  const max = Math.max(1, ...counts.map((item) => item.count))
  return <Stack spacing={2} sx={{ mt: 3 }}>{counts.map((item) => <Box key={item.name}><Stack direction="row" justifyContent="space-between"><Typography fontSize={13} fontWeight={600}>{item.name}</Typography><Typography variant="caption" color="text.secondary">{item.count} employees</Typography></Stack><Box sx={{ height: 7, bgcolor: 'divider', borderRadius: 5, mt: .75, overflow: 'hidden' }}><Box sx={{ width: `${(item.count / max) * 100}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 5 }} /></Box></Box>)}</Stack>
}

function DashboardPage() {
  const { user } = useAuth()
  const projects = useCollection('projects')
  const subProjects = useCollection('subProjects')
  const employees = useCollection('employees')
  const forecasts = useCollection('forecastMasters')
  const active = employees.data.filter((item) => String(item.status).toLowerCase() === 'active')
  const billable = active.filter((item) => ['yes', 'true', 'billable'].includes(String(item.budgeted).toLowerCase()))
  const rollingOff = active.filter((item) => { const date = new Date(item.rollOffDate); const days = (date - new Date()) / 86400000; return days >= 0 && days <= 30 })
  const current = new Date()
  const forecast = forecasts.data.find((item) => Number(item.year) === current.getFullYear() && Number(item.month) === current.getMonth() + 1)
  const loading = projects.loading || subProjects.loading || employees.loading || forecasts.loading

  const cards = [
    ['Projects', projects.data.length, 'Active projects', AccountTreeRoundedIcon],
    ['Sub Projects', subProjects.data.length, 'Mapped workstreams', GroupsRoundedIcon],
    ['Forecast Hours', Number(forecast?.hours || forecast?.forecastHours || 0).toLocaleString(), 'Current month · FC', InsightsRoundedIcon],
    ['Actual Hours', Number(forecast?.actualHours || 0).toLocaleString(), 'Current month · AC', AccessTimeRoundedIcon],
    ['Variance', Number((forecast?.actualHours || 0) - (forecast?.hours || forecast?.forecastHours || 0)).toLocaleString(), 'Actual minus forecast', InsightsRoundedIcon],
  ]

  return <Stack spacing={3}>
    <Box sx={{ borderLeft: '4px solid', borderColor: 'primary.main', pl: 2 }}><Typography component="h1" sx={{ fontSize: { xs: 27, md: 31 }, fontWeight: 700 }}>Good morning, {firstName(user?.displayName || user?.email?.split('@')[0])}</Typography><Typography color="text.secondary" sx={{ mt: .5, fontSize: 14 }}>Here’s your workforce overview for this month.</Typography></Box>
    {loading ? <Box sx={{ minHeight: 220, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', xl: '1.25fr repeat(3,minmax(0,1fr))' }, gap: 2 }}>
      <Card sx={{ bgcolor: 'secondary.main', color: 'common.white', gridColumn: { sm: 'span 2', xl: 'auto' }, gridRow: { xl: 'span 2' }, minHeight: 220 }}><CardContent sx={{ p: 3 }}><Stack direction="row" justifyContent="space-between"><Box><Typography sx={{ color: 'rgba(255,255,255,.72)', fontWeight: 600 }}>Active Workforce</Typography><Typography sx={{ mt: 1, fontSize: 42, fontWeight: 700 }}>{active.length}</Typography><Typography sx={{ color: 'rgba(255,255,255,.55)', fontSize: 13 }}>Total active employees</Typography></Box><Avatar sx={{ bgcolor: 'rgba(245,158,11,.13)', color: 'primary.light' }}><PeopleAltRoundedIcon /></Avatar></Stack><Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,.1)' }} /><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 1 }}>{[['Billable', billable.length], ['Non-Billable', active.length - billable.length], ['Rolling Off Soon', rollingOff.length]].map(([label, value]) => <Box key={label}><Typography color="primary.light" fontSize={20} fontWeight={700}>{value}</Typography><Typography sx={{ color: 'rgba(255,255,255,.56)', fontSize: 11.5 }}>{label}</Typography></Box>)}</Box></CardContent></Card>
      {cards.map(([label, value, helper, icon]) => <SummaryCard key={label} label={label} value={value} helper={helper} icon={icon} />)}
    </Box>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.55fr 1fr' }, gap: 2 }}>
      <Card variant="outlined"><CardContent sx={{ p: 3 }}><Typography fontSize={17} fontWeight={650}>Forecast vs Actual Hours</Typography><Typography variant="body2" color="text.secondary">Monthly utilization comparison</Typography><Stack direction="row" spacing={2.5} sx={{ mt: 2.5 }}><Typography variant="caption"><Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: 'secondary.main', borderRadius: '50%', mr: .75 }} />Forecast</Typography><Typography variant="caption"><Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%', mr: .75 }} />Actual</Typography></Stack>{forecasts.data.length ? <ForecastBars records={forecasts.data} /> : <Stack minHeight={210} alignItems="center" justifyContent="center" textAlign="center"><InsightsRoundedIcon sx={{ color: 'text.secondary', opacity: .45 }} /><Typography fontWeight={600} sx={{ mt: 1 }}>No forecast data available yet</Typography><Typography variant="body2" color="text.secondary">Monthly comparisons appear after forecast records are created.</Typography></Stack>}</CardContent></Card>
      <Card variant="outlined"><CardContent sx={{ p: 3 }}><Typography fontSize={17} fontWeight={650}>Project Allocation</Typography>{employees.data.length ? <ProjectAllocation employees={employees.data} /> : <Stack minHeight={255} alignItems="center" justifyContent="center" textAlign="center"><AccountTreeRoundedIcon sx={{ color: 'primary.main' }} /><Typography fontWeight={600} sx={{ mt: 1 }}>No project allocation data</Typography><Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>Project allocation will appear after employees are mapped to active projects.</Typography></Stack>}</CardContent></Card>
    </Box>
  </Stack>
}

export default DashboardPage

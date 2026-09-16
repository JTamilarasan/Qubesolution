import { useMemo, useState } from 'react'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { Alert, Box, Button, Card, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import * as XLSX from 'xlsx'
import PageHeader from '../../components/common/PageHeader'
import { useCollection } from '../../hooks/useCollection'

const groups = ['Revenue', 'Direct Cost', 'Indirect Cost']
const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
const types = ['Forecast', 'Actual']
const clean = (value) => String(value ?? '').trim()
const key = (group, ledger) => `${group}::${ledger}`
const emptyValues = () => Array(8).fill(0)
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

const recordDate = (record) => {
  const iso = clean(record.monthDate)
  if (/^\d{4}-\d{2}/.test(iso)) return new Date(`${iso.slice(0, 7)}-01T12:00:00`)
  const text = clean(record.month)
  const match = text.match(/^([A-Za-z]{3,9})[- /](\d{2}|\d{4})$/)
  if (!match) return null
  const month = new Date(`${match[1]} 1, 2000`).getMonth()
  const year = Number(match[2]) < 100 ? 2000 + Number(match[2]) : Number(match[2])
  return month < 0 ? null : new Date(year, month, 1)
}

const total = (rows) => rows.reduce((values, row) => values.map((value, index) => value + row.values[index]), emptyValues())
const subtract = (left, right) => left.map((value, index) => value - right[index])
const display = (value) => number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })

const ValueCells = ({ values, percent = false }) => values.map((value, index) => <TableCell key={index} align="right" sx={{ fontWeight: percent ? 700 : 'inherit' }}>{percent ? `${value.toFixed(2)}%` : display(value)}</TableCell>)
const SummaryRow = ({ label, values, percent = false }) => <TableRow sx={{ bgcolor: 'primary.50', '& td': { fontWeight: 750 } }}><TableCell>{label}</TableCell><ValueCells values={values} percent={percent} /></TableRow>

function ProfitAndLossReportPage() {
  const projects = useCollection('projects')
  const ledgers = useCollection('ledgers')
  const forecastEntries = useCollection('forecastEntries')
  const actualWorkHours = useCollection('actualWorkHours')
  const otherEntries = useCollection('otherEntries')
  const [year, setYear] = useState('')
  const [projectId, setProjectId] = useState('')

  const records = useMemo(() => [
    ...forecastEntries.data.map((item) => ({ ...item, reportType: 'Forecast', reportAmount: item.forecastAmount ?? item.amount })),
    ...actualWorkHours.data.map((item) => ({ ...item, reportType: 'Actual', reportAmount: item.actualHoursAmount ?? item.amount })),
    ...otherEntries.data.map((item) => ({ ...item, reportType: item.type, reportAmount: item.amount })),
  ], [forecastEntries.data, actualWorkHours.data, otherEntries.data])

  const years = useMemo(() => [...new Set(records.map(recordDate).filter(Boolean).map((date) => date.getFullYear()))].sort((a, b) => b - a), [records])
  const selectedProject = projects.data.find((project) => clean(project.projectId) === projectId)
  const ledgerDetails = useMemo(() => new Map(ledgers.data.map((ledger) => [clean(ledger.name).toLowerCase(), ledger])), [ledgers.data])

  const report = useMemo(() => {
    if (!year || !projectId) return null
    const rows = new Map()
    ledgers.data.filter((ledger) => groups.includes(ledger.groupName)).forEach((ledger) => rows.set(key(ledger.groupName, ledger.name), { group: ledger.groupName, ledger: ledger.name, values: emptyValues() }))
    records.forEach((record) => {
      const date = recordDate(record)
      if (!date || String(date.getFullYear()) !== String(year) || clean(record.projectId) !== projectId || !types.includes(record.reportType)) return
      const ledger = ledgerDetails.get(clean(record.ledgerName).toLowerCase())
      const group = clean(record.groupName || ledger?.groupName)
      const ledgerName = clean(record.ledgerName || ledger?.name)
      if (!groups.includes(group) || !ledgerName) return
      const rowKey = key(group, ledgerName)
      if (!rows.has(rowKey)) rows.set(rowKey, { group, ledger: ledgerName, values: emptyValues() })
      const quarter = Math.floor(date.getMonth() / 3)
      const typeOffset = record.reportType === 'Forecast' ? 0 : 1
      rows.get(rowKey).values[(quarter * 2) + typeOffset] += number(record.reportAmount)
    })
    const grouped = Object.fromEntries(groups.map((group) => [group, [...rows.values()].filter((row) => row.group === group && row.values.some((value) => value !== 0)).sort((a, b) => a.ledger.localeCompare(b.ledger))]))
    const revenue = total(grouped.Revenue), direct = total(grouped['Direct Cost']), indirect = total(grouped['Indirect Cost'])
    const gross = subtract(revenue, direct), net = subtract(gross, indirect)
    const pm = net.map((value, index) => revenue[index] ? (value / revenue[index]) * 100 : 0)
    return { grouped, revenue, direct, indirect, gross, net, pm }
  }, [year, projectId, records, ledgers.data, ledgerDetails])

  const download = () => {
    if (!report) return
    const heading = [year, selectedProject?.projectName || projectId, '', '', '', '', '', '', '']
    const quarterRow = ['', ...quarters.flatMap((quarter) => [quarter, ''])]
    const typeRow = ['', ...quarters.flatMap(() => types)]
    const body = []
    const addSection = (label, rows, totalLabel, totals) => {
      body.push([label, '', '', '', '', '', '', '', ''])
      rows.forEach((row) => body.push([row.ledger, ...row.values]))
      body.push([totalLabel, ...totals])
    }
    addSection('Revenue', report.grouped.Revenue, 'Total Revenue', report.revenue)
    addSection('Less Direct Cost', report.grouped['Direct Cost'], 'Total Direct Cost', report.direct)
    body.push(['Gross Margin', ...report.gross])
    addSection('Less Indirect Cost', report.grouped['Indirect Cost'], 'Total Indirect Cost', report.indirect)
    body.push(['Net Margin', ...report.net], ['PM%', ...report.pm.map((value) => `${value.toFixed(2)}%`)])
    const worksheet = XLSX.utils.aoa_to_sheet([heading, quarterRow, typeRow, ...body])
    worksheet['!merges'] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 8 } }, ...quarters.map((_, index) => ({ s: { r: 1, c: 1 + (index * 2) }, e: { r: 1, c: 2 + (index * 2) } }))]
    worksheet['!cols'] = [{ wch: 28 }, ...Array(8).fill({ wch: 14 })]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'P&L Report')
    XLSX.writeFile(workbook, `P&L-${projectId}-${year}.xlsx`)
  }

  const loading = projects.loading || ledgers.loading || forecastEntries.loading || actualWorkHours.loading || otherEntries.loading
  const errors = projects.error || ledgers.error || forecastEntries.error || actualWorkHours.error || otherEntries.error

  return <Stack spacing={3}>
    <PageHeader section="Reports / P&L Report" title="P&L Report" description="Compare quarterly forecast and actual profit and loss by project." />
    <Card variant="outlined"><Box sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
      <TextField select label="Year" value={year} onChange={(event) => setYear(event.target.value)} sx={{ minWidth: 160 }}>{years.map((item) => <MenuItem key={item} value={String(item)}>{item}</MenuItem>)}</TextField>
      <TextField select label="Project" value={projectId} onChange={(event) => setProjectId(event.target.value)} sx={{ minWidth: 280 }}>{projects.data.map((project) => <MenuItem key={project.id} value={clean(project.projectId)}>{project.projectId} — {project.projectName}</MenuItem>)}</TextField>
      <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={download} disabled={!report}>Download Excel</Button>
    </Box></Card>
    {errors && <Alert severity="error">{errors}</Alert>}
    {!loading && (!year || !projectId) && <Alert severity="info">Select a Year and Project to generate the P&L report.</Alert>}
    {report && <Card variant="outlined"><TableContainer><Table sx={{ minWidth: 1200 }}>
      <TableHead>
        <TableRow><TableCell rowSpan={3} sx={{ fontWeight: 800, minWidth: 240 }}>{year}</TableCell><TableCell colSpan={8} align="center" sx={{ fontSize: 18, fontWeight: 800 }}>{selectedProject?.projectName || projectId}</TableCell></TableRow>
        <TableRow>{quarters.map((quarter) => <TableCell key={quarter} colSpan={2} align="center" sx={{ fontWeight: 800 }}>{quarter}</TableCell>)}</TableRow>
        <TableRow>{quarters.flatMap((quarter) => types.map((type) => <TableCell key={`${quarter}-${type}`} align="center" sx={{ fontWeight: 700 }}>{type}</TableCell>))}</TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell colSpan={9} sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Revenue</TableCell></TableRow>
        {report.grouped.Revenue.map((row) => <TableRow key={key(row.group, row.ledger)}><TableCell>{row.ledger}</TableCell><ValueCells values={row.values} /></TableRow>)}
        <SummaryRow label="Total Revenue" values={report.revenue} />
        <TableRow><TableCell colSpan={9} sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Less Direct Cost</TableCell></TableRow>
        {report.grouped['Direct Cost'].map((row) => <TableRow key={key(row.group, row.ledger)}><TableCell>{row.ledger}</TableCell><ValueCells values={row.values} /></TableRow>)}
        <SummaryRow label="Total Direct Cost" values={report.direct} />
        <SummaryRow label="Gross Margin" values={report.gross} />
        <TableRow><TableCell colSpan={9} sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Less Indirect Cost</TableCell></TableRow>
        {report.grouped['Indirect Cost'].map((row) => <TableRow key={key(row.group, row.ledger)}><TableCell>{row.ledger}</TableCell><ValueCells values={row.values} /></TableRow>)}
        <SummaryRow label="Total Indirect Cost" values={report.indirect} />
        <SummaryRow label="Net Margin" values={report.net} />
        <SummaryRow label="PM%" values={report.pm} percent />
      </TableBody>
    </Table></TableContainer></Card>}
  </Stack>
}

export default ProfitAndLossReportPage

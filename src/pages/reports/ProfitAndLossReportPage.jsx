import { useMemo, useState } from 'react'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { Alert, Box, Button, Card, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import * as XLSX from 'xlsx'
import PageHeader from '../../components/common/PageHeader'
import { useCollection } from '../../hooks/useCollection'
import { formatDate, formatMonth } from '../../utils/formatters'

const groups = ['Revenue', 'Direct Cost', 'Indirect Cost']
const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
const quarterMonths = ['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec']
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
const mergeDetails = (rows) => Array.from({ length: 8 }, (_, index) => rows.flatMap((row) => row.details[index]))

const ValueCells = ({ values, details, percent = false, onValueClick }) => values.map((value, index) => <TableCell key={index} align="right" sx={{ fontWeight: percent ? 700 : 'inherit' }}>{details?.[index]?.length ? <Button variant="text" size="small" onClick={() => onValueClick(details[index], `${details[index][0].groupName || 'Ledger'} - ${details[index][0].ledgerName || ''}`)} sx={{ minWidth: 0, p: 0, fontWeight: 'inherit', color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>{percent ? `${value.toFixed(2)}%` : display(value)}</Button> : (percent ? `${value.toFixed(2)}%` : display(value))}</TableCell>)
const SummaryRow = ({ label, values, details, percent = false, onValueClick }) => <TableRow sx={{ bgcolor: 'primary.50', '& td': { fontWeight: 750 } }}><TableCell>{label}</TableCell><ValueCells values={values} details={details} percent={percent} onValueClick={onValueClick} /></TableRow>

function ProfitAndLossReportPage() {
  const projects = useCollection('projects')
  const subProjects = useCollection('subProjects')
  const ledgers = useCollection('ledgers')
  const forecastEntries = useCollection('forecastEntries')
  const actualWorkHours = useCollection('actualWorkHours')
  const otherEntries = useCollection('otherEntries')
  const revenueEntries = useCollection('revenueEntries')
  const [year, setYear] = useState('')
  const [projectId, setProjectId] = useState('')
  const [subProjectId, setSubProjectId] = useState('')
  const [detailRows, setDetailRows] = useState([])
  const [detailTitle, setDetailTitle] = useState('')

  const records = useMemo(() => [
    ...forecastEntries.data.map((item) => ({ ...item, reportType: 'Forecast', reportAmount: item.forecastAmount ?? item.amount })),
    ...actualWorkHours.data.map((item) => ({ ...item, reportType: 'Actual', reportAmount: item.actualHoursAmount ?? item.amount })),
    ...otherEntries.data.map((item) => ({ ...item, reportType: item.type, reportAmount: item.amount })),
    ...revenueEntries.data.map((item) => ({ ...item, reportType: item.type, reportAmount: item.amount })),
  ], [forecastEntries.data, actualWorkHours.data, otherEntries.data, revenueEntries.data])

  const years = useMemo(() => [...new Set(records.map(recordDate).filter(Boolean).map((date) => date.getFullYear()))].sort((a, b) => b - a), [records])
  const selectedYear = year || String(years[0] || '')
  const selectedProject = projects.data.find((project) => clean(project.projectId) === projectId)
  const ledgerDetails = useMemo(() => new Map(ledgers.data.map((ledger) => [clean(ledger.name).toLowerCase(), ledger])), [ledgers.data])

  const report = useMemo(() => {
    if (!selectedYear || !projectId) return null
    const rows = new Map()
    ledgers.data.filter((ledger) => groups.includes(ledger.groupName)).forEach((ledger) => rows.set(key(ledger.groupName, ledger.name), { group: ledger.groupName, ledger: ledger.name, values: emptyValues(), details: Array.from({ length: 8 }, () => []) }))
    records.forEach((record) => {
      const date = recordDate(record)
      if (!date || String(date.getFullYear()) !== selectedYear || clean(record.projectId) !== projectId || (subProjectId && clean(record.subProjectId) !== subProjectId) || !types.includes(record.reportType)) return
      const ledger = ledgerDetails.get(clean(record.ledgerName).toLowerCase())
      const group = clean(record.groupName || ledger?.groupName)
      const ledgerName = clean(record.ledgerName || ledger?.name)
      if (!groups.includes(group) || !ledgerName) return
      const rowKey = key(group, ledgerName)
      if (!rows.has(rowKey)) rows.set(rowKey, { group, ledger: ledgerName, values: emptyValues(), details: Array.from({ length: 8 }, () => []) })
      const quarter = Math.floor(date.getMonth() / 3)
      const typeOffset = record.reportType === 'Forecast' ? 0 : 1
      const valueIndex = (quarter * 2) + typeOffset
      rows.get(rowKey).values[valueIndex] += number(record.reportAmount)
      rows.get(rowKey).details[valueIndex].push(record)
    })
    const grouped = Object.fromEntries(groups.map((group) => [group, [...rows.values()].filter((row) => row.group === group && row.values.some((value) => value !== 0)).sort((a, b) => a.ledger.localeCompare(b.ledger))]))
    const revenue = total(grouped.Revenue), direct = total(grouped['Direct Cost']), indirect = total(grouped['Indirect Cost'])
    const gross = subtract(revenue, direct), net = subtract(gross, indirect)
    const pm = net.map((value, index) => revenue[index] ? (value / revenue[index]) * 100 : 0)
    return { grouped, revenue, direct, indirect, gross, net, pm, revenueDetails: mergeDetails(grouped.Revenue), directDetails: mergeDetails(grouped['Direct Cost']), indirectDetails: mergeDetails(grouped['Indirect Cost']) }
  }, [selectedYear, projectId, subProjectId, records, ledgers.data, ledgerDetails])

  const download = () => {
    if (!report) return
    const heading = [selectedYear, selectedProject?.projectName || projectId, '', '', '', '', '', '', '']
    const quarterRow = ['', ...quarters.flatMap((quarter, index) => [`${quarter} (${quarterMonths[index]})`, ''])]
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
    XLSX.writeFile(workbook, `P&L-${projectId}${subProjectId ? `-${subProjectId}` : ''}-${selectedYear}.xlsx`)
  }

  const loading = projects.loading || subProjects.loading || ledgers.loading || forecastEntries.loading || actualWorkHours.loading || otherEntries.loading || revenueEntries.loading
  const errors = projects.error || subProjects.error || ledgers.error || forecastEntries.error || actualWorkHours.error || otherEntries.error || revenueEntries.error
  const openDetails = (rows, title) => { setDetailRows(rows); setDetailTitle(title); }

  return <Stack spacing={3}>
    <PageHeader section="Reports / P&L Report" title="P&L Report" description="Compare quarterly forecast and actual profit and loss by project." />
    <Card variant="outlined"><Box sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
      <TextField select label="Year" value={selectedYear} onChange={(event) => setYear(event.target.value)} sx={{ minWidth: 160 }}>{years.map((item) => <MenuItem key={item} value={String(item)}>{item}</MenuItem>)}</TextField>
      <TextField select label="Project" value={projectId} onChange={(event) => { setProjectId(event.target.value); setSubProjectId('') }} sx={{ minWidth: 280 }}>{projects.data.map((project) => <MenuItem key={project.id} value={clean(project.projectId)}>{project.projectId} — {project.projectName}</MenuItem>)}</TextField>
      <TextField select label="Sub Project" value={subProjectId} onChange={(event) => setSubProjectId(event.target.value)} disabled={!projectId} sx={{ minWidth: 280 }}><MenuItem value="">All Sub Projects</MenuItem>{subProjects.data.filter((item) => clean(item.projectId) === projectId).map((item) => <MenuItem key={item.id} value={clean(item.subProjectId)}>{item.subProjectId} — {item.subProjectName}</MenuItem>)}</TextField>
      <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={download} disabled={!report}>Download Excel</Button>
    </Box></Card>
    {errors && <Alert severity="error">{errors}</Alert>}
    {!loading && (!selectedYear || !projectId) && <Alert severity="info">Select a Year and Project to generate the P&L report.</Alert>}
    {report && <Card variant="outlined"><TableContainer><Table sx={{ minWidth: 1200 }}>
      <TableHead>
        <TableRow><TableCell rowSpan={3} sx={{ fontWeight: 800, minWidth: 240 }}>{selectedYear}</TableCell><TableCell colSpan={8} align="center" sx={{ fontSize: 18, fontWeight: 800 }}>{selectedProject?.projectName || projectId}</TableCell></TableRow>
        <TableRow>{quarters.map((quarter, index) => <TableCell key={quarter} colSpan={2} align="center" sx={{ fontWeight: 800 }}>{quarter} ({quarterMonths[index]})</TableCell>)}</TableRow>
        <TableRow>{quarters.flatMap((quarter) => types.map((type) => <TableCell key={`${quarter}-${type}`} align="center" sx={{ fontWeight: 700 }}>{type}</TableCell>))}</TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell colSpan={9} sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Revenue</TableCell></TableRow>
        {report.grouped.Revenue.map((row) => <TableRow key={key(row.group, row.ledger)}><TableCell>{row.ledger}</TableCell><ValueCells values={row.values} details={row.details} onValueClick={openDetails} /></TableRow>)}
        <SummaryRow label="Total Revenue" values={report.revenue} details={report.revenueDetails} onValueClick={openDetails} />
        <TableRow><TableCell colSpan={9} sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Less Direct Cost</TableCell></TableRow>
        {report.grouped['Direct Cost'].map((row) => <TableRow key={key(row.group, row.ledger)}><TableCell>{row.ledger}</TableCell><ValueCells values={row.values} details={row.details} onValueClick={openDetails} /></TableRow>)}
        <SummaryRow label="Total Direct Cost" values={report.direct} details={report.directDetails} onValueClick={openDetails} />
        <SummaryRow label="Gross Margin" values={report.gross} details={report.revenueDetails.map((items, index) => [...items, ...report.directDetails[index]])} onValueClick={openDetails} />
        <TableRow><TableCell colSpan={9} sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Less Indirect Cost</TableCell></TableRow>
        {report.grouped['Indirect Cost'].map((row) => <TableRow key={key(row.group, row.ledger)}><TableCell>{row.ledger}</TableCell><ValueCells values={row.values} details={row.details} onValueClick={openDetails} /></TableRow>)}
        <SummaryRow label="Total Indirect Cost" values={report.indirect} details={report.indirectDetails} onValueClick={openDetails} />
        <SummaryRow label="Net Margin" values={report.net} details={report.revenueDetails.map((items, index) => [...items, ...report.directDetails[index], ...report.indirectDetails[index]])} onValueClick={openDetails} />
        <SummaryRow label="PM%" values={report.pm} details={report.revenueDetails} percent onValueClick={openDetails} />
      </TableBody>
    </Table></TableContainer></Card>}
    <Dialog open={Boolean(detailRows.length)} onClose={() => setDetailRows([])} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{detailTitle || 'Transaction Details'}<IconButton aria-label="Close details" onClick={() => setDetailRows([])} sx={{ position: 'absolute', right: 12, top: 10 }}>×</IconButton></DialogTitle>
      <DialogContent dividers><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{detailRows.length} record(s) contribute to this amount.</Typography><TableContainer><Table size="small"><TableHead><TableRow>{['Voucher No','Voucher Date','Type','Ledger','Employee','Project','Month','Amount'].map((label) => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{detailRows.map((record) => <TableRow key={`${record.id}-${record.reportType}`}><TableCell>{record.voucherNo || '-'}</TableCell><TableCell>{formatDate(record.voucherDate) || '-'}</TableCell><TableCell>{record.reportType || '-'}</TableCell><TableCell>{record.ledgerName || '-'}</TableCell><TableCell>{record.employeeName || record.employeeId || '-'}</TableCell><TableCell>{record.projectName || record.projectId || '-'}</TableCell><TableCell>{formatMonth(record.monthDate || record.month) || '-'}</TableCell><TableCell>{display(record.reportAmount)}</TableCell></TableRow>)}</TableBody></Table></TableContainer></DialogContent>
    </Dialog>
  </Stack>
}

export default ProfitAndLossReportPage

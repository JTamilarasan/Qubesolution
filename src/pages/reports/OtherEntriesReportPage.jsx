import { useMemo, useState } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Alert, Box, Button, Card, IconButton, MenuItem, Snackbar, Stack, TableCell, TableRow, TextField } from '@mui/material'
import FormDrawer from '../../components/common/FormDrawer'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import ContentState from '../../components/common/ContentState'
import { useCollection } from '../../hooks/useCollection'
import { updateRecord } from '../../services/firestoreService'
import { formatDate, formatMonth } from '../../utils/formatters'

const blank = { voucherNo: '', voucherDate: '', type: '', ledgerName: '', employeeId: '', employeeName: '', projectName: '', projectId: '', subProjectId: '', monthDate: '', amount: '', sheetName: '' }
const clean = (value) => String(value ?? '').trim()

function OtherEntriesReportPage() {
  const records = useCollection('otherEntries')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [type, setType] = useState('All')
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', type: 'All' })
  const [editing, setEditing] = useState(null), [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const filtered = useMemo(() => records.data
    .filter((item) => (!appliedFilters.from || item.voucherDate >= appliedFilters.from) && (!appliedFilters.to || item.voucherDate <= appliedFilters.to) && (appliedFilters.type === 'All' || item.type === appliedFilters.type))
    .sort((a, b) => String(b.voucherDate).localeCompare(String(a.voucherDate))), [records.data, appliedFilters])

  const startEdit = (item) => { setEditing(item); setForm({ ...blank, ...item, monthDate: clean(item.monthDate || item.month).slice(0, 7) }); setError('') }
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const save = async (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.voucherNo || !form.voucherDate || !form.type || !form.ledgerName || !form.employeeId || !form.employeeName || !form.projectName || !form.projectId || !form.subProjectId || !form.monthDate || !form.sheetName) return setError('All fields are required.')
    if (form.amount === '' || !Number.isFinite(amount) || amount < 0) return setError('Amount must be a valid number greater than or equal to 0.')
    setSaving(true)
    try {
      await updateRecord('otherEntries', editing.id, { voucherNo: clean(form.voucherNo), voucherDate: form.voucherDate, type: form.type, ledgerName: clean(form.ledgerName), employeeId: clean(form.employeeId), employeeName: clean(form.employeeName), projectName: clean(form.projectName), projectId: clean(form.projectId), subProjectId: clean(form.subProjectId), month: formatMonth(`${form.monthDate}-01`), monthDate: `${form.monthDate}-01`, amount, sheetName: clean(form.sheetName) })
      setEditing(null); setNotice('Other entry updated.')
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  return <Stack spacing={3}>
    <PageHeader section="Reports / Other Entries" title="Other Entries Report" description="View imported forecast and actual amounts by voucher date." />
    <Card variant="outlined">
      <Box component="form" onSubmit={(event) => { event.preventDefault(); setAppliedFilters({ from: fromDate, to: toDate, type }) }} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField type="date" label="From Date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField type="date" label="To Date" value={toDate} onChange={(event) => setToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: fromDate } }} />
        <TextField select label="Type" value={type} onChange={(event) => setType(event.target.value)}><MenuItem value="All">All</MenuItem><MenuItem value="Forecast">Forecast</MenuItem><MenuItem value="Actual">Actual</MenuItem></TextField>
        <Button type="submit" variant="contained">Submit</Button>
        <Button type="button" variant="outlined" onClick={() => { setFromDate(''); setToDate(''); setType('All'); setAppliedFilters({ from: '', to: '', type: 'All' }) }}>Reset</Button>
      </Box>
      {records.loading || records.error || !filtered.length ? <ContentState loading={records.loading} error={records.error} title="No uploaded entries found" description="Change the filters or import Other Entries records." /> : <PaginatedTable minWidth={1550} columns={['Voucher No','Voucher Date','Type','Ledger','Emp ID','Employee Name','Project Name','Project ID','Sub Project ID','Month','Amount','Sheet'].map((label) => ({ label })).concat({ label: 'Actions', align: 'right' })} rows={filtered} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.voucherNo}</TableCell><TableCell>{formatDate(item.voucherDate)}</TableCell><TableCell>{item.type}</TableCell><TableCell>{item.ledgerName}</TableCell><TableCell>{item.employeeId}</TableCell><TableCell>{item.employeeName}</TableCell><TableCell>{item.projectName}</TableCell><TableCell>{item.projectId}</TableCell><TableCell>{item.subProjectId}</TableCell><TableCell>{formatMonth(item.month)}</TableCell><TableCell>{item.amount}</TableCell><TableCell>{item.sheetName}</TableCell><TableCell align="right"><IconButton aria-label="Edit record" onClick={() => startEdit(item)}><EditOutlinedIcon /></IconButton></TableCell></TableRow>} />}
    </Card>
    <FormDrawer open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Other Entry" subtitle="Change the imported record values and save." onSubmit={save} saving={saving} submitLabel="Save Changes" width={760}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}>
        <TextField required label="Voucher No" value={form.voucherNo} onChange={(e) => change('voucherNo', e.target.value)} /><TextField required type="date" label="Voucher Date" value={form.voucherDate} onChange={(e) => change('voucherDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Type" value={form.type} slotProps={{ input: { readOnly: true } }} /><TextField required label="Ledger" value={form.ledgerName} onChange={(e) => change('ledgerName', e.target.value)} />
        <TextField required label="Emp ID" value={form.employeeId} onChange={(e) => change('employeeId', e.target.value)} /><TextField required label="Employee Name" value={form.employeeName} onChange={(e) => change('employeeName', e.target.value)} />
        <TextField required label="Project Name" value={form.projectName} onChange={(e) => change('projectName', e.target.value)} /><TextField required label="Project ID" value={form.projectId} onChange={(e) => change('projectId', e.target.value)} />
        <TextField required label="Sub Project ID" value={form.subProjectId} onChange={(e) => change('subProjectId', e.target.value)} /><TextField required type="month" label="Month" value={form.monthDate} onChange={(e) => change('monthDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField required type="number" label="Amount" value={form.amount} onChange={(e) => change('amount', e.target.value)} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} /><TextField required label="Sheet" value={form.sheetName} onChange={(e) => change('sheetName', e.target.value)} />
      </Box>
    </FormDrawer>
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info">{notice}</Alert></Snackbar>
  </Stack>
}

export default OtherEntriesReportPage

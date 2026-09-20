import { useMemo, useState } from 'react'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Alert, Box, Button, Card, IconButton, MenuItem, Snackbar, Stack, TableCell, TableRow, TextField } from '@mui/material'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ContentState from '../../components/common/ContentState'
import FormDrawer from '../../components/common/FormDrawer'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import { useCollection } from '../../hooks/useCollection'
import { deleteRecord, updateRecord } from '../../services/firestoreService'
import { formatDate, formatMonth } from '../../utils/formatters'
import { exportExcel } from '../../utils/exportExcel'

function RevenueEntriesReportPage() {
  const records = useCollection('revenueEntries')
  const ledgers = useCollection('ledgers')
  const subProjects = useCollection('subProjects')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [type, setType] = useState('All')
  const [filters, setFilters] = useState({ from: '', to: '', type: 'All' })
  const [deleting, setDeleting] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const filtered = useMemo(() => records.data.filter((item) => (!filters.from || item.voucherDate >= filters.from) && (!filters.to || item.voucherDate <= filters.to) && (filters.type === 'All' || item.type === filters.type)).sort((a, b) => String(b.voucherDate).localeCompare(String(a.voucherDate))), [records.data, filters])
  const download = () => exportExcel('Revenue-Entries-Report', 'Revenue Entries', ['Voucher No', 'Voucher Date', 'Type', 'Ledger', 'Sub Project Name', 'Subproject No', 'Project Name', 'Month', 'Amount', 'Sheet'], filtered.map((item) => [item.voucherNo, formatDate(item.voucherDate), item.type, item.ledgerName, item.subProjectName, item.subProjectId, item.projectName, formatMonth(item.monthDate || item.month), item.amount, item.sheetName]))
  const remove = async () => { setBusy(true); try { await deleteRecord('revenueEntries', deleting.id); setDeleting(null); setNotice('Revenue entry deleted.') } catch (error) { setNotice(error.message) } finally { setBusy(false) } }
  const startEdit = (item) => { setEditing(item); setForm({ ...item, monthDate: String(item.monthDate || '').slice(0, 7) }); setError('') }
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const save = async (event) => {
    event.preventDefault()
    const ledger = ledgers.data.find((item) => item.id === form.ledgerDocumentId)
    const subProject = subProjects.data.find((item) => item.subProjectId === form.subProjectId)
    const amount = Number(form.amount)
    if (!form.voucherNo?.trim() || !form.voucherDate || !form.type || !ledger || ledger.groupName !== 'Revenue' || !subProject || !form.monthDate || !form.sheetName?.trim()) return setError('Complete all required fields.')
    if (form.amount === '' || !Number.isFinite(amount) || amount < 0) return setError('Amount must be 0 or greater.')
    setBusy(true)
    try {
      await updateRecord('revenueEntries', editing.id, { voucherNo: form.voucherNo.trim(), voucherDate: form.voucherDate, type: form.type, ledgerDocumentId: ledger.id, ledgerName: ledger.name, ledgerCategoryName: ledger.categoryName, groupName: 'Revenue', subProjectId: subProject.subProjectId, subProjectName: subProject.subProjectName, projectId: subProject.projectId, projectName: subProject.projectName, monthDate: `${form.monthDate}-01`, month: formatMonth(`${form.monthDate}-01`), amount, sheetName: form.sheetName.trim() })
      setEditing(null); setNotice('Revenue entry updated.')
    } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
  }

  return <Stack spacing={3}>
    <PageHeader section="Reports / Revenue Entries" title="Revenue Entries Report" description="View imported forecast and actual revenue by voucher date." />
    <Card variant="outlined">
      <Box component="form" onSubmit={(event) => { event.preventDefault(); setFilters({ from: fromDate, to: toDate, type }) }} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField type="date" label="From Date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField type="date" label="To Date" value={toDate} onChange={(event) => setToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: fromDate } }} />
        <TextField select label="Type" value={type} onChange={(event) => setType(event.target.value)}><MenuItem value="All">All</MenuItem><MenuItem value="Forecast">Forecast</MenuItem><MenuItem value="Actual">Actual</MenuItem></TextField>
        <Button type="submit" variant="contained">Submit</Button>
        <Button type="button" variant="outlined" onClick={() => { setFromDate(''); setToDate(''); setType('All'); setFilters({ from: '', to: '', type: 'All' }) }}>Reset</Button>
        <Button type="button" variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={download} disabled={!filtered.length}>Download Excel</Button>
      </Box>
      {records.loading || records.error || !filtered.length ? <ContentState loading={records.loading} error={records.error} title="No revenue entries found" description="Change the filters or import Revenue Entries." /> : <PaginatedTable minWidth={1350} columns={['Voucher No', 'Voucher Date', 'Type', 'Ledger', 'Sub Project Name', 'Subproject No', 'Project Name', 'Month', 'Amount', 'Sheet'].map((label) => ({ label })).concat({ label: 'Actions', align: 'right' })} rows={filtered} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.voucherNo}</TableCell><TableCell>{formatDate(item.voucherDate)}</TableCell><TableCell>{item.type}</TableCell><TableCell>{item.ledgerName}</TableCell><TableCell>{item.subProjectName}</TableCell><TableCell>{item.subProjectId}</TableCell><TableCell>{item.projectName}</TableCell><TableCell>{formatMonth(item.monthDate || item.month)}</TableCell><TableCell>{item.amount}</TableCell><TableCell>{item.sheetName}</TableCell><TableCell align="right"><IconButton aria-label="Edit record" onClick={() => startEdit(item)}><EditOutlinedIcon /></IconButton><IconButton color="error" aria-label="Delete record" onClick={() => setDeleting(item)}><DeleteOutlineRoundedIcon /></IconButton></TableCell></TableRow>} />}
    </Card>
    <FormDrawer open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Revenue Entry" subtitle="Update this record and its P&L amount." onSubmit={save} saving={busy} submitLabel="Save Changes" width={760}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}>
        <TextField required label="Voucher No" value={form.voucherNo || ''} onChange={(event) => change('voucherNo', event.target.value)} />
        <TextField required type="date" label="Voucher Date" value={form.voucherDate || ''} onChange={(event) => change('voucherDate', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField select required label="Type" value={form.type || ''} onChange={(event) => change('type', event.target.value)}><MenuItem value="Forecast">Forecast</MenuItem><MenuItem value="Actual">Actual</MenuItem></TextField>
        <TextField select required label="Ledger Name" value={form.ledgerDocumentId || ''} onChange={(event) => change('ledgerDocumentId', event.target.value)}>{ledgers.data.filter((item) => item.groupName === 'Revenue').map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField>
        <TextField select required label="Sub Project" value={form.subProjectId || ''} onChange={(event) => change('subProjectId', event.target.value)}>{subProjects.data.map((item) => <MenuItem key={item.id} value={item.subProjectId}>{item.subProjectId} — {item.subProjectName}</MenuItem>)}</TextField>
        <TextField required type="month" label="Month" value={form.monthDate || ''} onChange={(event) => change('monthDate', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField required type="number" label="Amount" value={form.amount ?? ''} onChange={(event) => change('amount', event.target.value)} slotProps={{ htmlInput: { min: 0, step: 'any' } }} />
        <TextField required label="Sheet Name" value={form.sheetName || ''} onChange={(event) => change('sheetName', event.target.value)} />
      </Box>
    </FormDrawer>
    <ConfirmDialog open={Boolean(deleting)} title="Delete Revenue Entry?" description="Are you sure you want to delete this revenue entry?" onCancel={() => setDeleting(null)} onConfirm={remove} busy={busy} />
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info">{notice}</Alert></Snackbar>
  </Stack>
}

export default RevenueEntriesReportPage

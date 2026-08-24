import { useMemo, useState } from 'react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Alert, Box, Button, Card, IconButton, Snackbar, Stack, TableCell, TableRow, TextField } from '@mui/material'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ContentState from '../../components/common/ContentState'
import FormDrawer from '../../components/common/FormDrawer'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import { useCollection } from '../../hooks/useCollection'
import { deleteRecord, updateRecord } from '../../services/firestoreService'
import { formatDate, formatMonth } from '../../utils/formatters'

const blank = { voucherNo: '', voucherDate: '', ledgerName: '', employeeId: '', employeeName: '', projectName: '', projectId: '', subProjectId: '', monthDate: '', actualHours: '', perHourCost: '', sheetName: '' }
const clean = (value) => String(value ?? '').trim()
const costForMonth = (employee, monthDate) => employee?.perHourCostDetails
  ?.filter((item) => clean(item.date).slice(0, 7) <= clean(monthDate).slice(0, 7))
  .sort((a, b) => clean(b.date).localeCompare(clean(a.date)))[0]?.perHourCost ?? ''

function ActualWorkHoursReportPage() {
  const records = useCollection('actualWorkHours'), employees = useCollection('employees')
  const [fromDate, setFromDate] = useState(''), [toDate, setToDate] = useState('')
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '' })
  const [editing, setEditing] = useState(null), [form, setForm] = useState(blank), [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const filtered = useMemo(() => records.data.filter((item) => (!appliedRange.from || item.voucherDate >= appliedRange.from) && (!appliedRange.to || item.voucherDate <= appliedRange.to)).sort((a, b) => String(b.voucherDate).localeCompare(String(a.voucherDate))), [records.data, appliedRange])

  const startEdit = (item) => {
    const monthDate = clean(item.monthDate || item.month).slice(0, 7)
    const employee = employees.data.find((entry) => clean(entry.employeeId).toLowerCase() === clean(item.employeeId).toLowerCase())
    setEditing(item); setForm({ ...blank, ...item, monthDate, perHourCost: item.perHourCost ?? costForMonth(employee, monthDate) }); setError('')
  }
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const save = async (event) => {
    event.preventDefault()
    const actualHours = Number(form.actualHours), perHourCost = Number(form.perHourCost), actualHoursAmount = actualHours * perHourCost
    if (!form.voucherNo || !form.voucherDate || !form.ledgerName || !form.employeeId || !form.employeeName || !form.projectName || !form.projectId || !form.subProjectId || !form.monthDate || !form.sheetName) return setError('All fields are required.')
    if (form.actualHours === '' || form.perHourCost === '' || !Number.isFinite(actualHours) || actualHours < 0 || !Number.isFinite(perHourCost) || perHourCost < 0) return setError('Actual HRS and Per Hour Cost must be valid numbers greater than or equal to 0.')
    setSaving(true)
    try {
      await updateRecord('actualWorkHours', editing.id, { voucherNo: clean(form.voucherNo), voucherDate: form.voucherDate, ledgerName: clean(form.ledgerName), employeeId: clean(form.employeeId), employeeName: clean(form.employeeName), projectName: clean(form.projectName), projectId: clean(form.projectId), subProjectId: clean(form.subProjectId), month: formatMonth(`${form.monthDate}-01`), monthDate: `${form.monthDate}-01`, actualHours, perHourCost, actualHoursAmount, sheetName: clean(form.sheetName) })
      setEditing(null); setNotice('Actual work hours record updated.')
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  const remove = async () => { setSaving(true); try { await deleteRecord('actualWorkHours', deleting.id); setDeleting(null); setNotice('Actual work hours record deleted.') } catch (requestError) { setNotice(requestError.message) } finally { setSaving(false) } }

  return <Stack spacing={3}><PageHeader section="Reports / Actual Work Hours" title="Actual Work Hours Report" description="View and manage imported actual-hour entries by voucher date." />
    <Card variant="outlined"><Box component="form" onSubmit={(event) => { event.preventDefault(); setAppliedRange({ from: fromDate, to: toDate }) }} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}><TextField type="date" label="From Date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: { xs: '100%', sm: 220 } }} /><TextField type="date" label="To Date" value={toDate} onChange={(event) => setToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: fromDate } }} sx={{ width: { xs: '100%', sm: 220 } }} /><Button type="submit" variant="contained">Submit</Button><Button type="button" variant="outlined" onClick={() => { setFromDate(''); setToDate(''); setAppliedRange({ from: '', to: '' }) }}>Reset</Button></Box>
      {records.loading || records.error || !filtered.length ? <ContentState loading={records.loading} error={records.error} title="No uploaded entries found" description="Change the date range or import Actual Work Hours records." /> : <PaginatedTable minWidth={1650} columns={['Voucher No','Voucher Date','Ledger','Emp ID','Employee Name','Project Name','Project ID','Sub Project ID','Month','Actual HRS','Amount','Sheet'].map((label) => ({ label })).concat({ label: 'Actions', align: 'right' })} rows={filtered} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.voucherNo}</TableCell><TableCell>{formatDate(item.voucherDate)}</TableCell><TableCell>{item.ledgerName}</TableCell><TableCell>{item.employeeId}</TableCell><TableCell>{item.employeeName}</TableCell><TableCell>{item.projectName}</TableCell><TableCell>{item.projectId}</TableCell><TableCell>{item.subProjectId}</TableCell><TableCell>{formatMonth(item.month)}</TableCell><TableCell>{item.actualHours}</TableCell><TableCell>{item.actualHoursAmount ?? '-'}</TableCell><TableCell>{item.sheetName}</TableCell><TableCell align="right"><IconButton aria-label="Edit record" onClick={() => startEdit(item)}><EditOutlinedIcon /></IconButton><IconButton color="error" aria-label="Delete record" onClick={() => setDeleting(item)}><DeleteOutlineRoundedIcon /></IconButton></TableCell></TableRow>} />}
    </Card>
    <FormDrawer open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Actual Work Hours" subtitle="Change the imported record values and save." onSubmit={save} saving={saving} submitLabel="Save Changes" width={760}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}>
        <TextField required label="Voucher No" value={form.voucherNo} onChange={(e) => change('voucherNo', e.target.value)} /><TextField required type="date" label="Voucher Date" value={form.voucherDate} onChange={(e) => change('voucherDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField required label="Ledger" value={form.ledgerName} onChange={(e) => change('ledgerName', e.target.value)} /><TextField required label="Emp ID" value={form.employeeId} onChange={(e) => change('employeeId', e.target.value)} />
        <TextField required label="Employee Name" value={form.employeeName} onChange={(e) => change('employeeName', e.target.value)} /><TextField required label="Project Name" value={form.projectName} onChange={(e) => change('projectName', e.target.value)} />
        <TextField required label="Project ID" value={form.projectId} onChange={(e) => change('projectId', e.target.value)} /><TextField required label="Sub Project ID" value={form.subProjectId} onChange={(e) => change('subProjectId', e.target.value)} />
        <TextField required type="month" label="Month" value={form.monthDate} onChange={(e) => change('monthDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField required type="number" label="Actual HRS" value={form.actualHours} onChange={(e) => change('actualHours', e.target.value)} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} />
        <TextField required type="number" label="Per Hour Cost" value={form.perHourCost} onChange={(e) => change('perHourCost', e.target.value)} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} /><TextField disabled label="Amount" value={form.actualHours !== '' && form.perHourCost !== '' && Number.isFinite(Number(form.actualHours)) && Number.isFinite(Number(form.perHourCost)) ? Number(form.actualHours) * Number(form.perHourCost) : ''} />
        <TextField required label="Sheet" value={form.sheetName} onChange={(e) => change('sheetName', e.target.value)} />
      </Box>
    </FormDrawer>
    <ConfirmDialog open={Boolean(deleting)} title="Delete Actual Work Hours Record?" description="Are you sure you want to permanently delete this record?" onCancel={() => setDeleting(null)} onConfirm={remove} busy={saving} />
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info">{notice}</Alert></Snackbar>
  </Stack>
}
export default ActualWorkHoursReportPage

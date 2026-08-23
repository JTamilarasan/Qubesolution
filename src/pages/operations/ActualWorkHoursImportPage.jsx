import { useMemo, useRef, useState } from 'react'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import { Alert, Box, Button, Card, CardContent, Chip, LinearProgress, MenuItem, Stack, Step, StepLabel, Stepper, TableCell, TableRow, TextField, Typography } from '@mui/material'
import * as XLSX from 'xlsx'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import { useCollection } from '../../hooks/useCollection'
import { createRecords } from '../../services/firestoreService'
import { formatMonth } from '../../utils/formatters'

const clean = (value) => String(value ?? '').trim()
const fromColumn = (row, names) => { const key = Object.keys(row).find((column) => names.some((name) => column.trim().toLowerCase() === name.toLowerCase())); return key ? row[key] : '' }
const monthValue = (value) => {
  if (typeof value === 'number') { const parsed = XLSX.SSF.parse_date_code(value); if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-01` }
  const text = clean(value), short = text.match(/^([A-Za-z]{3,9})[- /](\d{2}|\d{4})$/)
  if (short) { const month = new Date(`${short[1]} 1, 2000`).getMonth(); const year = Number(short[2]) < 100 ? 2000 + Number(short[2]) : Number(short[2]); if (month >= 0) return `${year}-${String(month + 1).padStart(2, '0')}-01` }
  const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; const adjusted = new Date(date.getTime() + (12 * 60 * 60 * 1000)); return `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, '0')}-01`
}

const costForMonth = (employee, monthDate) => {
  const monthKey = clean(monthDate).slice(0, 7)
  const detail = employee?.perHourCostDetails
    ?.filter((item) => clean(item.date).slice(0, 7) <= monthKey)
    .sort((a, b) => clean(b.date).localeCompare(clean(a.date)))[0]
  if (!detail || detail.perHourCost === '' || !Number.isFinite(Number(detail.perHourCost))) return null
  return Number(detail.perHourCost)
}

const nextVoucherNumber = (records) => {
  const highestNumber = records.reduce((highest, record) => {
    const match = /^AWH-(\d{6})$/.exec(clean(record.voucherNo))
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `AWH-${String(highestNumber + 1).padStart(6, '0')}`
}

function ActualWorkHoursImportPage() {
  const ledgers = useCollection('ledgers'), employees = useCollection('employees'), workHours = useCollection('actualWorkHours')
  const inputRef = useRef(null), workbookRef = useRef(null)
  const [fileName, setFileName] = useState(''), [sheetNames, setSheetNames] = useState([]), [sheetName, setSheetName] = useState(''), [ledgerId, setLedgerId] = useState('')
  const [voucherDate, setVoucherDate] = useState('')
  const [rows, setRows] = useState([]), [validated, setValidated] = useState(false), [error, setError] = useState(''), [importing, setImporting] = useState(false), [complete, setComplete] = useState(false)
  const activeLedgers = ledgers.data.filter((item) => String(item.status).toLowerCase() === 'active')
  const valid = rows.filter((row) => row.isValid), invalid = rows.filter((row) => !row.isValid)
  const voucherNo = useMemo(() => nextVoucherNumber(workHours.data), [workHours.data])

  const readFile = async (event) => { const file = event.target.files?.[0]; if (!file) return; setError(''); setRows([]); setValidated(false); setComplete(false); try { const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true }); workbookRef.current = workbook; setFileName(file.name); setSheetNames(workbook.SheetNames); setSheetName(workbook.SheetNames[0] || '') } catch (requestError) { setError(`Unable to read workbook. ${requestError.message}`) } event.target.value = '' }
  const validate = () => {
    if (!ledgerId) return setError('Select Ledger Name before validation.')
    if (!voucherDate) return setError('Select Voucher Date before validation.')
    if (!workbookRef.current || !sheetName) return setError('Select an Excel file and sheet name.')
    const raw = XLSX.utils.sheet_to_json(workbookRef.current.Sheets[sheetName], { defval: '', raw: true })
    if (!raw.length) return setError('The selected sheet does not contain records.')
    const checked = raw.map((source, index) => {
      const employeeId = clean(fromColumn(source, ['Emp ID', 'Employee ID', 'EMPID'])), employeeName = clean(fromColumn(source, ['Name', 'Emp Name', 'Employee Name'])), projectName = clean(fromColumn(source, ['Project Name', 'ProjectName'])), projectId = clean(fromColumn(source, ['Proj ID', 'Project ID', 'ProjectId'])), subProjectId = clean(fromColumn(source, ['Sub-proj ID', 'Sub Project ID', 'SubProjectId'])), month = fromColumn(source, ['Month']), actualHoursRaw = fromColumn(source, ['Actual HRS', 'Actual Hours']), errors = []
      if (!employeeId) errors.push('Emp ID is required.'); if (!employeeName) errors.push('Name is required.'); if (!projectName) errors.push('Project Name is required.'); if (!projectId) errors.push('Proj ID is required.'); if (!subProjectId) errors.push('Sub-proj ID is required.')
      const employee = employees.data.find((item) => clean(item.employeeId).toLowerCase() === employeeId.toLowerCase())
      if (employeeId && !employee) errors.push('Employee ID does not exist in Employee Master.')
      if (employee && clean(employee.employeeName).toLowerCase() !== employeeName.toLowerCase()) errors.push('Employee Name does not match Employee Master.')
      if (employee && clean(employee.projectName).toLowerCase() !== projectName.toLowerCase()) errors.push('Project Name does not match Employee Master.')
      if (employee && clean(employee.projectId).toLowerCase() !== projectId.toLowerCase()) errors.push('Project ID does not match Employee Master.')
      if (employee && clean(employee.subProjectId).toLowerCase() !== subProjectId.toLowerCase()) errors.push('Sub Project ID does not match Employee Master.')
      const monthDate = monthValue(month), actualHours = Number(actualHoursRaw)
      if (!monthDate) errors.push('Month is invalid.'); if (actualHoursRaw === '' || !Number.isFinite(actualHours) || actualHours < 0) errors.push('Actual HRS must be 0 or greater.')
      const perHourCost = monthDate ? costForMonth(employee, monthDate) : null
      if (employee && monthDate && perHourCost === null) errors.push(`Per Hour Cost is not available on or before ${formatMonth(monthDate)} in Employee Master.`)
      const actualHoursAmount = perHourCost === null || !Number.isFinite(actualHours) ? null : actualHours * perHourCost
      return { rowNumber: index + 2, employeeId, employeeName, projectName, projectId, subProjectId, month: formatMonth(month), monthDate, actualHours, perHourCost, actualHoursAmount, errors, isValid: !errors.length }
    })
    setRows(checked); setValidated(true); setError('')
  }
  const importRows = async () => { if (!validated || invalid.length || !valid.length) return setError('Correct every validation error before importing.'); const ledger = ledgers.data.find((item) => item.id === ledgerId); setImporting(true); try { await createRecords('actualWorkHours', valid.map((row) => ({ ...row, errors: [], isValid: true, voucherNo, voucherDate, ledgerDocumentId: ledger.id, ledgerName: ledger.name, ledgerCategoryName: ledger.categoryName, groupName: ledger.groupName, sheetName, sourceFileName: fileName }))); setComplete(true) } catch (requestError) { setError(requestError.message) } finally { setImporting(false) } }

  return <Stack spacing={3}><PageHeader section="Imports / Actual Work Hours" title="Actual Work Hours" description="Validate employee project details before importing monthly actual hours." />
    {!activeLedgers.length && !ledgers.loading && <Alert severity="warning">Create an active Ledger in Ledger Master before importing Actual Work Hours.</Alert>}
    <Card variant="outlined"><CardContent sx={{ p: { xs: 2, sm: 3 } }}><Stepper activeStep={complete ? 4 : validated ? 2 : fileName ? 1 : 0} alternativeLabel sx={{ mb: 3 }}>{['Upload', 'Validate', 'Review', 'Import'].map((step) => <Step key={step}><StepLabel>{step}</StepLabel></Step>)}</Stepper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))' }, gap: 2, mb: 2 }}><TextField label="Voucher No" value={voucherNo} slotProps={{ input: { readOnly: true } }} /><TextField required type="date" label="Voucher Date" value={voucherDate} onChange={(event) => { setVoucherDate(event.target.value); setValidated(false) }} slotProps={{ inputLabel: { shrink: true } }} /><TextField select required label="Ledger Name" value={ledgerId} onChange={(event) => { setLedgerId(event.target.value); setValidated(false) }}>{activeLedgers.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField><TextField select required label="Upload Sheet Name" value={sheetName} onChange={(event) => { setSheetName(event.target.value); setRows([]); setValidated(false) }} disabled={!sheetNames.length}>{sheetNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}</TextField></Box>
      {!complete && <Box onClick={() => inputRef.current?.click()} sx={{ border: '1.5px dashed', borderColor: 'divider', borderRadius: 2.5, p: { xs: 4, sm: 5 }, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' } }}><CloudUploadRoundedIcon sx={{ fontSize: 42, color: 'primary.main' }} /><Typography fontWeight={650} sx={{ mt: 1 }}>Drop your Excel file here</Typography><Typography variant="body2" color="text.secondary">or browse from your computer · XLSX, XLS</Typography><Button type="button" variant="contained" sx={{ mt: 2 }}>Browse File</Button><input ref={inputRef} hidden type="file" accept=".xlsx,.xls" onChange={readFile} />{fileName && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Selected: {fileName}</Typography>}</Box>}
      {complete && <Alert severity="success">{valid.length} Actual Work Hours records imported successfully.</Alert>}
      {!complete && <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2, gap: '12px' }}><Button variant="outlined" onClick={validate} disabled={!fileName || !ledgerId || !voucherDate}>Validate</Button><Button variant="contained" onClick={importRows} disabled={!validated || Boolean(invalid.length) || !valid.length || importing}>{importing ? 'Importing…' : 'Import'}</Button></Stack>}{importing && <LinearProgress sx={{ mt: 1 }} />}
    </CardContent></Card>
    {validated && <Card variant="outlined"><Stack direction="row" sx={{ p: 2, gap: '8px' }}><Chip color="success" label={`Valid ${valid.length}`} /><Chip color={invalid.length ? 'error' : 'default'} label={`Invalid ${invalid.length}`} /></Stack><PaginatedTable minWidth={1250} columns={['Row','Emp ID','Name','Project Name','Proj ID','Sub-proj ID','Month','Actual HRS','Per Hour Cost','Actual Hours','Validation'].map((label) => ({ label }))} rows={rows} renderRow={(row) => <TableRow key={row.rowNumber}><TableCell>{row.rowNumber}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{row.employeeName}</TableCell><TableCell>{row.projectName}</TableCell><TableCell>{row.projectId}</TableCell><TableCell>{row.subProjectId}</TableCell><TableCell>{row.month}</TableCell><TableCell>{row.actualHours}</TableCell><TableCell>{row.perHourCost ?? '-'}</TableCell><TableCell>{row.actualHoursAmount ?? '-'}</TableCell><TableCell><Chip size="small" color={row.isValid ? 'success' : 'error'} label={row.isValid ? 'Valid' : row.errors.join(' ')} /></TableCell></TableRow>} /></Card>}
  </Stack>
}
export default ActualWorkHoursImportPage

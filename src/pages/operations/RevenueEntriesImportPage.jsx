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
const column = (row, names) => {
  const key = Object.keys(row).find((heading) => names.some((name) => heading.trim().toLowerCase() === name.toLowerCase()))
  return key === undefined ? '' : row[key]
}
const monthValue = (value) => {
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-01`
  }
  const text = clean(value)
  const short = text.match(/^([A-Za-z]{3,9})[- /](\d{2}|\d{4})$/)
  if (short) {
    const month = new Date(`${short[1]} 1, 2000`).getMonth()
    const year = Number(short[2]) < 100 ? 2000 + Number(short[2]) : Number(short[2])
    if (month >= 0) return `${year}-${String(month + 1).padStart(2, '0')}-01`
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}
const nextVoucher = (records, type) => {
  const prefix = type === 'Forecast' ? 'FRE' : 'ARE'
  const highest = records.reduce((max, record) => {
    const match = new RegExp(`^${prefix}-(\\d{6})$`).exec(clean(record.voucherNo))
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `${prefix}-${String(highest + 1).padStart(6, '0')}`
}

function RevenueEntriesImportPage() {
  const ledgers = useCollection('ledgers')
  const subProjects = useCollection('subProjects')
  const entries = useCollection('revenueEntries')
  const inputRef = useRef(null)
  const workbookRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [sheetNames, setSheetNames] = useState([])
  const [sheetName, setSheetName] = useState('')
  const [ledgerId, setLedgerId] = useState('')
  const [voucherDate, setVoucherDate] = useState('')
  const [entryType, setEntryType] = useState('Actual')
  const [rows, setRows] = useState([])
  const [validated, setValidated] = useState(false)
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [complete, setComplete] = useState(false)
  const activeLedgers = ledgers.data.filter((item) => clean(item.status).toLowerCase() === 'active' && item.groupName === 'Revenue')
  const voucherNo = useMemo(() => nextVoucher(entries.data, entryType), [entries.data, entryType])
  const valid = rows.filter((row) => row.isValid)
  const invalid = rows.filter((row) => !row.isValid)

  const readFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(''); setRows([]); setValidated(false); setComplete(false)
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false })
      workbookRef.current = workbook
      setFileName(file.name); setSheetNames(workbook.SheetNames); setSheetName(workbook.SheetNames[0] || '')
    } catch (requestError) { setError(`Unable to read workbook. ${requestError.message}`) }
    event.target.value = ''
  }

  const validate = () => {
    if (!voucherDate || !ledgerId || !workbookRef.current || !sheetName) return setError('Select Voucher Date, Revenue Ledger, file and sheet before validation.')
    const raw = XLSX.utils.sheet_to_json(workbookRef.current.Sheets[sheetName], { defval: '', raw: true })
    if (!raw.length) return setError('The selected sheet does not contain records.')
    const required = ['Sub Project Name', 'Subproject No', 'Project Name', 'Month', entryType]
    const headings = Object.keys(raw[0]).map((heading) => heading.trim().toLowerCase())
    const missing = required.filter((heading) => !headings.includes(heading.toLowerCase()))
    if (missing.length) return setError(`Missing Excel headings: ${missing.join(', ')}`)
    const checked = raw.map((source, index) => {
      const subProjectName = clean(column(source, ['Sub Project Name']))
      const subProjectId = clean(column(source, ['Subproject No']))
      const projectName = clean(column(source, ['Project Name']))
      const month = column(source, ['Month'])
      const amountRaw = column(source, [entryType])
      const subProject = subProjects.data.find((item) => clean(item.subProjectId).toLowerCase() === subProjectId.toLowerCase())
      const errors = []
      if (!subProjectId) errors.push('Subproject No is required.')
      if (!subProjectName) errors.push('Sub Project Name is required.')
      if (!projectName) errors.push('Project Name is required.')
      if (subProjectId && !subProject) errors.push('Subproject No does not exist in Sub Project Master.')
      if (subProject && clean(subProject.subProjectName).toLowerCase() !== subProjectName.toLowerCase()) errors.push('Sub Project Name does not match Sub Project Master.')
      if (subProject && clean(subProject.projectName).toLowerCase() !== projectName.toLowerCase()) errors.push('Project Name does not match Sub Project Master.')
      const monthDate = monthValue(month)
      const amount = Number(amountRaw)
      if (!monthDate) errors.push('Month is invalid.')
      if (amountRaw === '' || !Number.isFinite(amount) || amount < 0) errors.push(`${entryType} must be 0 or greater.`)
      return { rowNumber: index + 2, subProjectName, subProjectId, projectName, projectId: subProject?.projectId || '', month: monthDate ? formatMonth(monthDate) : clean(month), monthDate, amount, errors, isValid: !errors.length }
    })
    setRows(checked); setValidated(true); setError('')
  }

  const importRows = async () => {
    if (!validated || invalid.length || !valid.length) return setError('Correct every validation error before importing.')
    const ledger = ledgers.data.find((item) => item.id === ledgerId)
    if (!ledger || ledger.groupName !== 'Revenue') return setError('Select an active Revenue ledger.')
    setImporting(true)
    try {
      await createRecords('revenueEntries', valid.map((row) => ({ ...row, errors: [], isValid: true, voucherNo, voucherDate, type: entryType, ledgerDocumentId: ledger.id, ledgerName: ledger.name, ledgerCategoryName: ledger.categoryName, groupName: 'Revenue', sheetName, sourceFileName: fileName })))
      setComplete(true)
    } catch (requestError) { setError(requestError.message) } finally { setImporting(false) }
  }

  return <Stack spacing={3}>
    <PageHeader section="Imports / Revenue Entries" title="Revenue Entries Upload" description="Validate and import forecast or actual revenue amounts." />
    {!activeLedgers.length && !ledgers.loading && <Alert severity="warning">Create an active Revenue ledger in Ledger Master before importing.</Alert>}
    <Card variant="outlined"><CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Stepper activeStep={complete ? 4 : validated ? 2 : fileName ? 1 : 0} alternativeLabel sx={{ mb: 3 }}>{['Upload', 'Validate', 'Review', 'Import'].map((step) => <Step key={step}><StepLabel>{step}</StepLabel></Step>)}</Stepper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))' }, gap: 2, mb: 2 }}>
        <TextField label="Voucher No" value={voucherNo} slotProps={{ input: { readOnly: true } }} />
        <TextField required type="date" label="Voucher Date" value={voucherDate} onChange={(event) => { setVoucherDate(event.target.value); setValidated(false) }} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField select required label="Ledger Name" value={ledgerId} onChange={(event) => { setLedgerId(event.target.value); setValidated(false) }}>{activeLedgers.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField>
        <TextField select required label="Type" value={entryType} onChange={(event) => { setEntryType(event.target.value); setRows([]); setValidated(false); setComplete(false) }}><MenuItem value="Forecast">Forecast</MenuItem><MenuItem value="Actual">Actual</MenuItem></TextField>
        <TextField select required label="Upload Sheet Name" value={sheetName} onChange={(event) => { setSheetName(event.target.value); setRows([]); setValidated(false) }} disabled={!sheetNames.length}>{sheetNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}</TextField>
      </Box>
      {!complete && <Alert severity="info" sx={{ mb: 2 }}><strong>Required Excel headings:</strong> Sub Project Name, Subproject No, Project Name, Month, Forecast, Actual. The selected Type determines which amount is imported.</Alert>}
      {!complete && <Box onClick={() => inputRef.current?.click()} sx={{ border: '1.5px dashed', borderColor: 'divider', borderRadius: 2.5, p: { xs: 4, sm: 5 }, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' } }}><CloudUploadRoundedIcon sx={{ fontSize: 42, color: 'primary.main' }} /><Typography fontWeight={650} sx={{ mt: 1 }}>Drop your Excel file here</Typography><Typography variant="body2" color="text.secondary">or browse from your computer · XLSX, XLS</Typography><Button type="button" variant="contained" sx={{ mt: 2 }}>Browse File</Button><input ref={inputRef} hidden type="file" accept=".xlsx,.xls" onChange={readFile} />{fileName && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Selected: {fileName}</Typography>}</Box>}
      {!complete && <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2, gap: '12px' }}><Button variant="outlined" onClick={validate} disabled={!fileName || !ledgerId || !voucherDate}>Validate</Button><Button variant="contained" onClick={importRows} disabled={!validated || Boolean(invalid.length) || !valid.length || importing}>{importing ? 'Importing…' : 'Import'}</Button></Stack>}
      {complete && <Alert severity="success">{valid.length} Revenue Entries records imported successfully.</Alert>}
      {importing && <LinearProgress sx={{ mt: 1 }} />}
    </CardContent></Card>
    {validated && <Card variant="outlined"><Stack direction="row" sx={{ p: 2, gap: '8px' }}><Chip color="success" label={`Valid ${valid.length}`} /><Chip color={invalid.length ? 'error' : 'default'} label={`Invalid ${invalid.length}`} /></Stack><PaginatedTable minWidth={1100} tabs={[{ label: 'Success', value: 'success', filter: (row) => row.isValid }, { label: 'Failure', value: 'failure', filter: (row) => !row.isValid }]} columns={['Row', 'Sub Project Name', 'Subproject No', 'Project Name', 'Month', entryType, 'Validation'].map((label) => ({ label }))} rows={rows} renderRow={(row) => <TableRow key={row.rowNumber}><TableCell>{row.rowNumber}</TableCell><TableCell>{row.subProjectName}</TableCell><TableCell>{row.subProjectId}</TableCell><TableCell>{row.projectName}</TableCell><TableCell>{row.month}</TableCell><TableCell>{row.amount}</TableCell><TableCell><Chip size="small" color={row.isValid ? 'success' : 'error'} label={row.isValid ? 'Valid' : row.errors.join(' ')} /></TableCell></TableRow>} /></Card>}
  </Stack>
}

export default RevenueEntriesImportPage

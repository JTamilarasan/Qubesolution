import { useRef, useState } from 'react'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import { Alert, Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import * as XLSX from 'xlsx'
import PageHeader from '../../components/common/PageHeader'
import { useCollection } from '../../hooks/useCollection'
import { createRecords } from '../../services/firestoreService'
import { validateEmployeeRows } from '../../utils/importValidation'

function EmployeeImportPage() {
  const projects = useCollection('projects'), subs = useCollection('subProjects'), employees = useCollection('employees')
  const inputRef = useRef(null)
  const [rows, setRows] = useState([]), [fileName, setFileName] = useState(''), [error, setError] = useState(''), [importing, setImporting] = useState(false), [complete, setComplete] = useState(false)
  const valid = rows.filter((row) => row.isValid), invalid = rows.filter((row) => !row.isValid), duplicates = rows.filter((row) => row.duplicate)

  const readFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(''); setComplete(false)
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const raw = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' })
      if (!raw.length) throw new Error('The workbook does not contain employee records.')
      setRows(validateEmployeeRows(raw, projects.data, subs.data, employees.data)); setFileName(file.name)
    } catch (requestError) { setRows([]); setError(`Unable to read the workbook. ${requestError.message}`) }
    event.target.value = ''
  }

  const importValid = async () => {
    if (!valid.length) return
    setImporting(true); setError('')
    try {
      await createRecords('employees', valid.map((row) => ({ company: row.company, employeeId: row.employeeId, employeeName: row.employeeName, subProjectDocumentId: row.subProjectDocumentId, subProjectId: row.subProjectId, subProjectName: row.subProjectName, projectCategoryId: row.projectCategoryId, projectCategoryName: row.projectCategoryName, projectDocumentId: row.projectDocumentId, projectId: row.projectId, projectName: row.projectName, budgeted: row.budgeted, rollOnDate: row.rollOnDate, rollOffDate: row.rollOffDate, dateOfJoining: row.dateOfJoining, excelacomExperience: row.excelacomExperience, finalCustomer: row.finalCustomer, status: row.status })))
      setComplete(true)
    } catch (requestError) { setError(requestError.message) } finally { setImporting(false) }
  }

  return <Stack spacing={3}>
    <PageHeader section="Imports / Employee Import" title="Import Employees" description="Validate employee information against workforce master data before importing." />
    <Card variant="outlined"><CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Stepper activeStep={complete ? 4 : rows.length ? 2 : 0} alternativeLabel sx={{ mb: 3 }}>{['Upload', 'Validate', 'Review', 'Import'].map((step) => <Step key={step}><StepLabel>{step}</StepLabel></Step>)}</Stepper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {complete ? <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ py: 5 }}><Chip color="success" label="Import completed successfully" /><Typography variant="h5" fontWeight={700}>{valid.length} employees were imported.</Typography><Typography color="text.secondary">{invalid.length} records require correction.</Typography></Stack> : <Box onClick={() => inputRef.current?.click()} sx={{ border: '1.5px dashed', borderColor: 'divider', borderRadius: 2.5, p: { xs: 4, sm: 6 }, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' } }}><CloudUploadRoundedIcon sx={{ fontSize: 42, color: 'primary.main' }} /><Typography fontWeight={650} sx={{ mt: 1 }}>Drop your Excel file here</Typography><Typography variant="body2" color="text.secondary">or browse from your computer · XLSX, XLS</Typography><Button variant="contained" sx={{ mt: 2 }}>Browse File</Button><input ref={inputRef} hidden type="file" accept=".xlsx,.xls" onChange={readFile} /></Box>}
      {fileName && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Selected: {fileName}</Typography>}
    </CardContent></Card>
    {rows.length > 0 && !complete && <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 2 }}>{[['Total', rows.length], ['Valid', valid.length], ['Invalid', invalid.length], ['Duplicates', duplicates.length]].map(([label, value]) => <Card variant="outlined" key={label}><CardContent><Typography variant="body2" color="text.secondary">{label}</Typography><Typography fontSize={27} fontWeight={700}>{value}</Typography></CardContent></Card>)}</Box>
      <Card variant="outlined"><TableContainer><Table><TableHead><TableRow><TableCell>Row</TableCell><TableCell>Employee</TableCell><TableCell>Project</TableCell><TableCell>Sub Project</TableCell><TableCell>Validation</TableCell><TableCell>Issue</TableCell></TableRow></TableHead><TableBody>{rows.map((row) => <TableRow key={row.rowNumber}><TableCell>{row.rowNumber}</TableCell><TableCell>{row.employeeId} · {row.employeeName}</TableCell><TableCell>{row.projectId} — {row.projectName}</TableCell><TableCell>{row.subProjectId} — {row.subProjectName}</TableCell><TableCell><Chip size="small" color={row.isValid ? 'success' : 'warning'} label={row.isValid ? 'Ready' : 'Needs attention'} /></TableCell><TableCell sx={{ minWidth: 260 }}>{row.errors.join(' ') || '—'}</TableCell></TableRow>)}</TableBody></Table></TableContainer><Stack direction="row" justifyContent="flex-end" gap={1.5} sx={{ p: 2, position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}><Button variant="outlined" color="secondary" onClick={() => setRows([])}>Cancel</Button><Button variant="contained" disabled={!valid.length || importing} onClick={importValid}>{importing ? `Importing ${valid.length}…` : `Import ${valid.length} Valid Employees`}</Button></Stack>{importing && <LinearProgress />}</Card>
    </>}
  </Stack>
}

export default EmployeeImportPage

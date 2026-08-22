import { useRef, useState } from 'react'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import * as XLSX from 'xlsx'
import PageHeader from '../../components/common/PageHeader'
import { useCollection } from '../../hooks/useCollection'

function PayrollImportPage() {
  const employees = useCollection('employees')
  const input = useRef(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  const read = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const raw = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' })
      setRows(raw.map((row, index) => {
        const employeeId = String(row['Employee ID'] ?? row.EmployeeId ?? '').trim()
        const match = employees.data.find((item) => String(item.employeeId) === employeeId)
        return { row: index + 2, employeeId, employeeName: String(row['Employee Name'] ?? match?.employeeName ?? ''), matched: Boolean(match), issue: match ? '' : `Employee ID ${employeeId || '(blank)'} does not exist.` }
      }))
      setError('')
    } catch (requestError) {
      setError(`Unable to read workbook. ${requestError.message}`)
    }
    event.target.value = ''
  }

  return <Stack spacing={3}>
    <PageHeader section="Imports / Payroll Import" title="Payroll Import" description="Validate payroll employees against Employee Master before importing." />
    <Card variant="outlined"><CardContent sx={{ p: 3 }}>
      <Stepper activeStep={rows.length ? 2 : 0} alternativeLabel sx={{ mb: 3 }}>{['Upload', 'Validate', 'Review', 'Import'].map((step) => <Step key={step}><StepLabel>{step}</StepLabel></Step>)}</Stepper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box onClick={() => input.current?.click()} sx={{ p: 5, textAlign: 'center', border: '1.5px dashed', borderColor: 'divider', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.main' } }}>
        <CloudUploadRoundedIcon sx={{ color: 'primary.main', fontSize: 40 }} /><Typography fontWeight={650}>Upload payroll workbook</Typography><Typography variant="body2" color="text.secondary">XLSX or XLS · records are validated before saving</Typography><Button variant="contained" sx={{ mt: 2 }}>Browse File</Button><input hidden ref={input} type="file" accept=".xlsx,.xls" onChange={read} />
      </Box>
    </CardContent></Card>
    {rows.length > 0 && <Card variant="outlined">
      <Stack direction="row" gap={1} sx={{ p: 2 }} flexWrap="wrap"><Chip label={`Total ${rows.length}`} /><Chip color="success" label={`Matched ${rows.filter((row) => row.matched).length}`} /><Chip color="warning" label={`Unmatched ${rows.filter((row) => !row.matched).length}`} /></Stack>
      <TableContainer><Table><TableHead><TableRow><TableCell>Row</TableCell><TableCell>Employee ID</TableCell><TableCell>Employee</TableCell><TableCell>Validation</TableCell><TableCell>Issue</TableCell></TableRow></TableHead><TableBody>{rows.map((row) => <TableRow key={row.row}><TableCell>{row.row}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{row.employeeName}</TableCell><TableCell>{row.matched ? 'Matched' : 'Unmatched'}</TableCell><TableCell>{row.issue || '—'}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
    </Card>}
  </Stack>
}

export default PayrollImportPage

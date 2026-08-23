import { useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Autocomplete, Box, Card, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import PageHeader from '../../components/common/PageHeader'
import ContentState from '../../components/common/ContentState'
import StatusChip from '../../components/common/StatusChip'
import { useCollection } from '../../hooks/useCollection'
import { formatDate } from '../../utils/formatters'

const detailFields = (employee) => [
  ['Company', employee.company],
  ['Employee ID', employee.employeeId],
  ['Employee Name', employee.employeeName],
  ['Sub Project ID', employee.subProjectId],
  ['Sub Project Name', employee.subProjectName],
  ['Project ID', employee.projectId],
  ['Project Name', employee.projectName],
  ['Project Category', employee.projectCategoryName],
  ['Budgeted', employee.budgeted],
  ['Roll On Date', formatDate(employee.rollOnDate)],
  ['Roll Off Date', formatDate(employee.rollOffDate)],
  ['Date of Joining', formatDate(employee.dateOfJoining)],
  ['Excelacom Experience', employee.excelacomExperience ?? employee.experience ?? '—'],
  ['Final Customer', employee.finalCustomer || '—'],
  ['CTC', employee.ctc ?? '—'],
]

function EmployeeMasterReportPage() {
  const employees = useCollection('employees')
  const [selected, setSelected] = useState(null)

  return <Stack spacing={3}>
    <PageHeader section="Reports / Employee Master" title="Employee Master Report" description="Search an Employee ID and view the complete employee master details." />
    <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      {employees.loading || employees.error ? <ContentState loading={employees.loading} error={employees.error} title="Unable to load employees" description="Employee Master records are not available." /> : <Autocomplete
        options={employees.data}
        value={null}
        onChange={(_, employee) => employee && setSelected(employee)}
        getOptionLabel={(employee) => `${employee.employeeId || ''} — ${employee.employeeName || ''}`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText="No employee found"
        sx={{ maxWidth: 520 }}
        renderInput={(params) => <TextField {...params} label="Employee ID" placeholder="Search Employee ID or Employee Name" />}
        filterOptions={(options, state) => { const term = state.inputValue.trim().toLowerCase(); return options.filter((employee) => `${employee.employeeId} ${employee.employeeName}`.toLowerCase().includes(term)) }}
      />}
    </Card>

    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
      {selected && <>
        <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, p: { xs: 2, sm: 3 }, pb: 2 }}>
          <Box sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 2 }}><Typography variant="h5" fontWeight={750}>Employee Master Details</Typography><Typography variant="body2" color="text.secondary">{selected.employeeId} — {selected.employeeName}</Typography></Box>
          <IconButton onClick={() => setSelected(null)} aria-label="Close employee details"><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            {detailFields(selected).map(([label, value]) => <Box key={label} sx={{ p: 2, minWidth: 0, borderBottom: '1px solid', borderRight: { sm: '1px solid' }, borderColor: 'divider', '&:nth-of-type(even)': { borderRight: 0 } }}><Typography variant="caption" color="text.secondary" fontWeight={650}>{label}</Typography><Typography sx={{ mt: .5, overflowWrap: 'anywhere' }}>{value || '—'}</Typography></Box>)}
            <Box sx={{ p: 2 }}><Typography variant="caption" color="text.secondary" fontWeight={650}>Status</Typography><Box sx={{ mt: .75 }}><StatusChip status={selected.status} /></Box></Box>
          </Box>
          <Typography fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>Per Hour Cost Details</Typography>
          <Table size="small" sx={{ border: '1px solid', borderColor: 'divider' }}><TableHead><TableRow><TableCell>Date</TableCell><TableCell>Per Hour Cost</TableCell></TableRow></TableHead><TableBody>{selected.perHourCostDetails?.length ? selected.perHourCostDetails.map((item, index) => <TableRow key={`${item.date}-${index}`}><TableCell>{formatDate(item.date)}</TableCell><TableCell>{item.perHourCost}</TableCell></TableRow>) : <TableRow><TableCell colSpan={2} align="center">No per hour cost details</TableCell></TableRow>}</TableBody></Table>
        </DialogContent>
      </>}
    </Dialog>
  </Stack>
}

export default EmployeeMasterReportPage

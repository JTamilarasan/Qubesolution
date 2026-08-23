import { useMemo, useState } from 'react'
import { Box, Button, Card, Stack, TableCell, TableRow, TextField } from '@mui/material'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import ContentState from '../../components/common/ContentState'
import { useCollection } from '../../hooks/useCollection'
import { formatDate, formatMonth } from '../../utils/formatters'

function ActualWorkHoursReportPage() {
  const records = useCollection('actualWorkHours')
  const [fromDate, setFromDate] = useState(''), [toDate, setToDate] = useState('')
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '' })
  const filtered = useMemo(() => records.data.filter((item) => (!appliedRange.from || item.voucherDate >= appliedRange.from) && (!appliedRange.to || item.voucherDate <= appliedRange.to)).sort((a, b) => String(b.voucherDate).localeCompare(String(a.voucherDate))), [records.data, appliedRange])
  return <Stack spacing={3}><PageHeader section="Reports / Actual Work Hours" title="Actual Work Hours Report" description="View imported actual-hour entries by voucher date." />
    <Card variant="outlined"><Box component="form" onSubmit={(event) => { event.preventDefault(); setAppliedRange({ from: fromDate, to: toDate }) }} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}><TextField type="date" label="From Date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: { xs: '100%', sm: 220 } }} /><TextField type="date" label="To Date" value={toDate} onChange={(event) => setToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: fromDate } }} sx={{ width: { xs: '100%', sm: 220 } }} /><Button type="submit" variant="contained">Submit</Button><Button type="button" variant="outlined" onClick={() => { setFromDate(''); setToDate(''); setAppliedRange({ from: '', to: '' }) }}>Reset</Button></Box>
      {records.loading || records.error || !filtered.length ? <ContentState loading={records.loading} error={records.error} title="No uploaded entries found" description="Change the date range or import Actual Work Hours records." /> : <PaginatedTable minWidth={1550} columns={['Voucher No','Voucher Date','Ledger','Emp ID','Employee Name','Project Name','Project ID','Sub Project ID','Month','Actual HRS','Actual Hours','Sheet'].map((label) => ({ label }))} rows={filtered} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.voucherNo}</TableCell><TableCell>{formatDate(item.voucherDate)}</TableCell><TableCell>{item.ledgerName}</TableCell><TableCell>{item.employeeId}</TableCell><TableCell>{item.employeeName}</TableCell><TableCell>{item.projectName}</TableCell><TableCell>{item.projectId}</TableCell><TableCell>{item.subProjectId}</TableCell><TableCell>{formatMonth(item.month)}</TableCell><TableCell>{item.actualHours}</TableCell><TableCell>{item.actualHoursAmount ?? '-'}</TableCell><TableCell>{item.sheetName}</TableCell></TableRow>} />}
    </Card>
  </Stack>
}
export default ActualWorkHoursReportPage

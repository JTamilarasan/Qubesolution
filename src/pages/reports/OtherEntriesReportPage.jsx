import { useMemo, useState } from 'react'
import { Box, Button, Card, MenuItem, Stack, TableCell, TableRow, TextField } from '@mui/material'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import ContentState from '../../components/common/ContentState'
import { useCollection } from '../../hooks/useCollection'
import { formatDate, formatMonth } from '../../utils/formatters'

function OtherEntriesReportPage() {
  const records = useCollection('otherEntries')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [type, setType] = useState('All')
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', type: 'All' })
  const filtered = useMemo(() => records.data
    .filter((item) => (!appliedFilters.from || item.voucherDate >= appliedFilters.from) && (!appliedFilters.to || item.voucherDate <= appliedFilters.to) && (appliedFilters.type === 'All' || item.type === appliedFilters.type))
    .sort((a, b) => String(b.voucherDate).localeCompare(String(a.voucherDate))), [records.data, appliedFilters])

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
      {records.loading || records.error || !filtered.length ? <ContentState loading={records.loading} error={records.error} title="No uploaded entries found" description="Change the filters or import Other Entries records." /> : <PaginatedTable minWidth={1550} columns={['Voucher No','Voucher Date','Type','Ledger','Emp ID','Employee Name','Project Name','Project ID','Sub Project ID','Month','Amount','Sheet'].map((label) => ({ label }))} rows={filtered} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.voucherNo}</TableCell><TableCell>{formatDate(item.voucherDate)}</TableCell><TableCell>{item.type}</TableCell><TableCell>{item.ledgerName}</TableCell><TableCell>{item.employeeId}</TableCell><TableCell>{item.employeeName}</TableCell><TableCell>{item.projectName}</TableCell><TableCell>{item.projectId}</TableCell><TableCell>{item.subProjectId}</TableCell><TableCell>{formatMonth(item.month)}</TableCell><TableCell>{item.amount}</TableCell><TableCell>{item.sheetName}</TableCell></TableRow>} />}
    </Card>
  </Stack>
}

export default OtherEntriesReportPage

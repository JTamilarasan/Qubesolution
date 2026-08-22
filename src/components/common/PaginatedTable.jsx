import { useEffect, useState } from 'react'
import { Box, IconButton, InputAdornment, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

function PaginatedTable({ columns, rows, renderRow, minWidth }) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const filteredRows = query ? rows.filter((row) => Object.values(row).some((value) => typeof value !== 'object' && String(value ?? '').toLowerCase().includes(query))) : rows
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  useEffect(() => { if (page >= pageCount) setPage(pageCount - 1) }, [page, pageCount])
  const start = page * rowsPerPage
  return <>
    <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}><TextField size="small" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Search records" aria-label="Search table records" sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { height: 40, minHeight: 40 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 19 }} /></InputAdornment> } }} /></Box>
    <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}><Table sx={{ minWidth }}><TableHead><TableRow>{columns.map((column) => <TableCell key={column.label} align={column.align}>{column.label}</TableCell>)}</TableRow></TableHead><TableBody>{filteredRows.length ? filteredRows.slice(start, start + rowsPerPage).map(renderRow) : <TableRow><TableCell colSpan={columns.length} align="center" sx={{ height: 120, color: 'text.secondary', fontSize: 14 }}>No records found</TableCell></TableRow>}</TableBody></Table></TableContainer>
    {filteredRows.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '1fr 1fr 1fr' }, gridTemplateAreas: { xs: '"total rows" "pager pager"', sm: '"total pager rows"' }, alignItems: 'center', columnGap: 2, rowGap: { xs: 1, sm: 0 }, minHeight: 64, px: { xs: 1.5, sm: 2 }, py: { xs: 1.25, sm: 1 }, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography sx={{ gridArea: 'total', justifySelf: 'start', fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>Total records: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{filteredRows.length}</Box></Typography>
      <Stack direction="row" alignItems="center" sx={{ gridArea: 'pager', justifySelf: 'center', width: 'max-content', flexWrap: 'nowrap', gap: '8px' }}>
        <IconButton size="small" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((value) => value - 1)} sx={{ width: 36, height: 36 }}><ChevronLeftRoundedIcon /></IconButton>
        <Typography sx={{ width: 48, textAlign: 'center', fontSize: 13, lineHeight: '36px', fontWeight: 700, whiteSpace: 'nowrap' }}>{page + 1} / {pageCount}</Typography>
        <IconButton size="small" aria-label="Next page" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)} sx={{ width: 36, height: 36 }}><ChevronRightRoundedIcon /></IconButton>
      </Stack>
      <Stack direction="row" alignItems="center" sx={{ gridArea: 'rows', justifySelf: 'end', width: 'max-content', flexWrap: 'nowrap', gap: '8px' }}><Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: '36px', whiteSpace: 'nowrap' }}>Rows</Typography><Select size="small" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0) }} aria-label="Rows per page" sx={{ width: 72, height: 36, minHeight: '36px !important', fontSize: 13, '& .MuiSelect-select': { py: '7px', pl: '10px' } }}>{[10, 20, 30, 40, 50].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></Stack>
    </Box>}
  </>
}

export default PaginatedTable

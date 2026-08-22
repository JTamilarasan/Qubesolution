import { useEffect, useState } from 'react'
import { Box, IconButton, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

function PaginatedTable({ columns, rows, renderRow, minWidth }) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage))
  useEffect(() => { if (page >= pageCount) setPage(pageCount - 1) }, [page, pageCount])
  const start = page * rowsPerPage
  return <>
    <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}><Table sx={{ minWidth }}><TableHead><TableRow>{columns.map((column) => <TableCell key={column.label} align={column.align}>{column.label}</TableCell>)}</TableRow></TableHead><TableBody>{rows.slice(start, start + rowsPerPage).map(renderRow)}</TableBody></Table></TableContainer>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '1fr 1fr 1fr' }, gridTemplateAreas: { xs: '"total rows" "pager pager"', sm: '"total pager rows"' }, alignItems: 'center', columnGap: 2, rowGap: { xs: 1, sm: 0 }, minHeight: 64, px: { xs: 1.5, sm: 2 }, py: { xs: 1.25, sm: 1 }, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography sx={{ gridArea: 'total', justifySelf: 'start', fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>Total records: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{rows.length}</Box></Typography>
      <Stack direction="row" alignItems="center" sx={{ gridArea: 'pager', justifySelf: 'center', width: 'max-content', flexWrap: 'nowrap', gap: '8px' }}>
        <IconButton size="small" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((value) => value - 1)} sx={{ width: 36, height: 36 }}><ChevronLeftRoundedIcon /></IconButton>
        <Typography sx={{ width: 48, textAlign: 'center', fontSize: 13, lineHeight: '36px', fontWeight: 700, whiteSpace: 'nowrap' }}>{page + 1} / {pageCount}</Typography>
        <IconButton size="small" aria-label="Next page" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)} sx={{ width: 36, height: 36 }}><ChevronRightRoundedIcon /></IconButton>
      </Stack>
      <Stack direction="row" alignItems="center" sx={{ gridArea: 'rows', justifySelf: 'end', width: 'max-content', flexWrap: 'nowrap', gap: '8px' }}><Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: '36px', whiteSpace: 'nowrap' }}>Rows</Typography><Select size="small" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0) }} aria-label="Rows per page" sx={{ width: 72, height: 36, minHeight: '36px !important', fontSize: 13, '& .MuiSelect-select': { py: '7px', pl: '10px' } }}>{[10, 20, 30, 40, 50].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></Stack>
    </Box>
  </>
}

export default PaginatedTable

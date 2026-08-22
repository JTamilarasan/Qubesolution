import { useRef, useState } from 'react'
import { Alert, Box, Card, CardContent, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import ContentState from './ContentState'
import PageHeader from './PageHeader'
import { useCollection } from '../../hooks/useCollection'

function OperationPage({ section = 'Workforce', title, description, metrics = [], filters = [], columns = [], collectionName, primaryLabel, upload, emptyTitle, emptyDescription }) {
  const records = useCollection(collectionName)
  const input = useRef(null)
  const [selectedFile, setSelectedFile] = useState('')
  return <Stack spacing={3}>
    <PageHeader section={`${section} / ${title}`} title={title} description={description} primaryLabel={primaryLabel} onPrimary={() => upload && input.current?.click()} />
    {upload && <input ref={input} hidden type="file" accept=".xlsx,.xls" onChange={(event) => { setSelectedFile(event.target.files?.[0]?.name || ''); event.target.value = '' }} />}
    {selectedFile && <Alert severity="info">Selected {selectedFile}. Validation and preview are required before this workbook can be imported.</Alert>}
    {metrics.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', md: `repeat(${metrics.length},minmax(0,1fr))` }, gap: 2 }}>{metrics.map((metric) => <Card variant="outlined" key={metric}><CardContent><Typography variant="body2" color="text.secondary">{metric}</Typography><Typography fontSize={28} fontWeight={700}>0</Typography></CardContent></Card>)}</Box>}
    <Card variant="outlined"><Stack direction={{ xs: 'column', md: 'row' }} gap={1.25} sx={{ p: 2 }}>{filters.map((filter) => <TextField key={filter} size="small" select label={filter} defaultValue="" sx={{ minWidth: 150, flex: { xs: 'auto', md: 1 } }}><MenuItem value="">All</MenuItem></TextField>)}</Stack>{records.loading || records.error || !records.data.length ? <ContentState loading={records.loading} error={records.error} title={emptyTitle || `No ${title.toLowerCase()} records`} description={emptyDescription || 'Records will appear here when data is available.'} /> : <TableContainer><Table><TableHead><TableRow>{columns.map((column) => <TableCell key={column.field}>{column.label}</TableCell>)}</TableRow></TableHead><TableBody>{records.data.map((record) => <TableRow hover key={record.id}>{columns.map((column) => <TableCell key={column.field}>{record[column.field] ?? '—'}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer>}</Card>
  </Stack>
}

export default OperationPage

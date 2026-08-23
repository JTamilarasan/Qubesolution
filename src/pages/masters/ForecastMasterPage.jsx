import { useMemo, useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { Alert, Box, Button, Card, Divider, IconButton, Menu, MenuItem, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ContentState from '../../components/common/ContentState'
import FormDrawer from '../../components/common/FormDrawer'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import StatusChip from '../../components/common/StatusChip'
import { useCollection } from '../../hooks/useCollection'
import { createRecords, deleteRecord, updateRecord } from '../../services/firestoreService'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const emptyYear = () => ({ year: '', hours: Array(12).fill(0) })

function ForecastMasterPage() {
  const forecasts = useCollection('forecastMasters')
  const [blocks, setBlocks] = useState([emptyYear()]), [editingYear, setEditingYear] = useState(null), [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [anchor, setAnchor] = useState(null), [selected, setSelected] = useState(null)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 21 }, (_, index) => currentYear + index)
  const groups = useMemo(() => {
    const byYear = new Map()
    forecasts.data.forEach((record) => {
      const year = Number(record.year)
      if (!byYear.has(year)) byYear.set(year, { year, records: [], status: 'Active' })
      byYear.get(year).records.push(record)
    })
    return [...byYear.values()].map((group) => ({ ...group, records: group.records.sort((a, b) => Number(a.month) - Number(b.month)), totalHours: group.records.reduce((sum, item) => sum + Number(item.hours ?? item.forecastHours ?? 0), 0), status: group.records.some((item) => String(item.status).toLowerCase() === 'inactive') ? 'Inactive' : 'Active' })).sort((a, b) => a.year - b.year)
  }, [forecasts.data])
  const usedYears = new Set(groups.map((group) => group.year))

  const startCreate = () => { setEditingYear(null); setBlocks([emptyYear()]); setError(''); setOpen(true) }
  const startEdit = (group) => {
    const hours = Array(12).fill(0)
    group.records.forEach((item) => { hours[Number(item.month) - 1] = Number(item.hours ?? item.forecastHours ?? 0) })
    setEditingYear(group.year); setBlocks([{ year: group.year, hours }]); setError(''); setOpen(true); setAnchor(null); setSelected(null)
  }
  const changeYear = (index, year) => setBlocks((value) => value.map((block, blockIndex) => blockIndex === index ? { ...block, year: Number(year) } : block))
  const changeHours = (blockIndex, monthIndex, hours) => setBlocks((value) => value.map((block, index) => index === blockIndex ? { ...block, hours: block.hours.map((item, itemIndex) => itemIndex === monthIndex ? hours : item) } : block))
  const addYear = () => { if (blocks.some((block) => !block.year)) return setError('Select the current Year before adding another Year.'); setError(''); setBlocks((value) => [...value, emptyYear()]) }
  const removeYear = (index) => setBlocks((value) => value.filter((_, blockIndex) => blockIndex !== index))

  const save = async (event) => {
    event.preventDefault(); setError('')
    if (blocks.some((block) => !block.year)) return setError('Year is required.')
    if (blocks.some((block) => block.hours.some((hours) => !Number.isFinite(Number(hours)) || Number(hours) < 0))) return setError('Forecast Hours must be 0 or greater.')
    setSaving(true)
    try {
      for (const block of blocks) {
        const existing = forecasts.data.filter((item) => Number(item.year) === Number(block.year))
        const toCreate = []
        for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
          const payload = { year: Number(block.year), month: monthIndex + 1, monthName: months[monthIndex], hours: Number(block.hours[monthIndex] || 0), status: 'Active' }
          const record = existing.find((item) => Number(item.month) === monthIndex + 1)
          if (record) await updateRecord('forecastMasters', record.id, { ...payload, actualHours: Number(record.actualHours || 0), status: record.status || 'Active' })
          else toCreate.push({ ...payload, actualHours: 0 })
        }
        if (toCreate.length) await createRecords('forecastMasters', toCreate)
      }
      setOpen(false); setNotice(editingYear ? 'Forecast year updated.' : 'Forecast years created.')
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  const remove = async () => { setSaving(true); try { await Promise.all(selected.records.map((item) => deleteRecord('forecastMasters', item.id))); setSelected(null); setNotice('Forecast year deleted.') } catch (requestError) { setNotice(requestError.message) } finally { setSaving(false) } }

  return <Stack spacing={3}><PageHeader section="Masters / Forecast Master" title="Forecast Master" description="Maintain forecast hours for every month in a selected year." primaryLabel="Add Forecast" primaryIcon={<AddRoundedIcon />} onPrimary={startCreate} />
    <Card variant="outlined">{forecasts.loading || forecasts.error || !groups.length ? <ContentState loading={forecasts.loading} error={forecasts.error} title="No forecasts created yet" description="Add a year and enter monthly forecast hours." /> : <PaginatedTable columns={[{ label: 'Year' }, { label: 'Months' }, { label: 'Total Forecast Hours' }, { label: 'Status' }, { label: 'Actions', align: 'right' }]} rows={groups} renderRow={(group) => <TableRow hover key={group.year}><TableCell sx={{ fontWeight: 700 }}>{group.year}</TableCell><TableCell>{group.records.length} / 12</TableCell><TableCell>{group.totalHours}</TableCell><TableCell><StatusChip status={group.status} /></TableCell><TableCell align="right"><IconButton onClick={(event) => { setAnchor(event.currentTarget); setSelected(group) }}><MoreVertRoundedIcon /></IconButton></TableCell></TableRow>} />}</Card>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => { setAnchor(null); setSelected(null) }}><MenuItem onClick={() => startEdit(selected)}>Edit Year</MenuItem><MenuItem sx={{ color: 'error.main' }} onClick={() => setAnchor(null)}>Delete Year</MenuItem></Menu>
    <FormDrawer open={open} onClose={() => setOpen(false)} title={editingYear ? `Edit Forecast ${editingYear}` : 'New Forecast'} subtitle="Enter monthly forecast hours by year" onSubmit={save} saving={saving} submitLabel={editingYear ? 'Update Forecast' : 'Create Forecast'} width={800} mobileFullScreen>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Stack spacing={3}>{blocks.map((block, blockIndex) => <Box key={`${block.year}-${blockIndex}`}>{blockIndex > 0 && <Divider sx={{ mb: 3 }} />}<Stack direction="row" alignItems="center" sx={{ mb: 2 }}><TextField select required label="Year" value={block.year} disabled={Boolean(editingYear)} onChange={(event) => changeYear(blockIndex, event.target.value)} sx={{ width: { xs: '100%', sm: 220 } }}><MenuItem value="">Select Year</MenuItem>{yearOptions.filter((year) => year === block.year || (!usedYears.has(year) && !blocks.some((item, index) => index !== blockIndex && Number(item.year) === year))).map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField>{blocks.length > 1 && <IconButton type="button" aria-label="Remove year" onClick={() => removeYear(blockIndex)} sx={{ ml: 'auto', color: 'error.main' }}><DeleteOutlineRoundedIcon /></IconButton>}</Stack>
      {block.year && <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}><Table size="small"><TableHead><TableRow><TableCell sx={{ width: 90 }}>Year</TableCell><TableCell>Forecast Month</TableCell><TableCell sx={{ width: { xs: 130, sm: 190 } }}>Hours</TableCell></TableRow></TableHead><TableBody>{months.map((month, monthIndex) => <TableRow key={month}><TableCell>{monthIndex === 0 ? block.year : ''}</TableCell><TableCell>{month}</TableCell><TableCell><TextField type="number" size="small" value={block.hours[monthIndex]} onChange={(event) => changeHours(blockIndex, monthIndex, event.target.value === '' ? '' : Number(event.target.value))} slotProps={{ htmlInput: { min: 0, step: '0.01', 'aria-label': `${month} forecast hours` } }} sx={{ width: '100%', '& .MuiOutlinedInput-root': { minHeight: 38, height: 38 }, '& input': { textAlign: 'right', py: .75 } }} /></TableCell></TableRow>)}</TableBody></Table></TableContainer>}</Box>)}
      {!editingYear && <Button type="button" variant="outlined" startIcon={<AddRoundedIcon />} onClick={addYear} sx={{ alignSelf: 'flex-start' }}>Add Year</Button>}
    </Stack></FormDrawer>
    <ConfirmDialog open={Boolean(selected && !anchor)} title="Delete Forecast Year?" description={`Delete all monthly forecast records for ${selected?.year || 'this year'}?`} onCancel={() => setSelected(null)} onConfirm={remove} busy={saving} /><Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info">{notice}</Alert></Snackbar>
  </Stack>
}

export default ForecastMasterPage

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'

function HourlyCostSection({ value = [], onChange }) {
  const rows = value.length ? value : [{ date: '', perHourCost: '' }]
  const update = (index, field, fieldValue) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: fieldValue } : row))
  const remove = (index) => onChange(rows.filter((_, rowIndex) => rowIndex !== index))
  return <Box>
    <Typography sx={{ mb: 2, color: '#374151', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>Per Hour Cost Details</Typography>
    <Stack spacing={1.5}>{rows.map((row, index) => <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 36px' }, gap: 1.5, alignItems: 'center' }}>
      <TextField type="date" label="Date" value={row.date} onChange={(event) => update(index, 'date', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField type="number" label="Per Hour Cost" value={row.perHourCost} onChange={(event) => update(index, 'perHourCost', event.target.value === '' ? '' : Number(event.target.value))} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} />
      <IconButton aria-label="Remove cost row" disabled={rows.length === 1} onClick={() => remove(index)} sx={{ width: 36, height: 36, color: 'error.main' }}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
    </Box>)}</Stack>
    <Button type="button" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => onChange([...rows, { date: '', perHourCost: '' }])} sx={{ mt: 1.5 }}>Add Cost</Button>
  </Box>
}

export default HourlyCostSection

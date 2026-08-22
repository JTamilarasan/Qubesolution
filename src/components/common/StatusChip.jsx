import { Chip } from '@mui/material'

function StatusChip({ status = 'active' }) {
  const active = String(status).toLowerCase() === 'active'
  return <Chip size="small" label={active ? 'Active' : status || 'Inactive'} color={active ? 'success' : 'default'} variant={active ? 'filled' : 'outlined'} sx={{ height: 24, fontSize: 11.5 }} />
}

export default StatusChip

import { Box, Divider, Stack, Typography } from '@mui/material'

function FormSection({ title, children, divider = false, columns = 1 }) {
  return <Box>{divider && <Divider sx={{ mb: 2.5 }} />}<Typography sx={{ mb: 2, color: '#374151', fontSize: 12, lineHeight: 1.4, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{title}</Typography>{columns > 1 ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, minmax(0, 1fr))` }, gap: 2 }}>{children}</Box> : <Stack spacing={2}>{children}</Stack>}</Box>
}

export default FormSection

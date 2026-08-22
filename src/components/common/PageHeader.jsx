import { Box, Button, Stack, Typography } from '@mui/material'

function PageHeader({ section, title, description, primaryLabel, primaryIcon, onPrimary, secondaryLabel, onSecondary }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} gap={3} sx={{ width: '100%' }}>
      <Box sx={{ borderLeft: '4px solid', borderColor: 'primary.main', pl: 2 }}>
        <Typography variant="caption" color="text.secondary">{section}</Typography>
        <Typography component="h1" sx={{ fontSize: { xs: 26, md: 28 }, fontWeight: 700, lineHeight: 1.25 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: .5, fontSize: 14 }}>{description}</Typography>
      </Box>
      {(primaryLabel || secondaryLabel) && <Stack direction="row" gap={1.25} flexWrap="wrap">
        {secondaryLabel && <Button variant="outlined" color="secondary" onClick={onSecondary}>{secondaryLabel}</Button>}
        {primaryLabel && <Button variant="contained" startIcon={primaryIcon} onClick={onPrimary}>{primaryLabel}</Button>}
      </Stack>}
    </Stack>
  )
}

export default PageHeader

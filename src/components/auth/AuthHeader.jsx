import { Box, Typography } from '@mui/material'

function AuthHeader({ title, description }) {
  return (
    <Box>
      <Typography component="div" color="primary.dark" sx={{ mb: 1.5, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', lineHeight: 1.2, textTransform: 'uppercase' }}>Secure workspace</Typography>
      <Typography component="h1" sx={{ mb: 1, color: 'secondary.main', fontSize: { xs: 28, sm: 32 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 400, lineHeight: 1.5 }}>{description}</Typography>
    </Box>
  )
}

export default AuthHeader

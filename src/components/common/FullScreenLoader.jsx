import { Box, CircularProgress } from '@mui/material'

function FullScreenLoader() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }} role="status" aria-label="Loading authentication">
      <CircularProgress size={36} />
    </Box>
  )
}

export default FullScreenLoader

import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'

function ContentState({ loading, error, title = 'No records found', description, actionLabel, onAction, minHeight = 220 }) {
  if (loading) return <Box sx={{ minHeight, display: 'grid', placeItems: 'center' }}><CircularProgress size={32} /></Box>
  if (error) return <Alert severity="error" variant="outlined" sx={{ mx: 2, mb: 2, py: .5, maxWidth: 720 }}>{error}</Alert>
  return <Stack alignItems="center" justifyContent="center" textAlign="center" spacing={1} sx={{ minHeight, p: 3 }}><Box sx={{ width: 48, height: 48, display: 'grid', placeItems: 'center', bgcolor: 'primary.50', color: 'primary.dark', borderRadius: 2 }}><InboxRoundedIcon /></Box><Typography fontWeight={650}>{title}</Typography>{description && <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 430 }}>{description}</Typography>}{actionLabel && <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>{actionLabel}</Button>}</Stack>
}

export default ContentState

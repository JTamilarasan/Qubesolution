import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import SettingsRoundedIcon from '@mui/icons-material/AppSettingsAltRounded'
import { Box, Card, CardContent, Chip, Container, Stack, Typography } from '@mui/material'
import { isFirebaseConfigured } from '../firebase/config'

const setupItems = ['React 18 + Vite', 'React Router', 'Material UI', 'Firebase SDK']

function SetupPage() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', py: 6 }}>
      <Container maxWidth="sm">
        <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, '&:last-child': { pb: { xs: 3, sm: 5 } } }}>
            <Stack spacing={3}>
              <Box>
                <Chip icon={<SettingsRoundedIcon />} label="Phase 1" color="primary" variant="outlined" />
                <Typography component="h1" variant="h3" sx={{ mt: 2, fontWeight: 750, letterSpacing: '-0.04em' }}>
                  WorkforceOps
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  The application foundation is ready for authentication and workforce modules.
                </Typography>
              </Box>
              <Stack spacing={1.25}>
                {setupItems.map((item) => (
                  <Stack key={item} direction="row" spacing={1.25} alignItems="center">
                    <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
                    <Typography>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle2">Firebase environment</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isFirebaseConfigured
                    ? 'Configuration detected. Firebase is initialized.'
                    : 'Add the values from .env.example to a local .env file to initialize Firebase.'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default SetupPage

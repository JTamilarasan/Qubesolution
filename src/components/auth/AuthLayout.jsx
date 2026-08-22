import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import { Box, Container, Stack, Typography } from '@mui/material'

const features = [
  { label: 'Project Allocation', description: 'Plan and track project-based employee allocations', icon: AccountTreeRoundedIcon },
  { label: 'Master Data Validation', description: 'Validate master data and prevent import errors', icon: FactCheckRoundedIcon },
  { label: 'Forecast Intelligence', description: 'Compare forecast and actual workforce hours', icon: InsightsRoundedIcon },
]

function BrandMark() {
  return <Box component="img" src="/excelacom-mark.svg" alt="Excelacom" sx={{ width: 42, height: 36, objectFit: 'contain', bgcolor: '#FFFFFF', borderRadius: 1.25, p: .5, flex: '0 0 auto' }} />
}

function AuthLayout({ children }) {
  return (
    <Box component="main" sx={{ minHeight: '100vh', width: '100%', bgcolor: 'background.default', display: 'grid', placeItems: 'center', p: { xs: 0, md: 3, xl: 4 }, overflowX: 'hidden' }}>
      <Box sx={{ width: '100%', maxWidth: 1240, minHeight: { xs: '100vh', md: 'min(760px, calc(100vh - 48px))' }, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '55% 45%' }, bgcolor: 'background.paper', borderRadius: { xs: 0, md: 3 }, overflow: 'hidden', boxShadow: { md: '0 24px 70px rgba(17,24,39,.13)' } }}>
        <Box component="section" sx={{ bgcolor: 'secondary.main', color: 'common.white', px: { xs: 2.5, sm: 4.5, md: 6, lg: 7.5 }, py: { xs: 3, sm: 3.5, md: 5.5 }, display: 'flex' }}>
          <Stack sx={{ width: '100%' }} spacing={0}>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <BrandMark />
              <Box sx={{ minWidth: 0 }}>
                <Typography fontSize={19} fontWeight={700} lineHeight={1.15}>Excelacom</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.62)', letterSpacing: '.015em', fontSize: { xs: 10, sm: 11 } }}>Workforce Intelligence &amp; Operations</Typography>
              </Box>
            </Stack>

            <Box sx={{ my: { md: 'auto' }, pt: { xs: 3, sm: 3.5, md: 5 }, pb: { xs: 0, md: 4 } }}>
              <Typography component="h2" variant="h2" sx={{ maxWidth: 560, fontSize: { xs: 28, sm: 32, md: 42, lg: 48 }, lineHeight: 1.1, fontWeight: 700 }}>
                Smarter workforce<br />operations <Box component="span" sx={{ color: 'primary.light' }}>start here.</Box>
              </Typography>
              <Typography sx={{ mt: { xs: 1.75, md: 2.5 }, maxWidth: 570, color: 'rgba(255,255,255,.68)', lineHeight: { xs: 1.55, md: 1.7 }, fontSize: { xs: 13, sm: 14, md: 15 } }}>
                Connect employee allocation, project tracking, workforce forecasts and operational data in one secure workspace.
              </Typography>
              <Stack spacing={{ xs: 1.1, md: 1.6 }} sx={{ mt: { xs: 2.25, md: 3.5 } }}>
                {features.map(({ label, description, icon: Icon }) => (
                  <Stack key={label} direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: { xs: 30, md: 34 }, height: { xs: 30, md: 34 }, flex: '0 0 auto', borderRadius: 1.25, bgcolor: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.18)', display: 'grid', placeItems: 'center' }}>
                      <Icon sx={{ color: 'primary.light', fontSize: { xs: 16, md: 18 } }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={650} fontSize={{ xs: 13, md: 14 }}>{label}</Typography>
                      <Typography sx={{ display: { xs: 'none', md: 'block' }, color: 'rgba(255,255,255,.5)', fontSize: 11.5, mt: .2 }}>{description}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box component="section" sx={{ display: 'grid', placeItems: 'center', width: '100%', px: { xs: 2.5, sm: 7, md: 5.5, lg: 7.5 }, py: { xs: 4, sm: 5, md: 5.5 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="xs" disableGutters sx={{ width: '100%' }}>{children}</Container>
        </Box>
      </Box>
    </Box>
  )
}

export default AuthLayout

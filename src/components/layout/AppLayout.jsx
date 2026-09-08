import { useState } from 'react'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import {
  AppBar, Avatar, Badge, Box, Button, Divider, Drawer, IconButton, InputAdornment,
  List, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Toolbar, Tooltip, Typography,
} from '@mui/material'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import AuthAlert from '../auth/AuthAlert'
import { useAuth } from '../../hooks/useAuth'
import { getAuthErrorMessage, logOut } from '../../services/authService'

const expandedWidth = 256
const collapsedWidth = 72
const navigation = [
  { section: 'OVERVIEW', items: [{ label: 'Dashboard', path: '/dashboard', icon: DashboardRoundedIcon }] },
  // Future workforce menus are intentionally hidden from the sidebar.
  // { section: 'WORKFORCE', items: [
  //   { label: 'Attendance', path: '/attendance', icon: EventAvailableRoundedIcon },
  //   { label: 'Labour Hours', path: '/labour-hours', icon: AccessTimeRoundedIcon },
  // ] },
  { section: 'MASTERS', items: [
    { label: 'Project Category', path: '/masters/project-categories', icon: CategoryRoundedIcon }, { label: 'Project Master', path: '/masters/projects', icon: AccountTreeRoundedIcon }, { label: 'Sub Project Master', path: '/masters/sub-projects', icon: BadgeRoundedIcon }, { label: 'Employee Master', path: '/masters/employees', icon: PeopleAltRoundedIcon }, { label: 'Forecast Master', path: '/masters/forecast', icon: InsightsRoundedIcon }, { label: 'Ledger Category', path: '/masters/ledger-categories', icon: AccountBalanceRoundedIcon }, { label: 'Ledger Master', path: '/masters/ledgers', icon: MenuBookRoundedIcon },
  ] },
  { section: 'IMPORTS', items: [
    // Future imports: Employee Import and Payroll Import are intentionally hidden from the sidebar.
    // { label: 'Employee Import', path: '/imports/employees', icon: UploadFileRoundedIcon },
    // { label: 'Payroll Import', path: '/imports/payroll', icon: ReceiptLongRoundedIcon },
    { label: 'Forecast Work Hours', path: '/imports/forecast-entries', icon: UploadFileRoundedIcon }, { label: 'Actual Work Hours', path: '/imports/actual-work-hours', icon: AccessTimeRoundedIcon }, { label: 'Other Entries Upload', path: '/imports/other-entries', icon: UploadFileRoundedIcon },
  ] },
  { section: 'REPORTS', items: [{ label: 'Employee Master Report', path: '/reports/employee-master', icon: PeopleAltRoundedIcon }, { label: 'Forecast Entries Report', path: '/reports/forecast-entries', icon: QueryStatsRoundedIcon }, { label: 'Actual Hours Report', path: '/reports/actual-work-hours', icon: QueryStatsRoundedIcon }, { label: 'Other Entries Report', path: '/reports/other-entries', icon: QueryStatsRoundedIcon }] },
]

function Brand({ compact = false }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      <Box component="img" src="/excelacom-mark.svg" alt="Excelocom" sx={{ width: 42, height: 40, objectFit: 'contain', flex: '0 0 auto', bgcolor: '#FFFFFF', borderRadius: 1.25, p: .5 }} />
      {!compact && <Box sx={{ minWidth: 0 }}><Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>Excelocom</Typography><Typography sx={{ color: 'rgba(255,255,255,.64)', fontSize: 10.5, fontWeight: 400, lineHeight: 1.3, mt: .25 }} noWrap>Workforce Operations</Typography></Box>}
    </Stack>
  )
}

function Navigation({ compact, onSelect, onLogout, loggingOut }) {
  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ height: 76, px: compact ? 2 : 2.25, display: 'flex', alignItems: 'center' }}><Brand compact={compact} /></Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.08)' }} />
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.25, scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {navigation.map((group) => (
          <Box key={group.section} sx={{ mb: 1 }}>
            {!compact && <Typography sx={{ px: 2.25, py: .9, color: 'rgba(255,255,255,.38)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em' }}>{group.section}</Typography>}
            <List disablePadding>{group.items.map(({ label, path, icon: Icon }) => (
              <Tooltip key={path} title={compact ? label : ''} placement="right">
                <ListItemButton component={NavLink} to={path} onClick={onSelect} sx={{ mx: 1, mb: .2, minHeight: 42, px: compact ? 2 : 1.4, borderRadius: 1.25, color: 'rgba(255,255,255,.62)', position: 'relative', '&.active': { bgcolor: 'sidebar.active', color: 'common.white', '&::before': { content: '""', position: 'absolute', left: -8, width: 3, height: 24, borderRadius: '0 3px 3px 0', bgcolor: 'primary.main' }, '& .MuiListItemIcon-root': { color: 'primary.light' } }, '&:hover': { bgcolor: 'sidebar.hover', color: 'common.white' } }}>
                  <ListItemIcon sx={{ minWidth: compact ? 0 : 36, color: 'inherit' }}><Icon fontSize="small" /></ListItemIcon>{!compact && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: 550 }} />}
                </ListItemButton>
              </Tooltip>
            ))}</List>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 1, borderTop: '1px solid rgba(255,255,255,.08)' }}><Button fullWidth color="inherit" onClick={onLogout} disabled={loggingOut} startIcon={!compact && <LogoutRoundedIcon />} sx={{ justifyContent: compact ? 'center' : 'flex-start', color: 'rgba(255,255,255,.7)' }}>{compact ? <LogoutRoundedIcon /> : loggingOut ? 'Logging out…' : 'Logout'}</Button></Box>
    </Stack>
  )
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [message, setMessage] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const desktopWidth = collapsed ? collapsedWidth : expandedWidth
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const current = navigation.flatMap((group) => group.items).find((item) => item.path === location.pathname)

  const handleLogout = async () => { setLoggingOut(true); try { await logOut(); navigate('/', { replace: true }) } catch (error) { setMessage(getAuthErrorMessage(error)); setLoggingOut(false) } }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: expandedWidth, bgcolor: 'sidebar.main', border: 0 } }}><Navigation onSelect={() => setMobileOpen(false)} onLogout={handleLogout} loggingOut={loggingOut} /></Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', lg: 'block' }, width: desktopWidth, flexShrink: 0, transition: 'width .2s', '& .MuiDrawer-paper': { width: desktopWidth, bgcolor: 'sidebar.main', border: 0, transition: 'width .2s', overflowX: 'hidden' } }}><Navigation compact={collapsed} onLogout={handleLogout} loggingOut={loggingOut} /></Drawer>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} color="inherit" sx={{ bgcolor: { xs: 'sidebar.main', lg: 'rgba(255,255,255,.97)' }, borderBottom: '1px solid', borderColor: { xs: 'transparent', lg: 'divider' }, color: { xs: 'common.white', lg: 'text.primary' } }}>
          <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, sm: 3 } }}>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { lg: 'none' }, mr: 1 }} aria-label="Open navigation"><MenuRoundedIcon /></IconButton>
            <IconButton onClick={() => setCollapsed((value) => !value)} sx={{ display: { xs: 'none', lg: 'inline-flex' }, mr: 1 }} aria-label="Toggle sidebar"><ChevronLeftRoundedIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} /></IconButton>
            <Box sx={{ display: { xs: 'block', lg: 'none' }, flex: 1 }}><Brand /></Box>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, flex: 1 }}><Typography variant="caption" color="text.secondary">{current?.path.startsWith('/masters') ? 'Masters' : current?.path.startsWith('/imports') ? 'Imports' : current?.path.startsWith('/reports') ? 'Reports' : 'Workforce'}</Typography><Typography fontWeight={700}>{current?.label || 'Dashboard'}</Typography></Box>
            <TextField size="small" placeholder="Search Excelocom…" sx={{ width: 240, display: { xs: 'none', md: 'block' }, mr: 1.5 }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }} />
            <Tooltip title="Help"><IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}><HelpOutlineRoundedIcon /></IconButton></Tooltip>
            <Tooltip title="Notifications"><IconButton color="inherit"><Badge variant="dot" color="primary"><NotificationsNoneRoundedIcon /></Badge></IconButton></Tooltip>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 13, fontWeight: 700 }}>{initials}</Avatar><Typography fontWeight={600} fontSize={14} sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 130 }} noWrap>{displayName}</Typography></Stack>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, sm: 3, xl: 4 }, maxWidth: 1600, mx: 'auto', minWidth: 0 }}><Outlet /></Box>
      </Box>
      <AuthAlert message={message} onClose={() => setMessage('')} />
    </Box>
  )
}

export default AppLayout

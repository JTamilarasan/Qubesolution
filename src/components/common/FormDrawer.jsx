import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Box, Button, Dialog, Divider, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'

function FormDrawer({ open, onClose, title, subtitle, children, onSubmit, saving, submitLabel = 'Save', width = 480, mobileFullScreen = false }) {
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dialogWidth = width > 600 ? 760 : 480

  return <Dialog open={open} onClose={saving ? undefined : onClose} fullScreen={mobile && mobileFullScreen} maxWidth={false}
    slotProps={{ backdrop: { sx: { bgcolor: 'rgba(17, 24, 39, .46)' } }, paper: { component: 'form', onSubmit, sx: {
      width: mobile && !mobileFullScreen ? 'calc(100vw - 24px)' : `min(${dialogWidth}px, calc(100vw - 32px))`,
      maxWidth: mobile && !mobileFullScreen ? 'calc(100vw - 24px)' : `min(${dialogWidth}px, calc(100vw - 32px))`,
      maxHeight: mobileFullScreen && mobile ? '100%' : 'calc(100% - 48px)', m: mobile && !mobileFullScreen ? 1.5 : undefined,
      borderRadius: mobileFullScreen && mobile ? 0 : '14px', bgcolor: 'background.paper', boxShadow: '0 24px 70px rgba(17, 24, 39, .22)', overflow: 'hidden',
    } } }}>
    <Stack sx={{ minHeight: 0, maxHeight: 'inherit' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} sx={{ px: '22px', pt: '20px', pb: '16px', flex: '0 0 auto' }}>
        <Stack direction="row" gap={1.5} alignItems="stretch" sx={{ minWidth: 0 }}>
          <Box sx={{ width: 3, minHeight: 40, borderRadius: 999, bgcolor: 'primary.main', flex: '0 0 auto' }} />
          <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: 20, lineHeight: 1.25, fontWeight: 700, color: 'secondary.main' }}>{title}</Typography>{subtitle && <Typography sx={{ mt: '3px', fontSize: 13, color: 'text.secondary', lineHeight: 1.4 }}>{subtitle}</Typography>}</Box>
        </Stack>
        <IconButton disabled={saving} onClick={onClose} aria-label="Close dialog" sx={{ width: 36, height: 36, flex: '0 0 auto', color: 'text.secondary', '&:hover': { bgcolor: '#F3F4F6' } }}><CloseRoundedIcon sx={{ fontSize: 20 }} /></IconButton>
      </Stack>
      <Divider />
      <Box sx={{ p: '22px', flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</Box>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" gap="12px" sx={{ flex: '0 0 auto', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', px: '22px', pt: '16px', pb: '20px' }}>
        <Button variant="outlined" color="secondary" onClick={onClose} disabled={saving} sx={{ height: 40, minWidth: 84 }}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving} sx={{ height: 40, px: '18px' }}>{saving ? 'Saving…' : submitLabel}</Button>
      </Stack>
    </Stack>
  </Dialog>
}

export default FormDrawer

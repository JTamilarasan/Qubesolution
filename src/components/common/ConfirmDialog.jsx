import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

function ConfirmDialog({ open, title, description, onCancel, onConfirm, busy }) {
  return <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth={false} slotProps={{ paper: { sx: { width: 'min(420px, calc(100vw - 24px))', m: 1.5 } } }}>
    <DialogTitle sx={{ px: '22px', pt: '20px', pb: 1, color: 'secondary.main', fontSize: 20, fontWeight: 700 }}>{title}</DialogTitle>
    <DialogContent sx={{ px: '22px', py: 1.5 }}><DialogContentText sx={{ fontSize: 14, lineHeight: 1.55 }}>{description}</DialogContentText></DialogContent>
    <DialogActions sx={{ gap: '12px', px: '22px', pt: '16px', pb: '20px', borderTop: '1px solid', borderColor: 'divider' }}>
      <Button variant="outlined" color="secondary" onClick={onCancel} disabled={busy} sx={{ minWidth: 84 }}>Cancel</Button>
      <Button variant="contained" color="error" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</Button>
    </DialogActions>
  </Dialog>
}
export default ConfirmDialog

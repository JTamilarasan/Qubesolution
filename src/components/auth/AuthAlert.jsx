import { Alert, Snackbar } from '@mui/material'

function AuthAlert({ message, severity = 'error', onClose }) {
  return (
    <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>{message}</Alert>
    </Snackbar>
  )
}

export default AuthAlert

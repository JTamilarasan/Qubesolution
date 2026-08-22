import { useState } from 'react'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { Button, InputAdornment, Link, Stack, TextField } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AuthAlert from '../../components/auth/AuthAlert'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthLayout from '../../components/auth/AuthLayout'
import { getAuthErrorMessage, sendResetEmail } from '../../services/authService'
import { validateEmail } from '../../utils/formValidation'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('success')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const emailError = validateEmail(email)
    setError(emailError)
    if (emailError) return
    setSubmitting(true)
    setMessage('')
    try {
      await sendResetEmail(email.trim())
      setSeverity('success')
      setMessage('Password reset link has been sent to your email address.')
    } catch (requestError) {
      setSeverity('error')
      setMessage(getAuthErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader title="Reset your password" description="Enter your registered Excelacom email address and we'll send you a reset link." />
      <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2.25} sx={{ mt: 4 }}>
        <TextField
          fullWidth label="Email Address" name="email" type="email" autoComplete="email" autoFocus
          value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} error={Boolean(error)} helperText={error}
          slotProps={{ inputLabel: { sx: { fontSize: 13, fontWeight: 500 } }, input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" /></InputAdornment> } }}
        />
        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ minHeight: 48 }}>
          {submitting ? 'Sending reset link…' : 'Send reset link'}
        </Button>
        <Link component={RouterLink} to="/" underline="hover" textAlign="center" fontWeight={600}>Back to sign in</Link>
      </Stack>
      <AuthAlert message={message} severity={severity} onClose={() => setMessage('')} />
    </AuthLayout>
  )
}

export default ForgotPasswordPage

import { useState } from 'react'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { Box, Button, Checkbox, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import AuthAlert from '../../components/auth/AuthAlert'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthLayout from '../../components/auth/AuthLayout'
import PasswordField from '../../components/auth/PasswordField'
import { getAuthErrorMessage, signIn } from '../../services/authService'
import { validateEmail, validatePassword } from '../../utils/formValidation'

function SignInPage() {
  const [values, setValues] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const updateValue = (event) => {
    const { name, value, checked, type } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = { email: validateEmail(values.email), password: validatePassword(values.password) }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    setMessage('')
    try {
      await signIn(values.email.trim(), values.password, values.rememberMe)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      setMessage(getAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader title="Welcome back" description="Sign in to continue to Excelacom." />
      <Stack component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3.5 }}>
        <TextField
          fullWidth label="Work Email" name="email" type="email" autoComplete="email"
          value={values.email} onChange={updateValue} error={Boolean(errors.email)} helperText={errors.email}
          slotProps={{ inputLabel: { sx: { fontSize: 13, fontWeight: 500 } }, input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" /></InputAdornment> } }}
        />
        <PasswordField sx={{ mt: 2 }} value={values.password} onChange={updateValue} error={Boolean(errors.password)} helperText={errors.password} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5} sx={{ width: '100%', mt: 1, mb: 3.25, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Box component="label" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}>
            <Checkbox size="small" name="rememberMe" checked={values.rememberMe} onChange={updateValue} sx={{ p: .75, mr: .25 }} />
            <Typography component="span" sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>Remember me</Typography>
          </Box>
          <Link component={RouterLink} to="/forgot-password" underline="none" sx={{ ml: 'auto', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 500, color: 'primary.main', '&:hover': { color: 'primary.dark' } }}>Forgot password?</Link>
        </Stack>
        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ height: 52, borderRadius: 1.25, fontSize: 15, fontWeight: 600 }}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <Stack direction="row" alignItems="center" justifyContent="center" gap={.75} flexWrap="wrap" sx={{ mt: 2.25 }}>
          <Typography component="span" color="text.secondary" sx={{ fontSize: 14 }}>New to Excelacom?</Typography>
          <Link component={RouterLink} to="/signup" underline="none" sx={{ fontSize: 14, fontWeight: 600, color: 'primary.main', '&:hover': { color: 'primary.dark' } }}>Create account</Link>
        </Stack>
      </Stack>
      <AuthAlert message={message} onClose={() => setMessage('')} />
    </AuthLayout>
  )
}

export default SignInPage

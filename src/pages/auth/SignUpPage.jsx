import { useState } from 'react'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { Button, InputAdornment, Link, Stack, TextField } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import AuthAlert from '../../components/auth/AuthAlert'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthLayout from '../../components/auth/AuthLayout'
import PasswordField from '../../components/auth/PasswordField'
import { getAuthErrorMessage, registerUser } from '../../services/authService'
import { validateEmail, validatePassword } from '../../utils/formValidation'

function SignUpPage() {
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
    setErrors((current) => ({ ...current, [event.target.name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {
      fullName: values.fullName.trim() ? '' : 'Full name is required.',
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: !values.confirmPassword ? 'Confirm password is required.' : values.confirmPassword !== values.password ? 'Passwords do not match.' : '',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    setMessage('')
    try {
      await registerUser(values.fullName.trim(), values.email.trim(), values.password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setMessage(getAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader title="Create your Excelacom account" description="Set up your account to access workforce operations." />
      <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2} sx={{ mt: 3.5 }}>
        <TextField
          fullWidth label="Full Name" name="fullName" autoComplete="name" value={values.fullName} onChange={updateValue}
          error={Boolean(errors.fullName)} helperText={errors.fullName}
          slotProps={{ inputLabel: { sx: { fontSize: 13, fontWeight: 500 } }, input: { startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon fontSize="small" /></InputAdornment> } }}
        />
        <TextField
          fullWidth label="Email Address" name="email" type="email" autoComplete="email" value={values.email} onChange={updateValue}
          error={Boolean(errors.email)} helperText={errors.email}
          slotProps={{ inputLabel: { sx: { fontSize: 13, fontWeight: 500 } }, input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" /></InputAdornment> } }}
        />
        <PasswordField name="newPassword" label="Password" value={values.password} onChange={(event) => updateValue({ target: { name: 'password', value: event.target.value } })} error={Boolean(errors.password)} helperText={errors.password} />
        <PasswordField name="confirmPassword" label="Confirm Password" value={values.confirmPassword} onChange={updateValue} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword} />
        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ minHeight: 48 }}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </Button>
        <Stack direction="row" justifyContent="center" spacing={0.75} flexWrap="wrap">
          <span>Already have an account?</span>
          <Link component={RouterLink} to="/" underline="hover" fontWeight={700}>Sign in</Link>
        </Stack>
      </Stack>
      <AuthAlert message={message} onClose={() => setMessage('')} />
    </AuthLayout>
  )
}

export default SignUpPage

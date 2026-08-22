import { useState } from 'react'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material'

function PasswordField({ label = 'Password', name = 'password', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      fullWidth
      label={label}
      name={name}
      type={visible ? 'text' : 'password'}
      autoComplete={name === 'password' ? 'current-password' : 'new-password'}
      slotProps={{
        inputLabel: { sx: { fontSize: 13, fontWeight: 500 } },
        input: {
          startAdornment: (
            <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={visible ? 'Hide password' : 'Show password'}>
                <IconButton
                  edge="end"
                  onClick={() => setVisible((current) => !current)}
                  aria-label={visible ? 'Hide password' : 'Show password'}
                >
                  {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

export default PasswordField

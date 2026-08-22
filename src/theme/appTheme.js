import { alpha, createTheme } from '@mui/material/styles'

export const designTokens = {
  navy: '#111827',
  deepNavy: '#172033',
  orange: '#F59E0B',
  lightOrange: '#FDBA74',
  softOrange: '#FFF7ED',
  page: '#F8F7F4',
  paper: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
}

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { 50: designTokens.softOrange, main: designTokens.orange, light: designTokens.lightOrange, dark: '#D97706', contrastText: designTokens.navy },
    secondary: { main: designTokens.deepNavy, contrastText: '#FFFFFF' },
    background: { default: designTokens.page, paper: designTokens.paper },
    text: { primary: designTokens.text, secondary: designTokens.muted },
    divider: designTokens.border,
    sidebar: { main: designTokens.navy, hover: '#1F2937', active: '#263244' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontWeight: 750, letterSpacing: '-0.035em' },
    h2: { fontWeight: 750, letterSpacing: '-0.03em' },
    h3: { fontWeight: 750, letterSpacing: '-0.025em' },
    h4: { fontWeight: 750, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: 40, minHeight: 40, borderRadius: 8, padding: '0 16px',
          boxShadow: 'none', fontSize: 14, fontWeight: 600, lineHeight: 1.25, textTransform: 'none',
          '& .MuiButton-startIcon': { marginRight: 7, '& > :nth-of-type(1)': { fontSize: 18 } },
          '@media (max-width:600px)': { height: 44, minHeight: 44 },
        },
        containedPrimary: {
          '&:hover': { backgroundColor: '#D97706', boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderColor: designTokens.border, boxShadow: '0 8px 28px rgba(17, 24, 39, 0.05)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 9,
          fontSize: 14,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: designTokens.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C7CAD1' },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(designTokens.orange, 0.14)}` },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: designTokens.orange },
        },
        input: { padding: '12.5px 14px' },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 14, fontWeight: 500 } } },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 14, overflow: 'hidden' } } },
    MuiCheckbox: {
      styleOverrides: { root: { '&.Mui-checked': { color: designTokens.orange } } },
    },
    MuiLink: {
      defaultProps: { color: 'primary.dark' },
    },
    MuiTableHead: {
      styleOverrides: { root: { backgroundColor: '#FAF9F6' } },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&.MuiTableRow-hover:hover': { backgroundColor: designTokens.softOrange } } },
    },
  },
})

import { useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { Alert, Button, Card, IconButton, Menu, MenuItem, Snackbar, Stack, TableCell, TableRow, TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ContentState from '../../components/common/ContentState'
import FormDrawer from '../../components/common/FormDrawer'
import FormSection from '../../components/common/FormSection'
import PageHeader from '../../components/common/PageHeader'
import PaginatedTable from '../../components/common/PaginatedTable'
import StatusChip from '../../components/common/StatusChip'
import { useCollection } from '../../hooks/useCollection'
import { createRecord, deleteRecord, updateRecord } from '../../services/firestoreService'
import { formatDate } from '../../utils/formatters'

const blank = { name: '', categoryDocumentId: '', categoryName: '', groupName: '', status: 'Active' }
const readOnlySx = { '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }
function LedgerMasterPage() {
  const categories = useCollection('ledgerCategories'), ledgers = useCollection('ledgers'), navigate = useNavigate()
  const [form, setForm] = useState(blank), [editing, setEditing] = useState(null), [open, setOpen] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [anchor, setAnchor] = useState(null), [selected, setSelected] = useState(null)
  const activeCategories = categories.data.filter((item) => String(item.status).toLowerCase() === 'active')
  const start = (item = null) => { if (!item && !activeCategories.length) { setNotice('Create a Ledger Category before creating a Ledger.'); return } setEditing(item); setForm(item ? { ...blank, ...item } : blank); setError(''); setOpen(true); setAnchor(null); setSelected(null) }
  const selectCategory = (id) => { const category = categories.data.find((item) => item.id === id); setForm((value) => ({ ...value, categoryDocumentId: category?.id || '', categoryName: category?.name || '', groupName: category?.groupName || '' })) }
  const save = async (event) => { event.preventDefault(); const name = form.name.trim(), category = categories.data.find((item) => item.id === form.categoryDocumentId); if (!name || !category) return setError('Name and Category are required.'); if (ledgers.data.some((item) => item.id !== editing?.id && item.name.toLowerCase() === name.toLowerCase())) return setError('Ledger Name already exists.'); setSaving(true); try { const payload = { name, categoryDocumentId: category.id, categoryName: category.name, groupName: category.groupName, status: form.status }; if (editing) await updateRecord('ledgers', editing.id, payload); else await createRecord('ledgers', payload); setOpen(false); setNotice(editing ? 'Ledger updated.' : 'Ledger created.') } catch (requestError) { setError(requestError.message) } finally { setSaving(false) } }
  const remove = async () => { setSaving(true); try { await deleteRecord('ledgers', selected.id); setSelected(null); setNotice('Ledger deleted.') } catch (requestError) { setNotice(requestError.message) } finally { setSaving(false) } }
  return <Stack spacing={3}><PageHeader section="Masters / Ledger Master" title="Ledger Master" description="Manage ledgers and their category relationships." primaryLabel="New Ledger" primaryIcon={<AddRoundedIcon />} onPrimary={() => start()} />
    {!activeCategories.length && !categories.loading && <Alert severity="warning" action={<Button color="inherit" onClick={() => navigate('/masters/ledger-categories')}>Create Category</Button>}>Create a Ledger Category before creating a Ledger.</Alert>}
    <Card variant="outlined">{ledgers.loading || ledgers.error || !ledgers.data.length ? <ContentState loading={ledgers.loading} error={ledgers.error} title="No ledgers created yet" description="Create a ledger after creating a ledger category." /> : <PaginatedTable columns={[{ label: 'Name' }, { label: 'Category' }, { label: 'Group Name' }, { label: 'Status' }, { label: 'Created On' }, { label: 'Actions', align: 'right' }]} rows={ledgers.data} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.name}</TableCell><TableCell>{item.categoryName}</TableCell><TableCell>{item.groupName}</TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell><TableCell align="right"><IconButton onClick={(event) => { setAnchor(event.currentTarget); setSelected(item) }}><MoreVertRoundedIcon /></IconButton></TableCell></TableRow>} />}</Card>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => { setAnchor(null); setSelected(null) }}><MenuItem onClick={() => start(selected)}>Edit</MenuItem><MenuItem sx={{ color: 'error.main' }} onClick={() => setAnchor(null)}>Delete</MenuItem></Menu>
    <FormDrawer open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Ledger' : 'New Ledger'} subtitle="Ledger master information" onSubmit={save} saving={saving} submitLabel={editing ? 'Update Ledger' : 'Create Ledger'}>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<FormSection title="Ledger Information"><TextField required label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><TextField select required label="Category" value={form.categoryDocumentId} onChange={(event) => selectCategory(event.target.value)}>{categories.data.filter((item) => item.id === form.categoryDocumentId || String(item.status).toLowerCase() === 'active').map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField><TextField label="Group Name" value={form.groupName} sx={readOnlySx} slotProps={{ input: { readOnly: true } }} /><TextField select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></FormSection></FormDrawer>
    <ConfirmDialog open={Boolean(selected && !anchor)} title="Delete Ledger?" description="Are you sure you want to delete this ledger?" onCancel={() => setSelected(null)} onConfirm={remove} busy={saving} /><Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info">{notice}</Alert></Snackbar>
  </Stack>
}
export default LedgerMasterPage

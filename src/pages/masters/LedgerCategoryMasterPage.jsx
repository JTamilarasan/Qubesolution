import { useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { Alert, Card, IconButton, Menu, MenuItem, Snackbar, Stack, TableCell, TableRow, TextField } from '@mui/material'
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

const blank = { name: '', groupName: '', status: 'Active' }
function LedgerCategoryMasterPage() {
  const categories = useCollection('ledgerCategories'), ledgers = useCollection('ledgers')
  const [form, setForm] = useState(blank), [editing, setEditing] = useState(null), [open, setOpen] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [anchor, setAnchor] = useState(null), [selected, setSelected] = useState(null)
  const start = (item = null) => { setEditing(item); setForm(item ? { ...blank, ...item } : blank); setError(''); setOpen(true); setAnchor(null); setSelected(null) }
  const save = async (event) => { event.preventDefault(); const name = form.name.trim(); if (!name || !form.groupName) return setError('Name and Group Name are required.'); if (categories.data.some((item) => item.id !== editing?.id && item.name.toLowerCase() === name.toLowerCase())) return setError('Ledger Category Name already exists.'); setSaving(true); try { const payload = { name, groupName: form.groupName, status: form.status }; if (editing) { await updateRecord('ledgerCategories', editing.id, payload); await Promise.all(ledgers.data.filter((item) => item.categoryDocumentId === editing.id).map((item) => updateRecord('ledgers', item.id, { categoryName: name, groupName: form.groupName }))) } else await createRecord('ledgerCategories', payload); setOpen(false); setNotice(editing ? 'Ledger category updated.' : 'Ledger category created.') } catch (requestError) { setError(requestError.message) } finally { setSaving(false) } }
  const remove = async () => { if (ledgers.data.some((item) => item.categoryDocumentId === selected.id)) { setNotice('This ledger category is currently used by one or more ledgers.'); setSelected(null); return } setSaving(true); try { await deleteRecord('ledgerCategories', selected.id); setSelected(null); setNotice('Ledger category deleted.') } catch (requestError) { setNotice(requestError.message) } finally { setSaving(false) } }
  return <Stack spacing={3}><PageHeader section="Masters / Ledger Category" title="Ledger Category" description="Manage ledger categories and financial groups." primaryLabel="New Ledger Category" primaryIcon={<AddRoundedIcon />} onPrimary={() => start()} />
    <Card variant="outlined">{categories.loading || categories.error || !categories.data.length ? <ContentState loading={categories.loading} error={categories.error} title="No ledger categories" description="Create a ledger category before creating ledgers." /> : <PaginatedTable columns={[{ label: 'Name' }, { label: 'Group Name' }, { label: 'Status' }, { label: 'Created On' }, { label: 'Actions', align: 'right' }]} rows={categories.data} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.name}</TableCell><TableCell>{item.groupName}</TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell><TableCell align="right"><IconButton onClick={(event) => { setAnchor(event.currentTarget); setSelected(item) }}><MoreVertRoundedIcon /></IconButton></TableCell></TableRow>} />}</Card>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => { setAnchor(null); setSelected(null) }}><MenuItem onClick={() => start(selected)}>Edit</MenuItem><MenuItem sx={{ color: 'error.main' }} onClick={() => setAnchor(null)}>Delete</MenuItem></Menu>
    <FormDrawer open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Ledger Category' : 'New Ledger Category'} subtitle="Maintain a reusable ledger category" onSubmit={save} saving={saving} submitLabel={editing ? 'Update Category' : 'Create Category'}>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<FormSection title="Ledger Category Information"><TextField required label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><TextField select required label="Group Name" value={form.groupName} onChange={(event) => setForm({ ...form, groupName: event.target.value })}><MenuItem value="Revenue">Revenue</MenuItem><MenuItem value="Direct Cost">Direct Cost</MenuItem><MenuItem value="Indirect Cost">Indirect Cost</MenuItem></TextField><TextField select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></FormSection></FormDrawer>
    <ConfirmDialog open={Boolean(selected && !anchor)} title="Delete Ledger Category?" description="Are you sure you want to delete this ledger category?" onCancel={() => setSelected(null)} onConfirm={remove} busy={saving} /><Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info">{notice}</Alert></Snackbar>
  </Stack>
}
export default LedgerCategoryMasterPage

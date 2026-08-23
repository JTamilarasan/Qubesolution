import { useMemo, useState } from 'react'
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

function ProjectCategoryMasterPage() {
  const categories = useCollection('projectCategories'), projects = useCollection('projects'), subs = useCollection('subProjects'), employees = useCollection('employees')
  const [form, setForm] = useState({ name: '', status: 'Active' }), [editing, setEditing] = useState(null), [open, setOpen] = useState(false), [saving, setSaving] = useState(false)
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [anchor, setAnchor] = useState(null), [selected, setSelected] = useState(null)
  const sorted = useMemo(() => [...categories.data].sort((a, b) => a.name.localeCompare(b.name)), [categories.data])
  const start = (item = null) => { setEditing(item); setForm(item ? { name: item.name, status: item.status || 'Active' } : { name: '', status: 'Active' }); setError(''); setOpen(true); setAnchor(null); setSelected(null) }
  const save = async (event) => { event.preventDefault(); const name = form.name.trim(); if (!name) return setError('Category Name is required.'); if (categories.data.some((item) => item.id !== editing?.id && item.name.toLowerCase() === name.toLowerCase())) return setError('Category Name already exists.'); setSaving(true); try { const payload = { name, status: form.status }; if (editing) { await updateRecord('projectCategories', editing.id, payload); const children = projects.data.filter((item) => item.projectCategoryId === editing.id); await Promise.all([...children.map((item) => updateRecord('projects', item.id, { projectCategoryName: name })), ...subs.data.filter((item) => item.projectCategoryId === editing.id).map((item) => updateRecord('subProjects', item.id, { projectCategoryName: name })), ...employees.data.filter((item) => item.projectCategoryId === editing.id).map((item) => updateRecord('employees', item.id, { projectCategoryName: name }))]) } else await createRecord('projectCategories', payload); setOpen(false); setNotice(editing ? 'Project category updated.' : 'Project category created.') } catch (requestError) { setError(requestError.message) } finally { setSaving(false) } }
  const remove = async () => { if (projects.data.some((item) => item.projectCategoryId === selected.id)) { setNotice('This category is currently used by one or more projects.'); setSelected(null); return } setSaving(true); try { await deleteRecord('projectCategories', selected.id); setSelected(null); setNotice('Project category deleted.') } catch (requestError) { setNotice(requestError.message) } finally { setSaving(false) } }
  return <Stack spacing={3}><PageHeader section="Masters / Project Category" title="Project Category" description="Manage project categories used across projects." primaryLabel="New Category" primaryIcon={<AddRoundedIcon />} onPrimary={() => start()} />
    <Card variant="outlined">{categories.loading || categories.error || !sorted.length ? <ContentState loading={categories.loading} error={categories.error} title="No project categories" description="Create the first category to begin setting up projects." actionLabel="Create Category" onAction={() => start()} /> : <PaginatedTable columns={[{ label: 'Category Name' }, { label: 'Status' }, { label: 'Created On' }, { label: 'Actions', align: 'right' }]} rows={sorted} renderRow={(item) => <TableRow hover key={item.id}><TableCell>{item.name}</TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell><TableCell align="right"><IconButton onClick={(event) => { setAnchor(event.currentTarget); setSelected(item) }}><MoreVertRoundedIcon /></IconButton></TableCell></TableRow>} />}</Card>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => { setAnchor(null); setSelected(null) }}><MenuItem onClick={() => start(selected)}>Edit</MenuItem><MenuItem sx={{ color: 'error.main' }} onClick={() => setAnchor(null)}>Delete</MenuItem></Menu>
    <FormDrawer open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Project Category' : 'New Project Category'} subtitle="Maintain a reusable project category" onSubmit={save} saving={saving} submitLabel={editing ? 'Update Category' : 'Create Category'}>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<FormSection title="Category Information"><TextField required label="Category Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><TextField select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></FormSection></FormDrawer>
    <ConfirmDialog open={Boolean(selected && !anchor)} title="Delete Project Category?" description="Are you sure you want to delete this project category?" onCancel={() => setSelected(null)} onConfirm={remove} busy={saving} /><Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info">{notice}</Alert></Snackbar>
  </Stack>
}
export default ProjectCategoryMasterPage

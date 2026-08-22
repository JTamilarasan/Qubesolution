import { useMemo, useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Card, IconButton, InputAdornment, Menu, MenuItem, Snackbar, Alert, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ContentState from '../../components/common/ContentState'
import FormDrawer from '../../components/common/FormDrawer'
import FormSection from '../../components/common/FormSection'
import PageHeader from '../../components/common/PageHeader'
import StatusChip from '../../components/common/StatusChip'
import { useCollection } from '../../hooks/useCollection'
import { createRecord, deleteRecord, updateRecord } from '../../services/firestoreService'
import { formatDate } from '../../utils/formatters'

const blank = { projectId: '', projectName: '', status: 'active' }

function ProjectMasterPage() {
  const projects = useCollection('projects'), subProjects = useCollection('subProjects'), employees = useCollection('employees')
  const [search, setSearch] = useState(''), [form, setForm] = useState(blank), [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [anchor, setAnchor] = useState(null), [selected, setSelected] = useState(null), [deleting, setDeleting] = useState(false)
  const filtered = useMemo(() => projects.data.filter((item) => `${item.projectId} ${item.projectName}`.toLowerCase().includes(search.toLowerCase())), [projects.data, search])
  const startCreate = () => { setForm(blank); setEditing(null); setError(''); setOpen(true) }
  const startEdit = (item) => { setForm({ projectId: item.projectId, projectName: item.projectName, status: item.status || 'active' }); setEditing(item); setError(''); setOpen(true); setAnchor(null); setSelected(null) }
  const save = async (event) => { event.preventDefault(); setError(''); if (!form.projectId.trim() || !form.projectName.trim()) return setError('Project ID and Project Name are required.'); if (projects.data.some((item) => item.id !== editing?.id && String(item.projectId).toLowerCase() === form.projectId.trim().toLowerCase())) return setError('Project ID already exists.'); setSaving(true); try { const payload = { projectId: form.projectId.trim(), projectName: form.projectName.trim(), status: form.status }; if (editing) await updateRecord('projects', editing.id, payload); else await createRecord('projects', payload); setOpen(false); setNotice(editing ? 'Project updated successfully.' : 'Project created successfully.') } catch (requestError) { setError(requestError.message) } finally { setSaving(false) } }
  const remove = async () => { const mapped = subProjects.data.some((item) => item.projectId === selected.projectId) || employees.data.some((item) => item.projectId === selected.projectId); if (mapped) { setNotice('Remove mapped sub-projects and employees before deleting this project.'); setSelected(null); return } setDeleting(true); try { await deleteRecord('projects', selected.id); setNotice('Project deleted.'); setSelected(null) } catch (requestError) { setNotice(requestError.message) } finally { setDeleting(false) } }

  return <Stack spacing={3}><PageHeader section="Masters / Project Master" title="Project Master" description="Manage projects used for employee allocation." primaryLabel="New Project" primaryIcon={<AddRoundedIcon />} onPrimary={startCreate} />
    <Card variant="outlined"><Box sx={{ p: 2 }}><TextField size="small" placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ width: { xs: '100%', sm: 330 }, '& .MuiOutlinedInput-root': { height: 44 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }} /></Box>
      {projects.loading || projects.error || !filtered.length ? <ContentState loading={projects.loading} error={projects.error} title="No projects created yet" description="Create your first project to begin workforce allocation." actionLabel="Create Project" onAction={startCreate} /> : <TableContainer><Table><TableHead><TableRow><TableCell>Project ID</TableCell><TableCell>Project Name</TableCell><TableCell>Sub Projects</TableCell><TableCell>Employees</TableCell><TableCell>Status</TableCell><TableCell>Updated</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{filtered.map((item) => <TableRow hover key={item.id}><TableCell>{item.projectId}</TableCell><TableCell>{item.projectName}</TableCell><TableCell>{subProjects.data.filter((sub) => sub.projectId === item.projectId).length}</TableCell><TableCell>{employees.data.filter((employee) => employee.projectId === item.projectId).length}</TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell>{formatDate(item.updatedAt)}</TableCell><TableCell align="right"><IconButton aria-label={`Actions for ${item.projectName}`} onClick={(event) => { setAnchor(event.currentTarget); setSelected(item) }}><MoreVertRoundedIcon /></IconButton></TableCell></TableRow>)}</TableBody></Table></TableContainer>}
    </Card>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => { setAnchor(null); setSelected(null) }}><MenuItem onClick={() => startEdit(selected)}>Edit</MenuItem><MenuItem sx={{ color: 'error.main' }} onClick={() => setAnchor(null)}>Delete</MenuItem></Menu>
    <FormDrawer open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Project' : 'New Project'} subtitle={editing ? 'Update the selected project master record' : 'Create a new project master record'} onSubmit={save} saving={saving} submitLabel={editing ? 'Update Project' : 'Create Project'} width={560}>{error && <Alert severity="error" variant="outlined" sx={{ mb: 2.5 }}>{error}</Alert>}<FormSection title="Project Information"><TextField required label="Project ID" value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })} /><TextField required label="Project Name" value={form.projectName} onChange={(event) => setForm({ ...form, projectName: event.target.value })} /><TextField select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></TextField></FormSection></FormDrawer>
    <ConfirmDialog open={Boolean(selected && !anchor)} title="Delete project?" description={`Delete ${selected?.projectName || 'this project'}? This cannot be undone.`} onCancel={() => setSelected(null)} onConfirm={remove} busy={deleting} />
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="info" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
  </Stack>
}

export default ProjectMasterPage

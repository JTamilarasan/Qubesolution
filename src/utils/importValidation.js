const clean = (value) => String(value ?? '').trim()
const valueFrom = (row, names) => { const key = Object.keys(row).find((item) => names.some((name) => item.trim().toLowerCase() === name.toLowerCase())); return key ? row[key] : '' }
export function normalizeEmployeeRow(row) {
  return { company: clean(valueFrom(row, ['Company'])), employeeId: clean(valueFrom(row, ['Employee ID', 'EmployeeId', 'Emp ID'])), employeeName: clean(valueFrom(row, ['Employee Name', 'EmployeeName', 'Emp Name'])), subProjectId: clean(valueFrom(row, ['Sub-Proj ID', 'Sub Project ID'])), subProjectName: clean(valueFrom(row, ['Sub-Proj Name', 'Sub Project Name'])), budgeted: clean(valueFrom(row, ['Budgeted'])), dateOfJoining: valueFrom(row, ['Date of Joining', 'DOJ']), excelacomExperience: clean(valueFrom(row, ['Excelacom Experience', 'Experience'])), finalCustomer: clean(valueFrom(row, ['Final Customer'])), status: 'Active' }
}
export function validateEmployeeRows(rows, projects, subProjects, employees) {
  return rows.map((source, index) => {
    const row = normalizeEmployeeRow(source), errors = []
    const company = row.company.toLowerCase() === 'offshore' ? 'Offshore' : row.company.toLowerCase() === 'onshore' ? 'Onshore' : ''
    const budgeted = row.budgeted.toLowerCase().replace(/\s+/g, '-') === 'non-billable' ? 'Non-Billable' : row.budgeted.toLowerCase() === 'billable' ? 'Billable' : ''
    if (!company) errors.push('Company must be Onshore or Offshore.')
    if (!row.employeeId) errors.push('Employee ID is required.')
    if (!row.employeeName) errors.push('Employee Name is required.')
    if (!budgeted) errors.push('Budgeted must be Billable or Non-Billable.')
    if (!row.dateOfJoining) errors.push('Date of Joining is required.')
    const experience = Number(row.excelacomExperience || 0)
    if (!Number.isFinite(experience) || experience < 0) errors.push('Excelacom Experience must be a number greater than or equal to 0.')
    const sub = subProjects.find((item) => (row.subProjectId && String(item.subProjectId).toLowerCase() === row.subProjectId.toLowerCase()) || (row.subProjectName && clean(item.subProjectName).toLowerCase() === row.subProjectName.toLowerCase()))
    if (!sub) errors.push('Sub Project Name / ID does not match Sub Project Master.')
    const project = projects.find((item) => item.id === sub?.projectDocumentId) || projects.find((item) => item.projectId === sub?.projectId)
    if (sub && !project) errors.push('The matched Sub Project has no valid Main Project.')
    if (employees.some((item) => item.employeeId.toLowerCase() === row.employeeId.toLowerCase())) errors.push(`Employee ID ${row.employeeId} already exists.`)
    return { ...row, company, budgeted, excelacomExperience: experience, subProjectDocumentId: sub?.id || '', subProjectId: sub?.subProjectId || '', subProjectName: sub?.subProjectName || '', projectDocumentId: project?.id || '', projectId: project?.projectId || '', projectName: project?.projectName || '', projectCategoryId: project?.projectCategoryId || '', projectCategoryName: project?.projectCategoryName || '', rollOnDate: project?.rollOnDate || sub?.projectRollOnDate || '', rollOffDate: project?.rollOffDate || sub?.projectRollOffDate || '', rowNumber: index + 2, errors }
  }).map((row, _, all) => { const duplicate = all.filter((item) => item.employeeId && item.employeeId.toLowerCase() === row.employeeId.toLowerCase()).length > 1; return { ...row, duplicate, isValid: !row.errors.length && !duplicate, errors: duplicate ? [...row.errors, `Duplicate Employee ID ${row.employeeId} in uploaded file.`] : row.errors } })
}

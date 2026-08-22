const clean = (value) => String(value ?? '').trim()
const valueFrom = (row, names) => { const key = Object.keys(row).find((item) => names.some((name) => item.trim().toLowerCase() === name.toLowerCase())); return key ? row[key] : '' }

export function normalizeEmployeeRow(row) {
  return {
    employeeId: clean(valueFrom(row, ['Employee ID', 'EmployeeId'])), employeeName: clean(valueFrom(row, ['Employee Name', 'EmployeeName'])), email: clean(valueFrom(row, ['Email'])),
    projectId: clean(valueFrom(row, ['Proj ID', 'Project ID'])), projectName: clean(valueFrom(row, ['Project Name'])), subProjectId: clean(valueFrom(row, ['Sub-Proj ID', 'Sub Project ID'])), subProjectName: clean(valueFrom(row, ['Sub-Proj Name', 'Sub Project Name'])),
    budgeted: clean(valueFrom(row, ['Budgeted'])), rollOnDate: valueFrom(row, ['Roll On Date']), rollOffDate: valueFrom(row, ['Roll Off Date']), dateOfJoining: valueFrom(row, ['Date of Joining']), experience: clean(valueFrom(row, ['Experience'])), status: clean(valueFrom(row, ['Status'])) || 'active', exitDate: valueFrom(row, ['Exit Date']), finalCustomer: clean(valueFrom(row, ['Final Customer'])),
  }
}

export function validateEmployeeRows(rows, projects, subProjects, employees) {
  return rows.map((source, index) => {
    const row = normalizeEmployeeRow(source), errors = []
    if (!row.employeeId) errors.push('Employee ID is required.')
    if (!row.employeeName) errors.push('Employee Name is required.')
    if (!row.projectId) errors.push('Project ID is required.')
    const project = projects.find((item) => String(item.projectId) === row.projectId)
    if (row.projectId && !project) errors.push(`Project ID ${row.projectId} does not exist.`)
    else if (project && clean(project.projectName).toLowerCase() !== row.projectName.toLowerCase()) errors.push(`Project name mismatch. Expected: ${project.projectName}; Uploaded: ${row.projectName || '(blank)'}.`)
    const sub = subProjects.find((item) => String(item.subProjectId) === row.subProjectId)
    if (!row.subProjectId) errors.push('Sub Project ID is required.')
    else if (!sub) errors.push(`Sub Project ID ${row.subProjectId} does not exist.`)
    else {
      if (clean(sub.subProjectName).toLowerCase() !== row.subProjectName.toLowerCase()) errors.push(`Sub Project name mismatch. Expected: ${sub.subProjectName}; Uploaded: ${row.subProjectName || '(blank)'}.`)
      if (String(sub.projectId) !== row.projectId) errors.push(`Sub Project ${row.subProjectId} is not mapped to Project ${row.projectId}.`)
    }
    const duplicateExisting = employees.some((item) => String(item.employeeId).toLowerCase() === row.employeeId.toLowerCase())
    if (duplicateExisting) errors.push(`Employee ID ${row.employeeId} already exists.`)
    return { ...row, rowNumber: index + 2, errors, duplicateExisting }
  }).map((row, _, all) => ({ ...row, duplicate: row.duplicateExisting || all.filter((item) => item.employeeId && item.employeeId.toLowerCase() === row.employeeId.toLowerCase()).length > 1, isValid: !row.errors.length && all.filter((item) => item.employeeId && item.employeeId.toLowerCase() === row.employeeId.toLowerCase()).length === 1, errors: all.filter((item) => item.employeeId && item.employeeId.toLowerCase() === row.employeeId.toLowerCase()).length > 1 ? [...row.errors, `Duplicate Employee ID ${row.employeeId} in uploaded file.`] : row.errors }))
}

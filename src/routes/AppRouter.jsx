import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import SignInPage from '../pages/auth/SignInPage'
import SignUpPage from '../pages/auth/SignUpPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import EmployeeMasterPage from '../pages/masters/EmployeeMasterPage'
import ForecastMasterPage from '../pages/masters/ForecastMasterPage'
import ProjectMasterPage from '../pages/masters/ProjectMasterPage'
import ProjectCategoryMasterPage from '../pages/masters/ProjectCategoryMasterPage'
import LedgerCategoryMasterPage from '../pages/masters/LedgerCategoryMasterPage'
import LedgerMasterPage from '../pages/masters/LedgerMasterPage'
import SubProjectMasterPage from '../pages/masters/SubProjectMasterPage'
import AttendancePage from '../pages/operations/AttendancePage'
import EmployeeImportPage from '../pages/operations/EmployeeImportPage'
import LabourHoursPage from '../pages/operations/LabourHoursPage'
import PayrollImportPage from '../pages/operations/PayrollImportPage'
import ActualWorkHoursImportPage from '../pages/operations/ActualWorkHoursImportPage'
import ActualWorkHoursReportPage from '../pages/reports/ActualWorkHoursReportPage'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

function AppRouter() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<PublicRoute><SignInPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/employees" element={<Navigate to="/masters/employees" replace />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/labour-hours" element={<LabourHoursPage />} />
      <Route path="/masters/projects" element={<ProjectMasterPage />} />
      <Route path="/masters/project-categories" element={<ProjectCategoryMasterPage />} />
      <Route path="/masters/sub-projects" element={<SubProjectMasterPage />} />
      <Route path="/masters/employees" element={<EmployeeMasterPage />} />
      <Route path="/masters/ledger-categories" element={<LedgerCategoryMasterPage />} />
      <Route path="/masters/ledgers" element={<LedgerMasterPage />} />
      <Route path="/masters/forecast" element={<ForecastMasterPage />} />
      <Route path="/imports/employees" element={<EmployeeImportPage />} />
      <Route path="/imports/payroll" element={<PayrollImportPage />} />
      <Route path="/imports/actual-work-hours" element={<ActualWorkHoursImportPage />} />
      <Route path="/reports/actual-work-hours" element={<ActualWorkHoursReportPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></BrowserRouter>
}

export default AppRouter

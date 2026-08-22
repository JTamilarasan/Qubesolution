import OperationPage from '../../components/common/OperationPage'

const columns = [
  { field: 'employeeName', label: 'Employee' }, { field: 'projectName', label: 'Project' },
  { field: 'forecastHours', label: 'Forecast' }, { field: 'actualHours', label: 'Actual' },
  { field: 'variance', label: 'Variance' }, { field: 'status', label: 'Status' },
]

export default function LabourHoursPage() {
  return <OperationPage title="Labour Hours" description="Compare employee forecast and actual labour utilization." filters={['Year', 'Month', 'Project', 'Sub Project']} columns={columns} collectionName="labourHours" primaryLabel="Upload Hours" upload emptyTitle="No labour hour records" emptyDescription="Validated labour-hour imports will appear here with forecast, actual, and variance values." />
}

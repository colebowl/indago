import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layouts/AppShell'
import { PropertyListPage } from '@/pages/property-list/PropertyListPage'
import { AddPropertyPage } from '@/pages/add-property/AddPropertyPage'
import { PropertyReportPage } from '@/pages/property-report/PropertyReportPage'

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<PropertyListPage />} />
        <Route path="/add" element={<AddPropertyPage />} />
        <Route path="/property/:id" element={<PropertyReportPage />} />
      </Routes>
    </AppShell>
  )
}

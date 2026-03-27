import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

import Settings from './pages/Settings'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Quotations from './pages/Quotations'

import Invoices from './pages/Invoices'
import DeliveryOrders from './pages/DeliveryOrders'

import Statements from './pages/Statements'
import Dashboard from './pages/Dashboard'

import { CompanyProvider } from './context/CompanyContext'

function App() {
  return (
    <CompanyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="delivery-orders" element={<DeliveryOrders />} />
            <Route path="statements" element={<Statements />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </CompanyProvider>
  )
}

export default App

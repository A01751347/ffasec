// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import UploadPage from './pages/UploadPage';
import ReportPage from './pages/ReportPage';
import CustomersPage from './pages/CustomersPage';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
        <div>
          <Sidebar/>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

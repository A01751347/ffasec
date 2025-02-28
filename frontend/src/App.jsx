// src/App.jsx
import React from "react";
import {Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import OrdersPage from "./pages/OrdersPage";
import UploadPage from "./pages/UploadPage";
import ReportPage from "./pages/ReportPage";
import CustomersPage from "./pages/CustomersPage";
import Sidebar from "./components/Sidebar";

function App() {
  return (
		<div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
			{/* BG */}
			<div className='fixed inset-0 z-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
				<div className='absolute inset-0 backdrop-blur-sm' />
			</div>

			<Sidebar />

        {/* en caso de poner un dashboard ponle un flex-grow */}


          <Routes>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/customers" element={<CustomersPage />} />
          </Routes>
        </div>
        
  );
}

export default App;

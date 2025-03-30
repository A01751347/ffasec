import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Lazy loading de componentes de página
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const POSPage = lazy(() => import("./pages/POSPage")); // Punto de venta
const SalesPage = lazy(() => import("./pages/SalesPage"));

function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      <Sidebar />

      {/* Contenido principal con Suspense para lazy loading */}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/pos" element={<POSPage />} />// En el componente Routes, añadir:
          <Route path="/sales-history" element={<SalesPage />} />
        </Routes>

    </div>
  );
}

export default App;``
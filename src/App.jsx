import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import DeliveryOrders from "./pages/DeliveryOrders";
import CreateDeliveryOrder from "./pages/CreateDeliveryOrder";
import DeliveryOrderDetails from "./pages/DeliveryOrderDetails";
import Tables from "./pages/Tables";
import MenuItems from "./pages/MenuItems";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Employees from "./pages/Employees";
import NotFound from "./pages/NotFound";
import { useLang } from "./context/LanguageContext";

export default function App() {
  const { isRTL } = useLang();

  return (
    <>
      <Toaster
        position={isRTL ? "top-left" : "top-right"}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111827",
            color: "#F8FAFC",
            border: "1px solid #1F2937",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 12px 32px -8px rgba(0,0,0,0.45)",
          },
          success: { iconTheme: { primary: "#22C55E", secondary: "#111827" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#111827" } },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <DeliveryOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/create"
            element={
              <ProtectedRoute>
                <CreateDeliveryOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/:id"
            element={
              <ProtectedRoute>
                <DeliveryOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tables"
            element={
              <ProtectedRoute>
                <Tables />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

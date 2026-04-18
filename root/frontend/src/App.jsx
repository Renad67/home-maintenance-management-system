import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import CustomerDashboard from "./pages/CustomerDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAllTasks from "./pages/AdminAllTasks";
import AdminReviews from "./pages/AdminReviews";
import AdminTechnicians from "./pages/AdminTechnicians";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Main Dashboard Routes */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-tasks" element={<AdminAllTasks />} />
        <Route path="/admin-reviews" element={<AdminReviews />} />
        <Route path="/admin-technicians" element={<AdminTechnicians />} />

        {/* Placeholder for upcoming pages */}
        <Route
          path="/add-request"
          element={
            <h2
              style={{ color: "#333", textAlign: "center", marginTop: "50px" }}
            >
              Add Request Page (Coming Soon)
            </h2>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

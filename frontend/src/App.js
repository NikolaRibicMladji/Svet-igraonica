import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Playrooms from "./pages/Playrooms";
import CreatePlayroom from "./pages/CreatePlayroom";
import ManagePlayroom from "./pages/ManagePlayroom";
import AdminPanel from "./pages/AdminPanel";
import PlayroomDetails from "./pages/PlayroomDetails";
import Book from "./pages/Book";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import OwnerTimeSlots from "./pages/OwnerTimeSlots";
import OwnerDashboard from "./pages/OwnerDashboard";
import "./styles/global.css";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="container loading">Učitavanje...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const VlasnikRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["vlasnik", "admin"]}>
    {children}
  </ProtectedRoute>
);

const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

const RoditeljRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["roditelj", "admin"]}>
    {children}
  </ProtectedRoute>
);

function AppRoutes() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/playrooms" element={<Playrooms />} />
        <Route path="/playrooms/:id" element={<PlayroomDetails />} />

        <Route
          path="/book/:id"
          element={
            <RoditeljRoute>
              <Book />
            </RoditeljRoute>
          }
        />

        <Route
          path="/booking-success"
          element={
            <RoditeljRoute>
              <BookingSuccess />
            </RoditeljRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <RoditeljRoute>
              <MyBookings />
            </RoditeljRoute>
          }
        />

        <Route
          path="/manage-playroom"
          element={
            <VlasnikRoute>
              <ManagePlayroom />
            </VlasnikRoute>
          }
        />

        <Route
          path="/create-playroom"
          element={
            <VlasnikRoute>
              <CreatePlayroom />
            </VlasnikRoute>
          }
        />

        <Route
          path="/manage-slots"
          element={<Navigate to="/owner-slots" replace />}
        />

        <Route
          path="/owner-slots"
          element={
            <VlasnikRoute>
              <OwnerTimeSlots />
            </VlasnikRoute>
          }
        />

        <Route
          path="/vlasnik/dashboard"
          element={
            <VlasnikRoute>
              <OwnerDashboard />
            </VlasnikRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

const NotFound = () => {
  return (
    <div
      className="container"
      style={{ textAlign: "center", padding: "60px 20px" }}
    >
      <h1 style={{ fontSize: "6rem", color: "#ff6b4a" }}>404</h1>
      <h2>Stranica nije pronađena</h2>
      <p>Izvinjavamo se, stranica koju tražite ne postoji.</p>

      <Link
        to="/"
        className="btn btn-primary"
        style={{ marginTop: "20px", display: "inline-block" }}
      >
        Vrati se na početnu
      </Link>
    </div>
  );
};

export default App;

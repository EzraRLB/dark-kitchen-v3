import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import TeamManagement from "./pages/TeamManagement";
import AdminRoute from "./guards/AdminRoute";
import NotFound from "./routes/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  {
    path: "/admin/team",
    element: (
      <AdminRoute>
        <TeamManagement />
      </AdminRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);

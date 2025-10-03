import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { role, isAdmin, setRole } = useAuth();

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Dark Kitchen</h1>
      <p style={{ color: "#64748b" }}>
        Bienvenido, Alejandro. Rol actual: <b>{role}</b>
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link
          to="/admin/team"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#0ea5e9",
            color: "white",
            textDecoration: "none"
          }}
        >
          {isAdmin ? "Ir a Gestión de Equipo" : "Solo admins: Gestión de Equipo"}
        </Link>

        <button
          onClick={() => setRole(isAdmin ? "staff" : "admin")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer"
          }}
        >
          Cambiar rol a {isAdmin ? "staff" : "admin"}
        </button>
      </div>
    </div>
  );
}

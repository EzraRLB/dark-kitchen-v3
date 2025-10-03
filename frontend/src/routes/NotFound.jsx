import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: "0 16px" }}>
      <h2>Página no encontrada</h2>
      <p style={{ color: "#6b7280" }}>
        La ruta solicitada no existe o no tienes permisos.
      </p>
      <Link to="/" style={{ color: "#0ea5e9" }}>Volver al inicio</Link>
    </div>
  );
}

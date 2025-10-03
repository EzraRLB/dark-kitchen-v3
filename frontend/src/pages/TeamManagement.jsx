import { useEffect, useMemo, useState } from "react";
import data from "../assets/mock-users.json";
import RoleBadge from "../components/RoleBadge";
import RoleSelect from "../components/RoleSelect";
import Layout from "../components/Layout";

const STORAGE_KEY = "dk_users_mock";

export default function TeamManagement() {
  const [users, setUsers] = useState(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : data;
  });
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const t = query.toLowerCase();
      const matchesText = u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t);
      const matchesRole = roleFilter === "Todos" || u.role === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, query, roleFilter]);

  const updateRole = (id, newRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <Layout title="Gestión de Equipo">
      <div className="card">
        <div className="toolbar">
          <input
            className="input"
            placeholder="Buscar por nombre o email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>Todos</option>
            <option>Cocina</option>
            <option>Mesero</option>
            <option>Repartidor</option>
            <option>Caja</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Email</th><th>Rol actual</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <tr key={u.id} className={idx % 2 ? "odd" : ""}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <RoleSelect value={u.role} onChange={(r) => updateRole(u.id, r)} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="muted">No hay resultados con esos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="hint">* Cambios guardados en <code>localStorage</code> (sin backend).</p>
      </div>
    </Layout>
  );
}

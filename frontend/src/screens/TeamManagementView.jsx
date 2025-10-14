import React, { useEffect, useMemo, useState } from "react";
import axios from 'axios';
import Modal from '../components/Modal';
import './TeamManagementView.css';

// ---------- Configuración ----------
const KITCHEN_UNITS = [
  { id: "cocina", label: "Cocina" },
  { id: "caja", label: "Caja" },
  { id: "reparto", label: "Reparto" },
  { id: "barra", label: "Barra" },
  { id: "ensamble", label: "Ensamble" },
];

// --- FUNCIÓN CLAVE: Obtiene el token y lo prepara para la cabecera ---
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error("No se encontró token de acceso. Por favor, inicie sesión de nuevo.");
        return {};
    }
    return { 
        headers: { 
            Authorization: `Bearer ${token}` 
        } 
    };
};

// --- API Helpers que ahora usan el token ---
async function apiFetchUsers() {
  const { data } = await axios.get('http://127.0.0.1:8000/api/users/team/', getAuthHeaders());
  // Mapeamos los nombres para que coincidan con lo que espera el frontend
  return data.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`.trim() || u.username,
      email: u.email,
      unit: u.unit,
  }));
}

async function apiUpdateUser(userId, payload) {
  return await axios.patch(`http://127.0.0.1:8000/api/users/team/${userId}/`, payload, getAuthHeaders());
}

// ---------- Vista Principal (con manejo de errores) ----------
export default function TeamManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("todos");

  const [pinModal, setPinModal] = useState({ open: false, user: null, pin: "" });
  const [unitModal, setUnitModal] = useState({ open: false, user: null, unit: "" });

  useEffect(() => {
    apiFetchUsers()
        .then(data => {
            setUsers(data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error al obtener usuarios:", err);
            setError("No se pudo cargar la lista de usuarios. Es posible que tu sesión haya expirado.");
            setLoading(false);
        });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const search = query.toLowerCase();
      const matchesText = !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
      const matchesUnit = unitFilter === "todos" || user.unit === unitFilter;
      return matchesText && matchesUnit;
    });
  }, [users, query, unitFilter]);

  const unitLabel = (id) => KITCHEN_UNITS.find(k => k.id === id)?.label || id;

  const handleSavePin = async () => {
    const { user, pin } = pinModal;
    if (!/^\d{4,6}$/.test(pin)) return alert("El PIN debe ser de 4 a 6 dígitos.");
    await apiUpdateUser(user.id, { user_pin: pin });
    setPinModal({ open: false, user: null, pin: "" });
  };

  const handleSaveUnit = async () => {
    const { user, unit } = unitModal;
    await apiUpdateUser(user.id, { unit });
    setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, unit } : u)));
    setUnitModal({ open: false, user: null, unit: "" });
  };

  return (
    <div className="admin-container">
      {/* ... (el JSX de la toolbar y los modales no cambia) ... */}
      <div className="admin-toolbar">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o email..." className="search-input" />
        <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="filter-select">
          <option value="todos">Todas las Unidades</option>
          {KITCHEN_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Unidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="status-cell">Cargando usuarios...</td></tr>}
            {error && <tr><td colSpan="5" className="status-cell error-cell">{error}</td></tr>}
            {!loading && !error && filteredUsers.length === 0 && (
                <tr><td colSpan="5" className="status-cell">No se encontraron usuarios.</td></tr>
            )}
            {!loading && !error && filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="unit-pill">{unitLabel(user.unit)}</span></td>
                <td>
                  <button className="action-btn" onClick={() => setPinModal({ open: true, user, pin: '' })}>Cambiar PIN</button>
                  <button className="action-btn" onClick={() => setUnitModal({ open: true, user, unit: user.unit })}>Cambiar Unidad</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ... (Modales) ... */}
      <Modal open={pinModal.open} title={`Cambiar PIN de ${pinModal.user?.name}`} onClose={() => setPinModal({ open: false, user: null, pin: '' })} onConfirm={handleSavePin}>
        <label>Nuevo PIN (4-6 dígitos)</label>
        <input type="text" value={pinModal.pin} onChange={e => setPinModal(s => ({ ...s, pin: e.target.value.replace(/\D/g, "") }))} maxLength={6} className="modal-input" />
      </Modal>

      <Modal open={unitModal.open} title={`Cambiar Unidad de ${unitModal.user?.name}`} onClose={() => setUnitModal({ open: false, user: null, unit: '' })} onConfirm={handleSaveUnit}>
        <label>Unidad de Cocina</label>
        <select value={unitModal.unit} onChange={e => setUnitModal(s => ({ ...s, unit: e.target.value }))} className="modal-input">
          {KITCHEN_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </Modal>
    </div>
  );
}
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
  // intenta varios nombres porque no sabemos con cuál lo guardaste
  const token =
    localStorage.getItem("accessToken") ||   // lo que esperaba tu helper
    localStorage.getItem("access") ||        // lo que sí te manda el backend
    localStorage.getItem("token");           // por si acaso

  if (!token) {
    console.warn("No hay token en localStorage");
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


// --- API Helpers que ahora usan el token ---
async function apiFetchUsers() {
  const { data } = await axios.get('http://127.0.0.1:8000/api/users/team/', getAuthHeaders());
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

// 👇 NUEVO: crear usuario
async function apiCreateUser(payload) {
  // aquí asumo que tu endpoint de lista acepta POST
  return await axios.post(
    'http://127.0.0.1:8000/api/users/team/',
    payload,
    getAuthHeaders()
  );
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

  // 👇 NUEVO modal de añadir
  const [addModal, setAddModal] = useState({
    open: false,
    first_name: '',
    last_name: '',
    email: '',
    unit: '',
    username: '',
    user_pin: ''
  });

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

  //  NUEVO: guardar usuario
  const handleCreateUser = async () => {
  if (!addModal.email) {
    alert("El email es obligatorio.");
    return;
  }

  try {
    const payload = {
        first_name: addModal.first_name,
        last_name: addModal.last_name,
        email: addModal.email,
        unit: addModal.unit || null,
        username: addModal.username || addModal.email.split("@")[0],
        user_pin: addModal.user_pin || null,
        // 👇 por si el backend pide password, le mandamos uno
        password: addModal.user_pin || "12345678"
    };

    const { data: created } = await apiCreateUser(payload);

    const newRow = {
      id: created.id,
      name: `${created.first_name || ''} ${created.last_name || ''}`.trim() || created.username,
      email: created.email,
      unit: created.unit,
    };

    setUsers(prev => [...prev, newRow]);

    setAddModal({
      open: false,
      first_name: '',
      last_name: '',
      email: '',
      unit: '',
      username: '',
      user_pin: ''
    });
  } catch (err) {
    console.error("Error creando usuario:", err);
    // 👇 esto es lo que te va a decir EXACTAMENTE qué quiere el backend
    const msg =
      err?.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : err.message;
    alert("No se pudo crear el usuario:\n" + msg);
  }
};


  return (
    <div className="admin-container">
      {/* TOOLBAR */}
      <div className="admin-toolbar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="search-input"
        />

        <div className="toolbar-right">
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todas las Unidades</option>
            {KITCHEN_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>

          {/* 👇 NUEVO BOTÓN */}
          <button
            className="add-user-btn"
            onClick={() => setAddModal(m => ({ ...m, open: true }))}
          >
            + Añadir usuario
          </button>
        </div>
      </div>

      {/* TABLA */}
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

      {/* MODAL PIN */}
      <Modal
        open={pinModal.open}
        title={`Cambiar PIN de ${pinModal.user?.name}`}
        onClose={() => setPinModal({ open: false, user: null, pin: '' })}
        onConfirm={handleSavePin}
      >
        <label>Nuevo PIN (4-6 dígitos)</label>
        <input
          type="text"
          value={pinModal.pin}
          onChange={e => setPinModal(s => ({ ...s, pin: e.target.value.replace(/\D/g, "") }))}
          maxLength={6}
          className="modal-input"
        />
      </Modal>

      {/* MODAL UNIDAD */}
      <Modal
        open={unitModal.open}
        title={`Cambiar Unidad de ${unitModal.user?.name}`}
        onClose={() => setUnitModal({ open: false, user: null, unit: '' })}
        onConfirm={handleSaveUnit}
      >
        <label>Unidad de Cocina</label>
        <select
          value={unitModal.unit}
          onChange={e => setUnitModal(s => ({ ...s, unit: e.target.value }))}
          className="modal-input"
        >
          {KITCHEN_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </Modal>

      {/* 👇 MODAL NUEVO USUARIO */}
      <Modal
        open={addModal.open}
        title="Añadir nuevo usuario"
        onClose={() => setAddModal({
          open: false,
          first_name: '',
          last_name: '',
          email: '',
          unit: '',
          username: '',
          user_pin: ''
        })}
        onConfirm={handleCreateUser}
      >
        <label>Nombre</label>
        <input
          className="modal-input"
          value={addModal.first_name}
          onChange={e => setAddModal(s => ({ ...s, first_name: e.target.value }))}
        />

        <label>Apellidos</label>
        <input
          className="modal-input"
          value={addModal.last_name}
          onChange={e => setAddModal(s => ({ ...s, last_name: e.target.value }))}
        />

        <label>Email</label>
        <input
          className="modal-input"
          type="email"
          value={addModal.email}
          onChange={e => setAddModal(s => ({ ...s, email: e.target.value }))}
        />

        <label>Unidad</label>
        <select
          className="modal-input"
          value={addModal.unit}
          onChange={e => setAddModal(s => ({ ...s, unit: e.target.value }))}
        >
          <option value="">-- Selecciona --</option>
          {KITCHEN_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>

        <label>Username (opcional)</label>
        <input
          className="modal-input"
          value={addModal.username}
          onChange={e => setAddModal(s => ({ ...s, username: e.target.value }))}
        />

        <label>PIN (opcional)</label>
        <input
          className="modal-input"
          maxLength={6}
          value={addModal.user_pin}
          onChange={e => setAddModal(s => ({ ...s, user_pin: e.target.value.replace(/\D/g, "") }))}
        />
      </Modal>
    </div>
  );
}

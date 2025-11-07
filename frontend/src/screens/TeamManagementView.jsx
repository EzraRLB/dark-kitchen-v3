import React, { useEffect, useMemo, useState } from "react";
import axios from 'axios';
import Modal from '../components/Modal';
import './TeamManagementView.css';

// ---------- Configuración ----------
const USER_ROLES = [
  { id: "cocina", label: "Cocina" },
  { id: "reparto", label: "Reparto" },
  { id: "ensamble", label: "Ensamble" },
  { id: "supervisor", label: "Supervisor" },
  { id: "admin", label: "Administrador" },
];

// --- FUNCIÓN CLAVE: Obtiene el token ---
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token");

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

// --- API Helpers ---
async function apiFetchUsers() {
  const { data } = await axios.get('http://127.0.0.1:8000/api/users/team/', getAuthHeaders());
  return data.map(u => {
    const rawRole = (u.user_role || (u.is_staff ? 'admin' : '')).toString().toLowerCase();
    const is_admin = u.is_superuser || ['admin', 'supervisor'].includes(rawRole);
    return {
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.user_alias,
      email: u.email || '',
      role: rawRole,
      is_admin,
    };
  });
}

// (apiUpdateUser se queda igual, aunque ya no lo usamos para el PIN)
async function apiUpdateUser(userId, payload) {
  return await axios.patch(`http://127.0.0.1:8000/api/users/team/${userId}/`, payload, getAuthHeaders());
}

async function apiCreateUser(payload) {
  return await axios.post('http://127.0.0.1:8000/api/users/team/', payload, getAuthHeaders());
}

async function apiDeleteUser(userId, adminPassword = null) {
  const config = getAuthHeaders();
  if (adminPassword) {
    config.data = { admin_password: adminPassword };
  }
  return await axios.delete(`http://127.0.0.1:8000/api/users/team/${userId}/`, config);
}

// 👇 --- NUEVA FUNCIÓN API PARA RESTABLECER EL PIN ---
async function apiResetPin(userId, adminPassword) {
  const config = getAuthHeaders();
  const payload = { admin_password: adminPassword };
  // Llamamos al nuevo endpoint que creamos en urls.py
  return await axios.post(`http://127.0.0.1:8000/api/users/team/${userId}/reset-pin/`, payload, config);
}


// ---------- Vista Principal ----------
export default function TeamManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");

  // 👇 --- ELIMINAMOS EL ESTADO DEL MODAL DE PIN ---
  // const [pinModal, setPinModal] = useState({ open: false, user: null, pin: "" });
  
  // (El modal de 'unidad' ya lo habíamos quitado, lo cual es correcto)

  const [addModal, setAddModal] = useState({
    open: false,
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    user_role: 'cocina'
  });
  
  const resetAddModal = () => {
    setAddModal({
      open: false,
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      user_role: 'cocina'
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("No se pudo cargar la lista de usuarios. Es posible que tu sesión haya expirado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const search = query.toLowerCase();
      const matchesText = !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
      const matchesRole = roleFilter === "todos" || user.role === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, query, roleFilter]);

  const roleLabel = (id) => USER_ROLES.find(r => r.id === id)?.label || id;

  // 👇 --- REESCRIBIMOS LA LÓGICA DE 'CAMBIAR PIN' ---
  const handleResetPin = async (user) => {
    if (!user) return;

    // 1. Pedir la contraseña del admin (igual que al borrar)
    const adminPassword = window.prompt(
      `🔒 ACCIÓN SEGURA 🔒\nVas a restablecer el PIN para "${user.name}".\n\nPor favor, ingresa TU PROPIA contraseña de administrador para confirmar:`
    );

    // 2. Si el admin cancela, no hacemos nada
    if (!adminPassword) {
      return;
    }

    // 3. Llamar a la nueva API
    try {
      const response = await apiResetPin(user.id, adminPassword);
      // Mostramos el mensaje de éxito del backend
      alert(response.data.success || "PIN restablecido y enviado.");
    } catch (err) {
      console.error("Error al restablecer PIN:", err);
      // Mostramos el mensaje de error del backend
      const msg = err?.response?.data?.error || "No se pudo restablecer el PIN.";
      alert("Error: " + msg);
    }
  };

  // (handleSaveUnit ya no existe, lo cual es correcto)

  const handleCreateUser = async () => {
    // ... (esta función se queda igual que antes) ...
    if (!addModal.email || !addModal.user_role) {
      alert("El email y el rol son obligatorios.");
      return;
    }
    try {
      const payload = {
        first_name: addModal.first_name || '',
        last_name: addModal.last_name || '',
        email: addModal.email,
        username: addModal.username || addModal.email.split("@")[0],
        user_role: addModal.user_role,
      };
      await apiCreateUser(payload);
      await fetchUsers();
      resetAddModal();
      alert('¡Usuario creado! Se ha enviado un correo con el PIN de acceso.');
    } catch (err) {
      console.error("Error creando usuario:", err);
      const msg = err?.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
      alert("No se pudo crear el usuario:\n" + msg);
    }
  };

  const handleDeleteUser = async (user) => {
    // ... (esta función se queda igual que antes) ...
    if (!user) return;
    let adminPassword = null;
    if (user.is_admin) {
      adminPassword = window.prompt(
        "⚠️ ALERTA ⚠️\nEstás a punto de eliminar a un administrador (" + user.name + ").\n\nPor favor, ingresa TU PROPIA contraseña de administrador para confirmar:"
      );
      if (!adminPassword) return; 
    } else {
      const ok = window.confirm(`¿Estás seguro de eliminar a "${user.name}"?`);
      if (!ok) return;
    }
    try {
      await apiDeleteUser(user.id, adminPassword);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      alert("Usuario eliminado correctamente.");
    } catch (err) {
      console.error("Error borrando usuario:", err);
      const msg = err?.response?.data?.error || "No se pudo eliminar el usuario.";
      alert("Error: " + msg);
    }
  };

  return (
    <div className="admin-container">
      {/* TOOLBAR (sin cambios) */}
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los Roles</option>
            {USER_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <button
            className="add-user-btn"
            onClick={() => setAddModal(m => ({ ...m, open: true }))}
          >
            + Añadir usuario
          </button>
        </div>
      </div>

      {/* TABLA (Botón de PIN actualizado) */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
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
                <td>
                  <span className="unit-pill" data-role={user.role}>
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td>
                  {/* 👇 --- ONCLICK ACTUALIZADO --- */}
                  <button className="action-btn" onClick={() => handleResetPin(user)}>
                    Restablecer PIN
                  </button>
                  
                  {user.is_admin ? (
                     <button className="action-btn-red danger" onClick={() => handleDeleteUser(user)}>Eliminar (Admin)</button>
                  ) : (
                    <button className="action-btn-red danger" onClick={() => handleDeleteUser(user)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 👇 --- MODAL DE PIN ELIMINADO --- */}
      {/* (Ya no existe el <Modal open={pinModal.open} ... >) */}


      {/* MODAL NUEVO USUARIO (sin cambios) */}
      <Modal
        open={addModal.open}
        title="Añadir nuevo usuario"
        onClose={resetAddModal}
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
        <label>Email (Obligatorio)</label>
        <input
          className="modal-input"
          type="email"
          value={addModal.email}
          onChange={e => setAddModal(s => ({ ...s, email: e.target.value }))}
        />
        <label>Rol (Obligatorio)</label>
        <select
          className="modal-input"
          value={addModal.user_role}
          onChange={e => setAddModal(s => ({ ...s, user_role: e.target.value }))}
        >
          {USER_ROLES.map(role => <option key={role.id} value={role.id}>{role.label}</option>)}
        </select>
        <label>Username (Opcional - si se deja vacío, usa el email)</label>
        <input
          className="modal-input"
          value={addModal.username}
          onChange={e => setAddModal(s => ({ ...s, username: e.target.value }))}
        />
      </Modal>
    </div>
  );
}
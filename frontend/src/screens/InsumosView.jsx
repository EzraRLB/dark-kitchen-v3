import React, { useEffect, useState } from "react";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import './InsumosView.css';

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("access") || localStorage.getItem("token");
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

async function apiFetchIngredientes() {
  const { data } = await axios.get('http://127.0.0.1:8000/inventory/api/ingredientes/', getAuthHeaders());
  return data;
}

async function apiFetchUnidadesMedida() {
  const { data } = await axios.get('http://127.0.0.1:8000/inventory/api/unidades-medida/', getAuthHeaders());
  return data;
}

async function apiCreateIngrediente(payload) {
  return await axios.post('http://127.0.0.1:8000/inventory/api/ingredientes/', payload, getAuthHeaders());
}

async function apiUpdateIngrediente(id, payload) {
  return await axios.patch(`http://127.0.0.1:8000/inventory/api/ingredientes/${id}/`, payload, getAuthHeaders());
}

async function apiDeleteIngrediente(id) {
  return await axios.delete(`http://127.0.0.1:8000/inventory/api/ingredientes/${id}/`, getAuthHeaders());
}

export default function InsumosView() {
  const [ingredientes, setIngredientes] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({
    open: false,
    isEdit: false,
    ingrediente: null,
    nombre_ingrediente: '',
    tipo_articulo: 'INSUMO_RECETA',
    unidad_base_consumo: '',
    unidad_compra: ''
  });

  const fetchIngredientes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetchIngredientes();
      setIngredientes(data);
    } catch (err) {
      console.error("Error al obtener ingredientes:", err);
      setError("Error: No fue posible actualizar la tabla. Inténtelo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnidadesMedida = async () => {
    try {
      const data = await apiFetchUnidadesMedida();
      setUnidadesMedida(data);
    } catch (err) {
      console.error("Error al obtener unidades de medida:", err);
    }
  };

  useEffect(() => {
    fetchIngredientes();
    fetchUnidadesMedida();
  }, []);

  const resetModal = () => {
    setModal({
      open: false,
      isEdit: false,
      ingrediente: null,
      nombre_ingrediente: '',
      tipo_articulo: 'INSUMO_RECETA',
      unidad_base_consumo: '',
      unidad_compra: ''
    });
  };

  const openAddModal = () => {
    resetModal();
    setModal(m => ({ ...m, open: true }));
  };

  const openEditModal = (ingrediente) => {
    setModal({
      open: true,
      isEdit: true,
      ingrediente,
      nombre_ingrediente: ingrediente.nombre_ingrediente,
      tipo_articulo: ingrediente.tipo_articulo,
      unidad_base_consumo: ingrediente.unidad_base_consumo,
      unidad_compra: ingrediente.unidad_compra
    });
  };

  const handleSaveIngrediente = async () => {
    if (!modal.nombre_ingrediente || !modal.unidad_base_consumo || !modal.unidad_compra) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    try {
      const payload = {
        nombre_ingrediente: modal.nombre_ingrediente,
        tipo_articulo: modal.tipo_articulo,
        unidad_base_consumo: modal.unidad_base_consumo,
        unidad_compra: modal.unidad_compra
      };
      if (modal.isEdit) {
        await apiUpdateIngrediente(modal.ingrediente.id_ingrediente, payload);
      } else {
        await apiCreateIngrediente(payload);
      }
      await fetchIngredientes();
      resetModal();
      alert(modal.isEdit ? 'Ingrediente actualizado correctamente.' : 'Ingrediente creado correctamente.');
    } catch (err) {
      console.error("Error guardando ingrediente:", err);
      alert("No se pudo guardar el ingrediente.");
    }
  };

  const getTipoArticuloLabel = (tipo) => {
    const tipos = {
      'INSUMO_RECETA': 'Insumo de Receta',
      'EMPAQUE': 'Empaque',
      'CONDIMENTO_INCLUIDO': 'Condimento Incluido'
    };
    return tipos[tipo] || tipo;
  };

  const handleEdit = (ingrediente) => {
    openEditModal(ingrediente);
  };

  const handleDelete = async (ingrediente) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres borrar este ingrediente? Sólo hazlo de descontinuarlo completamente. Se evaluará la integridad de recetas que lo utilicen y no será posible borrarlo de ser utilizado en una.`
    );
    if (!confirmed) return;
    
    try {
      await apiDeleteIngrediente(ingrediente.id_ingrediente);
      await fetchIngredientes();
      alert('Ingrediente eliminado correctamente.');
    } catch (err) {
      console.error("Error eliminando ingrediente:", err);
      alert('No se pudo eliminar el ingrediente. Puede estar siendo utilizado en recetas.');
    }
  };

  return (
    <div className="insumos-container">
      <div className="insumos-toolbar">
        <button className="add-insumo-btn" onClick={openAddModal}>
          Añadir Insumo
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo de Artículo</th>
              <th>Unidad Base Consumo</th>
              <th>Unidad Compra</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="status-cell">Cargando ingredientes...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="6" className="status-cell error-cell">{error}</td>
              </tr>
            )}
            {!loading && !error && ingredientes.length === 0 && (
              <tr>
                <td colSpan="6" className="status-cell empty-cell">
                  Presiona "Añadir Insumo" para incorporarlo a esta tabla.
                </td>
              </tr>
            )}
            {!loading && !error && ingredientes.map(ingrediente => (
              <tr key={ingrediente.id_ingrediente}>
                <td>{ingrediente.id_ingrediente}</td>
                <td>{ingrediente.nombre_ingrediente}</td>
                <td>
                  <span className="tipo-pill" data-tipo={ingrediente.tipo_articulo}>
                    {getTipoArticuloLabel(ingrediente.tipo_articulo)}
                  </span>
                </td>
                <td>{ingrediente.unidad_base_consumo_nombre}</td>
                <td>{ingrediente.unidad_compra_nombre}</td>
                <td>
                  <button 
                    className="action-icon-btn edit-btn" 
                    onClick={() => handleEdit(ingrediente)}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="action-icon-btn delete-btn" 
                    onClick={() => handleDelete(ingrediente)}
                    title="Eliminar"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modal.open}
        title={modal.isEdit ? "Editar Ingrediente" : "Añadir Ingrediente"}
        onClose={resetModal}
        onConfirm={handleSaveIngrediente}
      >
        <label>Nombre del Ingrediente</label>
        <input
          className="modal-input"
          value={modal.nombre_ingrediente}
          onChange={e => setModal(m => ({ ...m, nombre_ingrediente: e.target.value }))}
        />
        <label>Tipo de Artículo</label>
        <select
          className="modal-input"
          value={modal.tipo_articulo}
          onChange={e => setModal(m => ({ ...m, tipo_articulo: e.target.value }))}
        >
          <option value="INSUMO_RECETA">Insumo de Receta</option>
          <option value="EMPAQUE">Empaque</option>
          <option value="CONDIMENTO_INCLUIDO">Condimento Incluido</option>
        </select>
        <label>Unidad Base de Consumo</label>
        <select
          className="modal-input"
          value={modal.unidad_base_consumo}
          onChange={e => setModal(m => ({ ...m, unidad_base_consumo: e.target.value }))}
        >
          <option value="">Seleccionar unidad...</option>
          {unidadesMedida.map(unidad => (
            <option key={unidad.id_um} value={unidad.id_um}>
              {unidad.nombre_um} ({unidad.abreviacion_um})
            </option>
          ))}
        </select>
        <label>Unidad de Compra</label>
        <select
          className="modal-input"
          value={modal.unidad_compra}
          onChange={e => setModal(m => ({ ...m, unidad_compra: e.target.value }))}
        >
          <option value="">Seleccionar unidad...</option>
          {unidadesMedida.map(unidad => (
            <option key={unidad.id_um} value={unidad.id_um}>
              {unidad.nombre_um} ({unidad.abreviacion_um})
            </option>
          ))}
        </select>
      </Modal>
    </div>
  );
}
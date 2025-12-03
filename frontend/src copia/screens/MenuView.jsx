import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import './InsumosView.css'; // Reutilizamos estilos

const MenuView = () => {
  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]); // Para el select
  const [modalOpen, setModalOpen] = useState(false);
  
  // Estado para el formulario de nuevo platillo
  const [nuevoPlatillo, setNuevoPlatillo] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    receta: [] // Lista de ingredientes seleccionados: { ingrediente_id, cantidad }
  });

  // Estado temporal para agregar un ingrediente a la receta
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState('');
  const [cantidadReceta, setCantidadReceta] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resProductos, resIngredientes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/inventory/api/productos/', getAuthHeaders()),
        axios.get('http://127.0.0.1:8000/inventory/api/ingredientes/', getAuthHeaders())
      ]);
      setProductos(resProductos.data);
      setIngredientes(resIngredientes.data);
    } catch (error) {
      console.error("Error cargando menú:", error);
    }
  };

  const agregarIngredienteAReceta = () => {
    if (!ingredienteSeleccionado || !cantidadReceta) return;
    
    const ingObj = ingredientes.find(i => i.id_ingrediente === parseInt(ingredienteSeleccionado));
    
    const nuevoItem = {
      id_ingrediente: parseInt(ingredienteSeleccionado),
      nombre: ingObj.nombre_ingrediente,
      cantidad: parseFloat(cantidadReceta),
      unidad: ingObj.unidad_base_consumo_nombre
    };

    setNuevoPlatillo({
      ...nuevoPlatillo,
      receta: [...nuevoPlatillo.receta, nuevoItem]
    });
    
    setIngredienteSeleccionado('');
    setCantidadReceta('');
  };

  const guardarPlatillo = async () => {
    // Aquí iría la lógica para guardar primero el Producto y luego sus Recetas
    // (Simplificado para visualización)
    alert("Funcionalidad de guardar pendiente de conectar al backend");
    setModalOpen(false);
  };

  return (
    <div className="insumos-container">
      <div className="insumos-toolbar">
        <h2 style={{marginRight: 'auto'}}>Menú y Recetas</h2>
        <button className="add-insumo-btn" onClick={() => setModalOpen(true)}>
          + Crear Nuevo Platillo
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Platillo</th>
              <th>Precio</th>
              <th>Ingredientes (Receta)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(prod => (
              <tr key={prod.id}>
                <td style={{fontWeight: 'bold'}}>{prod.nombre}</td>
                <td>${prod.precio}</td>
                <td>
                  <ul style={{margin: 0, paddingLeft: '20px', fontSize: '0.9rem'}}>
                    {prod.ingredientes.map(ing => (
                      <li key={ing.id}>
                        {ing.cantidad} {ing.unidad} de {ing.ingrediente_nombre}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <span className={`tipo-pill ${prod.disponible ? '' : 'error-cell'}`} 
                        style={{backgroundColor: prod.disponible ? '#e6fcf5' : '#fff5f5', color: prod.disponible ? '#0ca678' : '#e03131'}}>
                    {prod.disponible ? 'Disponible' : 'Agotado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear Platillo */}
      <Modal 
        open={modalOpen} 
        title="Nuevo Platillo" 
        onClose={() => setModalOpen(false)}
        onConfirm={guardarPlatillo}
      >
        <label>Nombre del Platillo</label>
        <input 
          className="modal-input" 
          value={nuevoPlatillo.nombre}
          onChange={e => setNuevoPlatillo({...nuevoPlatillo, nombre: e.target.value})}
        />
        
        <label>Precio de Venta ($)</label>
        <input 
          className="modal-input" 
          type="number"
          value={nuevoPlatillo.precio}
          onChange={e => setNuevoPlatillo({...nuevoPlatillo, precio: e.target.value})}
        />

        <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}} />
        
        <h4>Definir Receta</h4>
        <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
          <div style={{flex: 2}}>
            <label style={{fontSize: '0.8rem'}}>Ingrediente</label>
            <select 
              className="modal-input"
              value={ingredienteSeleccionado}
              onChange={e => setIngredienteSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {ingredientes.map(ing => (
                <option key={ing.id_ingrediente} value={ing.id_ingrediente}>
                  {ing.nombre_ingrediente} ({ing.unidad_base_consumo_nombre})
                </option>
              ))}
            </select>
          </div>
          <div style={{flex: 1}}>
            <label style={{fontSize: '0.8rem'}}>Cantidad</label>
            <input 
              className="modal-input" 
              type="number" 
              placeholder="0.00"
              value={cantidadReceta}
              onChange={e => setCantidadReceta(e.target.value)}
            />
          </div>
          <button 
            type="button"
            className="add-insumo-btn" 
            style={{padding: '0.9rem', marginBottom: '2px'}}
            onClick={agregarIngredienteAReceta}
          >
            +
          </button>
        </div>

        {/* Lista de ingredientes agregados */}
        <div style={{marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '8px'}}>
          <small style={{color: '#6c757d'}}>Ingredientes en este platillo:</small>
          {nuevoPlatillo.receta.length === 0 && <p style={{fontSize: '0.9rem', fontStyle: 'italic'}}>Aún no hay ingredientes.</p>}
          <ul style={{margin: '5px 0', paddingLeft: '20px'}}>
            {nuevoPlatillo.receta.map((item, idx) => (
              <li key={idx} style={{fontSize: '0.9rem'}}>
                {item.cantidad} {item.unidad} de <strong>{item.nombre}</strong>
              </li>
            ))}
          </ul>
        </div>

      </Modal>
    </div>
  );
};

export default MenuView;
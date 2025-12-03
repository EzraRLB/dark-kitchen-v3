import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderCard from './OrderCard';
import './KdsScreen.css';

const KdsScreen = ({ user, onLogout }) => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper para headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchOrders = async () => {
    try {
      // Pedimos solo las activas con el parámetro kds=true
      const { data } = await axios.get('http://127.0.0.1:8000/orders/api/orders/?kds=true', getAuthHeaders());
      setOrdenes(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching KDS orders:", error);
    }
  };

  // Polling: Buscar órdenes nuevas cada 5 segundos
  useEffect(() => {
    fetchOrders(); // Primera carga
    const interval = setInterval(fetchOrders, 5000); // Recarga automática
    return () => clearInterval(interval);
  }, []);

  const moverOrden = async (id, estadoActual) => {
    let nuevoEstado = '';
    if (estadoActual === 'nuevo') nuevoEstado = 'preparando';
    else if (estadoActual === 'preparando') nuevoEstado = 'listo';
    else if (estadoActual === 'listo') nuevoEstado = 'entregado';

    if (!nuevoEstado) return;

    // Actualización Optimista (UI primero)
    const ordenesAnteriores = [...ordenes];
    setOrdenes(ordenes.map(o => o.id === id ? { ...o, status: nuevoEstado } : o));

    try {
      // Actualizar en Backend
      await axios.patch(
        `http://127.0.0.1:8000/orders/api/orders/${id}/`, 
        { status: nuevoEstado }, 
        getAuthHeaders()
      );
      // Si es entregado, la refrescamos para que desaparezca
      if (nuevoEstado === 'entregado') {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error actualizando orden:", error);
      // Revertir si falla
      setOrdenes(ordenesAnteriores);
      alert("Error de conexión al actualizar orden");
    }
  };

  // Filtrar por columnas según el status que viene del backend
  const columnas = {
    nuevo: ordenes.filter(o => o.status === 'nuevo'),
    preparando: ordenes.filter(o => o.status === 'preparando'),
    listo: ordenes.filter(o => o.status === 'listo'),
  };

  return (
    <div className="kds-container">
      <header className="kds-header">
        <h1>Kitchen Display System <span style={{fontSize:'0.8rem', color:'#888'}}>Actualización en vivo</span></h1>
        <div className="user-info">
          <span>{user.user_alias} ({user.user_role})</span>
          <button onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </header>
      
      {loading ? (
        <div style={{color:'white', padding:'2rem', textAlign:'center'}}>Cargando órdenes...</div>
      ) : (
        <main className="kds-columns">
          <div className="kds-column">
            <h2>Nuevos ({columnas.nuevo.length})</h2>
            {columnas.nuevo.map(orden => (
              <OrderCard key={orden.id} orden={orden} onNextStep={() => moverOrden(orden.id, 'nuevo')} />
            ))}
          </div>
          <div className="kds-column">
            <h2>En Preparación ({columnas.preparando.length})</h2>
            {columnas.preparando.map(orden => (
              <OrderCard key={orden.id} orden={orden} onNextStep={() => moverOrden(orden.id, 'preparando')} />
            ))}
          </div>
          <div className="kds-column">
            <h2>Listos para Recoger ({columnas.listo.length})</h2>
            {columnas.listo.map(orden => (
              <OrderCard key={orden.id} orden={orden} onNextStep={() => moverOrden(orden.id, 'listo')} />
            ))}
          </div>
        </main>
      )}
    </div>
  );
};

export default KdsScreen;
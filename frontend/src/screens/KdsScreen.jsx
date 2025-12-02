import React, { useState } from 'react';
import OrderCard from './OrderCard';
import './KdsScreen.css';

const mockOrdenes = [
  { id: 'A101', tiempo: 5, items: ['Hamburguesa Clásica (x1)', 'Papas Fritas (x1)'], estado: 'nuevo' },
  { id: 'A102', tiempo: 2, items: ['Ensalada César (x1)', 'Agua Mineral (x1)'], estado: 'nuevo' },
  { id: 'B205', tiempo: 12, items: ['Pizza Pepperoni (x1)', 'Refresco Grande (x2)'], estado: 'preparando' },
  { id: 'C301', tiempo: 18, items: ['Tacos al Pastor (x3)', 'Horchata (x1)'], estado: 'preparando' },
];

const KdsScreen = ({ user, onLogout }) => {
  const [ordenes, setOrdenes] = useState(mockOrdenes);

  const moverOrden = (id, nuevoEstado) => {
    setOrdenes(ordenes.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o));
  };

  const columnas = {
    nuevo: ordenes.filter(o => o.estado === 'nuevo'),
    preparando: ordenes.filter(o => o.estado === 'preparando'),
    listo: ordenes.filter(o => o.estado === 'listo'),
  };

  return (
    <div className="kds-container">
      <header className="kds-header">
        <h1>Kitchen Display System</h1>
        <div className="user-info">
          <span>{user.user_alies}</span>
          <button onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </header>
      <main className="kds-columns">
        <div className="kds-column">
          <h2>Nuevos ({columnas.nuevo.length})</h2>
          {columnas.nuevo.map(orden => <OrderCard key={orden.id} orden={orden} onNextStep={() => moverOrden(orden.id, 'preparando')} />)}
        </div>
        <div className="kds-column">
          <h2>En Preparación ({columnas.preparando.length})</h2>
          {columnas.preparando.map(orden => <OrderCard key={orden.id} orden={orden} onNextStep={() => moverOrden(orden.id, 'listo')} />)}
        </div>
        <div className="kds-column">
          <h2>Listos para Recoger ({columnas.listo.length})</h2>
          {columnas.listo.map(orden => <OrderCard key={orden.id} orden={orden} onNextStep={() => setOrdenes(ordenes.filter(o => o.id !== orden.id))} />)}
        </div>
      </main>
    </div>
  );
};

export default KdsScreen;
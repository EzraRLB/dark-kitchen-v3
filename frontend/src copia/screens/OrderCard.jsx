import React, { useState, useEffect } from 'react';
import './OrderCard.css';

const OrderCard = ({ orden, onNextStep }) => {
  const [minutos, setMinutos] = useState(0);

  useEffect(() => {
    // Calcular tiempo inicial basado en created_at
    const calcularTiempo = () => {
      const inicio = new Date(orden.created_at).getTime();
      const ahora = new Date().getTime();
      const diff = Math.floor((ahora - inicio) / 60000); // diferencia en minutos
      setMinutos(diff);
    };

    calcularTiempo();
    // Actualizar contador cada minuto
    const timer = setInterval(calcularTiempo, 60000);
    return () => clearInterval(timer);
  }, [orden.created_at]);

  const getActionText = () => {
    if (orden.status === 'nuevo') return 'Empezar Preparación';
    if (orden.status === 'preparando') return 'Marcar Listo';
    return 'Entregar al Cliente';
  };

  // Color del borde según tiempo de espera (Alerta visual)
  const getBorderColor = () => {
    if (orden.status === 'nuevo' && minutos > 10) return 'red';
    if (orden.status === 'nuevo') return '#ffc107'; // amarillo
    if (orden.status === 'preparando') return '#007bff'; // azul
    return '#28a745'; // verde
  };

  return (
    <div className={`order-card`} style={{ borderLeftColor: getBorderColor() }}>
      <div className="order-header">
        <span className="order-id">#{orden.id}</span>
        <span className="order-timer">{minutos} min</span>
      </div>
      <ul className="order-items">
        {/* Mapeamos los items reales de la API */}
        {orden.items && orden.items.map((item) => (
          <li key={item.id}>
            <strong>{item.cantidad}x</strong> {item.producto_nombre}
          </li>
        ))}
      </ul>
      <div className="order-total" style={{padding: '0.5rem 1rem', color: '#adb5bd', fontSize: '0.9rem', textAlign: 'right'}}>
        Total: ${orden.total}
      </div>
      <button className="order-action" onClick={onNextStep}>
        {getActionText()}
      </button>
    </div>
  );
};

export default OrderCard;
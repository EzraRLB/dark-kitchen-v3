import React, { useState, useEffect } from 'react';
import './OrderCard.css';

const OrderCard = ({ orden, onNextStep }) => {
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(orden.tiempo);

  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoTranscurrido(prev => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getActionText = () => {
    if (orden.estado === 'nuevo') return 'Preparar';
    if (orden.estado === 'preparando') return 'Listo';
    return 'Entregar';
  };

  return (
    <div className={`order-card estado-${orden.estado}`}>
      <div className="order-header">
        <span className="order-id">#{orden.id}</span>
        <span className="order-timer">{tiempoTranscurrido} min</span>
      </div>
      <ul className="order-items">
        {orden.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
      <button className="order-action" onClick={onNextStep}>
        {getActionText()}
      </button>
    </div>
  );
};

export default OrderCard;
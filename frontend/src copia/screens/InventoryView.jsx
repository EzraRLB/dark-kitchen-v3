import React, { useState } from 'react';
import InsumosView from './InsumosView';
import MenuView from './MenuView'; // <--- Importar la nueva vista
import './InventoryView.css';

const InventoryView = () => {
  // Cambiamos el estado inicial si prefieres
  const [activeSubTab, setActiveSubTab] = useState('insumos');

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'insumos':
        return <InsumosView />;
      case 'menu':
        return <MenuView />; // <--- Renderizar Menú
      default:
        return <InsumosView />;
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventario y Menú</h2>
        <nav className="inventory-nav">
          <button 
            className={`inventory-tab ${activeSubTab === 'insumos' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('insumos')}
          >
            Catálogo de Insumos (Stock)
          </button>
          {/* 👇 NUEVO BOTÓN */}
          <button 
            className={`inventory-tab ${activeSubTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('menu')}
          >
            Gestión de Menú (Recetas)
          </button>
        </nav>
      </div>
      <div className="inventory-content">
        {renderSubContent()}
      </div>
    </div>
  );
};

export default InventoryView;
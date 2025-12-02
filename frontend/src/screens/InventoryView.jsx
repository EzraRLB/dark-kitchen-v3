import React, { useState } from 'react';
import InsumosView from './InsumosView';
import './InventoryView.css';

const InventoryView = () => {
  const [activeSubTab, setActiveSubTab] = useState('insumos');

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'insumos':
        return <InsumosView />;
      default:
        return <InsumosView />;
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventario</h2>
        <nav className="inventory-nav">
          <button 
            className={`inventory-tab ${activeSubTab === 'insumos' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('insumos')}
          >
            Catálogo de Insumos
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
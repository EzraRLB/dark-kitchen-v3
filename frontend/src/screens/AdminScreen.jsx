import React, { useState } from 'react';
import TeamManagementView from './TeamManagementView';
import InventoryView from './InventoryView';
import './AdminScreen.css';

const AdminScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('team');

  const renderContent = () => {
    switch (activeTab) {
      case 'team':
        return <TeamManagementView />;
      case 'inventory':
        return <InventoryView />;
      case 'reports':
        return <div className="reports-placeholder"><h3>Reportes - Próximamente</h3></div>;
      default:
        return <TeamManagementView />;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2 className="brand-title">Admin Panel</h2>
        <nav className="sidebar-nav">
          <button 
            className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Gestión de Equipo
          </button>
          <button 
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventario
          </button>
          <button 
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reportes
          </button>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <div/> {/* Spacer */}
          <div className="user-menu">
            <span>{user.user_alias}</span>
            <button onClick={onLogout} className="logout-button">Cerrar Sesión</button>
          </div>
        </header>
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminScreen;
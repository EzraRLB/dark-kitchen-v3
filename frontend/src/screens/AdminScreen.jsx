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
      default:
        return <TeamManagementView />;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2 className="brand-title">Admin Panel</h2>
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('team'); }}
          >
            Gestión de Equipo
          </a>
          <a 
            href="#" 
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('inventory'); }}
          >
            Inventario
          </a>
          <a href="#" className="nav-link">Reportes</a>
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
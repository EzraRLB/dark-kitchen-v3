import React from 'react';
import TeamManagementView from './TeamManagementView';
import './AdminScreen.css';

const AdminScreen = ({ user, onLogout }) => {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2 className="brand-title">Admin Panel</h2>
        <nav className="sidebar-nav">
          <a href="#" className="nav-link active">Gestión de Equipo</a>
          <a href="#" className="nav-link">Ingredientes</a>
          <a href="#" className="nav-link">Inventario</a>
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
          <TeamManagementView />
        </div>
      </main>
    </div>
  );
};

export default AdminScreen;
// frontend/src/App.jsx

import { useState, useEffect, useCallback } from 'react';
import LoginScreen from './screens/LoginScreen';
import KdsScreen from './screens/KdsScreen';
import AdminScreen from './screens/AdminScreen'; // <-- IMPORTA LA NUEVA PANTALLA

const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

function App() {
  const [user, setUser] = useState(null);
  
  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('accessToken');
  }, []);

  useEffect(() => {
    // ... (lógica de inactividad sin cambios) ...
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (user) {
        inactivityTimer = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
      }
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [user, handleLogout]);

  const handleLoginSuccess = (loggedInUser, token) => {
    localStorage.setItem('accessToken', token);
    setUser(loggedInUser);
  };

  const renderContent = () => {
    if (!user) {
      return <LoginScreen onLogin={handleLoginSuccess} />;
    }
    
    if (user.user_role === 'cocinero' || user.user_role === 'empacador') {
      return <KdsScreen user={user} onLogout={handleLogout} />;
    }
    
    // --- LÓGICA AÑADIDA PARA MOSTRAR LA PANTALLA DE ADMIN ---
    if (user.user_role === 'admin' || user.user_role === 'supervisor') {
      return <AdminScreen user={user} onLogout={handleLogout} />;
    }

    // Si el rol no coincide, por seguridad lo mandamos al login
    return <LoginScreen onLogin={handleLoginSuccess} />;
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;
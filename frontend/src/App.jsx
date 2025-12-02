import { useState, useEffect, useCallback } from 'react';
import LoginScreen from './screens/LoginScreen';
import KdsScreen from './screens/KdsScreen';
import AdminScreen from './screens/AdminScreen';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

function App() {
  const [user, setUser] = useState(null);
  
  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('accessToken');
  }, []);

  useEffect(() => {
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

  // 👇 --- CAMBIO 1: AÑADIMOS LOS NUEVOS ROLES AL MAPA ---
  const ROLE_MAP = {
    // Roles nuevos
    cocina: 'cocina',
    reparto: 'reparto',
    ensamble: 'ensamble',

    // Roles viejos (por si acaso)
    cocinero: 'cocinero',
    empacador: 'empacador',
    empleado: 'cocinero',
    employee: 'cocinero',

    // Roles de Admin
    admin: 'admin',
    administrador: 'admin',
    supervisor: 'supervisor',
    manager: 'supervisor'
  };

  const normalizeRole = (raw) => {
    if (!raw) return '';
    const r = String(raw).toLowerCase();
    return ROLE_MAP[r] || r;
  };

  const handleLoginSuccess = (a, b) => {
    let loggedInUser = a;
    let token = b;

    if (typeof a === 'string' && typeof b === 'object') {
      token = a;
      loggedInUser = b;
    }

    console.log('handleLoginSuccess - user:', loggedInUser, 'token:', token);

    const rawRole = loggedInUser?.user_role || loggedInUser?.role || loggedInUser?.role_name;
    const normalizedRole = normalizeRole(rawRole);

    const normalizedUser = {
      ...loggedInUser,
      user_role: normalizedRole
    };

    if (token) {
      localStorage.setItem('accessToken', token);
    }
    setUser(normalizedUser);
  };

  // 👇 --- CAMBIO 2: RECONOCEMOS LOS NUEVOS ROLES DEL KDS ---
  const isKdsRole = (role) => {
    // Lista de todos los roles que deben ir al KDS
    const kdsRoles = [
      'cocina', 'reparto', 'ensamble', // Los nuevos
      'cocinero', 'empacador'         // Los viejos (por si acaso)
    ];
    return kdsRoles.includes(role);
  };

  const renderContent = () => {
    if (!user) {
      return <LoginScreen onLogin={handleLoginSuccess} />;
    }
    
    // Esta lógica ahora funcionará con los nuevos roles
    if (isKdsRole(user.user_role)) {
      return <KdsScreen user={user} onLogout={handleLogout} />;
    }
    
    if (user.user_role === 'admin' || user.user_role === 'supervisor') {
      return <AdminScreen user={user} onLogout={handleLogout} />;
    }

    // Si el rol no coincide, por seguridad volver al login
    console.warn("Rol desconocido, volviendo al login:", user.user_role);
    return <LoginScreen onLogin={handleLoginSuccess} />;
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;
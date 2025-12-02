// ...existing code...
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PinInput from '../components/PinInput';
import './LoginScreen.css';

const LoginScreen = ({ onLogin }) => {
  const [view, setView] = useState('pin');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Nuevo estado: cuando un PIN pertenece a un admin pendiente de confirmar credenciales
  const [pendingAdmin, setPendingAdmin] = useState(null);

  // 👇 helper para NO repetir código
  const saveAuth = (user, token) => {
    if (token) {
      // aquí es donde nuestro TeamManagementView lo va a encontrar
      localStorage.setItem('accessToken', token);
      // opcional: guardar el usuario
      localStorage.setItem('currentUser', JSON.stringify(user || {}));
      // opcional: para que axios ya lo mande solito
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  useEffect(() => {
    if (pin.length === 6) {
      handlePinLogin(pin);
    }
  }, [pin]);

  const handlePinLogin = async (completedPin) => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://127.0.0.1:8000/api/users/token/pin/', {
        user_pin: completedPin,
      });

      // Depuración: ver qué devuelve el backend
      console.log('handlePinLogin response:', data);

      // Normalizar token y usuario por si la API tiene nombres distintos
      const token = data.access || data.token || data.access_token || null;
      const apiUser = data.user || data.user_info || data.profile || {};

      // Normalizar rol a string lowercase
      const role = (apiUser.user_role || apiUser.role || apiUser.role_name || '').toString().toLowerCase();

      if (role === 'admin' || role === 'administrador' || role === 'supervisor' || role === 'manager') {
        // Si el PIN pertenece a un admin: no iniciar sesión aquí.
        // Pedimos confirmación con email/contraseña en la vista admin.
        setPendingAdmin(apiUser);
        setUsername(apiUser.user_alias || apiUser.email || '');
        setPassword('');
        setView('admin');
        setError('Se detectó una cuenta administrativa. Ingresa correo/usuario y contraseña para confirmar.');
        // No guardar token ni llamar onLogin
      } else {
        // Si NO es admin -> iniciar sesión KDS como antes
        if (!apiUser.user_role && !apiUser.role && !apiUser.role_name) {
          apiUser.user_role = 'cocinero';
        }
        saveAuth(apiUser, token);
        if (typeof onLogin === 'function') {
          onLogin(apiUser, token);
        }
      }

      setIsLoading(false);
      setPin('');
    } catch (err) {
      setError('PIN incorrecto.');
      setPin('');
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        'http://127.0.0.1:8000/api/users/token/admin/',
        {
          username: username,
          password: password,
        }
      );

      // Si venimos de un pendingAdmin, usamos su info como user final
      const finalUser = pendingAdmin ? { ...pendingAdmin, user_role: 'admin' } : { user_role: 'admin', user_alias: username };

      // 👇 guardamos token también para admin
      const token = data.access || data.token || data.access_token || null;
      saveAuth(finalUser, token);

      if (typeof onLogin === 'function') {
        onLogin(finalUser, token);
      }

      // limpiar estado pendiente
      setPendingAdmin(null);
      setIsLoading(false);
    } catch (err) {
      setError('Usuario o contraseña incorrecta.');
      setIsLoading(false);
    }
  };

  // Ajuste UI: si salimos al view='pin' limpiar pendingAdmin
  const switchToPin = () => {
    setView('pin');
    setError('');
    setPin('');
    setPendingAdmin(null);
  };

  return (
    <div className="login-screen">
      <div className="branding-panel">
        <div className="branding-content">
          <h2>Dark Kitchen</h2>
          <p>La herramienta definitiva para tu cocina.</p>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-content">
          {view === 'pin' ? (
            <>
              <h1>Acceso Cocina</h1>
              <p className="subtitle">Ingresa tu PIN de 6 dígitos</p>
              <PinInput length={6} onComplete={setPin} />
              {error && <p className="error-message">{error}</p>}
              {isLoading && <p className="loading-message">Verificando...</p>}
              <a
                className="switch-link"
                onClick={() => {
                  setView('admin');
                  setError('');
                  setPin('');
                }}
              >
                ¿Eres administrador?
              </a>
            </>
          ) : (
            <>
              <h1>Acceso Administrador</h1>
              <p className="subtitle">Ingresa tus credenciales</p>
              {pendingAdmin && (
                <p className="info-message">PIN verificado para: {pendingAdmin.user_alias || pendingAdmin.email || 'administrador'}. Confirma con tu correo/usuario y contraseña.</p>
              )}
              <form onSubmit={handleAdminLogin}>
                <div className="input-group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Usuario o correo"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Contraseña"
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
              <a
                className="switch-link"
                onClick={() => {
                  switchToPin();
                  setUsername('');
                  setPassword('');
                }}
              >
                Ingresar como cocinero
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
// ...existing code...
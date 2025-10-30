// frontend/src/screens/LoginScreen.jsx

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
        }
      );

      // 👇 guardamos token
      saveAuth(data.user, data.access);

      // 👇 avisamos al padre (tú ya lo tenías)
      onLogin(data.user, data.access);

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

      const user = { user_role: 'admin', user_alias: username };

      // 👇 guardamos token también para admin
      saveAuth(user, data.access);

      onLogin(user, data.access);
      setIsLoading(false);
    } catch (err) {
      setError('Usuario o contraseña incorrecta.');
      setIsLoading(false);
    }
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
              <form onSubmit={handleAdminLogin}>
                <div className="input-group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Usuario"
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
                  setView('pin');
                  setError('');
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

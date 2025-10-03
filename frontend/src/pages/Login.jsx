import React, { useState } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    const isAdmin = email.trim().toLowerCase().endsWith("@darkkitchen.local");
    const displayName = (name || email.split("@")[0]).trim();
    login({ name: displayName, email, role: isAdmin ? "admin" : "staff" });
    window.location.href = isAdmin ? "/admin/team" : "/login";
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img className="logo" src="/images/img-logo-uloop.jpeg" alt="Uloop" />
        </div>

        <h1 className="tittle">Bienvenid@</h1>
        <p className="subtittle">Inicie sesión</p>

        <form onSubmit={handleLogin} className="form">
          <div className="input-group">
            <input type="text" placeholder="Nombre (para saludo)"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="options">
            <label><input type="checkbox" className="checkbox" /> Recuérdame</label>
            <a href="#" className="forgot">¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit" className="login-btn">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

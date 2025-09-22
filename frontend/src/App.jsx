import React, { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login con:", { email, password });
    // llamada al backend
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/*logos */}
        <div className="logo-container">
          <img src="" alt="" />
          <img src="" alt="" />
        </div>

        <h1 className="tittle">Bienvenidos</h1>
        <p className="subtittle">Inicie sesion</p>

        <form onSubmit={handleLogin} className="form">
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email" 
              value=""
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password"
              value=""
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="options">
            <label>
              <input className="checkbox" /> Recuerdame
            </label>
            <a href="#" className="forgot">
              Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}

export default App;

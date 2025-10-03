import { useAuth } from "../context/AuthContext";

export default function Layout({ title, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        {/* IZQUIERDA: LOGOS */}
        <div className="topbar-left">
          <img
            className="brand-logo"
            src="/images/img-logo-uloop.jpeg"
            alt="ULoop"
          />
          <img
            className="brand-logo second"
            src="/images/img-logo-partner.png"   // <-- cambia el nombre si tu archivo se llama distinto
            alt="Partner"
          />
        </div>

        {/* CENTRO: TÍTULO */}
        <div className="topbar-center">
          <span className="topbar-title">{title}</span>
        </div>

        {/* DERECHA: USUARIO */}
        <div className="topbar-right">
          {user && (
            <>
              <span className="welcome">
                Hola, <b>{user.name}</b> ({user.role})
              </span>
              <button className="btn-out" onClick={logoutAndBack}>Salir</button>
            </>
          )}
        </div>
      </header>

      <main className="content">{children}</main>
    </div>
  );

  function logoutAndBack() {
    logout();
    window.location.href = "/login";
  }
}

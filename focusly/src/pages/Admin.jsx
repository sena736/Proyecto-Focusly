import { useMemo, useState } from "react";
import "./Admin.css";

const ROLES = ["Invitado", "Usuario", "Administrador"];
const INITIAL_USERS = [
  { id: 1, name: "Juan Pérez", email: "juan@focusly.com", role: "Usuario", active: true },
  { id: 2, name: "María Gómez", email: "maria@focusly.com", role: "Usuario", active: true },
  { id: 3, name: "Carlos Rodríguez", email: "carlos@focusly.com", role: "Administrador", active: true },
  { id: 4, name: "Laura Martínez", email: "laura@focusly.com", role: "Invitado", active: false },
];
const INITIAL_QUOTES = [
  { id: 1, content: "La constancia de hoy construye tus resultados de mañana.", active: true },
  { id: 2, content: "Un paso a la vez también es avanzar.", active: true },
  { id: 3, content: "Concéntrate en lo que puedes completar ahora.", active: false },
];

export default function Admin({ adminName = "Carlos Rodríguez", onNavigate = () => {} }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [section, setSection] = useState("overview");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("Todos");
  const [newQuote, setNewQuote] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const filteredUsers = useMemo(() => users.filter((u) => {
    const q = query.trim().toLowerCase();
    return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (role === "Todos" || u.role === role);
  }), [users, query, role]);

  const activeUsers = users.filter((u) => u.active).length;
  const activeQuotes = quotes.filter((q) => q.active).length;

  const go = (name) => {
    setSection(name);
    requestAnimationFrame(() => document.getElementById(`admin-${name}`)?.scrollIntoView({ behavior: "smooth" }));
  };
  const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  const changeRole = (id, value) => setUsers((list) => list.map((u) => u.id === id ? { ...u, role: value } : u));
  const toggleUser = (id) => setUsers((list) => list.map((u) => u.id === id ? { ...u, active: !u.active } : u));
  const toggleQuote = (id) => setQuotes((list) => list.map((q) => q.id === id ? { ...q, active: !q.active } : q));
  const deleteQuote = (id) => setQuotes((list) => list.filter((q) => q.id !== id));
  const addQuote = (e) => {
    e.preventDefault();
    if (!newQuote.trim()) return;
    setQuotes((list) => [...list, { id: Date.now(), content: newQuote.trim(), active: true }]);
    setNewQuote(""); setShowQuoteForm(false);
  };

  return (
    <div className={`focusly-admin ${darkMode ? "is-dark" : ""}`}>
      <aside className="focusly-admin-sidebar">
        <div className="focusly-admin-brand"><span className="focusly-admin-brand-mark">F</span><span>FOCUSLY</span></div>
        <div className="focusly-admin-label">ADMINISTRACIÓN</div>
        <nav className="focusly-admin-nav">
          {[["overview", "▦", "Resumen"], ["users", "♙", "Usuarios"], ["roles", "◇", "Roles y permisos"], ["quotes", "✦", "Frases motivacionales"]].map(([key, icon, label]) => (
            <button key={key} className={`focusly-admin-nav-item ${section === key ? "is-active" : ""}`} onClick={() => go(key)}><span>{icon}</span>{label}</button>
          ))}
          <button className="focusly-admin-nav-item" onClick={() => onNavigate("dashboard")}><span>←</span>Volver al dashboard</button>
        </nav>
        <div className="focusly-admin-sidebar-footer"><button className="focusly-admin-theme" onClick={() => setDarkMode(!darkMode)}><span>{darkMode ? "☀" : "☾"}</span>{darkMode ? "Modo claro" : "Modo oscuro"}</button></div>
      </aside>

      <main className="focusly-admin-main">
        <header className="focusly-admin-header">
          <div><p className="focusly-admin-eyebrow">Panel administrativo</p><h1>¡Hola, {adminName.split(" ")[0]}!</h1><p>Gestiona usuarios, roles y contenido de Focusly desde un solo lugar.</p></div>
          <div className="focusly-admin-profile"><span className="focusly-admin-avatar">{initials(adminName)}</span><div><strong>{adminName}</strong><small>Administrador</small></div></div>
        </header>

        <section id="admin-overview" className="focusly-admin-section">
          <div className="focusly-admin-section-heading"><div><span className="focusly-admin-kicker">SISTEMA</span><h2>Resumen general</h2></div></div>
          <div className="focusly-admin-stats">
            {[["♙", "Usuarios registrados", users.length], ["●", "Usuarios activos", activeUsers], ["◇", "Roles disponibles", ROLES.length], ["✦", "Frases activas", activeQuotes]].map(([icon, label, value]) => <article className="focusly-admin-stat-card" key={label}><span className="focusly-admin-stat-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>)}
          </div>
        </section>

        <section id="admin-users" className="focusly-admin-section">
          <div className="focusly-admin-section-heading"><div><span className="focusly-admin-kicker">GESTIÓN DE USUARIOS</span><h2>Usuarios registrados</h2></div><span className="focusly-admin-count">{filteredUsers.length} usuarios</span></div>
          <div className="focusly-admin-card">
            <div className="focusly-admin-toolbar"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o correo..." /><select value={role} onChange={(e) => setRole(e.target.value)}><option>Todos</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="focusly-admin-table-wrap"><table className="focusly-admin-table"><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
              {filteredUsers.map((u) => <tr key={u.id}><td><div className="focusly-admin-user-cell"><span className="focusly-admin-user-avatar">{initials(u.name)}</span><span><strong>{u.name}</strong><small>{u.email}</small></span></div></td><td><select className="focusly-admin-role-select" value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></td><td><span className={`focusly-admin-status ${u.active ? "is-active" : "is-inactive"}`}><span>●</span>{u.active ? "Activo" : "Inactivo"}</span></td><td><button className="focusly-admin-action-button" onClick={() => toggleUser(u.id)}>{u.active ? "Desactivar" : "Activar"}</button></td></tr>)}
            </tbody></table>{!filteredUsers.length && <div className="focusly-admin-empty">No se encontraron usuarios con los filtros seleccionados.</div>}</div>
          </div>
        </section>

        <section id="admin-roles" className="focusly-admin-section">
          <div className="focusly-admin-section-heading"><div><span className="focusly-admin-kicker">CONTROL DE ACCESO</span><h2>Roles y permisos</h2></div></div>
          <div className="focusly-admin-role-grid">{ROLES.map((r) => <article className="focusly-admin-role-card" key={r}><div className="focusly-admin-role-icon">◇</div><h3>{r}</h3><p>{r === "Administrador" ? "Privilegios para administrar el sistema y los usuarios registrados." : r === "Usuario" ? "Acceso a las funcionalidades principales de productividad." : "Acceso limitado a la información pública del sistema."}</p><span className="focusly-admin-role-note">Rol asociado a un usuario</span></article>)}</div>
        </section>

        <section id="admin-quotes" className="focusly-admin-section">
          <div className="focusly-admin-section-heading"><div><span className="focusly-admin-kicker">CONTENIDO</span><h2>Frases motivacionales</h2></div><button className="focusly-admin-primary" onClick={() => setShowQuoteForm(!showQuoteForm)}>+ Nueva frase</button></div>
          {showQuoteForm && <form className="focusly-admin-quote-form" onSubmit={addQuote}><textarea value={newQuote} onChange={(e) => setNewQuote(e.target.value)} placeholder="Escribe una frase motivacional..." rows="3" /><div><button className="focusly-admin-primary">Guardar frase</button><button type="button" className="focusly-admin-secondary" onClick={() => setShowQuoteForm(false)}>Cancelar</button></div></form>}
          <div className="focusly-admin-quotes">{quotes.map((q) => <article className={`focusly-admin-quote-card ${q.active ? "" : "is-inactive"}`} key={q.id}><span className="focusly-admin-quote-mark">“</span><div className="focusly-admin-quote-content"><p>{q.content}</p><span>{q.active ? "Frase activa" : "Frase inactiva"}</span></div><div className="focusly-admin-quote-actions"><button onClick={() => toggleQuote(q.id)}>{q.active ? "Desactivar" : "Activar"}</button><button className="is-danger" onClick={() => deleteQuote(q.id)}>Eliminar</button></div></article>)}</div>
        </section>
      </main>
    </div>
  );
}
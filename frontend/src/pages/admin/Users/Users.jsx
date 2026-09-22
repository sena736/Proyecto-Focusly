import React, { useMemo, useState } from "react";
import UserTable from "../../../components/admin/UserTable/UserTable";
import "./Users.css";

const INITIAL_USERS = [
  {
    id: 1,
    name: "María González",
    email: "maria.gonzalez@email.com",
    role: "Estudiante",
    status: "Activo",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@email.com",
    role: "Estudiante",
    status: "Activo",
  },
  {
    id: 3,
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    role: "Administrador",
    status: "Activo",
  },
  {
    id: 4,
    name: "Luis Pérez",
    email: "luis.perez@email.com",
    role: "Estudiante",
    status: "Inactivo",
  },
  {
    id: 5,
    name: "Sofía Torres",
    email: "sofia.torres@email.com",
    role: "Estudiante",
    status: "Activo",
  },
];

const Users = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("todos");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        filterRole === "todos" ||
        user.role.toLowerCase() === filterRole.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

  const handleToggleStatus = (id) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Activo" ? "Inactivo" : "Activo",
            }
          : user,
      ),
    );
  };

  const handleDelete = (id) => {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
  };

  return (
    <main className="admin-users-page">
      <section className="admin-users-container">
        <header className="admin-users-header">
          <div>
            <span className="admin-users-label">ADMINISTRACIÓN</span>

            <h1>Usuarios</h1>

            <p>Consulta y administra los usuarios registrados en Focusly.</p>
          </div>

          <div className="admin-users-count">
            <strong>{users.length}</strong>
            <span>usuarios registrados</span>
          </div>
        </header>

        <section className="admin-users-toolbar">
          <div className="admin-users-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o correo..."
              aria-label="Buscar usuarios"
            />
          </div>

          <select
            className="admin-users-filter"
            value={filterRole}
            onChange={(event) => setFilterRole(event.target.value)}
            aria-label="Filtrar usuarios por rol"
          >
            <option value="todos">Todos los roles</option>
            <option value="estudiante">Estudiante</option>
            <option value="administrador">Administrador</option>
          </select>
        </section>

        <UserTable
          users={filteredUsers}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
};

export default Users;

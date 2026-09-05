
import React from "react";
import { Edit, Trash2, UserRound } from "lucide-react";
import "./UserTable.css";

const UserTable = ({
  users = [],
  onEdit,
  onDelete,
}) => {
  const defaultUsers = [
    {
      id: 1,
      name: "María López",
      email: "maria@email.com",
      role: "Usuario",
      status: "Activo",
    },
    {
      id: 2,
      name: "Juan Pérez",
      email: "juan@email.com",
      role: "Usuario",
      status: "Activo",
    },
    {
      id: 3,
      name: "Laura Gómez",
      email: "laura@email.com",
      role: "Usuario",
      status: "Inactivo",
    },
  ];

  const userList = users.length > 0 ? users : defaultUsers;

  return (
    <section className="user-table">
      <div className="user-table__header">
        <div>
          <h2>Usuarios</h2>
          <p>Gestiona los usuarios registrados en Focusly</p>
        </div>

        <span className="user-table__count">
          {userList.length} usuarios
        </span>
      </div>

      <div className="user-table__wrapper">
        <table className="user-table__table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {userList.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-table__user">
                    <div className="user-table__avatar">
                      <UserRound size={18} />
                    </div>

                    <span>{user.name}</span>
                  </div>
                </td>

                <td>{user.email}</td>

                <td>
                  <span className="user-table__role">
                    {user.role}
                  </span>
                </td>

                <td>
                  <span
                    className={`user-table__status ${
                      user.status === "Activo"
                        ? "user-table__status--active"
                        : "user-table__status--inactive"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td>
                  <div className="user-table__actions">
                    <button
                      type="button"
                      className="user-table__action user-table__action--edit"
                      onClick={() => onEdit?.(user)}
                      aria-label={`Editar ${user.name}`}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      className="user-table__action user-table__action--delete"
                      onClick={() => onDelete?.(user)}
                      aria-label={`Eliminar ${user.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userList.length === 0 && (
        <div className="user-table__empty">
          <UserRound size={35} />
          <h3>No hay usuarios</h3>
          <p>Aún no existen usuarios registrados.</p>
        </div>
      )}
    </section>
  );
};

export default UserTable;

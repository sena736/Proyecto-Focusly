import React from "react";
import UserTable from "../../../components/admin/UserTable/UserTable";
import RoleSelect from "../../../components/admin/RoleSelect/RoleSelect";
import { useUsers } from "../../../hooks/useUsers";
import "./Users.css";

const Users = () => {
  const {
    users = [],
    isLoading,
    isError,
    error,
    updateUserRole,
    isUpdatingRole,
  } = useUsers();

  const handleRoleChange = (userId, role) => {
    updateUserRole({
      userId,
      role,
    });
  };

  if (isLoading) {
    return (
      <main className="users">
        <div className="users__container">
          <div className="users__state">
            <p>Cargando usuarios...</p>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="users">
        <div className="users__container">
          <div className="users__state users__state--error">
            <p>
              {error?.message ||
                "No fue posible cargar los usuarios."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="users">
      <div className="users__container">
        <header className="users__header">
          <div>
            <h1>Usuarios</h1>
            <p>
              Administra los usuarios registrados y sus roles en
              Focusly.
            </p>
          </div>

          <span className="users__count">
            {users.length}{" "}
            {users.length === 1 ? "usuario" : "usuarios"}
          </span>
        </header>

        <section className="users__table-container">
          <UserTable
            users={users}
            renderRole={(user) => (
              <RoleSelect
                value={user.role}
                onChange={(event) =>
                  handleRoleChange(
                    user.id,
                    event.target.value
                  )
                }
                disabled={isUpdatingRole}
              />
            )}
          />
        </section>
      </div>
    </main>
  );
};

export default Users;

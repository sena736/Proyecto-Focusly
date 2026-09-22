import { useState } from "react";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const name = user?.name || user?.nombre || "Usuario Focusly";

  const email = user?.email || user?.correo || "usuario@email.com";

  const role = user?.role || user?.rol || "Usuario";

  const avatar = user?.avatar || user?.photo || user?.picture || "";

  const handleEdit = () => {
    setIsEditing((current) => !current);
  };

  return (
    <main className="profile-page">
      <section className="profile-container">
        <header className="profile-header">
          <div>
            <span className="profile-header__label">CUENTA</span>

            <h1>Mi perfil</h1>

            <p>
              Consulta tu información personal y administra los datos de tu
              cuenta.
            </p>
          </div>
        </header>

        <section className="profile-content">
          <ProfileCard
            name={name}
            email={email}
            role={role}
            avatar={avatar}
            onEdit={handleEdit}
          />

          {isEditing && (
            <div className="profile-edit-message">
              <p>La edición del perfil estará disponible próximamente.</p>

              <button type="button" onClick={() => setIsEditing(false)}>
                Cerrar
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default Profile;

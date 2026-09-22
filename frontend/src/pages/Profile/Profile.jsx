import React from "react";
import useProfile from "../../hooks/useProfile";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import "./Profile.css";

const Profile = () => {
  const { profile, isLoading, isError, error, updateProfile, isUpdating } =
    useProfile();

  if (isLoading) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-state">
            <div className="profile-loader"></div>
            <p>Cargando perfil...</p>
          </div>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-state profile-state-error">
            <h2>No se pudo cargar el perfil</h2>
            <p>
              {error?.message || "Ocurrió un error al obtener tu información."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-state">
            <h2>No hay información del perfil</h2>
            <p>No se encontró información para mostrar.</p>
          </div>
        </section>
      </main>
    );
  }

  const name = profile.name || profile.nombre || "Usuario Focusly";

  const email = profile.email || profile.correo || "usuario@email.com";

  const role = profile.role || profile.rol || "Usuario";

  const avatar = profile.avatar || profile.photo || profile.picture || "";

  return (
    <main className="profile-page">
      <section className="profile-container">
        <header className="profile-header">
          <span className="profile-header__label">CUENTA</span>

          <h1>Mi perfil</h1>

          <p>
            Consulta tu información personal y administra los datos de tu
            cuenta.
          </p>
        </header>

        <section className="profile-content">
          <ProfileCard
            name={name}
            email={email}
            role={role}
            avatar={avatar}
            onEdit={updateProfile}
            loading={isUpdating}
          />
        </section>
      </section>
    </main>
  );
};

export default Profile;

import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useProfile from "../../hooks/useProfile";
import PageHeader from "../../components/layout/PageHeader/PageHeader";
import ProfileCard from "../../components/profile/ProfileCard/ProfileCard";
import ProfileEditForm from "../../components/profile/ProfileEditForm/ProfileEditForm";
import Alert from "../../components/ui/Alert/Alert";
import Loader from "../../components/ui/Loader/Loader";
import Modal from "../../components/ui/Modal/Modal";
import "./Profile.css";

const Profile = () => {
  const {
    profile,
    isLoading,
    isError,
    error,
    updateProfileAsync,
    isUpdating,
  } = useProfile();

  // The header, sidebar and dashboard read the name from AuthContext.
  const { updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  // The element that opened the modal, so focus can go back to it.
  const triggerRef = useRef(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (!isEditing && !isUpdating && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isEditing, isUpdating]);

  const handleOpenEdit = (event) => {
    triggerRef.current = event?.currentTarget ?? null;
    setSaveError("");
    setSaved(false);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    if (isUpdating) {
      return;
    }

    restoreFocusRef.current = true;
    setIsEditing(false);
  };

  const handleSubmit = async ({ name: newName }) => {
    setSaveError("");

    try {
      const updated = await updateProfileAsync({ name: newName });

      updateUser({ name: updated?.name || newName });

      restoreFocusRef.current = true;
      setIsEditing(false);
      setSaved(true);
    } catch (submitError) {
      setSaveError(submitError?.message || "No se pudo actualizar el perfil.");
    }
  };

  if (isLoading) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-state">
            <Loader text="Cargando perfil..." />
          </div>
        </section>
      </main>
    );
  }

  // A failed background refetch keeps `data`: only block the page when there
  // is nothing to show.
  if (isError && !profile) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-state">
            <Alert
              type="error"
              title="No se pudo cargar el perfil"
              message={
                error?.message || "Ocurrió un error al obtener tu información."
              }
            />
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
        <PageHeader
          title="Mi perfil"
          subtitle="Consulta tu información personal y administra los datos de tu cuenta."
          breadcrumb={<span className="profile-header__label">CUENTA</span>}
        />

        <section className="profile-content">
          {saved && (
            <div className="profile-content__notice">
              <Alert
                type="success"
                message="Tu nombre se actualizó correctamente."
                onClose={() => setSaved(false)}
              />
            </div>
          )}

          <ProfileCard
            name={name}
            email={email}
            role={role}
            avatar={avatar}
            onEdit={handleOpenEdit}
            loading={isUpdating}
          />
        </section>
      </section>

      {/* ProfileEditForm trae sus propios botones: el Modal no muestra footer */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseEdit}
        title="Editar nombre"
        description="Es el nombre con el que apareces en Focusly."
        showConfirm={false}
        showCancel={false}
        loading={isUpdating}
      >
        <ProfileEditForm
          initialName={profile.name || ""}
          onSubmit={handleSubmit}
          onCancel={handleCloseEdit}
          loading={isUpdating}
          error={saveError}
        />
      </Modal>
    </main>
  );
};

export default Profile;

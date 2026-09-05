import "./ProfileCard.css";

const ProfileCard = ({
  name = "Usuario Focusly",
  email = "usuario@email.com",
  avatar,
  role = "Usuario",
  onEdit,
}) => {
  const getInitials = (value) => {
    return value
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
  };

  return (
    <article className="profile-card">
      <div className="profile-card__avatar">
        {avatar ? (
          <img src={avatar} alt={`Avatar de ${name}`} />
        ) : (
          <span>{getInitials(name)}</span>
        )}

        <span className="profile-card__status" />
      </div>

      <div className="profile-card__info">
        <span className="profile-card__role">{role}</span>

        <h2 className="profile-card__name">{name}</h2>

        <p className="profile-card__email">{email}</p>
      </div>

      <button
        type="button"
        className="profile-card__edit"
        onClick={onEdit}
        aria-label="Editar perfil"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 20h9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Editar
      </button>
    </article>
  );
};

export default ProfileCard;

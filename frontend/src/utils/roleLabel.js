import { USER_ROLES } from "./constants";

// Spanish label shown next to the user's name (dashboard and public header).
export const getRoleLabel = (role) =>
  role === USER_ROLES.ADMIN ? "Administrador" : "Estudiante";

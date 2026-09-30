import { describe, it, expect } from "vitest";

import { getRoleLabel } from "./roleLabel";

describe("getRoleLabel", () => {
  it("labels ADMIN as Administrador", () => {
    expect(getRoleLabel("ADMIN")).toBe("Administrador");
  });

  it.each(["USER", undefined, null, "", "SOMETHING_ELSE"])(
    "labels %s as Estudiante",
    (role) => {
      expect(getRoleLabel(role)).toBe("Estudiante");
    },
  );
});

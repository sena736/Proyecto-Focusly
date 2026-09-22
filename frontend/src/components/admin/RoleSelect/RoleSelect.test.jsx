import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoleSelect from "./RoleSelect";

describe("RoleSelect", () => {
  test("muestra el rol actual del usuario correctamente", () => {
    render(
      <RoleSelect
        value="Usuario"
        onChange={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox");

    expect(select).toHaveValue("Usuario");
  });

  test("dispara el callback de cambio de rol con el valor correcto", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <RoleSelect
        value="Usuario"
        onChange={handleChange}
      />
    );

    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "Administrador");

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: "Administrador",
        }),
      })
    );
  });
});
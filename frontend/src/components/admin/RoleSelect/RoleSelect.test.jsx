import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoleSelect from "./RoleSelect";

const ControlledRoleSelect = ({ onChange }) => {
  const [value, setValue] = React.useState("USER");

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange(event);
  };

  return <RoleSelect value={value} onChange={handleChange} />;
};

describe("RoleSelect", () => {
  test("muestra el rol actual del usuario correctamente", () => {
    render(
      <RoleSelect
        value="USER"
        onChange={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox");

    expect(select).toHaveValue("USER");
  });

  test("dispara el callback de cambio de rol con el valor correcto", async () => {
    const user = userEvent.setup();
    let receivedValue;
    const handleChange = vi.fn((event) => {
      receivedValue = event.target.value;
    });

    render(
      <ControlledRoleSelect
        onChange={handleChange}
      />
    );

    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "Administrador");

    expect(handleChange).toHaveBeenCalled();
    expect(receivedValue).toBe("ADMIN");
  });
});
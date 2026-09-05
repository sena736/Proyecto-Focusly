import { useState } from "react";
import "./Checkbox.css";

function Checkbox({
  label = "",
  checked: checkedProp,
  onChange,
  type = "circle",
}) {
  const [internalChecked, setInternalChecked] = useState(false);

  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : internalChecked;

  const handleChange = () => {
    const newValue = !checked;

    if (!isControlled) {
      setInternalChecked(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <label className={`checkbox-container ${type}`}>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      <span className="checkmark">{checked && "✓"}</span>

      {label && (
        <span className={`checkbox-label ${checked ? "completed" : ""}`}>
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;

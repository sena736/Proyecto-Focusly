import React from "react";
import "./Loader.css";

const Loader = ({
  size = "medium",
  text = "Cargando...",
  showText = true,
}) => {
  return (
    <div className={`loader-container loader-${size}`}>
      <div className="loader-spinner">
        <div className="loader-circle"></div>
      </div>

      {showText && (
        <p className="loader-text">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
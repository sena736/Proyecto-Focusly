// src/context/ThemeContext.jsx

import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  getInitialTheme,
  saveTheme,
} from "../services/storage.service";

import {
  THEMES,
} from "../utils/constants";


/* =========================================================
   FOCUSLY - THEME CONTEXT
========================================================= */


/* =========================================================
   1. CREAR CONTEXTO
========================================================= */

export const ThemeContext =
  createContext(null);


/* =========================================================
   2. PROVIDER
========================================================= */

export const ThemeProvider = ({
  children,
}) => {
  /* -------------------------------------------------------
     Tema inicial
  ------------------------------------------------------- */

  const [theme, setTheme] = useState(
    getInitialTheme
  );


  /* -------------------------------------------------------
     Aplicar tema al documento
  ------------------------------------------------------- */

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    saveTheme(theme);
  }, [theme]);


  /* -------------------------------------------------------
     Cambiar entre light y dark
  ------------------------------------------------------- */

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === THEMES.LIGHT
        ? THEMES.DARK
        : THEMES.LIGHT
    );
  };


  /* -------------------------------------------------------
     Cambiar tema manualmente
  ------------------------------------------------------- */

  const changeTheme = (
    newTheme
  ) => {
    const validThemes = [
      THEMES.LIGHT,
      THEMES.DARK,
    ];

    if (
      !validThemes.includes(
        newTheme
      )
    ) {
      return;
    }

    setTheme(newTheme);
  };


  /* -------------------------------------------------------
     Saber si está activo el modo oscuro
  ------------------------------------------------------- */

  const isDarkMode =
    theme === THEMES.DARK;


  /* -------------------------------------------------------
     Valor compartido
  ------------------------------------------------------- */

  const value = {
    theme,
    isDarkMode,

    toggleTheme,
    changeTheme,
  };


  /* -------------------------------------------------------
     Provider
  ------------------------------------------------------- */

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
};
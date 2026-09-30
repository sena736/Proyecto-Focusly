// src/context/ThemeContext.jsx

import {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getInitialTheme,
  getSavedTheme,
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

const DARK_SCHEME_QUERY =
  "(prefers-color-scheme: dark)";

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
     Elección explícita del usuario.

     Mientras no exista (nada guardado), el tema sigue al
     sistema operativo y NO se persiste.
  ------------------------------------------------------- */

  const [hasExplicitChoice, setHasExplicitChoice] =
    useState(() => getSavedTheme() !== null);

  // Siempre refleja el último tema elegido, incluso antes
  // de que React vuelva a renderizar (evita cierres obsoletos).
  const themeRef = useRef(theme);


  /* -------------------------------------------------------
     Aplicar tema al documento
  ------------------------------------------------------- */

  useEffect(() => {
    themeRef.current = theme;

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
  }, [theme]);


  /* -------------------------------------------------------
     Seguir al sistema mientras no haya elección explícita
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      hasExplicitChoice ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery =
      window.matchMedia(DARK_SCHEME_QUERY);

    if (!mediaQuery) {
      return undefined;
    }

    const handleChange = (event) => {
      const next = event.matches
        ? THEMES.DARK
        : THEMES.LIGHT;

      themeRef.current = next;
      setTheme(next);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener(
        "change",
        handleChange
      );

      return () => {
        mediaQuery.removeEventListener(
          "change",
          handleChange
        );
      };
    }

    // Safari < 14
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);

      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }

    return undefined;
  }, [hasExplicitChoice]);


  /* -------------------------------------------------------
     Aplicar una elección explícita del usuario
  ------------------------------------------------------- */

  const applyExplicitTheme = (nextTheme) => {
    themeRef.current = nextTheme;

    setTheme(nextTheme);
    setHasExplicitChoice(true);
    saveTheme(nextTheme);
  };


  /* -------------------------------------------------------
     Cambiar entre light y dark
  ------------------------------------------------------- */

  const toggleTheme = () => {
    applyExplicitTheme(
      themeRef.current === THEMES.LIGHT
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

    applyExplicitTheme(newTheme);
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

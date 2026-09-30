import { useEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";

import PublicHeader from "../../components/layout/PublicHeader/PublicHeader";
import Footer from "../../components/layout/Footer/Footer";
import "./PublicLayout.css";

/*
  Layout de las páginas públicas (landing y About).
  Login y Register quedan fuera de este layout.
*/
// Un hash mal codificado (p. ej. "#%") haría fallar decodeURIComponent.
const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const PublicLayout = () => {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  // React Router no hace scroll por sí solo: si la URL trae un hash se
  // desplaza a esa sección; si no, vuelve al inicio de la página.
  // - En la carga inicial y en atrás/adelante (POP) sin hash no se toca el
  //   scroll, para respetar la restauración del navegador.
  // - `key` cambia en cada navegación, así un mismo enlace funciona al repetirse.
  // - Sin `behavior` en scrollIntoView, el CSS global (scroll-behavior y
  //   prefers-reduced-motion) decide si la animación es suave.
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(safeDecode(hash.slice(1)));

      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }

    if (navigationType === "POP") return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, key, navigationType]);

  return (
    <div className="public-layout">
      <PublicHeader />

      <main className="public-layout__main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;

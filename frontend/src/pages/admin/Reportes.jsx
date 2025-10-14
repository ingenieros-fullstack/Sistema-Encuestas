// Reportes.jsx
// (Quita esta línea si estás usando Bootstrap por CDN en index.html)
// import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";

export default function Reportes() {
  useEffect(() => {
    document.body.style.background =
      "radial-gradient(circle at top, #eef2f7 0%, #dfe3e8 100%)";
    document.body.style.minHeight = "100vh";
  }, []);

  const year = new Date().getFullYear();

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card border-0 shadow-lg p-5 animate-fade rounded-5"
        style={{ maxWidth: "650px", background: "white" }}
      >
        <div className="badge-icon mx-auto mb-4">
          {/* Opción 1: emoji */}
          <span className="badge-emoji" role="img" aria-label="analytics">
            📈
          </span>
        </div>

        <h1 className="fw-bold text-dark mb-2">Reportes</h1>
        <p className="text-muted mb-4">Aquí podrás generar y visualizar reportes.</p>

        <div className="mx-auto mb-4 deco-line"></div>

        <h3 className="fw-semibold text-primary mb-3">🚧 Próximamente 🚧</h3>
        <p className="text-secondary px-3">
          Estamos trabajando para ofrecerte una vista completa de tus reportes y métricas.
          Muy pronto podrás acceder a tus datos detallados aquí.
        </p>
      </div>

      <p className="text-muted mt-4 small">
        © {year} Sistema de Encuestas — Velcode
      </p>

      {/* Estilos locales */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade { animation: fadeIn 0.85s ease; }

        .badge-icon{
          width:100px; height:100px; border-radius:50%;
          background: linear-gradient(135deg, rgba(13,110,253,.15) 0%, rgba(111,66,193,.15) 100%);
          display:flex; align-items:center; justify-content:center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.6);
        }
        .badge-emoji{
          font-size:2.8rem; line-height:1;
          transform: translateY(1px); /* corrige el baseline del emoji */
        }
        .badge-img{
          max-width:60%; height:auto; display:block;
        }

        .deco-line{
          width:80px; height:4px; border-radius:4px;
          background: linear-gradient(90deg, #0d6efd, #6f42c1, #0d6efd);
          background-size: 200% 100%;
          animation: gradientMove 3s ease infinite;
        }
        @keyframes gradientMove {
          0%{ background-position:0% 50%; }
          50%{ background-position:100% 50%; }
          100%{ background-position:0% 50%; }
        }

        .card:hover{
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(13,110,253,.15);
          transition: all .25s ease;
        }
      `}</style>
    </div>
  );
}

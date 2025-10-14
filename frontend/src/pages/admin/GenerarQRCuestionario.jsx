import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";
import "../../GenerarQR.css";

export default function GenerarQRCuestionario() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const url = useMemo(
    () => `${window.location.origin}/resolver/cuestionario/${codigo}`,
    [codigo]
  );

  // Personalización
  const [size, setSize] = useState(320);
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const [margin, setMargin] = useState(true);

  const qrWrapperRef = useRef(null);

  const toast = (msg) => {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className = "qr-toast";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Enlace copiado");
    } catch {
      toast("No se pudo copiar");
    }
  };

  const openLink = () => window.open(url, "_blank", "noopener,noreferrer");

  const downloadPNG = () => {
    const canvas = qrWrapperRef.current?.querySelector("canvas");
    if (!canvas) return toast("No se encontró el QR");
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${codigo || "qr"}.png`;
    a.click();
  };

  return (
    <div className="qr-page">
      <div className="qr-container">
        {/* Header */}
        <header className="qr-header">
          <div className="qr-header-left">
            <button className="btn btn-outline" onClick={() => navigate(-1)} aria-label="Volver">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <span>Volver</span>
            </button>
            <div>
              <h1 className="qr-title">Generador de Código QR</h1>
              <p className="qr-subtitle">
                Escanee para acceder al cuestionario (empleados y supervisores).
              </p>
            </div>
          </div>

          <div className="qr-badges">
            <span className="badge badge-dark">Cuestionario</span>
            <span className="badge badge-outline">{codigo}</span>
          </div>
        </header>

        {/* Contenido en 2 columnas */}
        <div className="qr-grid">
          {/* Vista previa */}
          <section className="card">
            <div className="card-head">
              <h2>Vista previa</h2>
              <div className="action-group">
                <button className="btn btn-primary" onClick={downloadPNG}>Descargar PNG</button>
                <button className="btn btn-outline" onClick={openLink}>Abrir enlace</button>
              </div>
            </div>

            <div className="qr-canvas-zone">
              <div ref={qrWrapperRef} className="qr-canvas-wrap">
                <QRCodeCanvas
                  value={url}
                  size={size}
                  bgColor={bg}
                  fgColor={fg}
                  includeMargin={margin}
                  level="M"
                />
              </div>
            </div>

            <div className="link-field">
              <label>Enlace de acceso</label>
              <div className="input-group">
                <input readOnly value={url} className="input" />
                <button className="btn btn-primary" onClick={copyLink}>Copiar</button>
              </div>
            </div>
          </section>

          {/* Panel de configuración */}
          <aside className="card">
            <h2 className="card-title">Configuración rápida</h2>

            <div className="field">
              <div className="field-row">
                <label>Tamaño</label>
                <div className="size-presets">
                  {[256, 320, 384, 448].map((n) => (
                    <button
                      key={n}
                      onClick={() => setSize(n)}
                      className={`chip ${size === n ? "chip-active" : ""}`}
                    >
                      {n}px
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={192}
                max={512}
                step={32}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
              />
            </div>

            <div className="grid2">
              <div className="field">
                <label>Color del código</label>
                <div className="color-row">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
                  <input type="text" value={fg} onChange={(e) => setFg(e.target.value)} className="input" />
                </div>
              </div>

              <div className="field">
                <label>Fondo</label>
                <div className="color-row">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
                  <input type="text" value={bg} onChange={(e) => setBg(e.target.value)} className="input" />
                </div>
              </div>
            </div>

            <div className="option-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={margin}
                  onChange={(e) => setMargin(e.target.checked)}
                />
                <span>Incluir margen (quiet zone)</span>
              </label>
              <span className="hint">Nivel de corrección: M</span>
            </div>

            <div className="tips">
              <strong>Sugerencias de uso:</strong>
              <ul>
                <li>Imprime mínimo 4 cm por lado para escaneo a 1 m.</li>
                <li>Contraste alto mejora la legibilidad.</li>
                <li>Genera el PNG al tamaño final; evita estirarlo.</li>
              </ul>
            </div>

            <div className="action-group">
              <button className="btn btn-primary" onClick={downloadPNG}>Descargar PNG</button>
              <button className="btn btn-outline" onClick={copyLink}>Copiar enlace</button>
              <button className="btn btn-outline" onClick={openLink}>Abrir enlace</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

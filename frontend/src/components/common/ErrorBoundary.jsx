import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Actualiza el estado para que en el próximo render
    // se muestre la UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Aquí puedes loguear el error a un servicio externo si quieres
    console.error("Error capturado en ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            color: "#fff",
            backgroundColor: "#b71c1c",
            borderRadius: "8px",
            margin: "2rem",
          }}
        >
          <h2>⚠️ Ocurrió un error en este módulo</h2>
          <p>Intenta cerrar el modal y volver a abrirlo.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

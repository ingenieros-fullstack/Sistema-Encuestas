import Navbar from "../components/Navbar";

export default function EmpleadoDashboard() {
  const nombre = localStorage.getItem("nombre");
  const rol = localStorage.getItem("rol");

  return (
    <>
      <Navbar rol={rol} nombre={nombre} />
      <div style={{ padding: "2rem" }}>
        <h1>Bienvenido {nombre}, este es tu Dashboard de EMPLEADO</h1>
      </div>
    </>
  );
}

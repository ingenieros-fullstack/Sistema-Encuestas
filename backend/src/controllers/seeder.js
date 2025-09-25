import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";

export const seedAdmin = async () => {
  try {
    // Verifica si ya existe un admin
    const existeAdmin = await Usuario.findOne({ where: { correo_electronico: "admin@correo.com" } });
    if (existeAdmin) {
      console.log("⚡ Admin ya existe, no se crea de nuevo.");
      return;
    }

    // Crea empresa demo si no existe
    let empresa = await Empresa.findOne({ where: { nombre: "Empresa Demo" } });
    if (!empresa) {
      empresa = await Empresa.create({
        nombre: "Empresa Demo",
        direccion: "Dirección Demo",
        contacto: "Contacto Demo",
        telefono: "123456789",
        correo_electronico: "empresa@demo.com"
      });
    }

    // Hash de la contraseña
    const hashedPass = await bcrypt.hash("123456", 10);

    // Inserta admin
    await Usuario.create({
      id_empresa: empresa.id_empresa,
      numero_empleado: "EMP001",
      nombre: "Administrador",
      correo_electronico: "admin@correo.com",
      password: hashedPass,
      rol: "admin",
      estatus: 1
    });

    console.log("✅ Usuario admin creado automáticamente (correo: admin@correo.com / pass: 123456)");
  } catch (error) {
    console.error("❌ Error creando admin:", error.message);
  }
};

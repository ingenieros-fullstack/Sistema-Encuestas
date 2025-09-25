import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";

export const seedAdminYUsuario = async () => {
  try {
    // Verifica si ya existe un admin
    const existeAdmin = await Usuario.findOne({ where: { correo_electronico: "admin@correo.com" } });
    if (existeAdmin) {
      console.log("⚡ Admin ya existe, no se crea de nuevo.");
    } else {
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
      const hashedPassAdmin = await bcrypt.hash("123456", 10);

      // Inserta admin
      await Usuario.create({
        id_empresa: empresa.id_empresa,
        numero_empleado: "EMP001",
        nombre: "Administrador",
        correo_electronico: "admin@correo.com",
        password: hashedPassAdmin,
        rol: "admin",
        estatus: 1
      });

      console.log("✅ Usuario admin creado automáticamente (correo: admin@correo.com / pass: 123456)");
    }

    // Verifica si ya existe un usuario
    const existeUsuario = await Usuario.findOne({ where: { correo_electronico: "usuario@correo.com" } });
    if (existeUsuario) {
      console.log("⚡ Usuario ya existe, no se crea de nuevo.");
    } else {
      // Usa la empresa demo existente
      const empresa = await Empresa.findOne({ where: { nombre: "Empresa Demo" } });

      // Hash de la contraseña
      const hashedPassUser = await bcrypt.hash("654321", 10);

      // Inserta usuario normal
      await Usuario.create({
        id_empresa: empresa.id_empresa,
        numero_empleado: "EMP002",
        nombre: "Usuario Demo",
        correo_electronico: "usuario@correo.com",
        password: hashedPassUser,
        rol: "usuario",
        estatus: 1
      });

      console.log("✅ Usuario normal creado automáticamente (correo: usuario@correo.com / pass: 654321)");
    }

  } catch (error) {
    console.error("❌ Error creando usuarios:", error.message);
  }
};

import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";

export const seedAdminYUsuario = async () => {
  try {
    // ================================
    // Verificar y crear empresa demo
    // ================================
    let empresa = await Empresa.findOne({ where: { nombre: "Empresa Demo" } });
    if (!empresa) {
      empresa = await Empresa.create({
        nombre: "Empresa Demo",
        direccion: "Dirección Demo",
        contacto: "Contacto Demo",
        telefono: "123456789",
        correo_electronico: "empresa@demo.com"
      });
      console.log("🏢 Empresa demo creada automáticamente.");
    }

    // ================================
    // Admin
    // ================================
    const existeAdmin = await Usuario.findOne({ where: { correo_electronico: "admin@correo.com" } });
    if (existeAdmin) {
      console.log("⚡ Admin ya existe, no se crea de nuevo.");
    } else {
      const hashedPassAdmin = await bcrypt.hash("123456", 10);
      await Usuario.create({
        id_empresa: empresa.id_empresa,
        numero_empleado: "EMP001",
        nombre: "Administrador",
        correo_electronico: "admin@correo.com",
        password: hashedPassAdmin,
        rol: "admin",
        estatus: 1
      });
      console.log("✅ Admin creado (correo: admin@correo.com / pass: 123456)");
    }

    // ================================
    // Empleado
    // ================================
    const existeEmpleado = await Usuario.findOne({ where: { correo_electronico: "empleado@correo.com" } });
    if (existeEmpleado) {
      console.log("⚡ Empleado ya existe, no se crea de nuevo.");
    } else {
      const hashedPassEmpleado = await bcrypt.hash("654321", 10);
      await Usuario.create({
        id_empresa: empresa.id_empresa,
        numero_empleado: "EMP002",
        nombre: "Empleado Demo",
        correo_electronico: "empleado@correo.com",
        password: hashedPassEmpleado,
        rol: "empleado",
        estatus: 1
      });
      console.log("✅ Empleado creado (correo: empleado@correo.com / pass: 654321)");
    }

    // ================================
    // Supervisor
    // ================================
    const existeSupervisor = await Usuario.findOne({ where: { correo_electronico: "supervisor@correo.com" } });
    if (existeSupervisor) {
      console.log("⚡ Supervisor ya existe, no se crea de nuevo.");
    } else {
      const hashedPassSupervisor = await bcrypt.hash("789012", 10);
      await Usuario.create({
        id_empresa: empresa.id_empresa,
        numero_empleado: "EMP003",
        nombre: "Supervisor Demo",
        correo_electronico: "supervisor@correo.com",
        password: hashedPassSupervisor,
        rol: "supervisor",
        estatus: 1
      });
      console.log("✅ Supervisor creado (correo: supervisor@correo.com / pass: 789012)");
    }

  } catch (error) {
    console.error("❌ Error creando usuarios:", error.message);
  }
};

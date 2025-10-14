import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";
import DataEmpleado from "../models/DataEmpleado.js";

export const seedAdminYUsuario = async () => {
  try {
    console.log("🚀 Iniciando creación de usuarios base...");

    // ===================================================
    // 🏢 1️⃣ Crear o recuperar empresa demo
    // ===================================================
    let empresa = await Empresa.findOne({ where: { nombre: "Empresa Demo" } });
    if (!empresa) {
      empresa = await Empresa.create({
        nombre: "Empresa Demo",
        direccion: "Dirección Demo",
        contacto: "Contacto Demo",
        telefono: "123456789",
        correo_electronico: "empresa@demo.com",
      });
      console.log("🏢 Empresa demo creada automáticamente.");
    } else {
      console.log("🏢 Empresa demo existente detectada.");
    }

    // ===================================================
    // ⚙️ 2️⃣ Helper: crear o actualizar empleado + usuario
    // ===================================================
    const crearEmpleadoYUsuario = async (numeroEmpleado, nombre, correo, rol, passwordPlano) => {
      correo = correo.trim().toLowerCase();

      // 🔍 Buscar si ya existe empleado por correo
      let empleado = await DataEmpleado.findOne({ where: { correo_electronico: correo } });

      if (!empleado) {
        empleado = await DataEmpleado.create({
          id_empresa: empresa.id_empresa,
          nombre,
          correo_electronico: correo,
          sexo: "O",
          fecha_ingreso: new Date(),
        });
        console.log(`👤 Empleado creado: ${nombre}`);
      } else {
        console.log(`👤 Empleado existente: ${nombre}`);
      }

      // 🔒 Encriptar contraseña
      const hashedPass = await bcrypt.hash(passwordPlano, 10);

      // 🔍 Buscar si ya existe usuario por número de empleado
      let usuario = await Usuario.findOne({ where: { numero_empleado: numeroEmpleado } });

      if (usuario) {
        usuario.password = hashedPass;
        usuario.rol = rol;
        usuario.estatus = 1;
        usuario.must_change_password = false;
        usuario.id_data = empleado.id_data;
        await usuario.save();
        console.log(`✅ Usuario actualizado (${numeroEmpleado} / rol: ${rol})`);
      } else {
        await Usuario.create({
          id_data: empleado.id_data,
          numero_empleado: numeroEmpleado,
          correo_electronico: correo,
          password: hashedPass,
          rol,
          estatus: 1,
          must_change_password: false,
        });
        console.log(`✅ Usuario creado (${numeroEmpleado} / rol: ${rol})`);
      }
    };

    // ===================================================
    // 👥 3️⃣ Crear usuarios base con número fijo
    // ===================================================
    await crearEmpleadoYUsuario("00001", "Administrador", "admin@correo.com", "admin", "123456");
    await crearEmpleadoYUsuario("00002", "Empleado Demo", "empleado@correo.com", "empleado", "654321");
    await crearEmpleadoYUsuario("00003", "Supervisor Demo", "supervisor@correo.com", "supervisor", "789012");

    console.log("🎯 Usuarios base verificados y actualizados correctamente.");
  } catch (error) {
    console.error("❌ Error creando usuarios base:", error);
  }
};

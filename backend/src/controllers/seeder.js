import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";
import DataEmpleado from "../models/DataEmpleado.js";

export const seedAdminYUsuario = async () => {
  try {
    console.log("🚀 Iniciando creación de usuarios base...");

    // ================================
    // Crear o recuperar empresa demo
    // ================================
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

    // Helper: crea empleado y usuario asociado
    const crearEmpleadoYUsuario = async (numEmpleado, nombre, correo, rol, passPlano) => {
      // Normalizar correo
      correo = correo.trim().toLowerCase();

      // ================================
      // 1️⃣ Crear o recuperar empleado
      // ================================
      let empleado = await DataEmpleado.findOne({ where: { correo_electronico: correo } });

      if (!empleado) {
        empleado = await DataEmpleado.create({
          id_empresa: empresa.id_empresa,
          numero_empleado: numEmpleado,
          nombre,
          correo_electronico: correo,
          sexo: "O",
          fecha_ingreso: new Date(),
        });
        console.log(`👤 Empleado creado: ${nombre}`);
      } else {
        console.log(`👤 Empleado ya existe: ${nombre}`);
      }

      // ================================
      // 2️⃣ Crear o actualizar usuario
      // ================================
      const hashedPass = await bcrypt.hash(passPlano, 10);

      // Buscar usuario por id_data o por correo
      let usuario = await Usuario.findOne({
        where: { correo_electronico: correo },
      });

      if (usuario) {
        // Actualizar contraseña y rol si ya existe
        usuario.password = hashedPass;
        usuario.rol = rol;
        usuario.estatus = 1;
        usuario.must_change_password = false;
        await usuario.save();
        console.log(`✅ Usuario actualizado (${correo} / rol: ${rol})`);
      } else {
        // Crear manualmente si no existe
        await Usuario.create({
          id_data: empleado.id_data,
          correo_electronico: correo,
          password: hashedPass,
          rol,
          estatus: 1,
          must_change_password: false,
        });
        console.log(`✅ Usuario creado (${correo} / rol: ${rol})`);
      }
    };

    // ================================
    // 3️⃣ Crear usuarios base
    // ================================
    await crearEmpleadoYUsuario("EMP001", "Administrador", "admin@correo.com", "admin", "123456");
    await crearEmpleadoYUsuario("EMP002", "Empleado Demo", "empleado@correo.com", "empleado", "654321");
    await crearEmpleadoYUsuario("EMP003", "Supervisor Demo", "supervisor@correo.com", "supervisor", "789012");

    console.log("🎯 Usuarios base verificados y actualizados correctamente.");
  } catch (error) {
    console.error("❌ Error creando usuarios base:", error);
  }
};

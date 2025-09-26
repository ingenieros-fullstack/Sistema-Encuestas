import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import Empresa from "../models/Empresa.js";
import DataEmpleado from "../models/DataEmpleado.js";

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

    // Helper para crear empleado + usuario
    const crearEmpleadoYUsuario = async (numEmpleado, nombre, correo, rol, passPlano) => {
      // 1. Crear empleado en data_empleados
      let empleado = await DataEmpleado.findOne({ where: { correo_electronico: correo } });
      if (!empleado) {
        empleado = await DataEmpleado.create({
          id_empresa: empresa.id_empresa,
          numero_empleado: numEmpleado,
          nombre,
          correo_electronico: correo
        });
        console.log(`👤 Empleado base creado: ${nombre}`);
      }

      // 2. Hashear password
      const hashedPass = await bcrypt.hash(passPlano, 10);

      // 3. Buscar usuario (trigger ya lo crea, pero con clave por defecto)
      let usuario = await Usuario.findOne({ where: { id_data: empleado.id_data } });

      if (usuario) {
        // Actualizar contraseña y rol
        usuario.password = hashedPass;
        usuario.rol = rol;
        await usuario.save();
        console.log(`✅ Usuario actualizado (${correo} / pass: ${passPlano})`);
      } else {
        // Si por alguna razón el trigger no corrió, lo creamos manual
        await Usuario.create({
          id_data: empleado.id_data,
          correo_electronico: correo,
          password: hashedPass,
          rol,
          estatus: 1
        });
        console.log(`✅ Usuario creado (${correo} / pass: ${passPlano})`);
      }
    };

    // ================================
    // Crear Admin, Empleado, Supervisor
    // ================================
    await crearEmpleadoYUsuario("EMP001", "Administrador", "admin@correo.com", "admin", "123456");
    await crearEmpleadoYUsuario("EMP002", "Empleado Demo", "empleado@correo.com", "empleado", "654321");
    await crearEmpleadoYUsuario("EMP003", "Supervisor Demo", "supervisor@correo.com", "supervisor", "789012");

  } catch (error) {
    console.error("❌ Error creando usuarios:", error.message);
  }
};

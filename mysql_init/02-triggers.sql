USE encuestas_db;
DELIMITER $$

DROP TRIGGER IF EXISTS trg_after_insert_data_empleados $$
CREATE TRIGGER trg_after_insert_data_empleados
AFTER INSERT ON data_empleados
FOR EACH ROW
BEGIN
  INSERT INTO usuarios (id_data, correo_electronico, password, rol, estatus, must_change_password)
  VALUES (
    NEW.id_data,
    NEW.correo_electronico,
    SHA2('Empleado2025', 256),
    'empleado',
    1,
    1
  );
END$$

DROP TRIGGER IF EXISTS trg_after_update_data_empleados $$
CREATE TRIGGER trg_after_update_data_empleados
AFTER UPDATE ON data_empleados
FOR EACH ROW
BEGIN
  IF OLD.correo_electronico <> NEW.correo_electronico THEN
    UPDATE usuarios
    SET correo_electronico = NEW.correo_electronico
    WHERE id_data = NEW.id_data;
  END IF;
END$$

DELIMITER ;

DELIMITER $$

-- =========================================
-- Trigger: después de insertar una asignación
-- =========================================
CREATE TRIGGER trg_after_insert_asignacion
AFTER INSERT ON asignaciones
FOR EACH ROW
BEGIN
  -- Si no existe el registro en totales_formulario lo crea
  INSERT INTO totales_formulario (codigo_formulario, total_empleados, total_pendientes, total_respuestas)
  VALUES (NEW.codigo_formulario, 1, 1, 0)
  ON DUPLICATE KEY UPDATE
    total_empleados = total_empleados + 1,
    total_pendientes = total_pendientes + 1;
END$$


-- =========================================
-- Trigger: después de actualizar asignación
-- (cuando cambia de pendiente/en_progreso a completado)
-- =========================================
CREATE TRIGGER trg_after_update_asignacion
AFTER UPDATE ON asignaciones
FOR EACH ROW
BEGIN
  IF OLD.estado <> 'completado' AND NEW.estado = 'completado' THEN
    UPDATE totales_formulario
    SET 
      total_respuestas = total_respuestas + 1,
      total_pendientes = GREATEST(total_pendientes - 1, 0)
    WHERE codigo_formulario = NEW.codigo_formulario;
  END IF;
END$$


-- =========================================
-- Trigger: después de borrar asignación
-- =========================================
CREATE TRIGGER trg_after_delete_asignacion
AFTER DELETE ON asignaciones
FOR EACH ROW
BEGIN
  UPDATE totales_formulario
  SET 
    total_empleados = GREATEST(total_empleados - 1, 0),
    total_pendientes = CASE 
                          WHEN OLD.estado = 'pendiente' OR OLD.estado = 'en_progreso'
                          THEN GREATEST(total_pendientes - 1, 0)
                          ELSE total_pendientes
                        END,
    total_respuestas = CASE 
                          WHEN OLD.estado = 'completado'
                          THEN GREATEST(total_respuestas - 1, 0)
                          ELSE total_respuestas
                        END
  WHERE codigo_formulario = OLD.codigo_formulario;
END$$

DELIMITER ;

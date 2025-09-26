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

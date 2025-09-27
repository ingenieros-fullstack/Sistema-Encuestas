USE encuestas_db;

-- ================================
-- Triggers sobre data_empleados
-- ================================
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
END $$
DELIMITER ;

DELIMITER $$
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
END $$
DELIMITER ;

-- ================================
-- Triggers de normalización por rol
-- ================================
DELIMITER $$
DROP TRIGGER IF EXISTS trg_usuarios_bi_set_must_change $$
CREATE TRIGGER trg_usuarios_bi_set_must_change
BEFORE INSERT ON usuarios
FOR EACH ROW
BEGIN
  IF NEW.rol = 'admin' THEN
    SET NEW.must_change_password = 0;
  ELSE
    SET NEW.must_change_password = 1;
  END IF;
END $$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS trg_usuarios_bu_set_must_change $$
CREATE TRIGGER trg_usuarios_bu_set_must_change
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
  -- Si cambia el rol o viene nulo, normalizamos por rol
  IF NEW.rol <> OLD.rol OR NEW.must_change_password IS NULL THEN
    IF NEW.rol = 'admin' THEN
      SET NEW.must_change_password = 0;
    ELSE
      SET NEW.must_change_password = 1;
    END IF;
  END IF;
END $$
DELIMITER ;

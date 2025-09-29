-- =========================================
-- Script de inicialización BD encuestas_db
-- Versión: v2 (formularios con PK = codigo)
-- =========================================

-- Crear Base de Datos
CREATE DATABASE IF NOT EXISTS encuestas_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE encuestas_db;

-- =========================================
-- Usuario MySQL y privilegios (opcional)
-- =========================================
CREATE USER IF NOT EXISTS 'encuestas_user'@'%' IDENTIFIED BY 'encuestas_pass';
GRANT ALL PRIVILEGES ON encuestas_db.* TO 'encuestas_user'@'%';
FLUSH PRIVILEGES;

-- =========================================
-- Tabla: empresas
-- =========================================
DROP TABLE IF EXISTS empresas;
CREATE TABLE empresas (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(200),
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  correo_electronico VARCHAR(100),
  logo VARCHAR(200),
  rfc VARCHAR(20),
  registro_patronal VARCHAR(50),
  representante_legal VARCHAR(100),
  actividad_economica VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_empresas_nombre ON empresas (nombre);

-- =========================================
-- TABLA: data_empleados
-- =========================================
DROP TABLE IF EXISTS data_empleados;
CREATE TABLE data_empleados (
  id_data INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  numero_empleado VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100),
  apellido_materno VARCHAR(100),
  sexo ENUM('M','F','O'),
  fecha_nacimiento DATE,
  fecha_ingreso DATE,
  centro_trabajo VARCHAR(100),
  departamento VARCHAR(100),
  grado_estudios VARCHAR(50),
  turno VARCHAR(20),
  supervisor VARCHAR(100),
  telefono VARCHAR(20),
  foto VARCHAR(200),
  correo_electronico VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_data_empleados_empresa ON data_empleados (id_empresa);
CREATE INDEX idx_data_empleados_numero ON data_empleados (numero_empleado);
CREATE INDEX idx_data_empleados_correo ON data_empleados (correo_electronico);

-- =========================================
-- TABLA: usuarios
-- =========================================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_data INT NOT NULL,
  correo_electronico VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL, -- para hash bcrypt (~60)
  rol ENUM('admin','supervisor','empleado') NOT NULL DEFAULT 'empleado',
  estatus TINYINT(1) DEFAULT 1,
  must_change_password TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_data) REFERENCES data_empleados(id_data) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_usuarios_data ON usuarios (id_data);
CREATE INDEX idx_usuarios_correo ON usuarios (correo_electronico);
CREATE INDEX idx_usuarios_rol ON usuarios (rol);
CREATE INDEX idx_usuarios_must_change ON usuarios (must_change_password);

-- =========================================
-- Tabla: formularios (PK = codigo)
-- =========================================
DROP TABLE IF EXISTS formularios;
CREATE TABLE formularios (
  codigo VARCHAR(50) PRIMARY KEY,
  id_empresa INT NOT NULL,
  tipo ENUM('Encuesta','Cuestionario') NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  introduccion TEXT,
  texto_final TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  estatus ENUM('abierto','cerrado') DEFAULT 'abierto',
  umbral_aprobacion INT,
  tiempo_limite INT DEFAULT NULL,      -- minutos u otra unidad
  navegacion_preguntas TINYINT(1) DEFAULT 0,
  mostrar_respuestas TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_formularios_empresa ON formularios (id_empresa);
CREATE INDEX idx_formularios_tipo ON formularios (tipo);

-- =========================================
-- Tabla: totales_formulario
-- =========================================
DROP TABLE IF EXISTS totales_formulario;
CREATE TABLE totales_formulario (
  id_total INT AUTO_INCREMENT PRIMARY KEY,
  codigo_formulario VARCHAR(50) NOT NULL,
  total_empleados INT DEFAULT 0,
  total_respuestas INT DEFAULT 0,
  total_pendientes INT DEFAULT 0,
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_totales_codigo ON totales_formulario (codigo_formulario);

-- =========================================
-- Tabla: secciones (usa codigo_formulario)
-- =========================================
DROP TABLE IF EXISTS secciones;
CREATE TABLE secciones (
  id_seccion INT AUTO_INCREMENT PRIMARY KEY,
  codigo_formulario VARCHAR(50) NOT NULL,
  tema VARCHAR(150),
  nombre_seccion VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_secciones_formulario ON secciones (codigo_formulario);

-- =========================================
-- Tabla: preguntas
-- =========================================
DROP TABLE IF EXISTS preguntas;
CREATE TABLE preguntas (
  id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
  id_seccion INT NOT NULL,
  numero_pregunta INT,
  enunciado TEXT NOT NULL,
  tipo_pregunta ENUM('respuesta_corta','opcion_multiple','seleccion_unica','si_no','escala_1_5') NOT NULL,
  obligatoria TINYINT(1) DEFAULT 0,
  puntaje INT,
  respuesta_correcta TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_seccion) REFERENCES secciones(id_seccion) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_preguntas_seccion ON preguntas (id_seccion);
CREATE INDEX idx_preguntas_tipo ON preguntas (tipo_pregunta);

-- =========================================
-- Tabla: opciones
-- =========================================
CREATE TABLE opciones (
  id_opcion INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  valor VARCHAR(100),
  FOREIGN KEY (id_pregunta) REFERENCES preguntas(id_pregunta) ON DELETE CASCADE
);

CREATE INDEX idx_opciones_pregunta ON opciones (id_pregunta);

-- =========================================
-- Tabla: asignaciones (con codigo_formulario)
-- =========================================
DROP TABLE IF EXISTS asignaciones;
CREATE TABLE asignaciones (
  id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  codigo_formulario VARCHAR(50) NOT NULL,
  estado ENUM('pendiente','en_progreso','completado') DEFAULT 'pendiente',
  intentos_realizados INT DEFAULT 0,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_asignaciones_usuario ON asignaciones (id_usuario);
CREATE INDEX idx_asignaciones_formulario ON asignaciones (codigo_formulario);
CREATE INDEX idx_asignaciones_estado ON asignaciones (estado);
CREATE INDEX idx_asignaciones_usuario_formulario ON asignaciones (id_usuario, codigo_formulario);

-- =========================================
-- Tabla: respuestas
-- =========================================
DROP TABLE IF EXISTS respuestas;
CREATE TABLE respuestas (
  id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_asignacion INT NOT NULL,
  id_pregunta INT NOT NULL,
  respuesta TEXT NOT NULL,
  es_correcta TINYINT(1),
  puntaje_obtenido INT,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_asignacion) REFERENCES asignaciones(id_asignacion) ON DELETE CASCADE,
  FOREIGN KEY (id_pregunta) REFERENCES preguntas(id_pregunta) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_respuestas_asignacion ON respuestas (id_asignacion);
CREATE INDEX idx_respuestas_pregunta ON respuestas (id_pregunta);

-- =========================================
-- Tabla: qr_formularios (con codigo_formulario)
-- =========================================
DROP TABLE IF EXISTS qr_formularios;
CREATE TABLE qr_formularios (
  id_qr INT AUTO_INCREMENT PRIMARY KEY,
  codigo_formulario VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  codigo_qr TEXT NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_qr_formulario ON qr_formularios (codigo_formulario);
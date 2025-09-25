-- =========================================
-- Script de inicialización BD encuestas_db
-- Primera entrega v1.0.0
-- =========================================

-- Crear Base de Datos
CREATE DATABASE IF NOT EXISTS encuestas_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE encuestas_db;

-- =========================================
-- Crear Usuario y Privilegios
-- =========================================
CREATE USER IF NOT EXISTS 'encuestas_user'@'%' IDENTIFIED BY 'encuestas_pass';
GRANT ALL PRIVILEGES ON encuestas_db.* TO 'encuestas_user'@'%';
FLUSH PRIVILEGES;

-- =========================================
-- Tabla: empresas
-- =========================================
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
);

-- Índice para búsquedas rápidas por nombre
CREATE INDEX idx_empresas_nombre ON empresas (nombre);

-- =========================================
-- Tabla: usuarios
-- =========================================
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  numero_empleado VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100),
  apellido_materno VARCHAR(100),
  sexo ENUM('M','F','O'),
  fecha_nacimiento DATE,
  fecha_ingreso DATE,
  correo_electronico VARCHAR(100) NOT NULL,
  centro_trabajo VARCHAR(100),
  departamento VARCHAR(100),
  grado_estudios VARCHAR(50),
  turno VARCHAR(20),
  supervisor VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','supervisor','empleado') NOT NULL,
  estatus TINYINT(1) DEFAULT 1,
  telefono VARCHAR(20),
  foto VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_usuarios_empresa ON usuarios (id_empresa);
CREATE INDEX idx_usuarios_numero ON usuarios (numero_empleado);
CREATE INDEX idx_usuarios_correo ON usuarios (correo_electronico);

-- =========================================
-- Tabla: formularios
-- =========================================
CREATE TABLE formularios (
  id_formulario INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  tipo ENUM('nom035','general','cuestionario') NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  introduccion TEXT,
  texto_final TEXT,
  periodo YEAR,
  fecha_inicio DATE,
  fecha_fin DATE,
  estatus ENUM('abierta','cerrada','en_proceso') DEFAULT 'en_proceso',
  umbral_aprobacion INT,
  total_empleados INT DEFAULT 0,
  total_respuestas INT DEFAULT 0,
  total_pendientes INT DEFAULT 0,
  porcentaje_avance DECIMAL(5,2) DEFAULT 0.00,
  dias_visibles INT DEFAULT 0,
  obligatoria TINYINT(1) DEFAULT 0,
  modificar_respuestas TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
);

CREATE INDEX idx_formularios_empresa ON formularios (id_empresa);
CREATE INDEX idx_formularios_tipo ON formularios (tipo);

-- =========================================
-- Tabla: secciones
-- =========================================
CREATE TABLE secciones (
  id_seccion INT AUTO_INCREMENT PRIMARY KEY,
  id_formulario INT NOT NULL,
  tema VARCHAR(150),
  nombre_seccion VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_formulario) REFERENCES formularios(id_formulario) ON DELETE CASCADE
);

CREATE INDEX idx_secciones_formulario ON secciones (id_formulario);

-- =========================================
-- Tabla: preguntas
-- =========================================
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
);

CREATE INDEX idx_preguntas_seccion ON preguntas (id_seccion);
CREATE INDEX idx_preguntas_tipo ON preguntas (tipo_pregunta);

-- =========================================
-- Tabla: asignaciones
-- =========================================
CREATE TABLE asignaciones (
  id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_formulario INT NOT NULL,
  estado ENUM('pendiente','en_progreso','completado') DEFAULT 'pendiente',
  intentos_realizados INT DEFAULT 0,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_formulario) REFERENCES formularios(id_formulario) ON DELETE CASCADE
);

CREATE INDEX idx_asignaciones_usuario ON asignaciones (id_usuario);
CREATE INDEX idx_asignaciones_formulario ON asignaciones (id_formulario);
CREATE INDEX idx_asignaciones_estado ON asignaciones (estado);

-- =========================================
-- Tabla: respuestas
-- =========================================
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
);

CREATE INDEX idx_respuestas_asignacion ON respuestas (id_asignacion);
CREATE INDEX idx_respuestas_pregunta ON respuestas (id_pregunta);

-- =========================================
-- Tabla: qr_formularios
-- =========================================
CREATE TABLE qr_formularios (
  id_qr INT AUTO_INCREMENT PRIMARY KEY,
  id_formulario INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  codigo_qr TEXT NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_formulario) REFERENCES formularios(id_formulario) ON DELETE CASCADE
);

CREATE INDEX idx_qr_formulario ON qr_formularios (id_formulario);

-- =========================================
-- Datos iniciales
-- =========================================

-- Empresa demo
INSERT INTO empresas (nombre, direccion, contacto, telefono, correo_electronico)
VALUES ('Empresa Demo', 'Direccion Demo', 'Contacto Demo', '123456789', 'empresa@demo.com');


-- ======================================================
-- DATABASE: corehr_encuestas_db
-- Limpio: solo estructura + triggers integrados
-- ======================================================

-- ======================================================
-- EMPRESAS
-- ======================================================
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
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- DATA EMPLEADOS
-- ======================================================
CREATE TABLE data_empleados (
  id_data INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100),
  apellido_materno VARCHAR(100),
  sexo ENUM('M','F','O'),
  fecha_nacimiento DATE,
  fecha_ingreso DATE,
  correo_electronico VARCHAR(100) NOT NULL,
  centro_trabajo VARCHAR(100),
  cc VARCHAR(50),
  cc_descrip VARCHAR(150),
  departamento VARCHAR(100),
  depto_descrip VARCHAR(150),
  antiguedad INT,
  grado_estudios VARCHAR(50),
  turno VARCHAR(20),
  supervisor VARCHAR(100),
  edad INT,
  telefono VARCHAR(20),
  foto VARCHAR(200),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;



-- ======================================================
-- USUARIOS
-- ======================================================
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_data INT NOT NULL,
  numero_empleado VARCHAR(20),
  correo_electronico VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  rol ENUM('admin','supervisor','empleado') DEFAULT 'empleado',
  estatus TINYINT(1) DEFAULT 1,
  must_change_password TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_data) REFERENCES data_empleados(id_data)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- FORMULARIOS
-- ======================================================
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
  tiempo_limite INT,
  navegacion_preguntas TINYINT(1) DEFAULT 0,
  mostrar_respuestas TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- SECCIONES
-- ======================================================
CREATE TABLE secciones (
  id_seccion INT AUTO_INCREMENT PRIMARY KEY,
  codigo_formulario VARCHAR(50) NOT NULL,
  tema TEXT,
  nombre_seccion TEXT,
  condicion_pregunta_id INT,
  condicion_valor VARCHAR(255),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- PREGUNTAS
-- ======================================================
CREATE TABLE preguntas (
  id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
  id_seccion INT NOT NULL,
  numero_pregunta INT,
  enunciado TEXT NOT NULL,
  tipo_pregunta ENUM('respuesta_corta','opcion_multiple','seleccion_unica','si_no','escala_1_5','condicional') NOT NULL,
  obligatoria TINYINT(1) DEFAULT 0,
  puntaje INT DEFAULT 0,
  respuesta_correcta TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_seccion) REFERENCES secciones(id_seccion)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- OPCIONES
-- ======================================================
CREATE TABLE opciones (
  id_opcion INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  valor VARCHAR(100),
  FOREIGN KEY (id_pregunta) REFERENCES preguntas(id_pregunta)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- ASIGNACIONES
-- ======================================================
CREATE TABLE asignaciones (
  id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  codigo_formulario VARCHAR(50) NOT NULL,
  estado ENUM('pendiente','en_progreso','completado') DEFAULT 'pendiente',
  intentos_realizados INT DEFAULT 0,
  fecha_asignacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- ======================================================
-- RESPUESTAS
-- ======================================================
CREATE TABLE respuestas (
  id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_asignacion INT NOT NULL,
  id_pregunta INT NOT NULL,
  respuesta TEXT,
  es_correcta TINYINT(1),
  puntaje_obtenido INT DEFAULT 0,
  fecha_respuesta TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_asignacion) REFERENCES asignaciones(id_asignacion),
  FOREIGN KEY (id_pregunta) REFERENCES preguntas(id_pregunta)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- QR FORMULARIOS
-- ======================================================
CREATE TABLE qr_formularios (
  id_qr INT AUTO_INCREMENT PRIMARY KEY,
  codigo_formulario VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  codigo_qr TEXT NOT NULL,
  fecha_generacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ======================================================
-- TOTALES FORMULARIO
-- ======================================================
CREATE TABLE totales_formulario (
  id_total INT AUTO_INCREMENT PRIMARY KEY,
  codigo_formulario VARCHAR(50) NOT NULL UNIQUE,
  total_empleados INT DEFAULT 0,
  total_respuestas INT DEFAULT 0,
  total_pendientes INT DEFAULT 0,
  FOREIGN KEY (codigo_formulario) REFERENCES formularios(codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

COMMIT;

PRAGMA foreign_keys = OFF;

-- Limpiar base de datos
DROP TABLE IF EXISTS asignaturas_solicitud;
DROP TABLE IF EXISTS asignaturas_convenio;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS convenios;
DROP TABLE IF EXISTS usuarios;

PRAGMA foreign_keys = ON;

-- Crear tablas con índices mejorados
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    tipo TEXT NOT NULL,
    dni TEXT,
    nombre TEXT,
    email TEXT,
    centroId INTEGER,
    titulacionId INTEGER,
    curso INTEGER,
    anioAcademico TEXT,
    FOREIGN KEY(centroId) REFERENCES centros(id),
    FOREIGN KEY(titulacionId) REFERENCES titulaciones(id)
);

CREATE TABLE IF NOT EXISTS convenios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uniDestino TEXT NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(uniDestino)
);

CREATE TABLE IF NOT EXISTS asignaturas_convenio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    convenioId INTEGER,
    asignaturaOrigen TEXT NOT NULL,
    asignaturaDestino TEXT NOT NULL,
    FOREIGN KEY(convenioId) REFERENCES convenios(id) ON DELETE CASCADE,
    UNIQUE(convenioId, asignaturaOrigen, asignaturaDestino)
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuarioId INTEGER,
    tipo TEXT NOT NULL,
    uniDestino TEXT NOT NULL,
    duracion TEXT CHECK(duracion IN ('primer_cuatrimestre', 'segundo_cuatrimestre', 'curso_completo')) NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY(usuarioId) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS universidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    ubicacion TEXT,
    pais TEXT,
    activa BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS centros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    universidadId INTEGER,
    direccion TEXT,
    tipo TEXT,
    FOREIGN KEY(universidadId) REFERENCES universidades(id)
);

CREATE TABLE IF NOT EXISTS titulaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    centroId INTEGER,
    duracion INTEGER,
    creditos INTEGER,
    nivel TEXT,
    FOREIGN KEY(centroId) REFERENCES centros(id)
);

CREATE TABLE IF NOT EXISTS asignaturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    creditos INTEGER,
    titulacionId INTEGER,
    curso INTEGER,
    cuatrimestre INTEGER,
    FOREIGN KEY(titulacionId) REFERENCES titulaciones(id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_solicitudes_usuario ON solicitudes(usuarioId);
CREATE INDEX idx_solicitudes_uni ON solicitudes(uniDestino);
CREATE INDEX idx_asignaturas_convenio ON asignaturas_convenio(convenioId);
CREATE INDEX idx_usuarios_titulacion ON usuarios(titulacionId);
CREATE INDEX idx_usuarios_centro ON usuarios(centroId);
CREATE INDEX idx_asignaturas_titulacion ON asignaturas(titulacionId);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_historial ON solicitudes(historial);

-- Datos iniciales
INSERT OR REPLACE INTO usuarios (username, password, tipo) VALUES 
    ('admin', 'admin123', 'admin'),
    ('profesor', 'prof123', 'profesor'),
    ('estudiante', 'est123', 'estudiante');

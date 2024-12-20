const db = require('./config');
const fs = require('fs');
const path = require('path');

/**
 * Inicializa la base de datos con la estructura necesaria
 * @returns {Promise<boolean>} true si la inicialización fue exitosa
 */
async function initializeDatabase() {
    const dropTables = [
        'asignaturas_solicitud',
        'asignaturas_convenio',
        'solicitudes',
        'convenios',
        'usuarios'
    ];

    const createTables = [
        `CREATE TABLE usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            tipo TEXT NOT NULL
        )`,
        `CREATE TABLE convenios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uniDestino TEXT NOT NULL,
            fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE asignaturas_convenio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            convenioId INTEGER,
            asignaturaOrigen TEXT NOT NULL,
            asignaturaDestino TEXT NOT NULL,
            FOREIGN KEY(convenioId) REFERENCES convenios(id)
        )`,
        `CREATE TABLE solicitudes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuarioId INTEGER,
            tipo TEXT NOT NULL,
            uniDestino TEXT NOT NULL,
            duracion TEXT CHECK(duracion IN ('primer_cuatrimestre', 'segundo_cuatrimestre', 'curso_completo')) NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuarioId) REFERENCES usuarios(id)
        )`
    ];

    try {
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                // Configuración inicial
                db.run('PRAGMA foreign_keys = OFF');
                
                // Eliminar tablas existentes
                dropTables.forEach(table => {
                    db.run(`DROP TABLE IF EXISTS ${table}`);
                });

                // Crear nuevas tablas
                createTables.forEach(statement => {
                    db.run(statement);
                });

                // Datos iniciales
                db.run(`INSERT OR REPLACE INTO usuarios (username, password, tipo) VALUES 
                    ('admin', 'admin123', 'admin'),
                    ('profesor', 'prof123', 'profesor'),
                    ('estudiante', 'est123', 'estudiante')`);

                // Reactivar foreign keys
                db.run('PRAGMA foreign_keys = ON', err => {
                    err ? reject(err) : resolve();
                });
            });
        });

        return true;
    } catch (error) {
        throw new Error('Error en la inicialización de la base de datos');
    }
}

module.exports = { initializeDatabase };

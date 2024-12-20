const db = require('../database/config.js');

class Usuario {
    constructor(id, username, password, tipo, dni, titulacion) {
        this.id = id;
        this.username = username;
        this.password = password; // Debe estar hasheado
        this.tipo = tipo;
        this.dni = dni;
        this.titulacion = titulacion;
    }

    static async login(username, password) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM usuarios WHERE username = ? AND password = ?',
                [username, password],
                (err, row) => {
                    if (err) return reject(err);
                    if (!row) return resolve({ success: false, mensaje: 'Credenciales inválidas' });
                    
                    // Mapear tipos de usuario para mantener consistencia
                    const tipoMap = {
                        'admin': 'admin',
                        'estudiante': 'student',
                        'profesor': 'teacher'
                    };

                    resolve({
                        success: true,
                        id: row.id,
                        username: row.username,
                        tipo: tipoMap[row.tipo] || row.tipo
                    });
                }
            );
        });
    }

    async obtenerHistorialSolicitudes() {
        return await Solicitud.obtenerPorUsuario(this.id);
    }
}

class Administrador extends Usuario {
    constructor(id, username, password) {
        super(id, username, password, 'admin');
    }
}

class Profesor extends Usuario {
    constructor(id, username, password) {
        super(id, username, password, 'teacher');
    }

    async solicitarIntercambio(solicitudData) {
        return new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) {
                    console.error('Error al iniciar transacción:', err);
                    return reject(err);
                }

                db.run('INSERT INTO solicitudes (usuarioId, tipo, uniDestino) VALUES (?, ?, ?)',
                    [this.id, 'intercambio', solicitudData.uniDestino],
                    function(err) {
                        if (err) {
                            console.error('Error al crear solicitud:', err);
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        const solicitudId = this.lastID;
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Error al hacer commit:', err);
                                db.run('ROLLBACK');
                                return reject(err);
                            }
                            resolve(solicitudId);
                        });
                    });
            });
        });
    }
}

class Estudiante extends Usuario {
    constructor(id, username, password, dni, titulacion, curso, anioAcademico) {
        super(id, username, password, 'estudiante', dni, titulacion);
        this.curso = curso;
        this.anioAcademico = anioAcademico;
    }

    async solicitarConvalidacion(solicitudData) {
        return new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) {
                    console.error('Error al iniciar transacción:', err);
                    return reject(err);
                }

                db.run('INSERT INTO solicitudes (usuarioId, tipo, uniDestino) VALUES (?, ?, ?)',
                    [this.id, 'convalidacion', solicitudData.uniDestino],
                    function(err) {
                        if (err) {
                            console.error('Error al crear solicitud:', err);
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        const solicitudId = this.lastID;
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Error al hacer commit:', err);
                                db.run('ROLLBACK');
                                return reject(err);
                            }
                            resolve(solicitudId);
                        });
                    });
            });
        });
    }

    async puedeRealizarIntercambio() {
        const historial = await Solicitud.obtenerHistorialCompleto(this.id);
        return !historial.some(s => s.estado === 'aceptada');
    }
}

module.exports = { Usuario, Administrador, Profesor, Estudiante };
